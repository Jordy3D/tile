const imageInput = document.getElementById('imageInput');
const tileSizeSlider = document.getElementById('tileSize');
const pixelatedToggle = document.getElementById('pixelated');
const previewContainer = document.getElementById('previewContainer');
const darkModeToggle = document.getElementById('darkMode');
const fileNameDisplay = document.getElementById('fileNameDisplay');

let currentImage = null;

let currentImageDimensions = {
    width: 0,
    height: 0,
};

const fileInputContainer = document.querySelector('.file-input-container');
const contextMenu = document.querySelector('.context-menu');
const pasteImageButton = document.getElementById('pasteImage');

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        fileNameDisplay.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage = e.target.result;
            const image = new Image();
            image.src = currentImage;
            image.onload = () => {
                currentImageDimensions.width = image.width;
                currentImageDimensions.height = image.height;
                updateTileImage();
            };
        };
        reader.readAsDataURL(file);
    }
}

function updateTileImage() {
    const tileSize = tileSizeSlider.value;
    previewContainer.innerHTML = '';
    
    if (!currentImage) return;

    // set the background image of the preview container
    previewContainer.style.backgroundImage = `url(${currentImage})`;

    updateTileSize();
    updatePixelated();
}

function updateTileSize() {
    const tileSize = tileSizeSlider.value;
    // previewContainer.style.backgroundSize = `${tileSize}px ${tileSize}px`;

    // calculate the appropriate width for the tileSize and the aspect ratio of the image
    const aspectRatio = currentImageDimensions.width / currentImageDimensions.height;
    const height = tileSize;
    const width = tileSize * aspectRatio;

    // apply the width and height to the preview container background size
    previewContainer.style.backgroundSize = `${width}px ${height}px`;
}

function updatePixelated() {
    if (pixelatedToggle.checked) {
        previewContainer.classList.add('pixelated');
    } else {
        previewContainer.classList.remove('pixelated');
    }
}

function updateTheme() {
    document.documentElement.setAttribute(
        'data-theme',
        darkModeToggle.checked ? 'dark' : 'light'
    );
}

// Load saved preferences
darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
pixelatedToggle.checked = localStorage.getItem('pixelated') === 'true';
updateTheme();
updatePixelated();

darkModeToggle.addEventListener('change', () => {
    localStorage.setItem('darkMode', darkModeToggle.checked);
    updateTheme();
});

pixelatedToggle.addEventListener('change', () => {
    localStorage.setItem('pixelated', pixelatedToggle.checked);
    updatePixelated();
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    } else {
        fileNameDisplay.textContent = 'Choose Image';
    }
});

// Add drag and drop event listeners
fileInputContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileInputContainer.classList.add('drag-over');
});

fileInputContainer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    fileInputContainer.classList.remove('drag-over');
});

fileInputContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    fileInputContainer.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFile(file);
    }
});

// Prevent default context menu and show custom menu
fileInputContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
});

// Hide context menu when clicking outside
document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// Handle paste from context menu
pasteImageButton.addEventListener('click', async () => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type.startsWith('image/')) {
                    const blob = await clipboardItem.getType(type);
                    const file = new File([blob], 'pasted-image.png', { type });
                    handleFile(file);
                    break;
                }
            }
        }
    } catch (err) {
        console.error('Failed to paste image:', err);
    }
});

// Add keyboard shortcut for paste
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'v') {
        pasteImageButton.click();
    }
});

tileSizeSlider.addEventListener('input', updateTileSize);
pixelatedToggle.addEventListener('change', updatePixelated);
// window.addEventListener('resize', updateTileImage);
