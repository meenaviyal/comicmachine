import Gallery from './db.js';

/**
 * Auto-import functionality for ComicMachine
 * Automatically imports the orion collection if it doesn't exist in the database
 */

class AutoImport {
    constructor() {
        this.gallery = null;
        this.orionJsonPath = './library/orion.json';
    }

    /**
     * Initialize the auto-import system
     * @param {Gallery} galleryInstance - Pre-initialized Gallery instance
     */
    async init(galleryInstance) {
        this.gallery = galleryInstance;
    }

    /**
     * Check if the orion collection exists in the database
     * @returns {Promise<boolean>} - True if orion collection exists, false otherwise
     */
    async hasOrionCollection() {
        try {
            const collectionNames = await this.gallery.getCollectionNames();
            return collectionNames.includes('orion');
        } catch (error) {
            console.error('Error checking for orion collection:', error);
            return false;
        }
    }

    /**
     * Import the orion collection from library/orion.json
     * @returns {Promise<Object>} - Import result with success and error counts
     */
    async importOrionCollection() {
        try {
            console.log('Auto-importing orion collection...');
            
            // Fetch the orion collection data
            const response = await fetch(this.orionJsonPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch orion collection: ${response.status} ${response.statusText}`);
            }
            
            const orionData = await response.json();
            
            // Validate that we have an array of data
            if (!Array.isArray(orionData)) {
                throw new Error('Invalid orion collection format - expected array');
            }
            
            // Import the data using the gallery's import method
            const result = await this.gallery.importGallery(orionData);
            
            console.log(`Orion collection import completed: ${result.successCount} images imported, ${result.errorCount} errors`);
            
            return result;
        } catch (error) {
            console.error('Error importing orion collection:', error);
            throw error;
        }
    }

    /**
     * Main auto-import function - checks if orion collection exists and imports if needed
     * @returns {Promise<Object|null>} - Import result if import was performed, null if not needed
     */
    async autoImportOrion() {
        try {
            if (!this.gallery) {
                throw new Error('Gallery instance not initialized. Call init() first.');
            }

            // Check if orion collection already exists
            const hasOrion = await this.hasOrionCollection();
            
            if (hasOrion) {
                console.log('Orion collection already exists, skipping auto-import');
                return null;
            }

            // Import the orion collection
            const result = await this.importOrionCollection();
            
            return result;
        } catch (error) {
            console.error('Auto-import failed:', error);
            throw error;
        }
    }
}

export default AutoImport;
