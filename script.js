const STATUS_DURATION = 1500;
const activeToolEl = document.getElementById('active-tool');
const brushColorBtn = document.getElementById('brush-color');
const brushIcon = document.getElementById('brush');
const brushSize = document.getElementById('brush-size');
const brushSlider = document.getElementById('brush-slider');
const bucketColorBtn = document.getElementById('bucket-color');
const bucketIcon = document.getElementById('bucket-icon');
const eraser = document.getElementById('eraser');
const clearCanvasBtn = document.getElementById('clear-canvas');
const saveStorageBtn = document.getElementById('save-storage');
const loadStorageBtn = document.getElementById('load-storage');
const clearStorageBtn = document.getElementById('clear-storage');
const downloadBtn = document.getElementById('download');
const { body } = document;

// Global Variables
const canvas = document.createElement('canvas');
canvas.id = 'canvas';
const context = canvas.getContext('2d');
let currentSize = 10;
let bucketColor = '#FFFFFF';
let currentColor = '#A51DAB';
let isEraser = false;
let isMouseDown = false;
let drawnArray = [];

// Formatting Brush Size
function displayBrushSize() {
  if (currentSize < 10) {
    brushSize.textContent = `0${currentSize}`;
  } else {
    brushSize.textContent = currentSize;
  }
}

// Setting Brush Size
brushSlider.addEventListener('change', () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

// Setting Brush Color
brushColorBtn.addEventListener('change', () => {
  isEraser = false;
  currentColor = `#${brushColorBtn.value}`;
});

// Setting Background Color
bucketColorBtn.addEventListener('change', () => {
  bucketColor = `#${bucketColorBtn.value}`;
  bucketIcon.style.color = bucketColor;
  createCanvas();
  restoreCanvas();
});

// Eraser
eraser.addEventListener('click', () => {
  isEraser = true;
  brushIcon.style.color = 'white';
  eraser.style.color = 'black';
  activeToolEl.textContent = 'Eraser';
  currentColor = bucketColor;
  currentSize = 50;
});

/**
 * Set status and gracefully switch to brush mode
 * @param {string} statusMessage 
 */
function setStatusAndSwitchToBrush(statusMessage) {
  activeToolEl.textContent = statusMessage
  setTimeout(switchToBrush, STATUS_DURATION);
}

/**
 * Switch to brush
 */
function switchToBrush() {
  isEraser = false;
  activeToolEl.textContent = 'Brush';
  brushIcon.style.color = 'black';
  eraser.style.color = 'white';
  currentColor = `#${brushColorBtn.value}`;
  currentSize = 10;
  brushSlider.value = currentSize;
  displayBrushSize();
}

/**
 * Create the basic canvas
 */
function createCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50; // take into account the toolbar on top
  context.fillStyle = bucketColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  body.appendChild(canvas);
  switchToBrush();
}

// Clear Canvas
clearCanvasBtn.addEventListener('click', () => {
  createCanvas();
  drawnArray = [];
  setStatusAndSwitchToBrush('Canvas Cleared')
});

// Draw what is stored in DrawnArray
function restoreCanvas() {
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = 'round';
    if (drawnArray[i].eraser) {
      context.strokeStyle = bucketColor;
    } else {
      context.strokeStyle = drawnArray[i].color;
    }
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

// Store Drawn Lines in DrawnArray
/**
 * Store the canvas drawn in an array
 * @param {number} x x coordinate
 * @param {number} y y coordinate
 * @param {number} size size of the brush
 * @param {string} color color of the brush
 * @param {boolean} erase if eraser is enabled
 */
function storeDrawn(x, y, size, color, erase) {
  drawnArray.push({
    x,
    y,
    size,
    color,
    erase,
  });
}

// Get Mouse Position
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

// Mouse Down
canvas.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);
  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
  context.lineWidth = currentSize;
  context.lineCap = 'round'; // butt // square
  context.strokeStyle = currentColor;
});

// Mouse Move
canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser,
    );
  } else {
    storeDrawn(undefined);
  }
});

// Mouse Up
canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});

// // Save to Local Storage
saveStorageBtn.addEventListener('click', () => {
  localStorage.setItem('savedCanvas', JSON.stringify(drawnArray));
  setStatusAndSwitchToBrush('Canvas Saved');
});

// Load from Local Storage
loadStorageBtn.addEventListener('click', () => {
  if (localStorage.getItem('savedCanvas')) {
    drawnArray = JSON.parse(localStorage.getItem('savedCanvas'));
    restoreCanvas();
    setStatusAndSwitchToBrush('Canvas Saved');
  } else {
    const prevTextContent = activeToolEl.textContent;
    activeToolEl.textContent = 'No Canvas Found';
    setTimeout(() => {
      activeToolEl.textContent = prevTextContent;
    }, 1000);
  }

});

// Clear Local Storage
clearStorageBtn.addEventListener('click', () => {
  if (localStorage.getItem('savedCanvas')) {
    localStorage.removeItem('savedCanvas');
    // Active Tool
    setStatusAndSwitchToBrush('Local Storage Cleared');
  } else {
    const prevTextContent = activeToolEl.textContent;
    activeToolEl.textContent = 'No Canvas to delete';
    setTimeout(() => {
      activeToolEl.textContent = prevTextContent;
    }, 1000);
  }
  
});

// Download Image
downloadBtn.addEventListener('click', () => {
  downloadBtn.href = canvas.toDataURL('image/jpeg', 1);
  downloadBtn.download = 'paint-example.jpeg';
  setStatusAndSwitchToBrush('Image File Saved');
});

// Event Listener
brushIcon.addEventListener('click', switchToBrush);

// On Load
createCanvas();
