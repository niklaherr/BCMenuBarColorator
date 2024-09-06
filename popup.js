document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const colorInput = document.getElementById('color');
    const addUrlColorButton = document.getElementById('addUrlColor');
    const urlList = document.getElementById('urlList');

    // Function to update the displayed list of URL-color pairs
    function updateUrlList(url_dict) {
        urlList.innerHTML = ''; // Clear the list
        for (const [url, color] of Object.entries(url_dict)) {
            const li = document.createElement('li');
            li.innerHTML = `
                ${url}: <span style="color:${color}; font-weight: bold;">${color}</span>
                <button class="delete-btn" data-url="${url}">x</button>
            `;
            urlList.appendChild(li);
        }

        // Add event listeners to the delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const urlToDelete = event.target.getAttribute('data-url');
                deleteUrlColor(urlToDelete);
            });
        });
    }

    // Load existing URLs and colors on page load
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        updateUrlList(url_dict);  // Display the saved URL-color pairs
    });

    // Add URL-color pair to storage when the button is clicked
    addUrlColorButton.addEventListener('click', () => {
        const url = urlInput.value;
        const color = colorInput.value;

        if (url && color) {
            chrome.storage.sync.get('url_dict', (data) => {
                const url_dict = data.url_dict || {};
                url_dict[url] = color;  // Add or update the URL-color pair

                // Save the updated dictionary back to storage
                chrome.storage.sync.set({ url_dict }, () => {
                    updateUrlList(url_dict);  // Update the display list
                    urlInput.value = '';      // Clear the input fields
                });
            });
        }
    });

    // Function to delete a URL-color pair
    function deleteUrlColor(urlToDelete) {
        chrome.storage.sync.get('url_dict', (data) => {
            const url_dict = data.url_dict || {};

            // Check if the URL exists, then delete it
            if (url_dict[urlToDelete]) {
                delete url_dict[urlToDelete];

                // Save the updated dictionary back to storage
                chrome.storage.sync.set({ url_dict }, () => {
                    updateUrlList(url_dict);  // Update the display list
                });
            }
        });
    }
});
