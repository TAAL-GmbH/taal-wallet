try {
  chrome.devtools.panels.create(
    'Dev Tools',
    'taal-round-34x34.png',
    'src/pages/panel/index.html'
  );
} catch (e) {
  console.error(e);
}
