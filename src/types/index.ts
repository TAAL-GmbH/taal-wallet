import { ButtonStyleProps } from '../components/button';

export type TrackEventOptions = {
  category?: string;
  label: string;
  action?: string;
};

export enum ErrorCodeEnum {
  UNAUTHORIZED = 'unauthorized',
  UNKNOWN_ERROR = 'unknownError',
}

export type ParametersExceptFirst<F> = F extends (
  arg0: unknown,
  ...rest: infer R
) => unknown
  ? R
  : never;

export type OriginData = {
  isAuthorized: boolean;
  isPersistent: boolean;
};

export type PKType = {
  name: string;
  address: string;
  pk: string;
  balance: number | null;
};

export type hdKeyNetwork = {
  alias: string;
  cashAddrPrefix: string;
  cashAddrPrefixArray: number[];
  dnsSeeds: string[];
  name: string;
  networkMagic: number[];
  port: number;
  privatekey: number;
  pubkeyhash: number;
  scripthash: number;
  xprivkey: number;
  xpubkey: number;
};

export type hdPublicKey = {
  depth: number;
  fingerPrint: number[];
  network: hdKeyNetwork;
  publicKey: {
    compressed: boolean;
    network: hdKeyNetwork;
    point: unknown;
  };
  xpubkey: string;
  _buffers: unknown;
};

export type HDPrivateKey = {
  depth: number;
  fingerPrint: number[];
  hdPublicKey: hdPublicKey;
  network: hdKeyNetwork;
  privateKey: {
    bn: unknown;
    compressed: boolean;
    network: hdKeyNetwork;
    publicKey: {
      compressed: boolean;
      network: hdKeyNetwork;
      point: unknown;
    };
  };
  publicKey: {
    compressed: boolean;
    network: hdKeyNetwork;
    point: unknown;
  };
  xprivkey: string;
  xpubkey: string;
  _buffers: {
    chainCode: number[];
    checksum: number[];
    childIndex: number[];
    depth: number[];
    parentFingerPrint: number[];
    privateKey: number[];
    version: number[];
    xprivkey: number[];
  };
  _hdPublicKey: null;
};

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
