// jest.useFakeTimers();

Object.assign(global, require('jest-chrome'));

global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
  }
  postMessage(message) {
    // console.log('BroadcastChannel.postMessage', message);
    // this.onmessage(message);
  }
};

global.indexedDB = {
  open: jest.fn(),
};

global.IDBRequest = class IDBRequest {};
global.IDBTransaction = class IDBTransaction {};
global.IDBDatabase = class IDBDatabase {};
global.IDBObjectStore = class IDBObjectStore {};
global.IDBIndex = class IDBIndex {};
global.IDBCursor = class IDBCursor {};

global.chrome.action = {
  setIcon: () => {},
  setBadgeBackgroundColor: () => {},
  setBadgeText: () => {},
};

global.self = {
  addEventListener: () => {},
};

global.window = {
  alert: () => {},
  location: {
    pathname: 'extension/index.html',
  },
};
