import { Cache, DataFields } from '@urql/exchange-graphcache';
import { LoginMutation, MeQuery, MeDocument } from '../../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';

export const updateCacheOnLogin = (cache: Cache, result: DataFields) => {
  betterUpdateQuery<LoginMutation, MeQuery>(
    cache,
    { query: MeDocument },
    result,
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
};
