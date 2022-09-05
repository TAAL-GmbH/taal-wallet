import { WalletClient } from './WalletClient';
import { state } from './state';

const btnConnect: HTMLButtonElement = document.querySelector('#btn-connect');
const btnDisconnect: HTMLButtonElement = document.querySelector('#btn-disconnect');
const btnGetAddress: HTMLButtonElement = document.querySelector('#btn-get-address');
const btnGetBalance: HTMLButtonElement = document.querySelector('#btn-get-balance');
const btnGetUnspent: HTMLButtonElement = document.querySelector('#btn-get-unspent');
const btnCreateTx: HTMLButtonElement = document.querySelector('#btn-create-tx');
const btnSignMessage: HTMLButtonElement = document.querySelector('#btn-sign-message');
const btnInvalidAction: HTMLButtonElement = document.querySelector('#btn-invalid-action');

const wallet = new WalletClient({
  name: 'chuck-norris',
  extensionId: 'fdankaefdgldeaheancncgnikjkpnndo',
});

wallet.on('balance', (balance: number) => {
  state.balance = balance;
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
    console.error(e);
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
  console.warn(`Error: ${error?.reason || 'unknown'}`);
  state.error = error?.reason;
});

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
  // @ts-ignore
  const publicKey = new bsv.PublicKey.fromString(state.publicKey);
  // @ts-ignore
  const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer()).toString('hex');
  // @ts-ignore
  const lockingScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${pubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`);

  const utxo = {
    txid: unspent.tx_hash,
    vout: unspent.tx_pos,
    scriptPubKey: lockingScript.toHex(),
    amount: unspent.value / 1e8,
  };

  // @ts-ignore
  const tx = new bsv.Transaction()
    .from(utxo)
    .to(state.address, Math.floor(unspent.value / 2))
    .change(state.address);

  state.transaction = JSON.stringify(tx, null, 2);
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

// @ts-ignore for testing purposes only
window.wallet = wallet;
