import { ErrorCodeEnum } from '@/types';

export const errorMessages = {
  [ErrorCodeEnum.UNAUTHORIZED]: 'Unauthorized',
  [ErrorCodeEnum.UNKNOWN_ERROR]: 'Unknown API error',
  [ErrorCodeEnum.BAD_TXNS_IN_BELOWOUT]: 'Not enough funds',
};
