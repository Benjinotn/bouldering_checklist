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

const pinNames = ['blackPins', 'redPins', 'pinkPins', 'purplePins']

function migrateFromUrlToLocalStorage() {
    const urlParams= new URLSearchParams(window.location.search)
    const hasPinData = pinNames.some(pinName => urlParams.has(pinName));

    if(hasPinData) {
        let message = localStorage.getItem('currentRoutes')?.length ?
            'Routes are now stored on your device.  Would you like to overwrite your existing routes with the ones in the URL?' :
            'Routes are now stored on your device.  Routes stored in the URL will now be migrated to your device and removed from the URL.'
        if(confirm(message)) {
            document.getElementById('import-tool').style.display = 'flex'
            for(let activeTool of document.getElementsByClassName('active-tool')) {
                activeTool.style.display = 'none'
            }

            let urlPins = getPinsFromURL()
            const rect = backgroundImage.getBoundingClientRect();
            pins = urlPins = urlPins.map(pin => {
                pin.x =  pin.x / rect.width
                pin.y =  pin.y / rect.height
                return pin
            })

            const calibratePins = () => {
                let scale = parseFloat(document.getElementById('migration-scale').value)
                let xOffset = parseFloat(document.getElementById('migration-x-offset').value)
                let yOffset = parseFloat(document.getElementById('migration-y-offset').value)
                pins = urlPins.map(pin => {
                    return {
                        x: (pin.x * scale) + xOffset,
                        y: (pin.y * scale) + yOffset,
                        color: pin.color,
                        inProgress: pin.inProgress === undefined ? false : pin.inProgress // Initialize inProgress
                    }
                })
                renderPins()
            }

            document.getElementById('migration-scale').addEventListener('change', calibratePins)
            document.getElementById('migration-x-offset').addEventListener('change', calibratePins)
            document.getElementById('migration-y-offset').addEventListener('change', calibratePins)
            document.getElementById('migration-import').addEventListener('click', () => {
                saveCurrentRoutes()

                urlParams.delete('blackPins')
                urlParams.delete('redPins')
                urlParams.delete('pinkPins')
                urlParams.delete('purplePins')
                window.location.search = urlParams

                document.getElementById('import-tool').style.display = 'none'
                for(let activeTool of document.getElementsByClassName('active-tool')) {
                    activeTool.style.display = undefined
                }
            })

            renderPins()
        }
    }
}

// Function to parse pins from the URL
function getPinsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const loadedPins = [];

    const pincolors = ['black', 'red', 'pink', 'purple'];

    pincolors.forEach(color => {
        // check if there are any pin colors in the url
        const pinParamName = `${color}Pins`;
        const pinParam = urlParams.get(pinParamName)

        if (pinParam) {
            pinParam.split(';').forEach(pinStr => {
                const coords = pinStr.split(',').map(Number);
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    loadedPins.push({ x: coords[0], y: coords[1], color: color, inProgress: false }); // Initialize inProgress
                }
            });
        }
    })

    return loadedPins
}

// Function to update the URL with the current pins
function updateURL() {
    const redPinCoords = pins.filter(pin => pin.color === 'red').map(pin => `${pin.x},${pin.y}`).join(';');
    const pinkPinCoords = pins.filter(pin => pin.color === 'pink').map(pin => `${pin.x},${pin.y}`).join(';');
    const blackPinCoords = pins.filter(pin => pin.color === 'black').map(pin => `${pin.x},${pin.y}`).join(';');
    const purplePinCoords = pins.filter(pin => pin.color === 'purple').map(pin => `${pin.x},${pin.y}`).join(';');

    const newURL = new URL(window.location.href);
    newURL.searchParams.set('redPins', redPinCoords);
    newURL.searchParams.set('pinkPins', pinkPinCoords);
    newURL.searchParams.set('blackPins', blackPinCoords);
    newURL.searchParams.set('purplePins', purplePinCoords);
    window.history.pushState({}, '', newURL);
}

function saveCurrentRoutes() {
    localStorage.setItem('currentRoutes', JSON.stringify(pins))
}

function load() {
    const storedRoutes = localStorage.getItem('currentRoutes');
    if (storedRoutes) {
        pins = JSON.parse(storedRoutes).map(pin => {
            // Check if the 'inProgress' property exists
            if (pin.inProgress === undefined) {
                pin.inProgress = false; // Set a default value
            }
            return pin;
        });
    } else {
        pins = []; // Initialize as an empty array if no data is found
    }
    renderPins();
}

function archiveSet(setColor) {
    if(!pins.some(route => route.color === setColor)) {
        alert(`No ${setColor} routes to archive`)
        return
    }
    if(!confirm(`Are you sure you want to archive all ${setColor} routes?`)) {
        return
    }
    routeSets = Object.groupBy(pins, ({color}) => color === setColor ? 'archive' : 'current')

    // Save archived routes
    let archivedRoutes = JSON.parse(localStorage.getItem('archivedRoutes')) || {}
    if(!archivedRoutes[setColor]) {
        archivedRoutes[setColor] = []
    }
    archivedRoutes[setColor].push(routeSets.archive)
    localStorage.setItem('archivedRoutes', JSON.stringify(archivedRoutes))

    // Update current pins (after archiving just in case something goes wrong)
    pins = routeSets.current || []
    saveCurrentRoutes()

    renderPins()
}

function undoLastPin() {
    if (pins.length > 0) {
        pins.pop(); // Remove the last element from the pins array
        saveCurrentRoutes();
        renderPins();
    } else {
        alert("No pins to undo.");
    }
}

// Function to copy the current link to the clipboard
function copyCurrentLink() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => {
            // Show the notification
            copyNotification.classList.add('show');
            // Hide the notification after a short delay
            setTimeout(() => {
                copyNotification.classList.remove('show');
            }, 1500);
        })
        .catch(err => {
            console.error('Failed to copy link: ', err);
            alert('Failed to copy link to clipboard. Please try manually.');
        });
}

// Function to create a pin element
function createPinElement(pin, index) {
    const pinElement = document.createElement('div');
    pinElement.classList.add('pin', `pin-${pin.color}`);
    pinElement.style.left = `${backgroundImage.getBoundingClientRect().width * pin.x}px`;
    pinElement.style.top = `${backgroundImage.getBoundingClientRect().height * pin.y}px`;
    pinElement.dataset.pinIndex = index; // Store the index of the pin in the `pins` array

    // Apply transparency and outline based on the pin's inProgress state
    if (pin.inProgress) {
        pinElement.classList.add('in-progress');
    } else {
        pinElement.classList.remove('in-progress');
    }

    pinElement.addEventListener('click', togglePinInProgress);

    return pinElement;
}

function togglePinInProgress(event) {
    const pinIndex = parseInt(event.target.dataset.pinIndex);
    if (!isNaN(pinIndex) && pinIndex < pins.length) {
        pins[pinIndex].inProgress = !pins[pinIndex].inProgress;
        saveCurrentRoutes();
        renderPins();
    }
}

// Function to render the pins on the image
function renderPins() {
    pinContainer.innerHTML = ''; // Clear existing pins
    pins.forEach((pin, index) => {
        if ((pin.color === 'red' && redPinsVisible) ||
            (pin.color === 'pink' && pinkPinsVisible) ||
            (pin.color === 'purple' && purplePinsVisible) ||
            (pin.color === 'black' && blackPinsVisible)) {
            const pinElement = createPinElement(pin, index);
            pinContainer.appendChild(pinElement);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Event listener for clicking on the image to place a pin
    backgroundImage.addEventListener('click', (event) => {
        const rect = backgroundImage.getBoundingClientRect();
        // Store as ratio of image size because screen size can change with rotation / between devices
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        // Determine the selected pin color
        let selectedColor = 'red'; // Default to red if no selection
        if (pinkPinRadio.checked) {
            selectedColor = 'pink';
        } else if (blackPinRadio.checked) {
            selectedColor = 'black';
        } else if (purplePinRadio.checked) {
            selectedColor = 'purple';
        }

        // Check if the selected color is currently visible before adding a new pin
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
            const newPin = { x: x, y: y, color: selectedColor, inProgress: false }; // Initialize new pin as not in progress
            pins.push(newPin);
            renderPins();
            saveCurrentRoutes();
        }
    });

    window.addEventListener('resize', renderPins)

    // Event listeners for the visibility toggle switches
    toggleRedCheckbox.addEventListener('change', () => {
        redPinsVisible = toggleRedCheckbox.checked;
        renderPins();
    });

    togglePinkCheckbox.addEventListener('change', () => {
        pinkPinsVisible = togglePinkCheckbox.checked;
        renderPins();
    });

    toggleBlackCheckbox.addEventListener('change', () => {
        blackPinsVisible = toggleBlackCheckbox.checked;
        renderPins();
    });

    togglePurpleCheckbox.addEventListener('change', () => {
        purplePinsVisible = togglePurpleCheckbox.checked;
        renderPins();
    });

    archiveBlackSetBtn.addEventListener('click', () => archiveSet('black'));
    archiveRedSetBtn.addEventListener('click', () => archiveSet('red'));
    archivePinkSetBtn.addEventListener('click', () => archiveSet('pink'));
    archivePurpleSetBtn.addEventListener('click', () => archiveSet('purple'));

    // Event listener for the undo button
    undoPinButton.addEventListener('click', undoLastPin);

    // Event listener for the copy link button
    copyLinkButton.addEventListener('click', copyCurrentLink);

    load();

    migrateFromUrlToLocalStorage()

    // Initialize visibility based on checkbox state
    redPinsVisible = toggleRedCheckbox.checked;
    pinkPinsVisible = togglePinkCheckbox.checked;
    blackPinsVisible = toggleBlackCheckbox.checked;
    purplePinsVisible = togglePurpleCheckbox.checked;
    renderPins();
});