// Configuration for API endpoints
const config = {
    // API base URL - will be automatically determined based on environment
    get API_BASE_URL() {
        // Check if we're on localhost or 127.0.0.1
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('localhost');
        
        console.log('Current hostname:', window.location.hostname);
        console.log('Is localhost:', isLocalhost);
        
        // In development (localhost), use localhost backend
        if (isLocalhost) {
            return 'http://localhost:5000/api';
        }
        // In production, use the deployed backend URL
        return 'https://celebrity-styles-backend.onrender.com/api';
    },
    
    // Frontend base URL
    get FRONTEND_URL() {
        return window.location.origin;
    }
};

// Make config available globally
window.APP_CONFIG = config; 