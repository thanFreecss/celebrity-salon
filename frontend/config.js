// Configuration for API endpoints
const config = {
    // API base URL - will be automatically determined based on environment
    get API_BASE_URL() {
        // In production, use relative URLs (same domain)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return '/api';
        }
        // In development, use localhost
        return 'http://localhost:5000/api';
    },
    
    // Frontend base URL
    get FRONTEND_URL() {
        return window.location.origin;
    }
};

// Make config available globally
window.APP_CONFIG = config; 