interface HDPK {
  network: string;
  depth: number;
  parentFingerPrint: number;
  childIndex: number;
  privateKey: string;
  chainCode: string;
}

declare namespace bsv {
  namespace Address {
    function fromString(address: string): string;
  }
  // class Address {
  //   constructor();
  //   fromString(address: string): string;
  // }
  class Transaction {
    constructor();
    from(arg: any): Transaction;
    to(arg: any, arg1: any): Transaction;
    change(arg: any): Transaction;
    sign(arg: HDPK | undefined): Transaction;
  }
  namespace Transaction {
    class UnspentOutput {
      constructor(args: {
        txId: string;
        outputIndex: number;
        address: string;
        script: string;
        satoshis: number;
      });
    }
  }
  namespace HDPrivateKey {
    function fromString(arg: string): HDPK;
  }
}
