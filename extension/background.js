chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ url_dict: {} }, () => {
        console.log("Initial URL dictionary set.");
    });
});
