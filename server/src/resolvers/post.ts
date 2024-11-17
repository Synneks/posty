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
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { Updoot } from '../entities/Updoot';

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
    // TODO: req.session.userId is null even when the user is logged in
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    console.log(req.session);
    const { userId } = req.session;
    const realLimit = await Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const posts = await PostgresDataSource.query(
      `
        SELECT p.*, 
        json_build_object(
          'id', u.id, 
          'username', u.username, 
          'email', u.email,
          'createdAt', u."createdAt",
          'updatedAt', u."updatedAt"
        ) "creator",
        ${
          userId
            ? '(select value from updoot where "userId" = $3 and "postId" = p.id) "voteStatus"'
            : '$3 as "voteStatus"'
        }
        FROM post p
        INNER JOIN "user" u ON u.id = p."creatorId"
        WHERE p."createdAt" < $1
        ORDER BY p."createdAt" DESC
        LIMIT $2
      `,
      [
        req.session.cursor
          ? new Date(parseInt(req.session.cursor))
          : new Date(),
        realLimitPlusOne,
        req.session.userId,
      ]
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id }, relations: ['creator'] });
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
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await Post.update(id, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id', () => Int) id: number): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch {
      return false;
    }
    return true;
  }
}
