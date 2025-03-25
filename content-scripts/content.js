(function() {
    'use strict';
    const url = window.location.href;

    // Function to change the background color based on URL
    function changeBackgroundColor(url_dict) {
        const productMenuBar = document.querySelector('[id=product-menu-bar]'); // Select elements with the id "product-menu-bar"
        if (productMenuBar) {
            let longestMatch = null;
            for (const [key, value] of Object.entries(url_dict)) {
                if (url.startsWith(key)) {
                    if (longestMatch === null || key.length > longestMatch.length) {
                        longestMatch = key;
                        productMenuBar.style.backgroundColor = value[0];
                        applyDarkMode(value[1]);
                    }
                }
            }
        }
    }

    // Function to apply dark mode by inverting colors except for the product menu bar
    function applyDarkMode(darkModeOn) {
        const productMenuBar = document.querySelector('[id=product-menu-bar]');
        if (darkModeOn) {
            document.documentElement.style.filter = 'invert(1)';
            if (productMenuBar) {
                chrome.storage.sync.get('url_dict', (data) => {
                    const url_dict = data.url_dict || {};
                    for (const [key, value] of Object.entries(url_dict)) {
                        if (url.startsWith(key)) {
                            const originalColor = value[0];
                            const invertedColor = invertHexColor(originalColor);
                            productMenuBar.style.backgroundColor = invertedColor;
                            break;
                        }
                    }
                });
            }
        } else {
            document.documentElement.style.filter = 'none';
            if (productMenuBar) {
                chrome.storage.sync.get('url_dict', (data) => {
                    const url_dict = data.url_dict || {};
                    for (const [key, value] of Object.entries(url_dict)) {
                        if (url.startsWith(key)) {
                            const originalColor = value[0];
                            productMenuBar.style.backgroundColor = originalColor;
                            break;
                        }
                    }
                });
            }
        }
    }
    function invertHexColor(hex) {
        hex = hex.replace('#', '');
        const inverted = (parseInt(hex, 16) ^ 0xFFFFFF).toString(16).padStart(6, '0');
        return `#${inverted}`;
    }
    
    // Retrieve the URL-color mappings from storage and apply the color on page load
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        changeBackgroundColor(url_dict);
    });

    // Listen for messages from the popup script
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'updateColor') {
            applyDarkMode(false);
            const {color} = message;
            const productMenuBar = document.querySelector('[id=product-menu-bar]'); 
            productMenuBar.style.backgroundColor = color;
        }
    });
    
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'refreshStyles') {
            chrome.storage.sync.get('url_dict', (data) => {
                const url_dict = data.url_dict || {};
                const productMenuBar = document.querySelector('[id=product-menu-bar]');
                if (productMenuBar) {
                    let matched = false;
                    for (const [key, value] of Object.entries(url_dict)) {
                        if (url.startsWith(key)) {
                            productMenuBar.style.backgroundColor = value[0];
                            applyDarkMode(value[1]);
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        // Reset to default color if no match is found
                        productMenuBar.style.backgroundColor = '#282828';
                        applyDarkMode(false);
                    }
                }
            });
        }
    });
    
    // Observe DOM changes in case elements are dynamically loaded
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get('url_dict', (data) => {
            const url_dict = data.url_dict || {};
            changeBackgroundColor(url_dict);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
