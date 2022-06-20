import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import bsv, { Mnemonic } from 'bsv';
import 'bsv/mnemonic';
import { broadcast, getTx, getUnspent } from '../features/wocApiSlice';
import { ApiResponse, ErrorCodeEnum } from '../types';
import { ApiError } from './errors/apiError';
import { WocApiError } from './errors/wocApiError';
import { getErrorMessage } from './generic';
import stas from 'stas-js';

const DEFAULT_NETWORK = 'testnet';
const SATS_PER_BITCOIN = 1e8;

export const createHDPrivateKey = ({
  mnemonic,
  network = DEFAULT_NETWORK,
  password = '',
}: {
  mnemonic: Mnemonic;
  network?: string;
  password?: string;
}) => {
  // @ts-ignore
  window.bsv = bsv;
  const mSeed = mnemonic.toSeed(password);

  const hDPrivateKeyFromSeed = bsv.HDPrivateKey.fromSeed(mSeed, network);
  const hDPrivateKey2 = mnemonic.toHDPrivateKey(password, network);

  const child_0_1_2h = hDPrivateKeyFromSeed
    .deriveChild(0)
    .deriveChild(1)
    .deriveChild(2, true);
  var copy_of_child_0_1_2h = hDPrivateKey2.deriveChild("m/0/1/2'");

  console.log({
    mSeed,
    // hDPrivateKey0: hDPrivateKey0.toString(),
    // hDPrivateKeyFromSeed: hDPrivateKeyFromSeed.toString(),
    hDPrivateKeyFromSeed,
    // hDPrivateKey2: hDPrivateKey2.toString(),
    hDPrivateKey2,
    child_0_1_2h,
    copy_of_child_0_1_2h,
    // address,
    // address2,
  });

  return;

  // store.dispatch(
  //   appendPK({
  //     address,
  //     pk: masterPrivateKey.toString(),
  //     name: Date.now().toString(),
  //     balance: null,
  //   })
  // );
};

export const isValidAddress = (addr: string, network = DEFAULT_NETWORK) => {
  try {
    new bsv.Address(addr, network);
    return true;
  } catch {
    return false;
  }
};

export const bitcoinToSatoshis = (amount: number) =>
  Math.round(amount * SATS_PER_BITCOIN);
export const satoshisToBitcoin = (amount: number) => amount / SATS_PER_BITCOIN;

export const sendBSV = async ({
  srcAddress,
  dstAddress,
  privateKey,
  amount,
}: {
  srcAddress: string;
  dstAddress: string;
  privateKey: string;
  amount: number;
}): Promise<ApiResponse<string>> => {
  if (!isValidAddress(srcAddress)) {
    throw new Error(`Invalid source address: ${srcAddress}`);
  }
  if (!isValidAddress(dstAddress)) {
    throw new Error(`Invalid destination address: ${dstAddress}`);
  }

  const { data: unspentList } = await getUnspent(srcAddress);

  if (!unspentList?.length) {
    throw new Error('No funds available');
  }

  const {
    tx_hash: txId,
    tx_pos: outputIndex,
    value: satoshis,
  } = unspentList[0];

  const { data: unspentTx } = await getTx(txId);
  const script = unspentTx?.vout[outputIndex].scriptPubKey.hex;

  const utxo = new bsv.Transaction.UnspentOutput({
    txId,
    outputIndex,
    address: srcAddress,
    script,
    satoshis,
  });

  console.log({
    txId,
    outputIndex,
    address: srcAddress,
    script,
    satoshis,
  });

  const pkObj = bsv.HDPrivateKey.fromString(privateKey);

  const tx = new bsv.Transaction()
    .from(utxo)
    .to(dstAddress, amount)
    // TODO: create new address for change
    .change(srcAddress)
    .sign(pkObj.privateKey);

  try {
    const result = await broadcast(tx.toString());
    if ('data' in result && /^[0-9a-fA-F]{64}$/.test(result.data)) {
      console.log('tx broadcasted', result.data);
      return {
        success: true,
        data: result.data,
      };
    } else if ('error' in result) {
      console.log('tx broadcast error', result.error);
      throw new WocApiError(result.error as FetchBaseQueryError);
    }
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: {
        errorCode: ErrorCodeEnum.UNKNOWN_ERROR,
        message: getErrorMessage(e, 'Unknown error'),
      },
    };
  }
};
