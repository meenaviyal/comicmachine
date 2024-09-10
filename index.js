import Gallery from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
    const gallery = new Gallery('galleryDB', 1);
    await gallery.init();
    // Define ScalableTextbox
    fabric.ScalableTextbox = fabric.util.createClass(fabric.Textbox, {
        type: 'scalableTextbox',
        initialize: function(text, options) {
            options || (options = {});
            this.callSuper('initialize', text, options);
        },
        _renderText: function(ctx) {
            this.callSuper('_renderText', ctx);
            ctx.scale(1 / this.scaleX, 1 / this.scaleY);
        }
    });

    // Initialize Fabric.js canvas
    var canvas = new fabric.Canvas('comic-artboard');

    // Load canvas from localStorage if exists
    const savedCanvas = localStorage.getItem('canvasState');
    if (savedCanvas) {
        canvas.loadFromJSON(savedCanvas, canvas.renderAll.bind(canvas));
    }

    // Retrieve stored fonts from localStorage
    var storedFonts = JSON.parse(localStorage.getItem('customFonts')) || [];

    // Function to save canvas state to localStorage
    function saveCanvasState() {
        localStorage.setItem('canvasState', JSON.stringify(canvas.toJSON()));
    }

    // Add event listener for canvas modifications
    canvas.on('object:modified', saveCanvasState);
    canvas.on('object:added', saveCanvasState);
    canvas.on('object:removed', saveCanvasState);
    
            // Function to delete selected item
            function deleteSelectedItem() {
                var activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.remove(activeObject);
                    canvas.renderAll();
                } else {
                    alert('Please select an item to delete.');
                }
            }
    
            // Function to clear all items from canvas
            function clearCanvas() {
                if (confirm('Are you sure you want to clear all items from the canvas?')) {
                    canvas.clear();
                    canvas.renderAll();
                    localStorage.removeItem('canvasState');
                }
            }
    
            // Function to populate font select dropdown
            function populateFontSelect() {
                var fontSelect = document.getElementById('fontSelector');
                fontSelect.innerHTML = '<option value="">Select Font</option>';
                
                // Add default fonts
                var defaultFonts = ['Arial', 'Courier', 'Georgia'];
                
                defaultFonts.forEach(function(font) {
                    var option = document.createElement('option');
                    option.value = font;
                    option.textContent = font;
                    fontSelect.appendChild(option);
                });
    
                // Add stored custom fonts
                storedFonts.forEach(function(font) {
                    var option = document.createElement('option');
                    option.value = font.family;
                    option.textContent = font.family;
                    fontSelect.appendChild(option);
                });
            }
    
            // Call the function to populate font select
            populateFontSelect();
    
            // Function to make canvas responsive
            function resizeCanvas() {
                const container = document.querySelector('.artboard-area');
                const containerWidth = container.offsetWidth;
                const aspectRatio = canvas.height / canvas.width;
                const newWidth = containerWidth;
                const newHeight = containerWidth * aspectRatio;
    
                canvas.setDimensions({ width: newWidth, height: newHeight });
                canvas.setZoom(newWidth / 800); // 800 is the original canvas width
                canvas.renderAll();
            }
    
            // Initial resize and add event listener for window resize
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
    
            // Function to add image to canvas
            function addImageToCanvas(imgSrc) {
                fabric.Image.fromURL(imgSrc, function(img) {
                    // Set maximum dimensions for the image
                    const maxWidth = canvas.width * 0.5;  // 50% of canvas width
                    const maxHeight = canvas.height * 0.5;  // 50% of canvas height
    
                    // Calculate scale factor to fit within max dimensions
                    var scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height);
                    
                    // Scale the image
                    img.scale(scaleFactor);
    
                    // Center the image on the canvas
                    img.set({
                        left: canvas.width / 2,
                        top: canvas.height / 2,
                        originX: 'center',
                        originY: 'center'
                    });
    
                    canvas.add(img);
                    canvas.renderAll();
                });
            }
    
            // Event delegation for gallery images
            document.getElementById('galleryDisplay').addEventListener('click', function(e) {
                if (e.target.tagName === 'IMG') {
                    addImageToCanvas(e.target.src);
                }
            });
    
            // Function to add text to canvas
            function addTextToCanvas(text, font, size) {
                var textbox = new fabric.ScalableTextbox(text, {
                    left: canvas.width / 2,
                    top: canvas.height / 2,
                    fontSize: size,
                    fontFamily: font,
                    fill: '#000000',
                    originX: 'center',
                    originY: 'center',
                    width: 200,  // Set a fixed initial width
                    padding: 5,  // Add some padding
                    textAlign: 'center'  // Center-align the text
                });
                canvas.add(textbox);
                canvas.setActiveObject(textbox);
                canvas.renderAll();
            }
    
            // Add text button functionality
            document.getElementById('addTextButton').addEventListener('click', function() {
                var text = document.getElementById('input').value;
                var font = document.getElementById('fontSelector').value;
                var size = document.querySelector('input[type="number"]').value;
                
                if (text && font && size) {
                    addTextToCanvas(text, font, parseInt(size));
                } else {
                    alert('Please enter text, select a font, and specify a font size.');
                }
            });
    
            // Image upload functionality
            document.getElementById('imageUpload').addEventListener('change', function(e) {
                var file = e.target.files[0];
                var reader = new FileReader();
    
                reader.onload = function(event) {
                    var img = new Image();
                    img.onload = function() {
                        var fabricImage = new fabric.Image(img);
                        
                        // Set maximum dimensions for the image
                        const maxWidth = canvas.width * 0.5;  // 50% of canvas width
                        const maxHeight = canvas.height * 0.5;  // 50% of canvas height
    
                        // Calculate scale factor to fit within max dimensions
                        var scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height);
                        
                        // Scale the image
                        fabricImage.scale(scaleFactor);
    
                        // Center the image on the canvas
                        fabricImage.set({
                            left: canvas.width / 2,
                            top: canvas.height / 2,
                            originX: 'center',
                            originY: 'center'
                        });
    
                        canvas.add(fabricImage);
                        canvas.renderAll();
                    }
                    img.src = event.target.result;
                }
                reader.readAsDataURL(file);
            });
    
            // Initialize tooltips
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl)
            });
    
            // Download canvas as PNG with white background
            document.getElementById('downloadBtn').addEventListener('click', function() {
                // Get the original dimensions of the canvas
                var originalWidth = canvas.width;
                var originalHeight = canvas.height;
    
                // Create a new canvas with white background
                var tempCanvas = document.createElement('canvas');
                var tempContext = tempCanvas.getContext('2d');
                tempCanvas.width = originalWidth;
                tempCanvas.height = originalHeight;
    
                // Fill with white background
                tempContext.fillStyle = 'white';
                tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
                // Draw the Fabric.js canvas content onto the new canvas
                var dataURL = canvas.toDataURL({
                    format: 'png',
                    multiplier: 1,
                    width: originalWidth,
                    height: originalHeight
                });
    
                var img = new Image();
                img.onload = function() {
                    tempContext.drawImage(img, 0, 0);
    
                    // Create download link
                    var link = document.createElement('a');
                    link.download = 'comic_strip.png';
                    link.href = tempCanvas.toDataURL('image/png');
                    link.click();
                };
                img.src = dataURL;
            });
    
            // Add event listener for delete button
            document.getElementById('deleteBtn').addEventListener('click', deleteSelectedItem);
    
            // Add event listener for clear canvas button
            document.getElementById('clearCanvasBtn').addEventListener('click', clearCanvas);
            
    let currentPage = 1;
    let selectedCollection = '';

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

    // Ensure "All Collections" option exists
    if (!collectionSelect.querySelector('option[value=""]')) {
        const allCollectionsOption = document.createElement('option');
        allCollectionsOption.value = '';
        allCollectionsOption.textContent = 'All Collections';
        collectionSelect.insertBefore(allCollectionsOption, collectionSelect.firstChild);
    }

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

    async function populateCollectionDropdown() {
        try {
            // Clear existing options except the first one (All Collections)
            while (collectionSelect.options.length > 1) {
                collectionSelect.remove(1);
            }

            const collectionNames = await gallery.getCollectionNames();
            collectionNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                collectionSelect.appendChild(option);
            });

            // Set selectedCollection to empty string (All Collections) by default
            selectedCollection = '';
            collectionSelect.value = '';
            displayGallery();
        } catch (error) {
            console.error('Error fetching collection names:', error);
        }
    }

    async function displayGallery() {
        console.log("display gallery");
        galleryDisplay.innerHTML = '';
        try {
            const { results, totalPages } = await gallery.getGalleryItems(currentPage, selectedCollection);

            if (results.length === 0) {
                galleryDisplay.innerHTML = '<p>No images found.</p>';
            } else {
                results.forEach(image => {
                    const imgElement = document.createElement('img');
                    imgElement.src = image.imageData;
                    imgElement.alt = image.imageName;
                    imgElement.classList.add('w-full', 'h-auto', 'object-cover', 'rounded');
                    galleryDisplay.appendChild(imgElement);
                });
            }

            // Update pagination controls
            currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
            prevPageButton.disabled = currentPage === 1;
            nextPageButton.disabled = currentPage === totalPages || results.length < gallery.ITEMS_PER_PAGE;
        } catch (error) {
            console.error('Error displaying gallery:', error);
            galleryDisplay.innerHTML = '<p>Error loading images. Please try again.</p>';
        }
    }

    // Initial setup
    populateCollectionDropdown();
});
