import { ButtonStyleProps } from '../components/button';

export enum ErrorCodeEnum {
  UNAUTHORIZED = 'unauthorized',
  UNKNOWN_ERROR = 'unknownError',
  BAD_TXNS_IN_BELOWOUT = 'bad-txns-in-belowout',
}

export type ApiResponse<T = null> =
  | {
      success: false;
      data?: undefined | null;
      error: {
        errorCode: ErrorCodeEnum;
        message: string;
      };
    }
  | {
      success: true;
      data: T;
      error?: undefined | null;
    };

export type TrackEventOptions = {
  category?: string;
  label: string;
  action?: string;
};

export type ValueOf<T> = T[keyof T];

export type ParametersExceptFirst<F> = F extends (arg0: unknown, ...rest: infer R) => unknown ? R : never;

export type OriginType = {
  origin: string;
  isAuthorized: boolean;
  isPersistent: boolean;
};

export type PKType = {
  name: string;
  address: string;
  path: string;
  balance: {
    updatedAt: number | null;
    amount: number | null;
  };
};

export type PKFullType = PKType & {
  privateKeyHash: string;
  publicKeyHash: string;
};

export type RootPKType = {
  privateKeyHash: string;
  privateKeyEncrypted: string;
};

export type PKMap = Record<string, PKType>;

export type DialogData = {
  id: number;
  title: string;
  body?: string;
  error?: string;
  timeout?: number;
  fitView?: boolean;
  resizeWindow?: boolean;
  options: {
    label: string;
    variant?: ButtonStyleProps['variant'];
    returnValue?: string;
  }[];
  response?: number;
  data?: unknown;
};
