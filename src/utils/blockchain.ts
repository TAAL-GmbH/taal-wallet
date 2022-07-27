import bsv, { Mnemonic } from 'bsv';
import 'bsv/mnemonic';
import { broadcast, getTx, getUnspent } from '../features/wocApiSlice';
import { ApiResponse, ErrorCodeEnum, PKFullType, PKType } from '../types';
import { WocApiError } from './errors/wocApiError';
import { getErrorMessage } from './generic';
import { networkList } from '../constants/networkList';

const SATS_PER_BITCOIN = 1e8;

type SendBsvOptions = {
  srcAddress: string;
  dstAddress: string;
  privateKeyHash: string;
  network: string;
  amount: number;
};

// const sighash = bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID;

export const isValidAddress = (addr: string, network: string) => {
  try {
    new bsv.Address(addr, network);
    return true;
  } catch {
    return false;
  }
};

export const bitcoinToSatoshis = (amount: number) => Math.round(amount * SATS_PER_BITCOIN);
export const satoshisToBitcoin = (amount: number) => amount / SATS_PER_BITCOIN;

export const createBSVTransferTransaction = async ({
  srcAddress,
  dstAddress,
  privateKeyHash,
  network,
  amount,
}: SendBsvOptions) => {
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
  const { tx_hash: txId, tx_pos: outputIndex, value: satoshis } = unspentList[0];
  const { data: unspentTx } = await getTx(txId);
  const script = unspentTx?.vout[outputIndex].scriptPubKey.hex;
  const utxo = new bsv.Transaction.UnspentOutput({
    txId,
    outputIndex,
    address: srcAddress,
    script,
    satoshis,
  });
  return (
    new bsv.Transaction()
      .from(utxo)
      .to(dstAddress, amount)
      // TODO: create new address for change
      .change(srcAddress)
      .sign(privateKeyHash)
  );
};

export const sendBSV = async ({
  srcAddress,
  dstAddress,
  privateKeyHash,
  network,
  amount,
}: SendBsvOptions): Promise<ApiResponse<string>> => {
  if (!isValidAddress(srcAddress, network)) {
    throw new Error(`Invalid source address: ${srcAddress}`);
  }
  if (!isValidAddress(dstAddress, network)) {
    throw new Error(`Invalid destination address: ${dstAddress}`);
  }

  const tx = await createBSVTransferTransaction({
    srcAddress,
    dstAddress,
    privateKeyHash,
    network,
    amount,
  });

  try {
    const result = await broadcast(tx.toString());
    if ('data' in result && /^[0-9a-fA-F]{64}$/.test(result.data)) {
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
  const rootKey = bsv.HDPrivateKey.fromSeed(mSeed, network.envName);

  // another way of doing the same thing
  // const hDPrivateKey2 = mnemonic.toHDPrivateKey(password, network);
  // var copy_of_child_0_1_2h = hDPrivateKey2.deriveChild("m/0/1/2'");

  // const child_0_1_2h = rootPrivateKey
  //   .deriveChild(0)
  //   .deriveChild(1)
  //   .deriveChild(2, true);

  return {
    pkInstance: rootKey,
  };
};

export const derivePk = ({
  name,
  rootKey: rootKeyInput,
  path,
}: {
  name?: string;
  rootKey: string | bsv.HDPrivateKey;
  path: string;
}): PKFullType => {
  let rootKey = typeof rootKeyInput === 'string' ? restorePK(rootKeyInput) : rootKeyInput;
  const network = rootKey.network.name;
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

  const key = rootKey.deriveChild(fullPath);
  const address = key.publicKey.toAddress(network).toString();

  return {
    address,
    privateKeyHash: key.privateKey.toString(),
    publicKeyHash: key.publicKey.toString(),
    path: fullPath,
    name: name || `Wallet-${pathSegments[5]}`,
    balance: {
      updatedAt: null,
      amount: null,
    },
  };
};

export const restorePK = (privateKeyHash: string) => bsv.HDPrivateKey.fromString(privateKeyHash);

export const generateMnemonic = () => bsv.Mnemonic.fromRandom();

export const rebuildMnemonic = (phrase: string) => bsv.Mnemonic.fromString(phrase);
