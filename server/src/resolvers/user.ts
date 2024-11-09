import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { sendMail } from '../utils/sendEmail';
import { validateRegister } from '../utils/validateRegister';
import { UsernamePasswordInput } from './UsernamePasswordInput';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Passoword must be longer than 2 characters',
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    redis.del(key);

    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token has expired or is invalid',
          },
        ],
      };
    }

    const userIdInt = parseInt(userId);
    const user = await User.findOne({ where: { id: userIdInt } });

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User does not exist',
          },
        ],
      };
    }

    await User.update(userIdInt, { password: await argon2.hash(newPassword) });

    // login user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // the email is not in the db
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'EX',
      1000 * 60 * 60 * 24 * 3 // 3 days
    );

    sendMail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);

    try {
      // const result = await getConnection()
      //   .createQueryBuilder()
      //   .insert()
      //   .into(User)
      //   .values({
      //     email: options.email,
      //     username: options.username,
      //     password: hashedPassword,
      //   })
      //   .returning('*')
      //   .execute();
      const user = await User.create({
        email: options.email,
        username: options.username,
        password: hashedPassword,
      }).save();

      // store user id session as cookie
      req.session.userId = user.id.toString();

      return { user };
    } catch (error) {
      // duplicate username error
      if (error.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'Username already taken',
            },
          ],
        };
      }
      console.log('error: ', error.message);
      return {
        errors: [
          {
            field: 'unknown',
            message: 'Unknown error occurred. Please try again.',
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "Username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password!, password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Incorrect password',
          },
        ],
      };
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id.toString();

    return {
      user,
    };
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext): Promise<User | null> {
    // not logged in
    if (!req.session.userId) {
      return Promise.resolve(null);
    }

    return User.findOne({
      where: { id: parseInt(req.session.userId) },
    });
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
