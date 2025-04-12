document.addEventListener('DOMContentLoaded', () => {
    const copyURLButton = document.getElementById('copy-url-button');
    const copyMessage = document.getElementById('copy-message');
    const checkboxes = document.querySelectorAll('.tickbox-wrapper input[type="checkbox"]');

    function copyCurrentURL() {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                copyMessage.style.display = 'block';
                setTimeout(() => {
                    copyMessage.style.display = 'none';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy URL: ', err);
                alert('Failed to copy URL. Please copy it manually.');
            });
    }

    copyURLButton.addEventListener('click', copyCurrentURL);

    // Initially hide the copy message
    copyMessage.style.display = 'none';

    function updateURL() {
        const tickedClimbs = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                tickedClimbs.push(checkbox.id); // Or any unique identifier
            }
        });

        const params = new URLSearchParams();
        if (tickedClimbs.length > 0) {
            params.set('climbs', tickedClimbs.join(','));
        }
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL);
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateURL);
    });

    function loadStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const tickedClimbs = params.get('climbs');

        if (tickedClimbs) {
            const tickedArray = tickedClimbs.split(',');
            tickedArray.forEach(climbId => {
                const checkbox = document.getElementById(climbId);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }

    loadStateFromURL();
});