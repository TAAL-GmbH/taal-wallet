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

export type ParametersExceptFirst<F> = F extends (
  arg0: unknown,
  ...rest: infer R
) => unknown
  ? R
  : never;

export type OriginType = {
  origin: string;
  isAuthorized: boolean;
  isPersistent: boolean;
};
// export type OriginData = {
//   isAuthorized: boolean;
//   isPersistent: boolean;
// };

export type DbPKType = {
  name: string;
  address: string;
  path: string;
  network: string;
  privateKeyEncrypted: string;
  balance: {
    updatedAt: number | null;
    amount: number | null;
  };
};

export type RootPKType = {
  privateKeyHash: string;
};

export type PKType = Pick<
  DbPKType,
  'name' | 'address' | 'path' | 'network' | 'balance'
> & {
  privateKey: string;
};

export type PKMap = Record<string, PKType>;

// export type hdKeyNetwork = {
//   alias: string;
//   cashAddrPrefix: string;
//   cashAddrPrefixArray: number[];
//   dnsSeeds: string[];
//   name: string;
//   networkMagic: number[];
//   port: number;
//   privatekey: number;
//   pubkeyhash: number;
//   scripthash: number;
//   xprivkey: number;
//   xpubkey: number;
// };

// export type hdPublicKey = {
//   depth: number;
//   fingerPrint: number[];
//   network: hdKeyNetwork;
//   publicKey: {
//     compressed: boolean;
//     network: hdKeyNetwork;
//     point: unknown;
//   };
//   xpubkey: string;
//   _buffers: unknown;
// };

// export type HDPrivateKey = {
//   depth: number;
//   fingerPrint: number[];
//   hdPublicKey: hdPublicKey;
//   network: hdKeyNetwork;
//   privateKey: {
//     bn: unknown;
//     compressed: boolean;
//     network: hdKeyNetwork;
//     publicKey: {
//       compressed: boolean;
//       network: hdKeyNetwork;
//       point: unknown;
//     };
//   };
//   publicKey: {
//     compressed: boolean;
//     network: hdKeyNetwork;
//     point: unknown;
//   };
//   xprivkey: string;
//   xpubkey: string;
//   _buffers: {
//     chainCode: number[];
//     checksum: number[];
//     childIndex: number[];
//     depth: number[];
//     parentFingerPrint: number[];
//     privateKey: number[];
//     version: number[];
//     xprivkey: number[];
//   };
//   _hdPublicKey: null;
// };

export type DialogData = {
  id: number;
  title: string;
  body?: string;
  error?: string;
  timeout?: number;
  options: {
    label: string;
    variant?: ButtonStyleProps['variant'];
    returnValue?: string;
  }[];
  response?: number;
  data?: unknown;
};
