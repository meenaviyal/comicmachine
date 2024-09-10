class Gallery {
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.ITEMS_PER_PAGE = 10;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains('galleries')) {
                    const objectStore = this.db.createObjectStore('galleries', { keyPath: 'id', autoIncrement: true });
                    objectStore.createIndex('collectionName', 'collectionName', { unique: false });
                    objectStore.createIndex('imageName', 'imageName', { unique: false });
                    objectStore.createIndex('imageTags', 'imageTags', { unique: false });
                    objectStore.createIndex('imageData', 'imageData', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event) => {
                reject(`IndexedDB error: ${event.target.errorCode}`);
            };
        });
    }

    async addImage(collectionName, imageName, imageTags, imageData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['galleries'], 'readwrite');
            const objectStore = transaction.objectStore('galleries');
            const newImage = { collectionName, imageName, imageTags, imageData };
            const request = objectStore.add(newImage);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(`Error adding image: ${event.target.errorCode}`);
        });
    }

    async loadGallery(page) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['galleries'], 'readonly');
            const objectStore = transaction.objectStore('galleries');
            const countRequest = objectStore.count();

            countRequest.onsuccess = () => {
                const totalItems = countRequest.result;
                const totalPages = Math.ceil(totalItems / this.ITEMS_PER_PAGE);

                const request = objectStore.openCursor();
                let counter = 0;
                const start = (page - 1) * this.ITEMS_PER_PAGE;
                const end = start + this.ITEMS_PER_PAGE;
                const results = [];

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        if (counter >= start && counter < end) {
                            results.push(cursor.value);
                        }
                        counter++;
                        if (counter < end) {
                            cursor.continue();
                        } else {
                            resolve({ results, totalPages, currentPage: page });
                        }
                    } else {
                        resolve({ results, totalPages, currentPage: page });
                    }
                };

                request.onerror = (event) => reject(`Error loading gallery: ${event.target.errorCode}`);
            };
        });
    }

    async deleteImage(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['galleries'], 'readwrite');
            const objectStore = transaction.objectStore('galleries');
            const request = objectStore.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(`Error deleting image: ${event.target.errorCode}`);
        });
    }

    async getCollectionNames() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['galleries'], 'readonly');
            const objectStore = transaction.objectStore('galleries');
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                const allImages = event.target.result;
                const collectionNames = [...new Set(allImages.map(image => image.collectionName))];
                resolve(collectionNames);
            };

            request.onerror = (event) => reject(`Error fetching collection names: ${event.target.errorCode}`);
        });
    }

    async exportGallery() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['galleries'], 'readonly');
            const objectStore = transaction.objectStore('galleries');
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                const allImages = event.target.result;
                resolve(JSON.stringify(allImages));
            };

            request.onerror = (event) => reject(`Error exporting gallery: ${event.target.errorCode}`);
        });
    }

    async importFromFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            return this.importGallery(jsonData);
        } catch (error) {
            console.error('Error importing from file:', error);
            throw error;
        }
    }

    async importGallery(importedData) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(importedData)) {
                reject(new Error('Invalid import data format'));
                return;
            }

            const transaction = this.db.transaction(['galleries'], 'readwrite');
            const objectStore = transaction.objectStore('galleries');

            let successCount = 0;
            let errorCount = 0;

            importedData.forEach((item) => {
                if (this.validateImportItem(item)) {
                    const request = objectStore.add(item);
                    request.onsuccess = () => {
                        successCount++;
                        if (successCount + errorCount === importedData.length) {
                            resolve({ successCount, errorCount });
                        }
                    };
                    request.onerror = () => {
                        errorCount++;
                        if (successCount + errorCount === importedData.length) {
                            resolve({ successCount, errorCount });
                        }
                    };
                } else {
                    errorCount++;
                    if (successCount + errorCount === importedData.length) {
                        resolve({ successCount, errorCount });
                    }
                }
            });
        });
    }

    validateImportItem(item) {
        return (
            item &&
            typeof item.collectionName === 'string' &&
            typeof item.imageName === 'string' &&
            typeof item.imageTags === 'string' &&
            typeof item.imageData === 'string' &&
            item.imageData.startsWith('data:image/')
        );
    }
}

export default Gallery;
