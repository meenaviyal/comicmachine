document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'galleryDB';
    const dbVersion = 1;

    // Open the database and upgrade if necessary
    const dbRequest = indexedDB.open(dbName, dbVersion);
    let db;

    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    dbRequest.onupgradeneeded = (event) => {
        db = event.target.result;

        // Check if the object store already exists, and if not, create it
        if (!db.objectStoreNames.contains('galleries')) {
            const objectStore = db.createObjectStore('galleries', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('collectionName', 'collectionName', { unique: false });
            objectStore.createIndex('imageName', 'imageName', { unique: false });
            objectStore.createIndex('imageTags', 'imageTags', { unique: false });
            objectStore.createIndex('imageData', 'imageData', { unique: false });
        }
    };

    dbRequest.onsuccess = (event) => {
        db = event.target.result;
        loadGallery();
        getCollectionNames(); // Call to fetch the collection names
    };

    dbRequest.onerror = (event) => {
        console.error('IndexedDB error:', event.target.errorCode);
    };

    const galleryForm = document.getElementById('galleryForm');
    const galleryTableBody = document.getElementById('galleryTableBody');
    const galleryModal = document.getElementById('galleryModal');
    const openModalButton = document.getElementById('openModalButton');
    const closeModalButton = document.getElementById('closeModalButton');

    openModalButton.addEventListener('click', () => {
        galleryModal.classList.remove('hidden');
    });

    closeModalButton.addEventListener('click', () => {
        galleryModal.classList.add('hidden');
    });

    galleryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const collectionName = document.getElementById('collectionName').value;
        const imageName = document.getElementById('imageName').value;
        const imageTags = document.getElementById('imageTags').value;
        const imageFile = document.getElementById('imageFile').files[0];

        const reader = new FileReader();
        reader.onloadend = () => {
            const imageData = reader.result;
            addImageToGallery(collectionName, imageName, imageTags, imageData);
            galleryModal.classList.add('hidden');
        };
        reader.readAsDataURL(imageFile);
    });

    function addImageToGallery(collectionName, imageName, imageTags, imageData) {
        const transaction = db.transaction(['galleries'], 'readwrite');
        const objectStore = transaction.objectStore('galleries');
        const newImage = { collectionName, imageName, imageTags, imageData };
        const request = objectStore.add(newImage);

        request.onsuccess = () => {
            galleryForm.reset();
            loadGallery();
        };

        request.onerror = (event) => {
            console.error('Error adding image:', event.target.errorCode);
        };
    }

    function loadGallery() {
        galleryTableBody.innerHTML = '';
        const transaction = db.transaction(['galleries'], 'readonly');
        const objectStore = transaction.objectStore('galleries');
        const request = objectStore.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const { id, collectionName, imageName, imageTags, imageData } = cursor.value;
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td class="border px-4 py-2">${id}</td>
                    <td class="border px-4 py-2"><img src="${imageData}" alt="${imageName}" class="w-16 h-16 object-cover rounded"></td>
                    <td class="border px-4 py-2">${collectionName}</td>
                    <td class="border px-4 py-2">${imageName}</td>
                    <td class="border px-4 py-2">${imageTags}</td>
                    <td class="border px-4 py-2">
                        <button class="bg-red-500 text-white p-2 rounded" data-id="${id}">Delete</button>
                    </td>
                `;

                galleryTableBody.appendChild(row);
                cursor.continue();
            }
        };
    }

    galleryTableBody.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const id = Number(event.target.dataset.id);
            deleteImageFromGallery(id);
        }
    });

    function deleteImageFromGallery(id) {
        const transaction = db.transaction(['galleries'], 'readwrite');
        const objectStore = transaction.objectStore('galleries');
        const request = objectStore.delete(id);

        request.onsuccess = () => {
            loadGallery();
        };

        request.onerror = (event) => {
            console.error('Error deleting image:', event.target.errorCode);
        };
    }

    // New function to get the list of unique collection names
    function getCollectionNames() {
        const transaction = db.transaction(['galleries'], 'readonly');
        const objectStore = transaction.objectStore('galleries');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const allImages = event.target.result;
            const collectionNames = [...new Set(allImages.map(image => image.collectionName))];
            console.log('Collection Names:', collectionNames);
            // You can use collectionNames array for your purpose, like populating a dropdown.
        };

        request.onerror = (event) => {
            console.error('Error fetching collection names:', event.target.errorCode);
        };
    }

    exportButton.addEventListener('click', exportGallery);
    importButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importGallery);

    function exportGallery() {
        const transaction = db.transaction(['galleries'], 'readonly');
        const objectStore = transaction.objectStore('galleries');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const allImages = event.target.result;
            const exportData = JSON.stringify(allImages);
            
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gallery_export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        request.onerror = (event) => {
            console.error('Error exporting gallery:', event.target.errorCode);
        };
    }

    function importGallery(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid import data format');
                }

                const transaction = db.transaction(['galleries'], 'readwrite');
                const objectStore = transaction.objectStore('galleries');

                let successCount = 0;
                let errorCount = 0;

                importedData.forEach((item) => {
                    if (validateImportItem(item)) {
                        const request = objectStore.add(item);
                        request.onsuccess = () => {
                            successCount++;
                            if (successCount + errorCount === importedData.length) {
                                finishImport(successCount, errorCount);
                            }
                        };
                        request.onerror = () => {
                            errorCount++;
                            if (successCount + errorCount === importedData.length) {
                                finishImport(successCount, errorCount);
                            }
                        };
                    } else {
                        errorCount++;
                        if (successCount + errorCount === importedData.length) {
                            finishImport(successCount, errorCount);
                        }
                    }
                });
            } catch (error) {
                console.error('Error importing gallery:', error);
                alert('Error importing gallery: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    function validateImportItem(item) {
        return (
            item &&
            typeof item.collectionName === 'string' &&
            typeof item.imageName === 'string' &&
            typeof item.imageTags === 'string' &&
            typeof item.imageData === 'string' &&
            item.imageData.startsWith('data:image/')
        );
    }

    function finishImport(successCount, errorCount) {
        alert(`Import completed. ${successCount} items imported successfully, ${errorCount} items failed.`);
        loadGallery();
        fileInput.value = '';
    }
});
