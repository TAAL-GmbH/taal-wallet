import bsv, { Mnemonic } from 'bsv';
import 'bsv/mnemonic';
import { broadcast, getTx, getUnspent } from '../features/wocApiSlice';
import { ApiResponse, ErrorCodeEnum } from '../types';
import { WocApiError } from './errors/wocApiError';
import { getErrorMessage } from './generic';
import { networkList } from '../constants/networkList';
import stas from 'stas-js';

const SATS_PER_BITCOIN = 1e8;

// const sighash =
//   bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID;

export const isValidAddress = (addr: string, network: string) => {
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
  rootPkHash,
  amount,
}: {
  srcAddress: string;
  dstAddress: string;
  rootPkHash: string;
  amount: number;
}): Promise<ApiResponse<string>> => {
  const rootPk = bsv.HDPrivateKey.fromString(rootPkHash);
  const network = rootPk.network.name;

  if (!isValidAddress(srcAddress, network)) {
    throw new Error(`Invalid source address: ${srcAddress}`);
  }
  if (!isValidAddress(dstAddress, network)) {
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

  const tx = new bsv.Transaction()
    .from(utxo)
    .to(dstAddress, amount)
    // TODO: create new address for change
    .change(srcAddress)
    .sign(rootPk.privateKey);

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
      throw new WocApiError(result.error);
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

export const createHDPrivateKey = ({
  mnemonic,
  networkId,
  password,
}: {
  mnemonic: Mnemonic;
  networkId: string;
  password: string;
}) => {
  const network = networkList.find(item => item.id === networkId);

  const mSeed = mnemonic.toSeed(password);
  const masterPrivateKey = bsv.HDPrivateKey.fromSeed(mSeed, network.envName);

  // another way of doing the same thing
  // const hDPrivateKey2 = mnemonic.toHDPrivateKey(password, network);
  // var copy_of_child_0_1_2h = hDPrivateKey2.deriveChild("m/0/1/2'");

  // const child_0_1_2h = masterPrivateKey
  //   .deriveChild(0)
  //   .deriveChild(1)
  //   .deriveChild(2, true);

  return {
    pkInstance: masterPrivateKey,
  };
};

export const derivePk = ({
  name = `Key-${Date.now()}`,
  masterKey,
  path,
}: {
  name?: string;
  masterKey: bsv.HDPrivateKey;
  path: string;
}) => {
  const network = masterKey.network.name;
  // m / purpose' / coin_type' / account' / change / address_index
  // m / 44 / 236 / 0' / 0 / 0
  const pathSegments = path.split('/');
  if (pathSegments.length === 3) {
    pathSegments.unshift('m', "44'", "236'");
  }

  const fullPath = pathSegments.join('/');

  if (pathSegments.length !== 6) {
    throw new Error(`Invalid path: ${fullPath}`);
  }

  const key = masterKey.deriveChild(fullPath);
  const address = key.publicKey.toAddress(network).toString();

  return {
    address,
    path: fullPath,
    name,
    balance: {
      updatedAt: null,
      amount: null,
    },
  };
};

export const restorePK = (privateKey: string) =>
  bsv.HDPrivateKey.fromString(privateKey);

export const generateMnemonic = () => bsv.Mnemonic.fromRandom();
