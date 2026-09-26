chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStorage') {
    chrome.storage.local.get(['userId'], (data) => {
      sendResponse(data);
    });
    return true;
  }
});
