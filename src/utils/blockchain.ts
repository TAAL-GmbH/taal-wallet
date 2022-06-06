import bsv, { Mnemonic } from 'bsv';
import 'bsv/mnemonic';

export const createHDPrivateKey = ({
  mnemonic,
  network = 'testnet',
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
