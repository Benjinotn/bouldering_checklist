document.addEventListener('DOMContentLoaded', () => {
    const leftCheckboxesContainer = document.getElementById('left-checkboxes');
    const rightCheckboxesContainer = document.getElementById('right-checkboxes');
    const climbListContainer = document.getElementById('climb-list');
    const copyURLButton = document.getElementById('copy-url-button');
    const copyMessage = document.getElementById('copy-message');
    const climbs = [
        { name: "V3 - The Red Slab", color: "red", position: "left" },
        { name: "V4 - Overhanging Arete", color: "blue", position: "right" },
        { name: "V2 - Corner Crack", color: "green", position: "left" },
        { name: "V5 - Dynamic Move", color: "yellow", position: "right" },
        { name: "V1 - Slabby Start", color: "red", position: "left" },
        // Add more climbs with color and position
    ];

    function createColorCheckboxElement(climb, index) {
        const div = document.createElement('div');
        div.classList.add('color-checkbox-item');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `climb-${index}`;
        checkbox.dataset.index = index; // Store original index for URL updates
        const label = document.createElement('label');
        label.setAttribute('for', `climb-${index}`);
        label.textContent = climb.name;
        label.style.color = climb.color; // Set text color based on climb color

        div.appendChild(checkbox);
        div.appendChild(label);
        return div;
    }

    function loadStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const tickedIndices = params.get('climbs');

        if (tickedIndices) {
            const indicesArray = tickedIndices.split(',').map(Number).filter(Number.isInteger);
            indicesArray.forEach(index => {
                const checkbox = document.querySelector(`#left-checkboxes input[data-index="${index}"]`) ||
                                 document.querySelector(`#right-checkboxes input[data-index="${index}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }

    function updateURL() {
        const tickedClimbs = [];
        const checkboxesLeft = document.querySelectorAll('#left-checkboxes input[type="checkbox"]:checked');
        checkboxesLeft.forEach(checkbox => {
            tickedClimbs.push(parseInt(checkbox.dataset.index));
        });
        const checkboxesRight = document.querySelectorAll('#right-checkboxes input[type="checkbox"]:checked');
        checkboxesRight.forEach(checkbox => {
            tickedClimbs.push(parseInt(checkbox.dataset.index));
        });

        const params = new URLSearchParams();
        if (tickedClimbs.length > 0) {
            params.set('climbs', tickedClimbs.sort((a, b) => a - b).join(',')); // Sort for consistency
        }
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL);
    }

    function copyCurrentURL() {
        // ... (same copy URL function as before) ...
    }

    // Clear the original climb list (we're using color-coded checkboxes now)
    if (climbListContainer) {
        climbListContainer.style.display = 'none';
    }

    // Add color-coded checkboxes to the left and right containers
    climbs.forEach((climb, index) => {
        const checkboxElement = createColorCheckboxElement(climb, index);
        const checkbox = checkboxElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateURL);
        if (climb.position === "left") {
            leftCheckboxesContainer.appendChild(checkboxElement);
        } else if (climb.position === "right") {
            rightCheckboxesContainer.appendChild(checkboxElement);
        }
    });

    loadStateFromURL();
    if (copyURLButton) {
        copyURLButton.addEventListener('click', copyCurrentURL);
    }
});