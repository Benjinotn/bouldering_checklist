document.addEventListener('DOMContentLoaded', () => {
    const leftCheckboxesContainer = document.getElementById('left-checkboxes');
    const rightCheckboxesContainer = document.getElementById('right-checkboxes');
    const climbListContainer = document.getElementById('climb-list');
    const copyURLButton = document.getElementById('copy-url-button');
    const copyMessage = document.getElementById('copy-message');
    const climbs = [
        // ... your climb data ...
    ];
    const numCheckboxesLeft = 10;
    const numCheckboxesRight = 10;

    function createRelativeCheckboxElement(index, isLeft) {
        const div = document.createElement('div');
        div.classList.add('relative-checkbox-item');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${isLeft ? 'left' : 'right'}-climb-${index}`;
        checkbox.dataset.index = index; // You might need a different indexing scheme
        const label = document.createElement('label');
        label.setAttribute('for', `${isLeft ? 'left' : 'right'}-climb-${index}`);
        label.textContent = `Climb ${isLeft ? 'L' : 'R'} ${index + 1}`; // Placeholder label

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
        const leftCheckboxes = document.querySelectorAll('#left-checkboxes input[type="checkbox"]:checked');
        leftCheckboxes.forEach(checkbox => {
            tickedClimbs.push(parseInt(checkbox.dataset.index));
        });
        const rightCheckboxes = document.querySelectorAll('#right-checkboxes input[type="checkbox"]:checked');
        rightCheckboxes.forEach(checkbox => {
            tickedClimbs.push(parseInt(checkbox.dataset.index));
        });

        const params = new URLSearchParams();
        if (tickedClimbs.length > 0) {
            params.set('climbs', tickedClimbs.sort((a, b) => a - b).join(','));
        }
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL);
    }

    function copyCurrentURL() {
        // ... (same copy URL function) ...
    }

    if (climbListContainer) {
        climbListContainer.style.display = 'none';
    }

    // Create left checkboxes
    for (let i = 0; i < numCheckboxesLeft; i++) {
        const checkboxElement = createRelativeCheckboxElement(i, true);
        const checkbox = checkboxElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateURL);
        leftCheckboxesContainer.appendChild(checkboxElement);
    }

    // Create right checkboxes
    for (let i = 0; i < numCheckboxesRight; i++) {
        const checkboxElement = createRelativeCheckboxElement(i, false);
        const checkbox = checkboxElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateURL);
        rightCheckboxesContainer.appendChild(checkboxElement);
    }

    loadStateFromURL();
    if (copyURLButton) {
        copyURLButton.addEventListener('click', copyCurrentURL);
    }
});