jest.mock('../features/wocApi');
jest.mock('../db/index.ts');
jest.mock('../db/shared.ts');

import { initBackground } from '../pages/background/index';
import { mockForBackground } from './jest.chrome-mock';
import { WalletClient } from '../../demo/WalletClient';
import { replacePKMap, setActivePk, setRootPK } from '../features/pkSlice';
import { dispatchAndValidate } from '../utils/dispatchAndValidate';

const address = '0x0000000000000000000000000000000000000000';
const privateKeyHash =
  'tprv8ZgxMBicQKsPdeZmGQd1jwHx9AccNSSWRA4QF2H5W1W3vbd93S2i6bgcR7Q1VheEq89J4Sccsy5XppBDJQxe81jmrY8GecFBFjSF7ZWq11r';
const publicKeyHash = '03e7beeae73e19410623b0bdc6e502f416f2993e8820df81f522902aeaf99abd24';
const path = "m/44'/236'/0'/0/0";

describe('background.js', () => {
  let wallet: WalletClient;

  beforeAll(async () => {
    await dispatchAndValidate(
      replacePKMap({
        [address]: {
          address,
          balance: {
            satoshis: 100000,
            updatedAt: Date.now(),
          },
          name: 'My Wallet',
          path,
        },
      }),
      s => s.pk.map[address]?.address === address
    );

    await dispatchAndValidate(setActivePk(address), s => s.pk.activePk?.address === address);

    await dispatchAndValidate(
      setRootPK({
        privateKeyHash,
        privateKeyEncrypted: '',
      }),
      s => s.pk.rootPk?.privateKeyHash === privateKeyHash
    );
  });

  beforeEach(() => {
    mockForBackground();
    initBackground();
    wallet = new WalletClient({ name: 'name', extensionId: 'extId' });
  });

  it('should return valid address', done => {
    (async () => {
      wallet.on('disconnect', done);

      wallet.on('connect', async () => {
        expect(await wallet.getAddress()).toEqual(address);
        wallet.disconnect();
      });

      wallet.connect();
    })();
  });

  it('should return valid public key', done => {
    (async () => {
      wallet.on('disconnect', done);

      wallet.on('connect', async () => {
        expect(await wallet.getPublicKey()).toEqual(publicKeyHash);
        wallet.disconnect();
      });

      wallet.connect();
    })();
  });

  it('should return valid balance', done => {
    (async () => {
      wallet.on('disconnect', done);

      wallet.on('connect', async () => {
        expect(await wallet.getBalance()).toEqual(1998653);
        wallet.disconnect();
      });

      wallet.connect();
    })();
  });
});
