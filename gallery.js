import Gallery from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
    const gallery = new Gallery('galleryDB', 1);
    await gallery.init();

    let currentPage = 1;
    let selectedCollection = '';

    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    const galleryForm = document.getElementById('galleryForm');
    const galleryTableBody = document.getElementById('galleryTableBody');
    const galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));
    const paginationContainer = document.getElementById('paginationContainer');
    const collectionSelect = document.getElementById('collectionSelect');

    loadGallery(currentPage);
    updateCollectionSuggestions();
    populateCollectionDropdown();

    collectionSelect.addEventListener('change', () => {
        selectedCollection = collectionSelect.value;
        currentPage = 1;
        loadGallery(currentPage);
    });

    galleryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const collectionName = document.getElementById('collectionName').value;
        const imageName = document.getElementById('imageName').value;
        const imageTags = document.getElementById('imageTags').value;
        const imageFile = document.getElementById('imageFile').files[0];

        const reader = new FileReader();
        reader.onloadend = async () => {
            const imageData = reader.result;
            await gallery.addImage(collectionName, imageName, imageTags, imageData);
            galleryForm.reset();
            loadGallery(currentPage);
            galleryModal.hide();
        };
        reader.readAsDataURL(imageFile);
    });

    async function loadGallery(page) {
        const { results, totalPages } = await gallery.getGalleryItems(page, selectedCollection);
        galleryTableBody.innerHTML = '';
        if (results.length === 0) {
            galleryTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No images found.</td></tr>';
        } else {
            results.forEach(item => {
                const row = createTableRow(item.id, item.collectionName, item.imageName, item.imageTags, item.imageData);
                galleryTableBody.appendChild(row);
            });
        }
        updatePagination(page, totalPages);
    }

    function createTableRow(id, collectionName, imageName, imageTags, imageData) {
        const row = document.createElement('tr');

        const tagPills = imageTags.split(',').map(tag => 
            `<span class="badge border border-info text-info me-1">${tag.trim()}</span>`
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

    galleryTableBody.addEventListener('click', async (event) => {
        if (event.target.tagName === 'BUTTON') {
            const id = Number(event.target.dataset.id);
            await gallery.deleteImage(id);
            loadGallery(currentPage);
        }
    });

    async function updateCollectionSuggestions() {
        const collectionNames = await gallery.getCollectionNames();
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

    document.getElementById('openModalButton').addEventListener('click', updateCollectionSuggestions);

    async function populateCollectionDropdown() {
        try {
            const collectionNames = await gallery.getCollectionNames();
            collectionSelect.innerHTML = '<option value="">All Collections</option>';
            collectionNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                collectionSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching collection names:', error);
        }
    }

    exportButton.addEventListener('click', async () => {
        const exportData = await gallery.exportGallery();
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gallery_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    importButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                const { successCount, errorCount } = await gallery.importGallery(importedData);
                alert(`Import completed. ${successCount} items imported successfully, ${errorCount} items failed.`);
                loadGallery(currentPage);
                fileInput.value = '';
            } catch (error) {
                console.error('Error importing gallery:', error);
                alert('Error importing gallery: ' + error.message);
            }
        };
        reader.readAsText(file);
    });
});
