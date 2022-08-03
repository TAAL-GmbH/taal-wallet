// import { chrome } from 'jest-chrome';

export const mockForBackground = () => {
  const listeners: {
    client: {
      onMessageListeners: ((msg: any, port: chrome.runtime.Port) => void)[];
      onDisconnectListeners: ((msg: any, port: chrome.runtime.Port) => void)[];
    };
    background: {
      onMessageListeners: ((msg: any, port: chrome.runtime.Port) => void)[];
      onDisconnectListeners: ((msg: any, port: chrome.runtime.Port) => void)[];
    };
  } = {
    client: {
      onMessageListeners: [],
      onDisconnectListeners: [],
    },
    background: {
      onMessageListeners: [],
      onDisconnectListeners: [],
    },
  };

  // backgroundPort will be used in WalletClient library (port-to-background)
  const backgroundPort: chrome.runtime.Port = {
    postMessage: message => {
      // calling backgroundPort.postMessage message will be delivered to background
      listeners.background.onMessageListeners.forEach(cb => cb(message, backgroundPort));
    },
    disconnect: () => {
      listeners.client.onDisconnectListeners.forEach(cb => cb(null, backgroundPort));
      listeners.background.onDisconnectListeners.forEach(cb => cb(null, clientPort));
    },
    onDisconnect: {
      addListener: cb => {
        // WalletClient registers it's onDisconnect events to backgroundPort
        listeners.client.onDisconnectListeners.push(cb);
      },
      getRules: () => {},
      hasListener: () => true,
      removeRules: () => {},
      addRules: () => {},
      removeListener: cb => {
        const index = listeners.background.onDisconnectListeners.indexOf(cb);
        if (index !== -1) {
          listeners.background.onDisconnectListeners.splice(index, 1);
        }
      },
      hasListeners: () => true,
    },
    onMessage: {
      addListener: cb => {
        // client registers it's onMessage event listeners
        listeners.client.onMessageListeners.push(cb);
      },
      getRules: () => {},
      hasListener: () => true,
      removeRules: () => {},
      addRules: () => {},
      removeListener: cb => {
        const index = listeners.background.onMessageListeners.indexOf(cb);
        if (index !== -1) {
          listeners.background.onMessageListeners.splice(index, 1);
        }
      },
      hasListeners: () => true,
    },
    name: 'something',
  };

  // clientPort will be used in background script (port-to-client)
  const clientPort: chrome.runtime.Port = {
    postMessage: message => {
      // calling clientPort.postMessage message will be delivered to client
      listeners.client.onMessageListeners.forEach(cb => cb(message, clientPort));
    },
    disconnect: () => {
      // listeners.client.onDisconnectListeners.forEach(cb => cb(null, backgroundPort));
    },
    onDisconnect: {
      addListener: cb => {
        // background registers it's onDisconnect event listeners
        listeners.background.onDisconnectListeners.push(cb);
      },
      getRules: () => {},
      hasListener: () => true,
      removeRules: () => {},
      addRules: () => {},
      removeListener: () => {},
      hasListeners: () => true,
    },
    onMessage: {
      addListener: cb => {
        // background registers it's onMessage event listeners
        listeners.background.onMessageListeners.push(cb);
      },
      getRules: () => {},
      hasListener: () => true,
      removeRules: () => {},
      addRules: () => {},
      removeListener: () => {},
      hasListeners: () => true,
    },
    name: 'something',
    sender: {
      id: 'senderId',
      origin: 'senderOrigin',
    },
  };

  // this gonna be called by the WalletClient library
  global.chrome.runtime.connect = () => backgroundPort;

  // this gonna be called by the background script
  global.chrome.runtime.onConnectExternal = {
    addListener: bgClientHandler => bgClientHandler(clientPort),
    getRules: () => {},
    hasListener: () => true,
    removeRules: () => {},
    addRules: () => {},
    removeListener: () => {},
    hasListeners: () => true,
  };
};
