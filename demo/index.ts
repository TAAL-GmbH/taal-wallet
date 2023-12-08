import { WalletClient, WalletError } from './WalletClient';
import { state } from './state';

// @ts-expect-error bsv is global
bsv.Transaction.DUST_AMOUNT = 0;

const btnConnect: HTMLButtonElement = document.querySelector('#btn-connect')!;
const btnDisconnect: HTMLButtonElement = document.querySelector('#btn-disconnect')!;
const btnGetAddress: HTMLButtonElement = document.querySelector('#btn-get-address')!;
const btnGetBalance: HTMLButtonElement = document.querySelector('#btn-get-balance')!;
const btnGetUnspent: HTMLButtonElement = document.querySelector('#btn-get-unspent')!;
const btnCreateTx: HTMLButtonElement = document.querySelector('#btn-create-tx')!;
const btnSignTx: HTMLButtonElement = document.querySelector('#btn-sign-tx')!;
const btnSignMessage: HTMLButtonElement = document.querySelector('#btn-sign-message')!;
const btnInvalidAction: HTMLButtonElement = document.querySelector('#btn-invalid-action')!;

const wallet = new WalletClient({
  name: 'chuck-norris',
  extensionId: 'engokokaoeppkmchbkjeoeimiffobcke', // production
});

wallet.on('balance', (balance: unknown) => {
  state.balance = balance as number;
});

wallet.on('address', (address: string) => {
  state.address = address;
});

wallet.on('connect', async () => {
  try {
    document.body.classList.add('connected');
    state.publicKey = await wallet.getPublicKey();
    state.rootPublicKey = await wallet.getRootPublicKey();
    state.address = await wallet.getAddress();
    state.balance = await wallet.getBalance();
    // balance also can be updated by wallet.on('balance')
    state.isConnected = true;
  } catch (e) {
    console.warn(e);
    state.error = e.message;
  }
});

wallet.on('disconnect', payload => {
  console.log('on disconnect', payload);
  state.isConnected = false;
  state.publicKey = null;
  state.rootPublicKey = null;
  state.address = null;
  state.balance = null;
  state.unspent = [];
  document.body.classList.remove('connected');
});

wallet.on('error', error => {
  console.warn(`Error: ${(error as WalletError)?.reason || 'unknown'}`);
  state.error = (error as WalletError)?.reason;
});

const getTransaction = async (txid: string) => {
  const url = `https://api.whatsonchain.com/v1/bsv/test/tx/${txid}`;
  const response = await fetch(url);
  return response.json();
};

btnConnect.addEventListener('click', () => {
  wallet.connect();
});

btnDisconnect.addEventListener('click', () => {
  wallet.disconnect();
});

btnGetAddress.addEventListener('click', async () => {
  state.address = 'Requesting';
  state.address = await wallet.getAddress();
});

btnGetBalance.addEventListener('click', () => {
  wallet.getBalance();
});

btnGetUnspent.addEventListener('click', async () => {
  state.unspent = await wallet.getUnspent();
});

btnCreateTx.addEventListener('click', async () => {
  const unspentList = await wallet.getUnspent();
  state.unspent = unspentList;

  if (!state.address) {
    state.error = 'No address';
    return;
  }
  if (!state.publicKey) {
    state.error = 'No public key';
    return;
  }
  if (!state.rootPublicKey) {
    state.error = 'No Root public key';
    return;
  }
  if (!state.unspent.length) {
    state.error = 'No unspent transactions';
    return;
  }

  const unspent = unspentList[0];
  // @ts-expect-error bsv is global
  const publicKey = new bsv.PublicKey.fromString(state.publicKey);
  // @ts-expect-error bsv is global
  const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer()).toString('hex');

  const unspentTx = await getTransaction(unspent.tx_hash);
  // @ ts-expect-error bsv is global
  // const lockingScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${pubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`);
  console.log({ unspentTx });
  const lockingScript = unspentTx.vout[0].scriptPubKey.hex;

  const utxo = {
    txid: unspent.tx_hash,
    vout: unspent.tx_pos,
    // scriptPubKey: lockingScript.toHex(),
    scriptPubKey: lockingScript,
    amount: unspent.value / 1e8,
  };

  console.log({ unspent, publicKey, pubKeyHash, lockingScript, utxo });

  // @ts-expect-error bsv is global
  const tx = new bsv.Transaction().from(utxo).to(state.address, 1).change(state.address);

  document.querySelector('#txInput')!.innerHTML = JSON.stringify(tx.toObject(), null, 2);
  state.transaction = JSON.stringify(tx, null, 2);
});

btnSignTx.addEventListener('click', async () => {
  const inputEl = document.querySelector('#txInput') as HTMLTextAreaElement;

  let txObj: object;
  try {
    txObj = JSON.parse(inputEl.value);
  } catch (e) {
    state.error = 'Invalid transaction';
    return;
  }
  // @ts-expect-error bsv is global
  const tx = new bsv.Transaction(txObj);
  state.signResult = await wallet.signTx(tx).catch(() => '');
  console.log({ signResult: state.signResult });
});

btnSignMessage.addEventListener('click', async () => {
  const inputEl = document.querySelector('input[name=messageInput]') as HTMLInputElement;
  if (inputEl.value.length === 0) {
    state.error = 'No message';
    return;
  }
  state.signMessageResult = await wallet.signMessage(inputEl.value).catch(() => '');
});

btnInvalidAction.addEventListener('click', async () => {
  try {
    await wallet.request({ action: 'invalid-action' });
  } catch (e) {
    console.warn(`catched error`, e);
  }
});

// @ts-expect-error for testing purposes only
window.wallet = wallet;
