import { WalletClient } from './WalletClient';
import { state } from './state';

const btnConnect: HTMLButtonElement = document.querySelector('#btn-connect');
const btnDisconnect: HTMLButtonElement =
  document.querySelector('#btn-disconnect');
const btnGetAddress: HTMLButtonElement =
  document.querySelector('#btn-get-address');
const btnGetBalance: HTMLButtonElement =
  document.querySelector('#btn-get-balance');
const btnInvalidAction: HTMLButtonElement = document.querySelector(
  '#btn-invalid-action'
);

const wallet = new WalletClient({
  name: 'chuck-norris',
  extensionId: 'ohciijbnclheeepfobgifphlmaimhpkj',
});

wallet.on('balance', (balance: number) => {
  state.balance = balance;
});

wallet.on('address', (address: string) => {
  state.address = address;
});

wallet.on('connect', async () => {
  state.isConnected = true;
  state.address = await wallet.getAddress();
  const balance = await wallet.getBalance();
  console.log(`got balance as return: ${balance}`);
  document.body.classList.add('connected');
});

wallet.on('disconnect', () => {
  console.log('on disconnect');
  state.isConnected = false;
  document.body.classList.remove('connected');
});

wallet.on('error', error => {
  alert(`Error: ${error?.reason || 'unknown'}`);
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

btnInvalidAction.addEventListener('click', async () => {
  try {
    await wallet.request({ action: 'invalid-action' });
  } catch (e) {
    console.warn(`catched error`, e);
  }
});

// @ts-ignore
window.wallet = wallet;
