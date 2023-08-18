export const isBackgroundPageResponding = async (timeout = 1000) => {
  // eslint-disable-next-line
  return new Promise(async resolve => {
    const timer = setTimeout(() => {
      resolve(false);
    }, timeout);
    const resp = await chrome.runtime.sendMessage({ action: 'bg:ping' });
    if (resp === 'pong') {
      clearTimeout(timer);
      resolve(true);
    }
  });
};
