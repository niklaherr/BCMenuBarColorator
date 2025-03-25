(function() {
    'use strict';
    const url = window.location.href;

    // Core functions
    function changeBackgroundColor(url_dict) {
        const productMenuBar = document.querySelector('[id=product-menu-bar]');
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

    function applyDarkMode(darkModeOn) {
        const productMenuBar = document.querySelector('[id=product-menu-bar]');
        if (darkModeOn) {
            document.documentElement.style.filter = 'invert(1)';
            if (productMenuBar) {
                updateMenuBarColor(true);
            }
        } else {
            document.documentElement.style.filter = 'none';
            if (productMenuBar) {
                updateMenuBarColor(false);
            }
        }
    }

    function updateMenuBarColor(invert) {
        chrome.storage.sync.get('url_dict', (data) => {
            const url_dict = data.url_dict || {};
            for (const [key, value] of Object.entries(url_dict)) {
                if (url.startsWith(key)) {
                    const originalColor = value[0];
                    const color = invert ? invertHexColor(originalColor) : originalColor;
                    document.querySelector('[id=product-menu-bar]').style.backgroundColor = color;
                    break;
                }
            }
        });
    }

    function invertHexColor(hex) {
        hex = hex.replace('#', '');
        const inverted = (parseInt(hex, 16) ^ 0xFFFFFF).toString(16).padStart(6, '0');
        return `#${inverted}`;
    }

    // Message listeners
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'updateColor') {
            applyDarkMode(false);
            document.querySelector('[id=product-menu-bar]').style.backgroundColor = message.color;
        } else if (message.action === 'refreshStyles') {
            refreshStyles();
        }
    });

    function refreshStyles() {
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
                    productMenuBar.style.backgroundColor = '#282828';
                    applyDarkMode(false);
                }
            }
        });
    }

    // DOM observer
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get('url_dict', (data) => {
            const url_dict = data.url_dict || {};
            changeBackgroundColor(url_dict);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial setup
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        changeBackgroundColor(url_dict);
    });
})();
