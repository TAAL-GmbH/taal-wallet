<div align="center">
<img src="public/taal-round-128x128.png" alt="logo"/>
<h1>TAAL Wallet Chrome extension</h1>
</div>

## Table of Contents

- [Intro](#intro)
- [Features](#features)
- [Installation](#installation)
  - [Procedures](#procedures)
- [Screenshots](#screenshots)
  - [NewTab](#newtab)
  - [Popup](#popup)  
- [Documents](#documents)


## Intro <a name="intro"></a>
This TAAL Wallet Chrome extensions using React and Typescript.

## Features <a name="features"></a>
- [React 18](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [BSV Javascript library](https://github.com/moneybutton/bsv)
- [TypeScript](https://www.typescriptlang.org/)
- [Webpack](https://webpack.js.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Chrome Extension Manifest Version 3](https://developer.chrome.com/docs/extensions/mv3/intro/)

## Installation <a name="installation"></a>

### Procedures <a name="procedures"></a>
1. Clone this repository.
2. Run `yarn` (check your node version >= 16)
3. Run `yarn dev`
4. Load Extension on Chrome
   1. Open - Chrome browser
   2. Access - chrome://extensions
   3. Check - Developer mode
   4. Find - Load unpacked extension
   5. Select - `dist` folder in this project (after dev or build)
5. If you want to build in production, Just run `yarn build`
6. To start a demo web client run `yarn demo`
7. To enable push messages run `yarn server`

### Optional
1. Copy `sample.env` to `.env` and customize it by your needs

## Screenshots <a name="screenshots"></a>

### New Tab <a name="newtab"></a>
<!-- TODO: add New Tab screenshot -->

### Popup <a name="popup"></a>

<!-- TODO: add Popup screenshot here -->


## Documents <a name="documents"></a>
- [ChromeExtension](https://developer.chrome.com/docs/extensions/mv3/)

---


# Communication

## Long lived connection

### On background.js
```js
chrome.runtime.onConnectExternal.addListener(port => {
  console.log('Client connected', port);
  port.onMessage.addListener(msg => {
    console.log('onExternalMessage', msg);
  });
});
```

### On web page
```js
const port = chrome.runtime.connect(extensionId, { name: 'some-name' });
port.onMessage.addListener(console.log);
port.postMessage({ payload: 'anything' })
```

### On content script
```js
const port = chrome.runtime.connect({ name: 'some-name' });
port.postMessage({ payload: 'anything' });
port.onMessage.addListener(msg => {
  console.log('onMessage', msg);
});
```

## One time communication (web -> background.js)
### On background.js
```js
chrome.runtime.onMessageExternal.addListener((payload, data, cb) => {
  console.log('onMessageExternal', { payload, data });
  if (typeof cb === 'function') {
    cb('response from background.js');
  }
  return true;
});
```

### On web page
```js
chrome.runtime.sendMessage(extensionId, { payload: 'anything' }, console.log)
```


### On content script
```js
chrome.runtime.sendMessage({ payload: 'anything' }, console.log);
```
