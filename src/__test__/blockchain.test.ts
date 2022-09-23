jest.mock('../features/wocApi');

import { createBSVTransferTransaction, sendBSV } from '../utils/blockchain';
import * as wocApi from '../features/wocApi';

let srcAddress = 'mh62GKa9jwsYztZRGAUbFA9iVF5oM3HoVf';
let dstAddress = 'mfuva4vmYVEnjXVMapE38xaK4UTjcfnNLh';
const privateKeyHash = 'cNW8heePSKeqCbPfQJhf2tLgNN6sVrfuAPAoaqk1FJbEuZ3FUgfB';
const network = 'testnet';

describe('blockchain.js', () => {
  describe('createBSVTransferTransaction', () => {
    it('should throw an error when srcAddress is invalid', async () => {
      const fn = () =>
        createBSVTransferTransaction({
          srcAddress: 'invalid',
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 1,
        });

      await expect(fn).rejects.toThrowError('Invalid source address: invalid');
    });

    it('should throw an error when destAddress is invalid', async () => {
      const fn = () =>
        createBSVTransferTransaction({
          srcAddress,
          dstAddress: 'invalid',
          privateKeyHash,
          network,
          satoshis: 1,
        });

      await expect(fn).rejects.toThrowError('Invalid destination address: invalid');
    });

    it('should throw an error when destAddress is too short', async () => {
      const fn = () =>
        createBSVTransferTransaction({
          srcAddress,
          dstAddress: 'mfuva4vmYVEnjXVMapE38xaK4UTj',
          privateKeyHash,
          network,
          satoshis: 1,
        });

      await expect(fn).rejects.toThrowError('Invalid destination address: mfuva4vmYVEnjXVMapE38xaK4UTj');
    });

    it('should throw an error when destAddress is too long', async () => {
      const fn = () =>
        createBSVTransferTransaction({
          srcAddress,
          dstAddress: 'mfuva4vmYVEnjXVMapE38xaK4UTjVMapE38xaK4UTjmYVEn',
          privateKeyHash,
          network,
          satoshis: 1,
        });

      await expect(fn).rejects.toThrowError(
        'Invalid destination address: mfuva4vmYVEnjXVMapE38xaK4UTjVMapE38xaK4UTjmYVEn'
      );
    });

    it('should throw an error when srcAddress is too short', async () => {
      const fn = () =>
        createBSVTransferTransaction({
          srcAddress: 'mfuva4vmYVEnjXVMapE38xaK4UTj',
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 1,
        });

      await expect(fn).rejects.toThrowError('Invalid source address: mfuva4vmYVEnjXVMapE38xaK4UTj');
    });

    it('should throw an error when srcAddress is too long', async () => {
      const fn = () =>
        createBSVTransferTransaction({
          srcAddress: 'mfuva4vmYVEnjXVMapE38xaK4UTjVMapE38xaK4UTjmYVEn',
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 1,
        });

      await expect(fn).rejects.toThrowError(
        'Invalid source address: mfuva4vmYVEnjXVMapE38xaK4UTjVMapE38xaK4UTjmYVEn'
      );
    });

    // validate that send amount cannot be zero, validation in front end?
    it('should throw an error when amount is zero', async () => {
      const fn = () =>
        createBSVTransferTransaction({
          srcAddress,
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 0,
        });
      await expect(fn).rejects.toThrowError('Amount must not be zero');
    });

    it('should return valid result', async () => {
      const result = (
        await createBSVTransferTransaction({
          srcAddress,
          dstAddress,
          privateKeyHash,
          network,
          satoshis: 1500000,
        })
      ).toObject();
      expect(result).toEqual(
        expect.objectContaining({
          changeScript:
            'OP_DUP OP_HASH160 20 0x11392aa71fb203ee7145e1cf46771a08c8d923f6 OP_EQUALVERIFY OP_CHECKSIG',
          hash: '6498c7b949607fce865863a62b3b3335bd1fb0b908c3d9bb00c6961648c9bc65',
        })
      );
    });

    // why is this broadcasting successfully, should inputs not be spent?
    it('should return valid result which can then be broadcast', async () => {
      const tx = await createBSVTransferTransaction({
        srcAddress,
        dstAddress,
        privateKeyHash,
        network,
        satoshis: 1500,
      });
      const result = await wocApi.broadcast(tx.toString());
      expect(JSON.stringify(result)).toContain(
        'cd73522be888ca665ccc5218fd79f5c8217acd4ede208f6b3c77700baa0964c2'
      );
    });

    it('should return result with one input', async () => {
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

    it('should return result with two inputs', async () => {
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

    it('should return result with three inputs', async () => {
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
    it('should do a request to broadcast', async () => {
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
