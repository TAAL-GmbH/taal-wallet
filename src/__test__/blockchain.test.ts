// @ts-nocheck
jest.mock('@/db/index.ts');
jest.mock('@/db/shared.ts');
import { createBSVTransferTransaction, sendBSV } from '../utils/blockchain';
import * as wocApi from '../features/woc-api';
import { store } from '../store';
import { setState } from '../features/pk-slice';
const srcAddress = 'mqz2RSpt6cH4u1VQpRVQf8iYKMuSrZvX9W';
const dstAddress = 'mfuva4vmYVEnjXVMapE38xaK4UTjcfnNLh';
const privateKeyHash = 'cNW8heePSKeqCbPfQJhf2tLgNN6sVrfuAPAoaqk1FJbEuZ3FUgfB';
const network = 'testnet';

describe('blockchain.js', () => {
  beforeAll(() => {
    // initStoreSync();
    store.dispatch(
      setState({
        network: {
          id: 'testnet',
          label: 'Testnet',
          envName: 'testnet',
          wocNetwork: 'test',
        },
        activePk: {
          address: 'my9XmnKGJu89qN6xpcqDRy9FKWhsph95fi',
          name: 'Wallet-0',
          path: "m/44'/236'/0'/0/0",
          balance: {
            updatedAt: 1666778958475,
            satoshis: 1976396,
          },
          rootPk: {
            privateKeyHash: privateKeyHash,
            privateKeyEncrypted: privateKeyHash,
          },
        },
      })
    );
  });
  describe('createBSVTransferTransaction', () => {
    test.only('should return valid result and broadcast', async () => {
      console.log(store.getState().pk);
      const res = await wocApi.airdrop(srcAddress);
      console.log(res);
      return;
      const result = await createBSVTransferTransaction({
        srcAddress,
        dstAddress,
        privateKeyHash,
        network,
        satoshis: 1500000,
      });
    });

    test('Attempt to create bsv tx with no utxo', async () => {
      try {
        await createBSVTransferTransaction({
          srcAddress,
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 10000,
        });
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err.toString()).toEqual('Error: No funds available');
      }
    });

    test('should return valid result which can then be broadcast', async () => {
      const tx = await createBSVTransferTransaction({
        srcAddress,
        dstAddress,
        privateKeyHash,
        network,
        satoshis: 1500,
      });
      const result = await wocApi.broadcast(tx.toString());
      console.log(result);
      expect(JSON.stringify(result)).toContain(
        'cd73522be888ca665ccc5218fd79f5c8217acd4ede208f6b3c77700baa0964c2'
      );
    });

    test('should return result with one input', async () => {
      const result = (
        await createBSVTransferTransaction({
          srcAddress,
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 900000,
        })
      ).toObject();

      expect(result.inputs.length).toEqual(1);
    });

    test('should return result with two inputs', async () => {
      const result = (
        await createBSVTransferTransaction({
          srcAddress,
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 1500000,
        })
      ).toObject();
      expect(result.inputs.length).toEqual(2);
    });

    test('should return result with three inputs', async () => {
      const result = (
        await createBSVTransferTransaction({
          srcAddress,
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 2500000,
        })
      ).toObject();
      expect(result.inputs.length).toEqual(3);
    });
  });

  describe('sendBSV', () => {
    test('should do a request to broadcast', async () => {
      const result = await sendBSV({
        srcAddress,
        dstAddress,
        privateKeyHash,
        network,
        satoshis: 1500000,
      });
      expect(wocApi.broadcast).toBeCalledWith(
        '0100000002a44e5de57128bee24735354461353c285d272688fd93595757e65823b3c6ad06010000006b483045022100b762f19d1e16ed90360738841165910cdbf28b3ef75966f7ad14ec2b0125df9d02207856f706093bfa238d7078932980f9ed1dcbf785ca33f1bebd66b9e0f2936642412103f9723305aa1c61e1e487663608c0a879e2a44f80f40a2a81eb89f088d74e2906fffffffffa649f339877ed4e1b2ae850ef1e11472ae185aa4ffda0a90706b3ae5e616c43010000006a47304402207bd6fb4ba7ac2772659a9921cd32e0701b03e622ed6830020cd221a78d6f0d110220621e7b57db0c10a5f3b5be2de7ad1aa1c95774487b7502cf8623ccad13877b85412103f9723305aa1c61e1e487663608c0a879e2a44f80f40a2a81eb89f088d74e2906ffffffff0260e31600000000001976a914045820caa3865456b5a659cf5d1a167de93adafa88ac9c900700000000001976a91411392aa71fb203ee7145e1cf46771a08c8d923f688ac00000000'
      );
    });
  });
});
