// Configuration for API endpoints
console.log('🔧 Config.js is loading...');
console.log('🔧 Current hostname:', window.location.hostname);

const config = {
    // API base URL - will be automatically determined based on environment
    get API_BASE_URL() {
        // Check if we're on localhost or 127.0.0.1
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('localhost');
        
        console.log('🔧 Config.js - Current hostname:', window.location.hostname);
        console.log('🔧 Config.js - Is localhost:', isLocalhost);
        
        // In development (localhost), use localhost backend
        if (isLocalhost) {
            console.log('🔧 Config.js - Using localhost backend');
            return 'http://localhost:5000/api';
        }
        // In production, use the deployed backend URL
        console.log('🔧 Config.js - Using production backend');
        // Use the backend-specific domain since the main domain doesn't have the API
        const backendUrl = 'https://celebrity-styles-backend.onrender.com/api';
        console.log('🔧 Config.js - Backend URL:', backendUrl);
        return backendUrl;
    },
    
    // Frontend base URL
    get FRONTEND_URL() {
        return window.location.origin;
    }
};

// Make config available globally
window.APP_CONFIG = config;
console.log('🔧 Config.js - APP_CONFIG set:', window.APP_CONFIG); 