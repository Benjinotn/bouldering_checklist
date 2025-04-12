document.addEventListener('DOMContentLoaded', () => {
    const climbListContainer = document.getElementById('climb-list');
    const climbs = [
        "V3 - The Red Slab",
        "V4 - Overhanging Arete",
        "V2 - Corner Crack",
        "V5 - Dynamic Move",
        // Add more climbs here
    ];

    // Function to generate the HTML for a single climb
    function createClimbElement(climb, index) {
        const div = document.createElement('div');
        div.classList.add('climb-item');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `climb-${index}`;
        const label = document.createElement('label');
        label.setAttribute('for', `climb-${index}`);
        label.textContent = climb;

        div.appendChild(checkbox);
        div.appendChild(label);
        return div;
    }

    // Function to load the state from the URL
    function loadStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const tickedIndices = params.get('climbs');

        if (tickedIndices) {
            const indicesArray = tickedIndices.split(',').map(Number).filter(Number.isInteger);
            indicesArray.forEach(index => {
                const checkbox = document.getElementById(`climb-${index}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }

    // Function to update the URL when a checkbox changes
    function updateURL() {
        const tickedClimbs = [];
        const checkboxes = document.querySelectorAll('#climb-list input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked) {
                tickedClimbs.push(index);
            }
        });

        const params = new URLSearchParams();
        if (tickedClimbs.length > 0) {
            params.set('climbs', tickedClimbs.join(','));
        }
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL); // Update URL without full page reload
    }

    // Add climbs to the list and attach event listeners
    climbs.forEach((climb, index) => {
        const climbElement = createClimbElement(climb, index);
        const checkbox = climbElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateURL);
        climbListContainer.appendChild(climbElement);
    });

    // Load initial state from the URL
    loadStateFromURL();
});