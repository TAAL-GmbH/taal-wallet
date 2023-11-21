import { errorMessages } from '@/constants/error-codes';
import { ErrorCodeEnum } from '@/types';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';

import { ApiError } from './api-error';

export class WocApiError extends ApiError {
  constructor(options: FetchBaseQueryError | SerializedError) {
    const { status, data } = options as FetchBaseQueryError;

    let message = 'Unknown error';
    let wocErrorId: number;

    if (typeof data === 'string') {
      const match = data.match(/unexpected response code (\d+): (\d+): (.+)/);
      if (match) {
        wocErrorId = parseInt(match[2]);
        message = errorMessages[match[3]] || match[3];
      }
    }

    super({
      errorCode: ErrorCodeEnum.UNKNOWN_ERROR,
      statusCode: typeof status === 'number' ? status : 500,
      message,
      wocErrorId,
    });
  }
}
