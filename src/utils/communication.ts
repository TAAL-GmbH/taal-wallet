export const isBackgroundPageResponding = async (timeout = 1000) => {
  return new Promise(async (resolve, reject) => {
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
