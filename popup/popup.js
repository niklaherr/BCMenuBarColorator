// Define constants and variables
const urlInput = document.getElementById('url');
const colorInput = document.getElementById('color');
const addUrlColorButton = document.getElementById('addUrlColor');
const urlList = document.getElementById('urlList');
const helpButton = document.getElementById('helpButton');
const helpWindow = document.getElementById('helpWindow');
const emptyState = document.getElementById('emptyState');

// Utility functions
function getContrastColor(hexColor) {
    // Remove # if present
    const color = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Calculate luminance using standard formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return appropriate contrast color
    return luminance > 0.5 ? '#2d3748' : '#ffffff';
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = (num >> 8 & 0x00FF) + amt;
    const G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
}

function updateUrlList(url_dict) {
    // Clear the list
    urlList.innerHTML = '';
    
    const hasUrls = Object.keys(url_dict).length > 0;
    
    if (!hasUrls) {
        // Show empty state
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.innerHTML = `
            No URLs configured yet.<br>
            Add your first URL above to get started!
        `;
        urlList.appendChild(emptyDiv);
        return;
    }

    // Create list items for each URL
    for (const [url, [color, darkMode, showProduktiv]] of Object.entries(url_dict)) {
        const li = document.createElement('li');
        li.className = 'url-item';
        
        const textColor = getContrastColor(color);
        const lighterColor = lightenColor(color, 10);
        
        // Set the background color and text color
        li.style.backgroundColor = color;
        li.style.color = textColor;
        li.style.border = `2px solid ${lighterColor}`;
        
        li.innerHTML = `
            <button class="mode-btn" data-url="${url}" style="color: ${textColor}; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);" title="${darkMode ? 'Dark Mode aktiviert' : 'Dark Mode deaktiviert'}">
                ${darkMode ? '🌙' : '☀️'}
            </button>
            <button class="produktiv-btn" data-url="${url}" style="color: ${textColor}; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);" title="${showProduktiv ? 'PRODUKTIV-Anzeige aktiviert' : 'PRODUKTIV-Anzeige deaktiviert'}">
                ${showProduktiv ? '🔴' : '🟢'}
            </button>
            <span class="url-text" style="color: ${textColor};">
                ${url}
            </span>
            <button class="delete-btn" data-url="${url}" title="URL löschen">
                ×
            </button>
        `;
        urlList.appendChild(li);
    }

    attachEventListeners();
}

function attachEventListeners() {
    // Add event listeners to the delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const urlToDelete = event.target.getAttribute('data-url');
            removeUrlColorPair(urlToDelete);
        });
    });

    // Add event listeners to the mode buttons
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const urlToToggle = event.target.getAttribute('data-url');
            toggleDarkMode(urlToToggle);
        });
    });

    // Add event listeners to the PRODUKTIV buttons
    const produktivButtons = document.querySelectorAll('.produktiv-btn');
    produktivButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const urlToToggle = event.target.getAttribute('data-url');
            toggleProduktivMode(urlToToggle);
        });
    });
}

// Storage-related functions
function removeUrlColorPair(urlToDelete) {
    if (!urlToDelete) return;
    
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        if (url_dict[urlToDelete]) {
            delete url_dict[urlToDelete];
            chrome.storage.sync.set({ url_dict }, () => {
                updateUrlList(url_dict);
                refreshStyles();
            });
        }
    });
}

function toggleDarkMode(urlToToggle) {
    if (!urlToToggle) return;
    
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        if (url_dict[urlToToggle]) {
            // Toggle dark mode state
            url_dict[urlToToggle][1] = !url_dict[urlToToggle][1];
            chrome.storage.sync.set({ url_dict }, () => {
                updateUrlList(url_dict);
                refreshStyles();
            });
        }
    });
}

function toggleProduktivMode(urlToToggle) {
    if (!urlToToggle) return;
    
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        if (url_dict[urlToToggle]) {
            // Toggle PRODUKTIV mode state (index 2)
            url_dict[urlToToggle][2] = !url_dict[urlToToggle][2];
            chrome.storage.sync.set({ url_dict }, () => {
                updateUrlList(url_dict);
                refreshStyles();
            });
        }
    });
}

function refreshStyles() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshStyles' });
        }
    });
}

// Event handlers
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadStoredData();
    setupHelpButton();
    setupAddUrlColorButton();
});

function initializeUI() {
    // Set localized text
    const extensionTitle = document.getElementById('extensionTitle');
    const urlLabel = document.getElementById('urlLabel');
    const colorLabel = document.getElementById('colorLabel');
    const addButtonText = document.getElementById('addButtonText');
    const urlListTitle = document.getElementById('urlListTitle');
    const helpText = document.getElementById('helpText');

    if (chrome.i18n) {
        extensionTitle.textContent = chrome.i18n.getMessage('extensionNameLbl') || 'BC Colors & Dark Mode';
        urlLabel.textContent = chrome.i18n.getMessage('EnterURLLbl') || 'Enter URL prefix:';
        colorLabel.textContent = chrome.i18n.getMessage('ColorLbl') || 'Color:';
        addButtonText.textContent = chrome.i18n.getMessage('AddURLLbl') || 'Add URL';
        urlListTitle.textContent = chrome.i18n.getMessage('URLListLbl') || 'Saved URLs with Colors';
        helpText.textContent = chrome.i18n.getMessage('helpTextLbl') || 'Enter the URL prefix to change the color of the Business Central top bar.';
    }

    // Auto-fill current URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
            let currentUrl = tabs[0].url;
            // Remove query parameters by default
            if (currentUrl.includes('?')) {
                currentUrl = currentUrl.split('?')[0];
            }
            urlInput.value = currentUrl;
            
            // Set color based on existing configuration
            chrome.storage.sync.get('url_dict', (data) => {
                const url_dict = data.url_dict || {};
                // Check if current URL matches any stored URL
                for (const [storedUrl, [color, darkMode, showProduktiv]] of Object.entries(url_dict)) {
                    if (currentUrl.startsWith(storedUrl)) {
                        colorInput.value = color;
                        break;
                    }
                }
            });
        }
    });
}

function loadStoredData() {
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        updateUrlList(url_dict);
    });
}

function setupHelpButton() {
    helpButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (helpWindow.style.display === 'none' || helpWindow.style.display === '') {
            helpWindow.style.display = 'block';
            
            // Update help text with localized content
            const helpContent = chrome.i18n.getMessage('helpTextLbl') || 
                'Enter the URL prefix to change the color of the Business Central top bar.\n' +
                'You can add multiple URLs. By default, the URL is separated at the first \'?\'.\n' +
                'However, you can freely choose up to which character the URL should be recognized.\n' +
                'Just copy the start of the URL into the Base-URL field.\n\n' +
                '✨New in Version 3:✨\n' +
                'By clicking the moon/sun icon, you can toggle dark mode.\n' +
                'By clicking the red/green circle, you can toggle the PRODUKTIV display.\n' +
                'Also, the extension is now available in Chrome!';
            
            document.getElementById('helpText').innerHTML = helpContent.replace(/\n/g, '<br>');
        } else {
            helpWindow.style.display = 'none';
        }
    });

    // Close help when clicking outside
    document.addEventListener('click', (event) => {
        if (!helpWindow.contains(event.target) && event.target !== helpButton) {
            helpWindow.style.display = 'none';
        }
    });
}

function setupAddUrlColorButton() {
    addUrlColorButton.addEventListener('click', (event) => {
        event.preventDefault();
        
        const url = urlInput.value.trim();
        const color = colorInput.value;

        if (!url) {
            alert('Bitte geben Sie eine URL ein!');
            return;
        }

        if (url && color) {
            chrome.storage.sync.get('url_dict', (data) => {
                const url_dict = data.url_dict || {};
                
                // Preserve existing states or default to false
                const darkMode = url_dict[url] ? url_dict[url][1] : false;
                const showProduktiv = url_dict[url] ? url_dict[url][2] : false;
                
                // Store the URL with color, dark mode state, and PRODUKTIV state
                url_dict[url] = [color, darkMode, showProduktiv];
                
                chrome.storage.sync.set({ url_dict }, () => {
                    updateUrlList(url_dict);
                    
                    // Send message to content script to update current page
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (tabs && tabs[0]) {
                            chrome.tabs.sendMessage(tabs[0].id, { 
                                action: 'updateColor', 
                                color: color, 
                                darkMode: darkMode,
                                showProduktiv: showProduktiv
                            });
                        }
                    });
                    
                    // Visual feedback
                    const originalText = addButtonText.textContent;
                    addButtonText.textContent = '✓ Hinzugefügt!';
                    setTimeout(() => {
                        addButtonText.textContent = originalText;
                    }, 1500);
                });
            });
        }
    });

    // Allow Enter key to add URL
    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addUrlColorButton.click();
        }
    });
}