// Define constants and variables
const urlInput = document.getElementById('url');
const colorInput = document.getElementById('color');
const addUrlColorButton = document.getElementById('addUrlColor');
const urlList = document.getElementById('urlList');
const helpButton = document.getElementById('helpButton');
const helpWindow = document.getElementById('helpWindow');

// Function to delete a URL-color pair
function deleteUrlKey(urlToDelete) {
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};

        // Check if the URL exists, then delete it
        if (url_dict[urlToDelete]) {
            delete url_dict[urlToDelete];

            // Save the updated dictionary back to storage
            chrome.storage.sync.set({ url_dict }, () => {
                updateUrlList(url_dict);

                // Send a message to the content script to reapply styles
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshStyles' });
                });
            });
        }
    });
}

// Function to toggle the boolean value for a URL
function toggleMode(urlToToggle) {
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};

        if (url_dict[urlToToggle]) {
            url_dict[urlToToggle][1] = !url_dict[urlToToggle][1];

            // Save the updated dictionary back to storage
            chrome.storage.sync.set({ url_dict }, () => {
                updateUrlList(url_dict);

                // Send a message to the content script to reapply styles
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshStyles' });
                });
            });
        }
    });
}

// Function to update the displayed list of URL-color pairs
function updateUrlList(url_dict) {
    urlList.innerHTML = '';
    for (const [url, [color, darkMode]] of Object.entries(url_dict)) {
        const li = document.createElement('li');
        li.innerHTML = `
            <button class="mode-btn" data-url="${url}">${darkMode ? '&#x1F312;' : '&#x1F314;'}</button>
            <span style="font-weight: bold; color:${color}; text-align: left; display: inline-block; width: 100%; margin-left: 8px;">${url}</span>
            <button class="delete-btn" data-url="${url}">x</button>
        `;
        urlList.appendChild(li);
    }

    // Add event listeners to the delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const urlToDelete = event.target.getAttribute('data-url');
            deleteUrlKey(urlToDelete);
        });
    });

    // Add event listeners to the mode buttons
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const urlToToggle = event.target.getAttribute('data-url');
            toggleMode(urlToToggle);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('h3').textContent = chrome.i18n.getMessage('extensionNameLbl');
    document.querySelector('input').textContent = chrome.i18n.getMessage('EnterURLLbl');
    document.querySelector('button').textContent = chrome.i18n.getMessage('AddURLLbl');
    document.querySelector('label[for="color"]').textContent = chrome.i18n.getMessage('ColorLbl');
    document.querySelector('h4').textContent = chrome.i18n.getMessage('URLListLbl');
    
    // Get the current tab's URL and prefill the URL input
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            let currentUrl = tabs[0].url;
            let urlWithoutParams = currentUrl.split('?')[0];
            urlInput.value = urlWithoutParams;  // Prefill the input field

            // Check if the URL exists in url_dict and set the color picker
            chrome.storage.sync.get('url_dict', (data) => {
                const url_dict = data.url_dict || {};
                if (url_dict[urlWithoutParams]) {
                    colorInput.value = url_dict[urlWithoutParams][0]; // Set saved color
                } else {
                    colorInput.value = '#000000'; // Default to black if no color is saved
                }
            });
        }
    });

    // Load existing URLs and colors on page load
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        updateUrlList(url_dict);  // Display the saved URL-color pairs
    });

    // Toggle the help window when the help button is clicked
    helpButton.addEventListener('click', function() {
        if (helpWindow.style.display === 'none' || helpWindow.style.display === '') {
            helpWindow.style.display = 'block';
            helpWindow.innerHTML = chrome.i18n.getMessage('helpTextLbl').replace(/\n/g, '<br>');
        } else {
            helpWindow.style.display = 'none';
        }
    });

    // Add URL-color pair to storage when the button is clicked
    addUrlColorButton.addEventListener('click', () => {
        const url = urlInput.value;
        const color = colorInput.value;

        if (url && color) {
            chrome.storage.sync.get('url_dict', (data) => {
                const url_dict = data.url_dict || {};
                url_dict[url] = [color, false];

                // Save the updated dictionary back to storage
                chrome.storage.sync.set({ url_dict }, () => {
                    updateUrlList(url_dict);
                    // Keep the color picker set to the current color instead of resetting

                    // Send a message to the content script to apply the new color immediately
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateColor', color: color });
                    });
                });
            });
        }
    });
});