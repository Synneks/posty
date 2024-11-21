import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { PostgresDataSource } from '../datasource';
import { Post } from '../entities/Post';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() thisPost: Post) {
    return thisPost.text.slice(0, 128);
  }

  @FieldResolver(() => User)
  creator(@Root() thisPost: Post, @Ctx() { userLoader }: MyContext) {
    // without data loader
    // return User.findOne({ where: { id: thisPost.creatorId } });
    return userLoader.load(thisPost.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() thisPost: Post,
    @Ctx() { req, updootLoader }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const updoot = await updootLoader.load({
      postId: thisPost.id,
      userId: Number(req.session.userId),
    });
    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    const hasVoted = await Updoot.findOne({
      where: { postId, userId: req.session.userId },
    });
    const isUpdoot = value !== -1;
    const _value = isUpdoot ? 1 : -1;
    let query = '';

    // the user has voted on the post before and they are changing their vote
    if (hasVoted && hasVoted.value !== _value) {
      query = `
          UPDATE updoot SET value = ${_value} WHERE "postId" = ${postId} AND "userId" = ${userId};
          UPDATE post SET points = points + ${2 * _value} WHERE id = ${postId};
          `;
    } else if (hasVoted && hasVoted.value === _value) {
      // the user has voted on the post before and they are undoing their vote
      query = `
          DELETE FROM updoot WHERE "postId" = ${postId} AND "userId" = ${userId};
          UPDATE post SET points = points + ${-1 * _value} WHERE id = ${postId};
          `;
    } else if (!hasVoted) {
      // the user has not voted before
      query = ` 
        INSERT INTO updoot ("userId", "postId", value) VALUES (${userId}, ${postId}, ${_value});
        UPDATE post SET points = points + ${_value} WHERE id = ${postId};
        `;
    }

    if (!query) {
      return false;
    }

    await PostgresDataSource.transaction(async (tm) => {
      await tm.query(query);
    });

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = await Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const posts = await PostgresDataSource.query(
      `
        SELECT p.*
        FROM post p
        WHERE p."createdAt" < $1
        ORDER BY p."createdAt" DESC
        LIMIT $2
      `,
      [
        req.session.cursor
          ? new Date(parseInt(req.session.cursor))
          : new Date(),
        realLimitPlusOne,
      ]
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    if (typeof title !== 'undefined' && typeof text !== 'undefined') {
      return await PostgresDataSource.createQueryBuilder()
        .update(Post)
        .set({ title, text })
        .where('id = :id and "creatorId" = :creatorId', {
          id,
          creatorId: req.session.userId,
        })
        .returning('*')
        .execute()
        .then((res) => {
          return res.raw[0];
        });
    }
    return null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
