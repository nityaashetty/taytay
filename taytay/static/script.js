/**
 * TayTay Search - Spotify Link Handler
 * Opens Spotify URIs/URLs in the appropriate application or web player
 */

/**
 * Opens Spotify links in the most appropriate way
 * @param {string} spotifyUrl - Spotify URI or URL
 */
function openSpotify(spotifyUrl) {
    if (!spotifyUrl) {
        alert('Sorry, no Spotify link available for this song.');
        return;
    }

    // Convert Spotify URI to URL if needed
    let finalUrl = convertSpotifyUri(spotifyUrl);
    
    // Try to open in Spotify app first, fallback to web player
    if (isMobileDevice()) {
        openSpotifyMobile(finalUrl);
    } else {
        openSpotifyDesktop(finalUrl);
    }
}

/**
 * Convert Spotify URI to web URL if necessary
 * @param {string} uri - Spotify URI or URL
 * @returns {string} Spotify web URL
 */
function convertSpotifyUri(uri) {
    // If it's already a web URL, return as is
    if (uri.startsWith('https://open.spotify.com/')) {
        return uri;
    }
    
    // If it's a Spotify URI (spotify:track:ID), convert to web URL
    if (uri.startsWith('spotify:')) {
        const parts = uri.split(':');
        if (parts.length >= 3) {
            const type = parts[1]; // usually 'track'
            const id = parts[2];
            return `https://open.spotify.com/${type}/${id}`;
        }
    }
    
    // If it doesn't match expected patterns, return as is and hope for the best
    return uri;
}

/**
 * Check if the device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Open Spotify on mobile devices
 * @param {string} url - Spotify web URL
 */
function openSpotifyMobile(url) {
    // Convert web URL back to URI for better app integration on mobile
    const uriVersion = convertWebUrlToUri(url);
    
    // Try app first, fallback to web
    const appLink = document.createElement('a');
    appLink.href = uriVersion;
    appLink.style.display = 'none';
    document.body.appendChild(appLink);
    appLink.click();
    document.body.removeChild(appLink);
    
    // Fallback to web version after a short delay
    setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, 1000);
}

/**
 * Open Spotify on desktop
 * @param {string} url - Spotify web URL
 */
function openSpotifyDesktop(url) {
    // Try to open in Spotify desktop app first
    const spotifyUri = convertWebUrlToUri(url);
    
    // Create a temporary iframe to try to trigger the Spotify app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = spotifyUri;
    document.body.appendChild(iframe);
    
    // Remove iframe after a short delay
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
    
    // Also open web version as backup
    setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, 500);
}

/**
 * Convert Spotify web URL to URI
 * @param {string} url - Spotify web URL
 * @returns {string} Spotify URI
 */
function convertWebUrlToUri(url) {
    // Extract track ID from web URL
    const match = url.match(/https:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
    if (match) {
        const type = match[1];
        const id = match[2];
        return `spotify:${type}:${id}`;
    }
    return url; // Return original if can't convert
}

/**
 * Add visual feedback when button is clicked
 * @param {HTMLElement} button - The clicked button
 */
function addClickFeedback(button) {
    if (!button) return;
    
    button.style.transform = 'scale(0.95)';
    button.style.opacity = '0.8';
    
    setTimeout(() => {
        button.style.transform = '';
        button.style.opacity = '';
    }, 150);
}

/**
 * Enhanced openSpotify function with visual feedback
 * @param {string} spotifyUrl - Spotify URI or URL
 */
function openSpotifyWithFeedback(spotifyUrl) {
    // Find the clicked button for feedback
    const clickedButton = event ? event.target.closest('.play-btn') : null;
    
    if (clickedButton) {
        addClickFeedback(clickedButton);
    }
    
    openSpotify(spotifyUrl);
}

/**
 * Initialize the page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('TayTay Search Spotify integration initialized');
    
    // Add click handlers to all play buttons for enhanced feedback
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(button => {
        button.addEventListener('mousedown', function() {
            addClickFeedback(this);
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // If user presses 'S' key, focus on search input (if on search page)
        if (e.key === 's' || e.key === 'S') {
            const searchInput = document.querySelector('input[name="user_input"]');
            if (searchInput && e.target !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
    });
});

/**
 * Utility function to check if Spotify is likely installed
 * @returns {boolean} Best guess if Spotify app is available
 */
function isSpotifyLikelyInstalled() {
    // This is a best-guess approach, not 100% reliable
    if (isMobileDevice()) {
        // On mobile, we can't reliably detect app installation
        return true; // Assume it might be installed
    } else {
        // On desktop, we also can't reliably detect without permissions
        return true; // Always try, fallback handles the rest
    }
}

/**
 * Show a helpful message about Spotify integration
 */
function showSpotifyInfo() {
    const message = `
🎵 Spotify Integration:
• Click "Play on Spotify" to open songs in Spotify
• Works with Spotify app or web player
• Requires Spotify account (free or premium)
    `;
    alert(message);
}

// Make openSpotify globally available with the enhanced version
window.openSpotify = openSpotifyWithFeedback;