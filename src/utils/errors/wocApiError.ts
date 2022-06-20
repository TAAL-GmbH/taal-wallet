import { errorMessages } from '@/src/constants/errorCodes';
import { ErrorCodeEnum } from '@/src/types';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { ApiError } from './apiError';

export class WocApiError extends ApiError {
  constructor(options: FetchBaseQueryError) {
    const { status, data } = options;

    let message = 'Unknown error';
    let statusCode: number = 500;
    let wocErrorId: number;

    if (typeof data === 'string') {
      const match = data.match(/unexpected response code (\d+): (\d+): (.+)/);
      if (match) {
        statusCode = parseInt(match[1]);
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
