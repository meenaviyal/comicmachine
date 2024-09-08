document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'galleryDB';
    const dbVersion = 1;
    let db;
    let currentPage = 1;
    const itemsPerPage = 6;
    let selectedCollection = '';

    // Open the database
    const dbRequest = indexedDB.open(dbName, dbVersion);

    dbRequest.onsuccess = (event) => {
        db = event.target.result;
        populateCollectionDropdown();
    };

    dbRequest.onerror = (event) => {
        console.error('IndexedDB error:', event.target.errorCode);
    };

    const collectionSelect = document.getElementById('collectionSelect');
    const galleryDisplay = document.getElementById('galleryDisplay');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');

    collectionSelect.addEventListener('change', () => {
        selectedCollection = collectionSelect.value;
        currentPage = 1;
        displayGallery();
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayGallery();
        }
    });

    nextPageButton.addEventListener('click', () => {
        currentPage++;
        displayGallery();
    });

    function populateCollectionDropdown() {
        const transaction = db.transaction(['galleries'], 'readonly');
        const objectStore = transaction.objectStore('galleries');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const allImages = event.target.result;
            const collectionNames = [...new Set(allImages.map(image => image.collectionName))];

            collectionNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                collectionSelect.appendChild(option);
            });

            if (collectionNames.length > 0) {
                selectedCollection = collectionNames[0];
                displayGallery();
            }
        };

        request.onerror = (event) => {
            console.error('Error fetching collection names:', event.target.errorCode);
        };
    }

    function displayGallery() {
        galleryDisplay.innerHTML = '';
        const transaction = db.transaction(['galleries'], 'readonly');
        const objectStore = transaction.objectStore('galleries');
        const index = objectStore.index('collectionName');
        const request = index.getAll(selectedCollection);

        request.onsuccess = (event) => {
            const images = event.target.result;
            const totalItems = images.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentImages = images.slice(startIndex, endIndex);

            currentImages.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = image.imageData;
                imgElement.alt = image.imageName;
                imgElement.classList.add('w-full', 'h-auto', 'object-cover', 'rounded');
                galleryDisplay.appendChild(imgElement);
            });

            // Update pagination controls
            currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
            prevPageButton.disabled = currentPage === 1;
            nextPageButton.disabled = currentPage === totalPages;
        };

        request.onerror = (event) => {
            console.error('Error displaying gallery:', event.target.errorCode);
        };
    }
});
