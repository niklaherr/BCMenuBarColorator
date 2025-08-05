# BC Colors & Dark Mode

**BC Colors & Dark Mode** ist eine Browser‑Erweiterung für Microsoft Dynamics 365 Business Central. Sie hilft dabei, verschiedene Umgebungen anhand farbiger Navigationsleisten zu unterscheiden, bietet einen Dark‑Mode je Umgebung und ermöglicht das Einblenden eines gut sichtbaren „PRODUKTIV“-Hinweises.

---

## Inhaltsverzeichnis
1. [Funktionen](#funktionen)  
2. [Installation](#installation)  
3. [Verwendung](#verwendung)  
4. [Projektstruktur](#projektstruktur)  
5. [Sprachunterstützung](#sprachunterstützung)  
6. [Beitrag leisten](#beitrag-leisten)  

---

## Funktionen
- **Farbige HotBar pro URL**  
  Hinterlegen Sie für jede Business‑Central‑Basis‑URL eine eigene Farbe. Die Erweiterung passt die Leiste (`product-menu-bar` / `O365_NavHeader`) automatisch an.
- **Dynamische Text- und Icon-Farben**  
  Der Kontrast wird automatisch berechnet; Icons, Buttons, Hover‑ und Active‑Zustände erhalten passende Styles.
- **Dark Mode pro Umgebung**  
  Optionaler invertierter Farbstil (über CSS‑Filter) innerhalb des `iframe`, um eine dunkle Oberfläche zu erzielen.
- **PRODUKTIV-Anzeige**  
  Zeigt bei Bedarf einen deutlichen „PRODUKTIV“-Text in der Mitte der HotBar.
- **Persistente Konfiguration**  
  Einstellungen werden über `chrome.storage.sync` gespeichert und zwischen Geräten synchronisiert.
- **Mehrsprachigkeit**  
  Oberfläche und Hilfetexte sind aktuell in Deutsch, Englisch, Französisch und Spanisch verfügbar.

---

## Installation
1. **Repository herunterladen**  
   - `git clone https://github.com/<dein-user>/BCMenuBarColorator.git`
2. **Unverpackte Erweiterung laden**  
   - Chrome/Edge öffnen → `chrome://extensions`  
   - „Entwicklermodus“ aktivieren  
   - „Entpackte Erweiterung laden“ wählen und den Ordner `BCMenuBarColorator` auswählen
3. Die Erweiterung erscheint nun in der Browser‑Symbolleiste.

---

## Verwendung
1. **Business Central öffnen** – die aktuelle URL wird im Popup automatisch vorgeschlagen.  
2. **Popup öffnen** (Klick auf das Erweiterungssymbol) und eine Farbe wählen.  
3. **Optional**:  
   - Mond-/Sonne‑Icon anklicken, um Dark Mode für diese URL zu aktivieren/deaktivieren.  
   - Rot-/Grün‑Icon anklicken, um die „PRODUKTIV“-Anzeige zu schalten.  
4. **„Add URL“ klicken** – die Leiste der aktuellen Seite färbt sich sofort.  
5. Weitere URLs nach Bedarf hinzufügen. Die Liste lässt sich über das Popup verwalten (Bearbeiten, Löschen, Umschalten von Dark Mode/Produktiv).

---

## Projektstruktur
```text
BCMenuBarColorator/
├── manifest.json                # Chrome-Manifest (v3)
├── extension/
│   └── background.js            # Service Worker: Initialisiert Speicher
├── content-scripts/
│   └── content.js               # Farb-/Dark-Mode-Logik, PRODUKTIV-Anzeige
├── popup/
│   ├── popup.html               # UI zum Verwalten der URLs
│   └── popup.js                 # Popup-Logik und Event-Handling
├── icons/                       # Erweiterungs-Icons
└── _locales/                    # Übersetzungen (de, en, es, fr)
