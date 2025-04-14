document.addEventListener('DOMContentLoaded', () => {
    const backgroundImage = document.getElementById('backgroundImage');
    const pinContainer = document.getElementById('pin-container');
    const clearPinsButton = document.getElementById('clearPins');
    const undoPinButton = document.getElementById('undoPin');
    const copyLinkButton = document.getElementById('copyLink');
    const copyNotification = document.getElementById('copyNotification');
    const toggleRedCheckbox = document.getElementById('toggleRedPins');
    const togglePinkCheckbox = document.getElementById('togglePinkPins');
    const toggleBlackCheckbox = document.getElementById('toggleBlackPins');
    const colorOptions = document.querySelectorAll('.color-option'); // Get all color buttons

    let pins = [];
    let redPinsVisible = true;
    let pinkPinsVisible = true;
    let blackPinsVisible = true;
    let selectedColor = 'red'; // Initialize selected color

    // Function to parse pins from the URL
    function getPinsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const redPinsParam = urlParams.get('redPins');
        const pinkPinsParam = urlParams.get('pinkPins');
        const blackPinsParam = urlParams.get('blackPins');
        const loadedPins = [];

        if (redPinsParam) {
            redPinsParam.split(';').forEach(pinStr => {
                const coords = pinStr.split(',').map(Number);
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    loadedPins.push({ x: coords[0], y: coords[1], color: 'red' });
                }
            });
        }

        if (pinkPinsParam) {
            pinkPinsParam.split(';').forEach(pinStr => {
                const coords = pinStr.split(',').map(Number);
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    loadedPins.push({ x: coords[0], y: coords[1], color: 'pink' });
                }
            });
        }

        if (blackPinsParam) {
            blackPinsParam.split(';').forEach(pinStr => {
                const coords = pinStr.split(',').map(Number);
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    loadedPins.push({ x: coords[0], y: coords[1], color: 'black' });
                }
            });
        }

        pins = loadedPins;
        renderPins();
    }

    // Function to update the URL with the current pins
    function updateURL() {
        const redPinCoords = pins.filter(pin => pin.color === 'red').map(pin => `<span class="math-inline">\{pin\.x\},</span>{pin.y}`).join(';');
        const pinkPinCoords = pins.filter(pin => pin.color === 'pink').map(pin => `<span class="math-inline">\{pin\.x\},</span>{pin.y}`).join(';');
        const blackPinCoords = pins.filter(pin => pin.color === 'black').map(pin => `<span class="math-inline">\{pin\.x\},</span>{pin.y}`).join(';');

        const newURL = new URL(window.location.href);
        newURL.searchParams.set('redPins', redPinCoords);
        newURL.searchParams.set('pinkPins', pinkPinCoords);
        newURL.searchParams.set('blackPins', blackPinCoords);
        window.history.pushState({}, '', newURL);
    }

    // Function to clear all visible pins from the URL and the application
    function clearAllPins() {
        const visiblePinsBeforeClear = pins.filter(pin =>
            (pin.color === 'red' && redPinsVisible) ||
            (pin.color === 'pink' && pinkPinsVisible) ||
            (pin.color === 'black' && blackPinsVisible)
        );

        if (visiblePinsBeforeClear.length > 0 && confirm("Are you sure you want to delete all visible pins?")) {
            pins = pins.filter(pin =>
                !( (pin.color === 'red' && redPinsVisible) ||
                   (pin.color === 'pink' && pinkPinsVisible) ||
                   (pin.color === 'black' && blackPinsVisible)
                 )
            );
            updateURL();
            renderPins();
        } else if (visiblePinsBeforeClear.length === 0) {
            alert("No visible pins to clear.");
        }
    }

    // Function to undo the last placed pin
    function undoLastPin() {
        if (pins.length > 0) {
            pins.pop();
            updateURL();
            renderPins();
        } else {
            alert("No pins to undo.");
        }
    }

    // Function to copy the current link to the clipboard
    function copyCurrentLink() {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                copyNotification.classList.add('show');
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
    function createPinElement(pin) {
        const pinElement = document.createElement('div');
        pinElement.classList.add('pin', `pin-${pin.color}`);
        pinElement.style.left = `${pin.x}px`;
        pinElement.style.top = `${pin.y}px`;
        return pinElement;
    }

    // Function to render the pins on the image
    function renderPins() {
        pinContainer.innerHTML = '';
        pins.forEach(pin => {
            if ((pin.color === 'red' && redPinsVisible) ||
                (pin.color === 'pink' && pinkPinsVisible) ||
                (pin.color === 'black' && blackPinsVisible)) {
                const pinElement = createPinElement(pin);
                pinContainer.appendChild(pinElement);
            }
        });
    }

    // Event listener for clicking on the image to place a pin
    backgroundImage.addEventListener('click', (event) => {
        const rect = backgroundImage.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if the selected color is currently visible before adding a new pin
        let shouldAddPin = false;
        if (selectedColor === 'red' && redPinsVisible) {
            shouldAddPin = true;
        } else if (selectedColor === 'pink' && pinkPinsVisible) {
            shouldAddPin = true;
        } else if (selectedColor === 'black' && blackPinsVisible) {
            shouldAddPin = true;
        }

        if (shouldAddPin) {
            const newPin = { x: Math.round(x), y: Math.round(y), color: selectedColor };
            pins.push(newPin);
            renderPins();
            updateURL();
        }
    });

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

    // Event listener for the clear pins button
    clearPinsButton.addEventListener('click', clearAllPins);

    // Event listener for the undo button
    undoPinButton.addEventListener('click', undoLastPin);

    // Event listener for the copy link button
    copyLinkButton.addEventListener('click', copyCurrentLink);

    // Event listeners for color selection buttons
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(btn => btn.classList.remove('active')); // Remove active class from all
            option.classList.add('active'); // Add active class to clicked button
            selectedColor = option.dataset.color; // Update selectedColor
        });
    });

    // Load pins from the URL on page load
    getPinsFromURL();

    // Initialize visibility based on checkbox state
    redPinsVisible = toggleRedCheckbox.checked;
    pinkPinsVisible = togglePinkCheckbox.checked;
    blackPinsVisible = toggleBlackCheckbox.checked;
    renderPins();
});