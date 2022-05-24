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
This TAAL Web3 Wallet Chrome extensions using React and Typescript.
> The focus was on improving the build speed and development experience with Vite.

## Features <a name="features"></a>
- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [SASS](https://sass-lang.com/)
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

## Screenshots <a name="screenshots"></a>

### New Tab <a name="newtab"></a>
<!-- TODO: add New Tab screenshot -->

### Popup <a name="popup"></a>

<!-- TODO: add Popup screenshot here -->


## Documents <a name="documents"></a>
- [Vite Plugin](https://vitejs.dev/guide/api-plugin.html)
- [ChromeExtension](https://developer.chrome.com/docs/extensions/mv3/)
- [Rollup](https://rollupjs.org/guide/en/)
- [Rollup-plugin-chrome-extension](https://www.extend-chrome.dev/rollup-plugin)

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
