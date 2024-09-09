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

    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let totalItems = 0;

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
        loadGallery(currentPage);
        getCollectionNames();
    };

    dbRequest.onerror = (event) => {
        console.error('IndexedDB error:', event.target.errorCode);
    };

    const galleryForm = document.getElementById('galleryForm');
    const galleryTableBody = document.getElementById('galleryTableBody');
    const galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));
    const paginationContainer = document.getElementById('paginationContainer');

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
            galleryModal.hide();
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
            loadGallery(currentPage);
        };

        request.onerror = (event) => {
            console.error('Error adding image:', event.target.errorCode);
        };
    }

    function loadGallery(page) {
        galleryTableBody.innerHTML = '';
        const transaction = db.transaction(['galleries'], 'readonly');
        const objectStore = transaction.objectStore('galleries');
        const countRequest = objectStore.count();

        countRequest.onsuccess = () => {
            totalItems = countRequest.result;
            const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

            const request = objectStore.openCursor();
            let counter = 0;
            const start = (page - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (counter >= start && counter < end) {
                        const { id, collectionName, imageName, imageTags, imageData } = cursor.value;
                        const row = createTableRow(id, collectionName, imageName, imageTags, imageData);
                        galleryTableBody.appendChild(row);
                    }
                    counter++;
                    if (counter < end) {
                        cursor.continue();
                    } else {
                        updatePagination(page, totalPages);
                    }
                } else {
                    updatePagination(page, totalPages);
                }
            };
        };
    }

    function createTableRow(id, collectionName, imageName, imageTags, imageData) {
        const row = document.createElement('tr');
        const getRandomColor = () => {
            const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        const tagPills = imageTags.split(',').map(tag => 
            `<span class="badge bg-${getRandomColor()} me-1">${tag.trim()}</span>`
        ).join('');

        row.innerHTML = `
            <td class="border px-4 py-2">${id}</td>
            <td class="border px-4 py-2">
                <div class="image-preview-container">
                    <img src="${imageData}" alt="${imageName}" class="image-preview">
                    <div class="image-preview-full">
                        <img src="${imageData}" alt="${imageName}">
                    </div>
                </div>
            </td>
            <td class="border px-4 py-2">${collectionName}</td>
            <td class="border px-4 py-2">${imageName}</td>
            <td class="border px-4 py-2">${tagPills}</td>
            <td class="border px-4 py-2">
                <button class="btn btn-danger btn-sm" data-id="${id}">Delete</button>
            </td>
        `;

        return row;
    }

    function updatePagination(currentPage, totalPages) {
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            paginationContainer.appendChild(li);
        }
    }

    paginationContainer.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.tagName === 'A') {
            currentPage = parseInt(event.target.dataset.page);
            loadGallery(currentPage);
        }
    });

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
            loadGallery(currentPage);
        };

        request.onerror = (event) => {
            console.error('Error deleting image:', event.target.errorCode);
        };
    }

    function getCollectionNames() {
        const transaction = db.transaction(['galleries'], 'readonly');
        const objectStore = transaction.objectStore('galleries');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const allImages = event.target.result;
            const collectionNames = [...new Set(allImages.map(image => image.collectionName))];
            console.log('Collection Names:', collectionNames);
            updateCollectionSuggestions(collectionNames);
        };

        request.onerror = (event) => {
            console.error('Error fetching collection names:', event.target.errorCode);
        };
    }

    function updateCollectionSuggestions(collectionNames) {
        const suggestionsContainer = document.getElementById('collectionSuggestions');
        suggestionsContainer.innerHTML = '';
        collectionNames.forEach(name => {
            const pill = document.createElement('span');
            pill.className = 'badge bg-secondary me-1 mb-1';
            pill.textContent = name;
            pill.style.cursor = 'pointer';
            pill.addEventListener('click', () => {
                document.getElementById('collectionName').value = name;
            });
            suggestionsContainer.appendChild(pill);
        });
    }

    document.getElementById('openModalButton').addEventListener('click', () => {
        getCollectionNames();
    });

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
        loadGallery(currentPage);
        fileInput.value = '';
    }
});
