document.addEventListener('DOMContentLoaded', () => {
    const copyURLButton = document.getElementById('copy-url-button');
    const copyMessage = document.getElementById('copy-message');

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
});