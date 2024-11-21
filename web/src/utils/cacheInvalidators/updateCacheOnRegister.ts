import { Cache, DataFields } from '@urql/exchange-graphcache';
import { MeDocument, MeQuery, RegisterMutation } from '../../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';

export const updateCacheOnRegister = (cache: Cache, result: DataFields) => {
  betterUpdateQuery<RegisterMutation, MeQuery>(
    cache,
    { query: MeDocument },
    result,
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
};
