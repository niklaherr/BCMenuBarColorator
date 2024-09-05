document.getElementById('add').addEventListener('click', () => {
    const url = document.getElementById('url').value;
    const color = document.getElementById('color').value;

    if (url && color) {
        chrome.storage.sync.get('url_dict', (data) => {
            const url_dict = data.url_dict || {};
            url_dict[url] = color;
            chrome.storage.sync.set({ url_dict }, () => {
                updateUrlList(url_dict);
            });
        });
    }
});

function updateUrlList(url_dict) {
    const urlList = document.getElementById('url-list');
    urlList.innerHTML = '';

    for (const [url, color] of Object.entries(url_dict)) {
        const li = document.createElement('li');
        li.textContent = `${url}: ${color}`;
        urlList.appendChild(li);
    }
}

// Load existing URLs and colors on page load
chrome.storage.sync.get('url_dict', (data) => {
    const url_dict = data.url_dict || {};
    updateUrlList(url_dict);
});
