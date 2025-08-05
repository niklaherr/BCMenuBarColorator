(function() {
    'use strict';
    const url = window.location.href;

    // Core functions
    function changeBackgroundColor(url_dict) {
        let longestMatch = null;
        for (const [key, value] of Object.entries(url_dict)) {
            if (url.startsWith(key)) {
                if (longestMatch === null || key.length > longestMatch.length) {
                    longestMatch = key;
                    const productMenuBar = document.querySelector('[id=product-menu-bar], [id=O365_NavHeader]');
                    if (productMenuBar) {
                        // Setze Hintergrundfarbe
                        productMenuBar.style.backgroundColor = value[0];
                        
                        // Berechne und setze passende Textfarbe
                        const textColor = getContrastingTextColor(value[0]);
                        productMenuBar.style.color = textColor;
                        
                        // Füge dynamische Styles für alle HotBar Elemente hinzu
                        addHotBarStyles(value[0], textColor);
                        
                        // Zeige oder verstecke PRODUKTIV-Anzeige
                        toggleProduktivDisplay(value[2] || false, textColor);
                    }
                    applyDarkMode(value[1]);
                }
            }
        }
    }

    // Hilfsfunktion: Berechne kontrastierende Textfarbe
    function getContrastingTextColor(backgroundColor) {
        // Entferne # falls vorhanden
        const hex = backgroundColor.replace('#', '');
        
        // Konvertiere Hex zu RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Berechne Luminanz (relative brightness)
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Wähle Weiß oder Schwarz basierend auf Luminanz
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    // Neue Funktion: PRODUKTIV-Anzeige in der Mitte der HotBar
    function toggleProduktivDisplay(show, textColor) {
        // Entferne vorherige PRODUKTIV-Anzeige
        const existingProduktiv = document.getElementById('bc-produktiv-display');
        if (existingProduktiv) {
            existingProduktiv.remove();
        }

        if (!show) return;

        const productMenuBar = document.querySelector('[id=product-menu-bar], [id=O365_NavHeader]');
        if (!productMenuBar) return;

        // Erstelle PRODUKTIV-Element
        const produktivElement = document.createElement('div');
        produktivElement.id = 'bc-produktiv-display';
        produktivElement.innerHTML = 'PRODUKTIV';
        
        // Styling für die PRODUKTIV-Anzeige
        produktivElement.style.cssText = `
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            color: ${textColor} !important;
            font-weight: 900 !important;
            font-size: 22px !important;
            letter-spacing: 3px !important;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.4) !important;
            z-index: 9999 !important;
            pointer-events: none !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            text-transform: uppercase !important;
            opacity: 0.9 !important;
        `;

        // Stelle sicher, dass die HotBar relative Positionierung hat
        if (getComputedStyle(productMenuBar).position === 'static') {
            productMenuBar.style.position = 'relative';
        }

        // Füge das Element zur HotBar hinzu
        productMenuBar.appendChild(produktivElement);
    }

    // Füge dynamische Styles für HotBar Elemente hinzu
    function addHotBarStyles(backgroundColor, textColor) {
        // Entferne vorherige Styles
        const existingStyle = document.getElementById('hotbar-color-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Berechne Hover-Farben basierend auf der Hintergrundfarbe
        const hoverColor = getHoverColor(backgroundColor);
        const activeColor = getActiveColor(backgroundColor);
        
        // Erstelle neue Styles
        const style = document.createElement('style');
        style.id = 'hotbar-color-styles';
        style.textContent = `
            /* HotBar Container */
            [id=product-menu-bar], [id=O365_NavHeader] {
                background-color: ${backgroundColor} !important;
                color: ${textColor} !important;
            }
            
            /* Alle currentColor Elemente in der HotBar */
            [id=product-menu-bar] [fill="currentColor"],
            [id=product-menu-bar] [stroke="currentColor"],
            [id=O365_NavHeader] [fill="currentColor"],
            [id=O365_NavHeader] [stroke="currentColor"] {
                fill: ${textColor} !important;
                stroke: ${textColor} !important;
            }
            
            /* SVG Icons in der HotBar */
            [id=product-menu-bar] svg,
            [id=O365_NavHeader] svg {
                fill: ${textColor} !important;
                color: ${textColor} !important;
            }
            
            /* Microsoft Fabric Icons (aber nicht in Persona-Elementen) */
            [id=product-menu-bar] .ms-Icon:not(.ms-Persona .ms-Icon):not([aria-label="User Account"] .ms-Icon),
            [id=product-menu-bar] [class*="ms-Icon"]:not(.ms-Persona [class*="ms-Icon"]):not([aria-label="User Account"] [class*="ms-Icon"]),
            [id=product-menu-bar] .ms-Button-icon:not(.ms-Persona .ms-Button-icon):not([aria-label="User Account"] .ms-Button-icon),
            [id=O365_NavHeader] .ms-Icon:not(.ms-Persona .ms-Icon):not([aria-label="User Account"] .ms-Icon),
            [id=O365_NavHeader] [class*="ms-Icon"]:not(.ms-Persona [class*="ms-Icon"]):not([aria-label="User Account"] [class*="ms-Icon"]),
            [id=O365_NavHeader] .ms-Button-icon:not(.ms-Persona .ms-Button-icon):not([aria-label="User Account"] .ms-Button-icon) {
                color: ${textColor} !important;
            }
            
            /* Allgemeine Icon-Klassen */
            [id=product-menu-bar] .icon,
            [id=product-menu-bar] .svg-icon,
            [id=product-menu-bar] i[class*="icon"],
            [id=O365_NavHeader] .icon,
            [id=O365_NavHeader] .svg-icon,
            [id=O365_NavHeader] i[class*="icon"] {
                color: ${textColor} !important;
            }
            
            /* Buttons und Links in der HotBar - Normale Zustände (AUSSER User Account Button) */
            [id=product-menu-bar] button:not([aria-label="User Account"]),
            [id=product-menu-bar] a,
            [id=product-menu-bar] .ms-Button:not([aria-label="User Account"]),
            [id=product-menu-bar] .ms-Button--default:not([aria-label="User Account"]),
            [id=O365_NavHeader] button:not([aria-label="User Account"]),
            [id=O365_NavHeader] a,
            [id=O365_NavHeader] .ms-Button:not([aria-label="User Account"]),
            [id=O365_NavHeader] .ms-Button--default:not([aria-label="User Account"]) {
                color: ${textColor} !important;
                background-color: transparent !important;
                border-color: transparent !important;
            }
            
            /* Spezifische Hover-Effekte für MS-Button Klassen (aber NICHT für User Account Button) */
            [id=product-menu-bar] .ms-Button:hover:not([aria-label="User Account"]),
            [id=product-menu-bar] .ms-Button--default:hover:not([aria-label="User Account"]),
            [id=product-menu-bar] .ms-Button--hasMenu:hover:not([aria-label="User Account"]),
            [id=product-menu-bar] button:hover:not([aria-label="User Account"]),
            [id=O365_NavHeader] .ms-Button:hover:not([aria-label="User Account"]),
            [id=O365_NavHeader] .ms-Button--default:hover:not([aria-label="User Account"]),
            [id=O365_NavHeader] .ms-Button--hasMenu:hover:not([aria-label="User Account"]),
            [id=O365_NavHeader] button:hover:not([aria-label="User Account"]) {
                background-color: ${hoverColor} !important;
                color: ${textColor} !important;
                border-color: transparent !important;
            }
            
            /* Active/Press-Effekte (aber NICHT für User Account Button) */
            [id=product-menu-bar] .ms-Button:active:not([aria-label="User Account"]),
            [id=product-menu-bar] .ms-Button--default:active:not([aria-label="User Account"]),
            [id=product-menu-bar] button:active:not([aria-label="User Account"]),
            [id=O365_NavHeader] .ms-Button:active:not([aria-label="User Account"]),
            [id=O365_NavHeader] .ms-Button--default:active:not([aria-label="User Account"]),
            [id=O365_NavHeader] button:active:not([aria-label="User Account"]) {
                background-color: ${activeColor} !important;
                color: ${textColor} !important;
            }
            
            /* Focus-Effekte (aber NICHT für User Account Button) */
            [id=product-menu-bar] .ms-Button:focus:not([aria-label="User Account"]),
            [id=product-menu-bar] .ms-Button--default:focus:not([aria-label="User Account"]),
            [id=product-menu-bar] button:focus:not([aria-label="User Account"]),
            [id=O365_NavHeader] .ms-Button:focus:not([aria-label="User Account"]),
            [id=O365_NavHeader] .ms-Button--default:focus:not([aria-label="User Account"]),
            [id=O365_NavHeader] button:focus:not([aria-label="User Account"]) {
                outline: 2px solid ${textColor} !important;
                outline-offset: 2px !important;
            }
            
            /* Hover-Effekte für Icon-Container innerhalb der Buttons (aber nicht User Account) */
            [id=product-menu-bar] .ms-Button:hover:not([aria-label="User Account"]) .ms-Icon,
            [id=product-menu-bar] .ms-Button:hover:not([aria-label="User Account"]) .ms-Button-icon,
            [id=product-menu-bar] .ms-Button:hover:not([aria-label="User Account"]) svg,
            [id=product-menu-bar] button:hover:not([aria-label="User Account"]) .ms-Icon,
            [id=product-menu-bar] button:hover:not([aria-label="User Account"]) svg,
            [id=O365_NavHeader] .ms-Button:hover:not([aria-label="User Account"]) .ms-Icon,
            [id=O365_NavHeader] .ms-Button:hover:not([aria-label="User Account"]) .ms-Button-icon,
            [id=O365_NavHeader] .ms-Button:hover:not([aria-label="User Account"]) svg,
            [id=O365_NavHeader] button:hover:not([aria-label="User Account"]) .ms-Icon,
            [id=O365_NavHeader] button:hover:not([aria-label="User Account"]) svg {
                color: ${textColor} !important;
                fill: ${textColor} !important;
            }
            
            /* Spezielle Behandlung: User Account Button - normaler Zustand und Hover */
            [id=product-menu-bar] button[aria-label="User Account"],
            [id=O365_NavHeader] button[aria-label="User Account"] {
                border-color: transparent !important;
                outline: none !important;
                box-shadow: none !important;
                background-color: transparent !important;
            }
            
            [id=product-menu-bar] button[aria-label="User Account"]:hover,
            [id=O365_NavHeader] button[aria-label="User Account"]:hover {
                background-color: ${hoverColor} !important;
                border-color: transparent !important;
                outline: none !important;
                box-shadow: none !important;
            }
            
            /* User Account Button - Persona-Inhalte komplett unberührt lassen */
            [id=product-menu-bar] button[aria-label="User Account"] .ms-Persona,
            [id=product-menu-bar] button[aria-label="User Account"] .ms-Persona *,
            [id=O365_NavHeader] button[aria-label="User Account"] .ms-Persona,
            [id=O365_NavHeader] button[aria-label="User Account"] .ms-Persona * {
                /* Keine Änderungen - behält alle ursprünglichen Styles */
            }
            
            /* Text-Elemente in der HotBar (aber schließe Persona-Elemente aus) */
            [id=product-menu-bar] .productname--vciTavsWTvsnEc4q4OcI,
            [id=product-menu-bar] .ms-Button-flexContainer:not(.ms-Persona *):not([aria-label="User Account"] *),
            [id=O365_NavHeader] .productname--vciTavsWTvsnEc4q4OcI,
            [id=O365_NavHeader] .ms-Button-flexContainer:not(.ms-Persona *):not([aria-label="User Account"] *) {
                color: ${textColor} !important;
            }
            
            /* PRODUKTIV-Anzeige soll immer sichtbar bleiben */
            #bc-produktiv-display {
                z-index: 99999 !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Hilfsfunktion: Berechne Hover-Farbe
    function getHoverColor(backgroundColor) {
        // Konvertiere Hex zu RGB
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Berechne Luminanz
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Für helle Farben: dunkler machen, für dunkle Farben: heller machen
        if (luminance > 0.5) {
            // Helle Farbe - mache dunkler
            const factor = 0.8;
            return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
        } else {
            // Dunkle Farbe - mache heller
            const factor = 1.3;
            return `rgb(${Math.min(255, Math.round(r * factor))}, ${Math.min(255, Math.round(g * factor))}, ${Math.min(255, Math.round(b * factor))})`;
        }
    }

    // Hilfsfunktion: Berechne Active-Farbe (noch stärker als Hover)
    function getActiveColor(backgroundColor) {
        // Konvertiere Hex zu RGB
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Berechne Luminanz
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Für helle Farben: noch dunkler, für dunkle Farben: noch heller
        if (luminance > 0.5) {
            // Helle Farbe - mache noch dunkler
            const factor = 0.6;
            return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
        } else {
            // Dunkle Farbe - mache noch heller
            const factor = 1.5;
            return `rgb(${Math.min(255, Math.round(r * factor))}, ${Math.min(255, Math.round(g * factor))}, ${Math.min(255, Math.round(b * factor))})`;
        }
    }

    function applyDarkMode(darkModeOn) {
        const iframe = document.querySelector('iframe');
    
        if (!iframe || !iframe.contentDocument) {
            console.warn('Dark mode: iframe not found or not accessible.');
            return;
        }
    
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
        if (darkModeOn) {
            console.log('Dark mode on (inside iframe)');
            if (iframeDoc.getElementById('dark-mode-style')) {
                return;
            }
            const style = iframeDoc.createElement('style');
            style.id = 'dark-mode-style';
            style.textContent = `
                html {
                    filter: invert(1) hue-rotate(180deg) contrast(0.9) brightness(1.1);
                }

                img,
                video,
                canvas,
                [style*="background-image"] {
                    filter: invert(1) hue-rotate(180deg) contrast(1.0) brightness(1.0) !important;
                }
            `;
            iframeDoc.documentElement.appendChild(style);
        } else {
            const style = iframeDoc.getElementById('dark-mode-style');
            if (style) {
                style.remove();
            }
        }
    }

    // Message listeners
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'updateColor') {
            applyDarkMode(message.darkMode); // Apply the dark mode state
            const productMenuBar = document.querySelector('[id=product-menu-bar], [id=O365_NavHeader]');
            if (productMenuBar) {
                // Setze Hintergrundfarbe
                productMenuBar.style.backgroundColor = message.color;
                
                // Berechne und setze passende Textfarbe
                const textColor = getContrastingTextColor(message.color);
                productMenuBar.style.color = textColor;
                
                // Füge dynamische Styles hinzu
                addHotBarStyles(message.color, textColor);
                
                // Zeige oder verstecke PRODUKTIV-Anzeige
                toggleProduktivDisplay(message.showProduktiv || false, textColor);
            }
        } else if (message.action === 'refreshStyles') {
            refreshStyles();
        }
    });

    function refreshStyles() {
        chrome.storage.sync.get('url_dict', (data) => {
            const productMenuBar = document.querySelector('[id=product-menu-bar], [id=O365_NavHeader]');
            const url_dict = data.url_dict || {};
            let matched = false;
            for (const [key, value] of Object.entries(url_dict)) {
                if (url.startsWith(key)) {
                    if (productMenuBar) {
                        // Setze Hintergrundfarbe
                        productMenuBar.style.backgroundColor = value[0];
                        
                        // Berechne und setze passende Textfarbe
                        const textColor = getContrastingTextColor(value[0]);
                        productMenuBar.style.color = textColor;
                        
                        // Füge dynamische Styles hinzu
                        addHotBarStyles(value[0], textColor);
                        
                        // Zeige oder verstecke PRODUKTIV-Anzeige
                        toggleProduktivDisplay(value[2] || false, textColor);
                    }
                    applyDarkMode(value[1]);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                if (productMenuBar) {
                    productMenuBar.style.backgroundColor = '#282828';
                    const textColor = getContrastingTextColor('#282828');
                    productMenuBar.style.color = textColor;
                    addHotBarStyles('#282828', textColor);
                    toggleProduktivDisplay(false, textColor);
                }
                applyDarkMode(false);
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