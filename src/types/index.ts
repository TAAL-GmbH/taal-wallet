import bsv from 'bsv';

import { ButtonStyleProps } from '@/components/generic/button';

export enum ErrorCodeEnum {
  UNAUTHORIZED = 'unauthorized',
  UNKNOWN_ERROR = 'unknownError',
  BAD_TXNS_IN_BELOWOUT = 'bad-txns-in-belowout',
}

export type UTXO = {
  address?: string;
  scriptPubKey: string;
  txid: string;
  vout: number;
  satoshis: number;
};

export type UTXOWithAmount = Omit<UTXO, 'satoshis'> & {
  amount: number;
};

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

export type AccountType = {
  id: string;
  name: string;
  networkId: string;
};

export type PKType = {
  name: string;
  address: string;
  path: string;
  balance: {
    updatedAt: number | null;
    satoshis: number | null;
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

export type SignPreimageData = {
  i: number;
  satoshis: number;
  script: string;
  sighash: number;
  tx: string;
};

export type SignTxData = bsv.Transaction;

export type SignMessage = string;

export type DialogData = {
  id: number;
  title?: string;
  error?: string;
  timeout?: number;
  fitView?: boolean;
  resizeWindow?: boolean;
  options: {
    label: string;
    variant?: ButtonStyleProps['$variant'];
    returnValue?: string;
  }[];
  response?: number;
} & (
  | {
      dialogType: 'html';
      data: {
        body: string;
      };
    }
  | {
      dialogType: 'confirm:origin';
      data: {
        origin: string;
      };
    }
  | {
      dialogType: 'sign:transaction';
      data: {
        txData: string;
        network: string;
      };
    }
  | {
      dialogType: 'sign:preimage';
      data: {
        preimageData: SignPreimageData;
        network: string;
      };
    }
  | {
      dialogType: 'sign:message';
      data: {
        message: SignMessage;
        network: string;
      };
    }
);

export type MediaType = {
  mimeType: string;
  isAudio: boolean;
  isVideo: boolean;
  isImage: boolean;
  isText: boolean;
  size: number;
  fileName: string;
  duration?: number | null;
  contentBase64: string;
  isValidContent: boolean | null;
  attributeList?: {
    key: string;
    value: string;
  }[];
};

export type ParsedTokenDetails = {
  decimals: number;
  description: string;
  image?: string;
  name: string;
  properties: Record<string, unknown>;
  satsPerToken: number;
  symbol: string;
  tokenId: string;
  totalSupply: number;
};

export type InjectSpacing = {
  $margin?: string;
  $padding?: string;
  $gap?: string;
};
