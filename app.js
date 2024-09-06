const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resolutionInput = document.getElementById('resolution');
const showGridCheckbox = document.getElementById('showGrid');
const downloadButton = document.getElementById('downloadButton');
const downloadSizeInput = document.getElementById('downloadSize');
const convertButton = document.getElementById('convertButton');
let canvasSize = 640;

let img = new Image();
let pixelatedImageData = null;

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        img.src = event.target.result;
        img.onload = () => {
            // Draw original image on canvas initially
            ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
        };
    };

    reader.readAsDataURL(file);
});

convertButton.addEventListener('click', () => {
    const resolution = parseInt(resolutionInput.value);

    // Step 1: Downscale the image to the desired pixel art resolution
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = resolution;
    offscreenCanvas.height = resolution;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.drawImage(img, 0, 0, resolution, resolution);

    // Step 2: Get the image data and store it for later (for download without the grid)
    pixelatedImageData = offscreenCtx.getImageData(0, 0, resolution, resolution);

    // Step 3: Scale up the pixel art to canvasSizexcanvasSize
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreenCanvas, 0, 0, resolution, resolution, 0, 0, canvasSize, canvasSize);

    // Step 4: Draw the grid only if the checkbox is checked
    if (showGridCheckbox.checked) {
        drawGrid(resolution);
    }
});

// Function to draw the grid as overlay (only if checkbox is checked)
function drawGrid(resolution) {
    const cellSize = canvasSize / resolution;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvasSize; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize);
        ctx.stroke();
    }

    for (let y = 0; y <= canvasSize; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize, y);
        ctx.stroke();
    }
}

// Re-render the image when the checkbox state changes
showGridCheckbox.addEventListener('change', () => {
    const resolution = parseInt(resolutionInput.value);

    if (pixelatedImageData) {
        // Redraw pixelated image without clearing data
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
        if (showGridCheckbox.checked) {
            drawGrid(resolution);
        }
    }
});

// Event listener for downloading the image (without grid)
downloadButton.addEventListener('click', () => {
    const downloadSize = parseInt(downloadSizeInput.value);

    // Create an offscreen canvas to generate the final image without the grid
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = downloadSize;
    downloadCanvas.height = downloadSize;
    const downloadCtx = downloadCanvas.getContext('2d');

    if (pixelatedImageData) {
        // Scale up the pixelated image to the selected download size
        downloadCtx.imageSmoothingEnabled = false; // Disable smoothing for sharp pixels
        downloadCtx.putImageData(pixelatedImageData, 0, 0); // Draw the pixelated image

        // Scale up and draw it to the final download canvas size
        downloadCtx.drawImage(downloadCanvas, 0, 0, pixelatedImageData.width, pixelatedImageData.height, 0, 0, downloadSize, downloadSize);

        // Trigger download
        const link = document.createElement('a');
        link.download = `pixel_art_${downloadSize}x${downloadSize}.png`;
        link.href = downloadCanvas.toDataURL();
        link.click();
    }
});
