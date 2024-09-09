const fontUrlInput = document.getElementById('fontUrlInput');
const addFontButton = document.getElementById('addFontButton');
const progressBar = document.getElementById('progressBar');
const progressBarInner = progressBar.querySelector('.progress-bar');
const previewText = document.getElementById('previewText');
const fontPreviews = document.getElementById('fontPreviews');

let fonts = ['Arial', 'Courier', 'Georgia'];
let storedFonts = JSON.parse(localStorage.getItem('customFonts')) || [];
fonts = [...fonts, ...storedFonts.map(f => f.family)];

function updateFontPreviews() {
    fontPreviews.innerHTML = '';
    fonts.forEach(font => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card font-preview-card">
                <div class="card-body">
                    <h5 class="card-title">${font}</h5>
                    <p class="card-text font-preview-text" style="font-family: '${font}';">
                        ${previewText.value}
                    </p>
                </div>
                ${font !== 'Arial' && font !== 'Courier' && font !== 'Georgia' ? 
                    `<button class="delete-font-btn" data-font="${font}">X</button>` : ''}
            </div>
        `;
        fontPreviews.appendChild(card);
    });
}

function addFontFace(fontFamily, fontData) {
    const fontFace = new FontFace(fontFamily, fontData);
    fontFace.load().then(function(loadedFace) {
        document.fonts.add(loadedFace);
        updateFontPreviews();
    }).catch(function(error) {
        console.error('Error loading font:', error);
    });
}

storedFonts.forEach(font => addFontFace(font.family, font.data));

updateFontPreviews();

function showProgress(show) {
    progressBar.classList.toggle('d-none', !show);
    progressBarInner.style.width = '0%';
}

function updateProgress(percent) {
    progressBarInner.style.width = `${percent}%`;
}

async function fetchWithProgress(url) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;
    let chunks = [];

    while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        updateProgress((receivedLength / contentLength) * 100);
    }

    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for(let chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }

    return chunksAll;
}

function resolveUrl(baseUrl, relativeUrl) {
    return new URL(relativeUrl, baseUrl).href;
}

function extractFontUrl(css) {
    const urlMatch = css.match(/url\s*\(\s*(['"]?)(.+?\.woff2?(?:\?[^'")]+)?)\1\s*\)/i);
    return urlMatch ? urlMatch[2] : null;
}

function extractFontFamily(css) {
    const familyMatch = css.match(/font-family:\s*(['"])?(.*?)\1?;/i);
    return familyMatch ? familyMatch[2].trim() : null;
}

addFontButton.addEventListener('click', async () => {
    const fontUrl = fontUrlInput.value;
    if (fontUrl) {
        showProgress(true);
        try {
            if (fontUrl.endsWith('.css')) {
                const cssResponse = await fetch(fontUrl);
                const css = await cssResponse.text();
                const relativeFontUrl = extractFontUrl(css);
                if (relativeFontUrl) {
                    const absoluteFontUrl = resolveUrl(cssResponse.url, relativeFontUrl);
                    const fontData = await fetchWithProgress(absoluteFontUrl);
                    const fontFamily = extractFontFamily(css);
                    if (fontFamily) {
                        addNewFont(fontFamily, fontData);
                    } else {
                        throw new Error('Could not extract font family from CSS');
                    }
                } else {
                    throw new Error('Could not find font file URL in CSS');
                }
            } else {
                const fontData = await fetchWithProgress(fontUrl);
                const fontFamily = prompt("Enter a name for this font:");
                if (fontFamily) {
                    addNewFont(fontFamily, fontData);
                } else {
                    throw new Error('Font name is required');
                }
            }
        } catch (error) {
            console.error('Error adding font:', error);
            alert('Error adding font. Please check the URL and try again.');
        } finally {
            showProgress(false);
        }
    }
});

function addNewFont(fontFamily, fontData) {
    if (!fonts.includes(fontFamily)) {
        addFontFace(fontFamily, fontData);
        fonts.push(fontFamily);
        storedFonts.push({ family: fontFamily, data: fontData });
        localStorage.setItem('customFonts', JSON.stringify(storedFonts));
        updateFontPreviews();
        fontUrlInput.value = '';
    } else {
        alert('This font is already added!');
    }
}

previewText.addEventListener('input', updateFontPreviews);

fontPreviews.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-font-btn')) {
        const fontToDelete = event.target.getAttribute('data-font');
        if (confirm(`Are you sure you want to delete the font "${fontToDelete}"?`)) {
            fonts = fonts.filter(font => font !== fontToDelete);
            storedFonts = storedFonts.filter(font => font.family !== fontToDelete);
            localStorage.setItem('customFonts', JSON.stringify(storedFonts));
            updateFontPreviews();
        }
    }
});