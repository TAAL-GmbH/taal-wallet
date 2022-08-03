import { AccountType, PKType } from '@/src/types';

type SharedState = {
  accountMap: { [accountId: string]: AccountType };
  keyVal: Record<string, any>;
};

type State = {
  pkMap: Record<string, PKType>;
  keyVal: Record<string, any>;
};

export const _sharedDb: SharedState = {
  accountMap: {},
  keyVal: {},
};

export const _db: State = {
  pkMap: {},
  keyVal: {},
};
