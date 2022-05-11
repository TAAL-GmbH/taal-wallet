// @ts-expect-error
importScripts('/scripts/bitcoin-components.js');
// @ts-expect-error
importScripts('/scripts/wallet-connect.js');
// @ts-expect-error
importScripts('/scripts/bsv-min.js');
// @ts-expect-error
importScripts('/scripts/bsv-message.min.js');

console.log('background.js loaded');

let pk = new PK();
const sighash =
  bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID;

class PKRetriever {
  request;
  sender;
  sendResponse;

  pkRetrievedListener() {
    checkConnection(this.request, this.sendResponse);
  }

  pkNotFoundListener(source) {
    this.sendResponse('Key not found, please initialize your key');
  }
}

class ConnectionRetriever {
  request;
  sendResponse;

  connectionRetrievedListener() {
    handleRequest(this.request, this.sendResponse);
  }

  connectionNotFoundListener() {
    this.sendResponse('Wallet not connected, please connect your wallet');
  }
}

function checkConnection(request, sendResponse) {
  if (request.command === undefined || !request.command) {
    sendResponse('error. request.name invalid');
    return;
  }
  if (!request.origin) {
    sendResponse('error. no origin');
    return;
  }

  if (request.command === 'disconnect') {
    let walletConnection = new WalletConnection();
    walletConnection.removeConnectionFromStorage(request.origin, sendResponse);
    return;
  }

  // upon window creation, let the popup query me for the  origin string
  let windowCallback = w => {
    chrome.runtime.onMessage.addListener(function (
      windowRequest,
      sender,
      windowSendResponse
    ) {
      if (windowRequest === 'get-origin') {
        windowSendResponse({ origin: request.origin });
        return;
      }
      if (windowRequest === 'origin-connect') {
        sendResponse({
          status: 'connected',
          address: pk.address,
          publicKey: pk.pk.publicKey.toString(),
        });
      }
    });
  };
  // create a connection popup and then pass it the origin
  if (request.command === 'connect') {
    chrome.windows.create(
      {
        type: 'popup',
        url: 'connect.html',
        width: 500,
        height: 800,
      },
      windowCallback
    );
    return;
  }

  let connectionRetriever = new ConnectionRetriever();
  connectionRetriever.request = request;
  connectionRetriever.sendResponse = sendResponse;

  if (!request.origin) {
    connectionRetriever.connectionNotFoundListener();
    return;
  }
  let walletConnection = new WalletConnection();
  walletConnection.retrieveConnection(request.origin, connectionRetriever);
}

async function handleRequest(request, sendResponse) {
  switch (request.command) {
    case 'sign': {
      // confirmation popup
      // upon window creation, let the popup query me for the tx
      let signWindowCallback = w => {
        chrome.runtime.onMessage.addListener(function (
          windowRequest,
          sender,
          windowSendResponse
        ) {
          if (windowRequest === 'getUnsigned') {
            windowSendResponse({
              confirmText: 'Do you want to sign this transaction?',
              unsigned: JSON.stringify(request.txHex, null, 4),
            });
            return;
          }
          if (windowRequest === 'okToSign') {
            const tx = new bsv.Transaction(request.txHex);
            const signedTx = tx.sign(pk.pk.privateKey);
            sendResponse({ signature: signedTx.serialize(true) });
            windowSendResponse();
          } else {
            return;
          }
        });
      };
      chrome.windows.create(
        {
          type: 'popup',
          url: 'confirm.html',
          width: 500,
          height: 800,
        },
        signWindowCallback
      );

      break;
    }
    case 'signPreimage': {
      // confirmation popup
      // upon window creation, let the popup query me for the tx
      let signPreimageWindowCallback = w => {
        chrome.runtime.onMessage.addListener(function (
          windowRequest,
          sender,
          windowSendResponse
        ) {
          if (windowRequest === 'getUnsigned') {
            windowSendResponse({
              confirmText: 'Do you want to sign this transaction?',
              unsigned: JSON.stringify(request.txHex, null, 4),
            });
            return;
          }
          if (windowRequest === 'okToSign') {
            const tx = new bsv.Transaction(request.txHex);
            const sighash = request.sighash;
            const script = request.script;
            const i = request.i;
            const satoshis = request.satoshis;
            const signedTx = bsv.Transaction.sighash.sign(
              tx,
              pk.pk.privateKey,
              sighash,
              i,
              script,
              satoshis
            );
            sendResponse({ signature: signedTx.serialize(true) });
            windowSendResponse();
          } else {
            return;
          }
        });
      };
      chrome.windows.create(
        {
          type: 'popup',
          url: 'confirm.html',
          width: 500,
          height: 800,
        },
        signPreimageWindowCallback
      );

      break;
    }
    case 'signMessage': {
      // confirmation popup
      // upon window creation, let the popup query me for the tx
      let signMessageWindowCallback = () => {
        chrome.runtime.onMessage.addListener(function (
          windowRequest,
          sender,
          windowSendResponse
        ) {
          if (windowRequest === 'getUnsigned') {
            windowSendResponse({
              confirmText: 'Do you want to sign this message?',
              unsigned: request.msg,
            });
            return;
          }
          if (windowRequest === 'okToSign') {
            const msg = new bsv.Message(request.msg);
            const signedMsg = msg.sign(pk.pk.privateKey);
            sendResponse({ signature: signedMsg });
            windowSendResponse();
          } else {
            return;
          }
        });
      };
      chrome.windows.create(
        {
          type: 'popup',
          url: 'confirm.html',
          width: 500,
          height: 800,
        },
        signMessageWindowCallback
      );
      break;
    }
    case 'getAddress': {
      let balance;
      try {
        balance = await pk.balance(pk.address);
      } catch (e) {
        sendResponse(e);
        return;
      }
      sendResponse({
        address: pk.address,
        balance: balance,
      });
      break;
    }
    case 'getUnspent': {
      let unspent;
      try {
        unspent = await pk.unspent();
      } catch (e) {
        sendResponse(e);
        return;
      }
      sendResponse({
        address: pk.address,
        unspent: unspent,
      });
      break;
    }
    default:
      sendResponse('unknown request');
  }
}

chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  console.log('onMessageExternal', request, sender);
  let pkR = new PKRetriever();
  pkR.request = request;
  pkR.sender = sender;
  pkR.sendResponse = sendResponse;

  pk.retrievePK(pkR);
});
