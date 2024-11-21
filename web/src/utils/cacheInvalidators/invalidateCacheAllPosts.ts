import { Cache } from '@urql/exchange-graphcache';

export const invalidateCacheForAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');

  // loop through all the paginated values and invalidate them all
  fieldInfos.forEach((fieldInfo) => {
    cache.invalidate('Query', 'posts', fieldInfo.arguments || {});
  });
};
