export type TrackEventOptions = {
  category?: string;
  label: string;
  action?: string;
};

export enum ErrorCodeEnum {
  UNAUTHORIZED = 'unauthorized',
  NO_REFRESH_TOKEN = 'noRefreshToken',
  REFRESH_TOKEN_FAILED = 'refreshTokenFailed',
  UNKNOWN_ERROR = 'unknownError',
}

export type ParametersExceptFirst<F> = F extends (
  arg0: unknown,
  ...rest: infer R
) => unknown
  ? R
  : never;
