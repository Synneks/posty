import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import Router from 'next/router';
import { Exchange, fetchExchange, mapExchange, stringifyVariables } from 'urql';
import { invalidateCacheForAllPosts } from './cacheInvalidators/invalidateCacheAllPosts';
import { invalidateCacheOnDeletePosts } from './cacheInvalidators/invalidateCacheOnDeletePosts';
import { updateCacheOnLogin } from './cacheInvalidators/updateCacheOnLogin';
import { updateCacheOnLogout } from './cacheInvalidators/updateCacheOnLogout';
import { updateCacheOnRegister } from './cacheInvalidators/updateCacheOnRegister';
import { updateCacheOnVote } from './cacheInvalidators/updateCacheOnVote';
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
            invalidateCacheOnDeletePosts(cache, _args);
          },
          vote: (_result, _args, cache, _info) => {
            updateCacheOnVote(cache, _args);
          },
          createPost(_result, _args, cache, _info) {
            invalidateCacheForAllPosts(cache);
          },
          login(_result, _args, cache, _info) {
            updateCacheOnLogin(cache, _result);
            invalidateCacheForAllPosts(cache);
          },
          register(_result, _args, cache, _info) {
            updateCacheOnRegister(cache, _result);
          },
          logout(_result, _args, cache, _info) {
            updateCacheOnLogout(cache, _result);
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
