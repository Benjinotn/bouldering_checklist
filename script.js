const backgroundImage = document.getElementById('backgroundImage');
 const pinContainer = document.getElementById('pin-container');
 const archiveBlackSetBtn = document.getElementById('archive-black-set');
 const archiveRedSetBtn = document.getElementById('archive-red-set');
 const archivePinkSetBtn = document.getElementById('archive-pink-set');
 const archivePurpleSetBtn = document.getElementById('archive-purple-set');
 const undoPinButton = document.getElementById('undoPin');
 const copyLinkButton = document.getElementById('copyLink');
 const copyNotification = document.getElementById('copyNotification');
 const redPinRadio = document.getElementById('redPinRadio');
 const pinkPinRadio = document.getElementById('pinkPinRadio');
 const blackPinRadio = document.getElementById('blackPinRadio');
 const purplePinRadio = document.getElementById('purplePinRadio');
 const toggleRedCheckbox = document.getElementById('toggleRedPins');
 const togglePinkCheckbox = document.getElementById('togglePinkPins');
 const toggleBlackCheckbox = document.getElementById('toggleBlackPins');
 const togglePurpleCheckbox = document.getElementById('togglePurplePins');
 
 let pins = [];
 let redPinsVisible = true;
 let pinkPinsVisible = true;
 let blackPinsVisible = true;
 let purplePinsVisible = true;
 
 function migrateFromUrlToLocalStorage() {
  // ... (Existing migrateFromUrlToLocalStorage function - No changes needed for this functionality)
 }
 
 // Function to parse pins from the URL
 function getPinsFromURL() {
  // ... (Existing getPinsFromURL function - Needs slight modification to handle 'state')
  const loadedPins = [];
 
  // ... (Existing code for parsing pins)
  if (blackPinsParam) {
   blackPinsParam.split(';').forEach(pinStr => {
    const parts = pinStr.split(':');
    const coords = parts[0].split(',').map(Number);
    const state = parts[1] || 'solid'; // Default to solid if state is not present
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
     loadedPins.push({ x: coords[0], y: coords[1], color: 'black', state: state });
    }
   });
  }
 
  if (redPinsParam) {
   redPinsParam.split(';').forEach(pinStr => {
    const parts = pinStr.split(':');
    const coords = parts[0].split(',').map(Number);
    const state = parts[1] || 'solid';
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
     loadedPins.push({ x: coords[0], y: coords[1], color: 'red', state: state });
    }
   });
  }
 
  if (pinkPinsParam) {
   pinkPinsParam.split(';').forEach(pinStr => {
    const parts = pinStr.split(':');
    const coords = parts[0].split(',').map(Number);
    const state = parts[1] || 'solid';
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
     loadedPins.push({ x: coords[0], y: coords[1], color: 'pink', state: state });
    }
   });
  }
 
  if (purplePinsParam) {
   purplePinsParam.split(';').forEach(pinStr => {
    const parts = pinStr.split(':');
    const coords = parts[0].split(',').map(Number);
    const state = parts[1] || 'solid';
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
     loadedPins.push({ x: coords[0], y: coords[1], color: 'purple', state: state });
    }
   });
  }
  return loadedPins;
 }
 
 // Function to update the URL with the current pins
 function updateURL() {
  const redPinCoords = pins.filter(pin => pin.color === 'red').map(pin => `<span class="math-inline">\{pin\.x\},</span>{pin.y}:${pin.state}`).join(';');
  const pinkPinCoords = pins.filter(pin => pin.color === 'pink').map(pin => `<span class="math-inline">\{pin\.x\},</span>{pin.y}:${pin.state}`).join(';');
  const blackPinCoords = pins.filter(pin => pin.color === 'black').map(pin => `<span class="math-inline">\{pin\.x\},</span>{pin.y}:${pin.state}`).join(';');
  const purplePinCoords = pins.filter(pin => pin.color === 'purple').map(pin => `<span class="math-inline">\{pin\.x\},</span>{pin.y}:${pin.state}`).join(';');
 
  const newURL = new URL(window.location.href);
  newURL.searchParams.set('redPins', redPinCoords);
  newURL.searchParams.set('pinkPins', pinkPinCoords);
  newURL.searchParams.set('blackPins', blackPinCoords);
  newURL.searchParams.set('purplePins', purplePinCoords);
  window.history.pushState({}, '', newURL);
 }
 
 function saveCurrentRoutes() {
  localStorage.setItem('currentRoutes', JSON.stringify(pins));
 }
 
 function load() {
  pins = JSON.parse(localStorage.getItem('currentRoutes')) || [];
  renderPins();
 }
 
 function archiveSet(setColor) {
  // ... (Existing archiveSet function - No changes needed)
 }
 
 function undoLastPin() {
  // ... (Existing undoLastPin function - No changes needed)
 }
 
 function copyCurrentLink() {
  // ... (Existing copyCurrentLink function - No changes needed)
 }
 
 // Function to create a pin element
 function createPinElement(pin) {
  const pinElement = document.createElement('div');
  pinElement.classList.add('pin', `pin-${pin.color}`);
  if (pin.state === 'hollow') {
   pinElement.classList.add('pin-hollow');
  }
  const rect = backgroundImage.getBoundingClientRect();
  pinElement.style.left = `${rect.width * pin.x}px`;
  pinElement.style.top = `${rect.height * pin.y}px`;
 
  // Add click event listener to toggle pin state
  pinElement.addEventListener('click', () => {
   pin.state = pin.state === 'solid' ? 'hollow' : 'solid';
   renderPins();
   saveCurrentRoutes();
   updateURL(); // Update the URL to reflect the pin state
  });
 
  return pinElement;
 }
 
 // Function to render the pins on the image
 function renderPins() {
  pinContainer.innerHTML = ''; // Clear existing pins
  pins.forEach(pin => {
   if ((pin.color === 'red' && redPinsVisible) ||
    (pin.color === 'pink' && pinkPinsVisible) ||
    (pin.color === 'purple' && purplePinsVisible) ||
    (pin.color === 'black' && blackPinsVisible)) {
    const pinElement = createPinElement(pin);
    pinContainer.appendChild(pinElement);
   }
  });
 }
 
 document.addEventListener('DOMContentLoaded', () => {
  // Event listener for clicking on the image to place a pin
  backgroundImage.addEventListener('click', (event) => {
   const rect = backgroundImage.getBoundingClientRect();
   const x = (event.clientX - rect.left) / rect.width;
   const y = (event.clientY - rect.top) / rect.height;
 
   let selectedColor = 'red';
   if (pinkPinRadio.checked) {
    selectedColor = 'pink';
   } else if (blackPinRadio.checked) {
    selectedColor = 'black';
   } else if (purplePinRadio.checked) {
    selectedColor = 'purple';
   }
 
   let shouldAddPin = false;
   if (selectedColor === 'red' && redPinsVisible) {
    shouldAddPin = true;
   } else if (selectedColor === 'pink' && pinkPinsVisible) {
    shouldAddPin = true;
   } else if (selectedColor === 'black' && blackPinsVisible) {
    shouldAddPin = true;
   } else if (selectedColor === 'purple' && purplePinsVisible) {
    shouldAddPin = true;
   }
 
   if (shouldAddPin) {
    const newPin = { x: x, y: y, color: selectedColor, state: 'solid' }; // Initial state is solid
    pins.push(newPin);
    renderPins();
    saveCurrentRoutes();
    updateURL(); // Update the URL to include the new pin
   }
  });
 
  window.addEventListener('resize', renderPins);
 
  // ... (Existing event listeners for toggle switches and buttons)
 
  load();
  migrateFromUrlToLocalStorage();
 
  // Initialize visibility based on checkbox state
  redPinsVisible = toggleRedCheckbox.checked;
  pinkPinsVisible = togglePinkCheckbox.checked;
  blackPinsVisible = toggleBlackCheckbox.checked;
  purplePinsVisible = togglePurpleCheckbox.checked;
  renderPins();
 });