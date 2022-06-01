import { errorMessages } from '@/src/constants/errorCodes';
import { ErrorCodeEnum } from '@/src/types';

type Info = Record<string, string | number | boolean>;

type Options = {
  errorCode: ErrorCodeEnum;
  message?: string;
  statusCode?: number;
} & Info;

export class ApiError extends Error {
  info: Info;
  errorCode: ErrorCodeEnum;
  statusCode: number;

  constructor(options: Options) {
    const { statusCode = 500, errorCode, message, ...info } = options;
    const messageText =
      message ||
      errorMessages[errorCode] ||
      errorMessages[ErrorCodeEnum.UNKNOWN_ERROR];

    super(messageText);
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.info = info;
  }
}
