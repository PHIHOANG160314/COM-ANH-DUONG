/**
 * Material Web Components - All-in-One Bundle
 * Using official @material/web/all.js for complete component set
 */

// Import all Material Web components at once
import '@material/web/all.js';

// Import and apply typography styles
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';

// Apply typography stylesheet globally when available
if (typescaleStyles?.styleSheet) {
    document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
}

if (window.Debug) Debug.log('✅ Material Web Components loaded (all.js bundle)');

