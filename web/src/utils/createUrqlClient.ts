import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import Router from 'next/router';
import {
  Exchange,
  fetchExchange,
  gql,
  mapExchange,
  stringifyVariables,
} from 'urql';
import {
  DeletePostMutationVariables,
  LoginMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { isServer } from './isServer';

export const errorExchange: Exchange = mapExchange({
  onError(error) {
    if (error.message.includes('not authenticated')) {
      Router.replace('/login');
    }
  },
});

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    // if the key is not in the cache then it should fetch new data
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      'posts'
    );
    info.partial = !isItInTheCache;

    let hasMore = true;

    // loop through the data from cache and return it, fileldInfos will increase and its new data will be added to the resutls array
    const results: string[] = [];
    fieldInfos.forEach((fieldInfo) => {
      const key = cache.resolve(entityKey, fieldInfo.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return { __typename: 'PaginatedPosts', hasMore: hasMore, posts: results };
  };
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => ({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        // alter posts query to use cursor pagination
        Query: { posts: cursorPagination() },
      },
      updates: {
        Mutation: {
          deletePost(_result, _args, cache, _info) {
            const { id } = _args as DeletePostMutationVariables;
            cache.invalidate({
              __typename: 'Post',
              id: id,
            });
          },
          vote: (_result, _args, cache, _info) => {
            const { postId, value } = _args as VoteMutationVariables;

            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId } as any
            );

            if (data) {
              const points = Number(data.points);
              const voteStatus = Number(data.voteStatus);
              const newPoints =
                voteStatus === value
                  ? points + -1 * value // undo vote
                  : points + (!voteStatus ? 1 : 2) * value; // change vote
              cache.writeFragment(
                gql`
                  fragment __ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                {
                  id: postId,
                  points: newPoints,
                  voteStatus: value === voteStatus ? 0 : value,
                } as any
              );
            }
          },
          createPost(_result, _args, cache, _info) {
            const allFields = cache.inspectFields('Query');
            const fieldInfos = allFields.filter(
              (info) => info.fieldName === 'posts'
            );

            // loop through all the paginated values and invalidate them all
            fieldInfos.forEach((fieldInfo) => {
              cache.invalidate('Query', 'posts', fieldInfo.arguments || {});
            });
          },
          login(_result, _args, cache, _info) {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    __typename: 'Query',
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register(_result, _args, cache, _info) {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    __typename: 'Query',
                    me: result.register.user,
                  };
                }
              }
            );
          },
          logout(_result, _args, cache, _info) {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null }) // set me to null
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
  fetchOptions: {
    credentials: 'include' as const,
    headers: isServer()
      ? {
          cookie: ctx?.req.headers.cookie,
        }
      : undefined,
  },
});
