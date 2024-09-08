document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'galleryDB';
    const dbVersion = 1;

    // Open the database and upgrade if necessary
    const dbRequest = indexedDB.open(dbName, dbVersion);
    let db;

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
});
