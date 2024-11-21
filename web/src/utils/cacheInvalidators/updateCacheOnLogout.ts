import { Cache, DataFields } from '@urql/exchange-graphcache';
import { MeDocument, MeQuery, RegisterMutation } from '../../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';

export const updateCacheOnLogout = (cache: Cache, result: DataFields) => {
  betterUpdateQuery<RegisterMutation, MeQuery>(
    cache,
    { query: MeDocument },
    result,
    () => ({ me: null }) // set me to null
  );
};
