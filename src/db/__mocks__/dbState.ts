import { AccountType, PKType } from '@/types';

type SharedState = {
  accountMap: { [accountId: string]: AccountType };
  keyVal: Record<string, unknown>;
};

type State = {
  pkMap: Record<string, PKType>;
  keyVal: Record<string, unknown>;
};

export const _sharedDb: SharedState = {
  accountMap: {},
  keyVal: {},
};

export const _db: State = {
  pkMap: {},
  keyVal: {},
};
