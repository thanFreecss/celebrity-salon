// API Configuration
const API_BASE_URL = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:5000/api';

// Global variables
let employees = [];
let users = [];
let reservations = [];

// API Functions
async function fetchEmployees() {
    try {
        console.log('Fetching employees from:', `${API_BASE_URL}/employees`);
        const response = await fetch(`${API_BASE_URL}/employees`);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            employees = data.data;
            populateEmployeeTable(employees);
            updatePaginationInfo(employees.length, 'employee');
            showNotification(`Successfully loaded ${employees.length} employees`, 'success');
        } else {
            console.error('Failed to fetch employees:', data.message);
            showNotification('Failed to fetch employees: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error fetching employees:', error);
        showNotification('Error connecting to server: ' + error.message, 'error');
    }
}

async function fetchUsers() {
    try {
        console.log('Fetching users from:', `${API_BASE_URL}/users`);
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            users = data.data;
            populateUserTable(users);
            updatePaginationInfo(users.length, 'user');
            showNotification(`Successfully loaded ${users.length} users`, 'success');
        } else {
            console.error('Failed to fetch users:', data.message);
            showNotification('Failed to fetch users: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        showNotification('Error connecting to server: ' + error.message, 'error');
    }
}

async function fetchReservations() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            reservations = data.data;
            populateReservationTable(reservations);
            updatePaginationInfo(reservations.length, 'reservation');
            showNotification(`Successfully loaded ${reservations.length} reservations`, 'success');
        } else {
            console.error('Failed to fetch reservations:', data.message);
            showNotification('Failed to fetch reservations: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error fetching reservations:', error);
        showNotification('Error connecting to server: ' + error.message, 'error');
    }
}

// Employee CRUD Operations
async function createEmployee(employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(employeeData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Employee created successfully', 'success');
            await fetchEmployees(); // Refresh the table
            return true;
        } else {
            showNotification(data.message || 'Failed to create employee', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error creating employee:', error);
        showNotification('Error creating employee', 'error');
        return false;
    }
}

async function updateEmployee(id, employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(employeeData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Employee updated successfully', 'success');
            await fetchEmployees(); // Refresh the table
            return true;
        } else {
            showNotification(data.message || 'Failed to update employee', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        showNotification('Error updating employee', 'error');
        return false;
    }
}

async function deleteEmployee(id) {
    const employee = employees.find(e => e._id === id);
    if (!employee) {
        showNotification('Employee not found', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        `Delete Employee`,
        `Are you sure you want to delete employee "${employee.name}"?`,
        'This action cannot be undone and will permanently remove the employee from the system.'
    );

    if (confirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(`Employee "${employee.name}" deleted successfully`, 'success');
                await fetchEmployees(); // Refresh the table
                return true;
            } else {
                showNotification(data.message || 'Failed to delete employee', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showNotification('Error deleting employee: ' + error.message, 'error');
            return false;
        }
    }
}

// Table Population Functions
function populateEmployeeTable(data = employees) {
    const tbody = document.getElementById('employee-table-body');
    tbody.innerHTML = '';

    data.forEach(employee => {
        const row = document.createElement('tr');
        
        // Map specialties to readable format
        const specialtiesText = employee.specialties && employee.specialties.length > 0 
            ? employee.specialties.map(specialty => mapSpecialtyToReadable(specialty)).join(', ')
            : 'No services assigned';
        
        row.innerHTML = `
            <td>${employee.employeeId || 'N/A'}</td>
            <td>${employee.name || 'N/A'}</td>
            <td>${employee.gender || 'N/A'}</td>
            <td>${employee.phone || 'N/A'}</td>
            <td>${employee.address || 'N/A'}</td>
            <td>${specialtiesText}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editEmployee('${employee._id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteEmployee('${employee._id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateUserTable(data = users) {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';

    data.forEach((user, index) => {
        const statusClass = user.isActive ? 'status-active' : 'status-inactive';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user._id ? user._id.slice(-6).toUpperCase() : 'N/A'}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>
                <span class="role-badge ${(user.role || 'user').toLowerCase()}">${user.role || 'User'}</span>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${user.isActive ? 'Active' : 'Inactive'}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editUser('${user._id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteUser('${user._id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateReservationTable(data = reservations) {
    const tbody = document.getElementById('reservation-table-body');
    tbody.innerHTML = '';

    data.forEach(reservation => {
        const statusClass = reservation.status === 'confirmed' ? 'status-active' : 
                           reservation.status === 'completed' ? 'status-active' : 
                           reservation.status === 'cancelled' ? 'status-inactive' : 'status-pending';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation._id ? reservation._id.slice(-8).toUpperCase() : 'N/A'}</td>
            <td>${reservation.fullName || 'N/A'}</td>
            <td>${reservation.mobileNumber || 'N/A'}</td>
            <td>${reservation.email || 'N/A'}</td>
            <td>${mapSpecialtyToReadable(reservation.service) || 'N/A'}</td>
            <td>${reservation.selectedEmployee || 'N/A'}</td>
            <td><span class="price-badge">₱${reservation.totalAmount || 'N/A'}</span></td>
            <td>${getServiceDuration(reservation.service) || 'N/A'}</td>
            <td>${formatDate(reservation.appointmentDate) || 'N/A'}</td>
            <td><span class="time-badge">${reservation.selectedTime || 'N/A'}</span></td>
            <td>
                <span class="status-badge ${statusClass}">${reservation.status || 'Pending'}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editReservation('${reservation._id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteReservation('${reservation._id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Utility Functions
function mapSpecialtyToReadable(specialty) {
    const specialtyMap = {
        'manicure': 'Manicure',
        'pedicure': 'Pedicure',
        'manicure-gel': 'Manicure Gel',
        'manipedi-gel': 'Manicure Pedicure Gel',
        'traditional-hamu': 'Hair and Makeup',
        'glam-hamu': 'Glam Hair and Makeup',
        'airbrush-hamu': 'Airbrush Hair and Makeup',
        'classic-lashes': 'Classic Lashes',
        'cat-eye-lashes': 'Cat Eye Lashes',
        'wispy-lashes': 'Wispy Lashes',
        'volume-lashes': 'Volume Lashes',
        'lash-lift': 'Lash Lift',
        'lash-removal': 'Lash Removal',
        'brow-shave': 'Brow Shave',
        'brow-tint': 'Brow Tint',
        'footspa': 'Foot Spa',
        'foot-massage': 'Foot Massage',
        'hand-massage': 'Hand Massage',
        'soft-gel-extension': 'Soft Gel Extension',
        'pedi-gel-footspa': 'Pedicure Gel Foot Spa',
        'pedi-gel': 'Pedicure Gel'
    };
    
    return specialtyMap[specialty] || specialty;
}

function getServiceDuration(service) {
    const durationMap = {
        'manicure': '30 min',
        'pedicure': '45 min',
        'footspa': '60 min',
        'manicure-gel': '45 min',
        'manipedi-gel': '90 min',
        'pedi-gel-footspa': '90 min',
        'pedi-gel': '45 min',
        'soft-gel-extension': '60 min',
        'foot-massage': '30 min',
        'hand-massage': '30 min',
        'traditional-hamu': '120 min',
        'glam-hamu': '150 min',
        'airbrush-hamu': '180 min',
        'classic-lashes': '90 min',
        'cat-eye-lashes': '90 min',
        'wispy-lashes': '90 min',
        'volume-lashes': '120 min',
        'lash-lift': '60 min',
        'lash-removal': '30 min',
        'brow-shave': '15 min',
        'brow-tint': '45 min'
    };
    
    return durationMap[service] || '60 min';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function updatePaginationInfo(count, type) {
    const paginationInfo = document.getElementById(`${type}-pagination-info`);
    if (paginationInfo) {
        paginationInfo.textContent = `1–${count} of ${count}`;
    }
}

function getAuthToken() {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
}

// Check if user is authenticated as admin
function checkAdminAuth() {
    const token = getAuthToken();
    const adminData = localStorage.getItem('adminData');
    
    if (!token || !adminData) {
        // Redirect to admin login
        window.location.href = 'admin-login.html';
        return false;
    }
    
    try {
        const userData = JSON.parse(adminData);
        if (userData.role !== 'admin') {
            // Not an admin, redirect to admin login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            window.location.href = 'admin-login.html';
            return false;
        }
        return true;
    } catch (error) {
        // Invalid data, redirect to admin login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = 'admin-login.html';
        return false;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#4caf50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
        default:
            notification.style.backgroundColor = '#2196f3';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Custom confirmation dialog function
function showConfirmDialog(title, message, description = '') {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease-out;
        `;

        // Create modal HTML
        modal.innerHTML = `
            <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px 0; color: #d32f2f; font-size: 1.25rem;">${title}</h3>
                <p style="margin: 0; color: #333; font-size: 1rem;">${message}</p>
                ${description ? `<p style="margin: 8px 0 0 0; color: #666; font-size: 0.875rem;">${description}</p>` : ''}
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button id="cancel-btn" style="
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #333;
                    font-size: 0.875rem;
                ">Cancel</button>
                <button id="confirm-btn" style="
                    background: #d32f2f;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 500;
                ">Delete</button>
            </div>
        `;

        // Add modal to overlay
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add event listeners
        const cancelBtn = modal.querySelector('#cancel-btn');
        const confirmBtn = modal.querySelector('#confirm-btn');

        const cleanup = () => {
            document.body.removeChild(overlay);
        };

        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });

        confirmBtn.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(false);
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                resolve(false);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

// Search Functions
function setupSearchFunctionality() {
    // Employee search
    document.getElementById('search-input').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredEmployees = employees.filter(employee => 
            employee.name.toLowerCase().includes(searchTerm) ||
            (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm)) ||
            (employee.specialties && employee.specialties.some(specialty => 
                mapSpecialtyToReadable(specialty).toLowerCase().includes(searchTerm)
            ))
        );
        populateEmployeeTable(filteredEmployees);
    });

    // User search
    document.getElementById('user-search-input').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = users.filter(user => 
            (user.username && user.username.toLowerCase().includes(searchTerm)) ||
            (user.fullName && user.fullName.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm)) ||
            (user.role && user.role.toLowerCase().includes(searchTerm))
        );
        populateUserTable(filteredUsers);
    });

    // Reservation search
    document.getElementById('reservation-search-input').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredReservations = reservations.filter(reservation => 
            (reservation.customerName && reservation.customerName.toLowerCase().includes(searchTerm)) ||
            (reservation.services && reservation.services.toLowerCase().includes(searchTerm)) ||
            (reservation.stylist && reservation.stylist.toLowerCase().includes(searchTerm)) ||
            (reservation.bookingId && reservation.bookingId.toLowerCase().includes(searchTerm))
        );
        populateReservationTable(filteredReservations);
    });
}

// Navigation Functions
function showEmployees() {
    document.getElementById('employees-section').style.display = 'block';
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('reservation-section').style.display = 'none';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('a[href="#employees"]').classList.add('active');
    
    // Fetch employees if not already loaded
    if (employees.length === 0) {
        fetchEmployees();
    }
}

function showUsers() {
    document.getElementById('employees-section').style.display = 'none';
    document.getElementById('users-section').style.display = 'block';
    document.getElementById('reservation-section').style.display = 'none';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('a[href="#users"]').classList.add('active');
    
    // Fetch users if not already loaded
    if (users.length === 0) {
        fetchUsers();
    }
}

function showReservations() {
    document.getElementById('employees-section').style.display = 'none';
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('reservation-section').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('a[href="#reservation"]').classList.add('active');
    
    // Fetch reservations if not already loaded
    if (reservations.length === 0) {
        fetchReservations();
    }
}

// Action Functions
async function editEmployee(id) {
    const employee = employees.find(emp => emp._id === id);
    if (employee) {
        // TODO: Implement edit modal
        alert(`Edit employee: ${employee.name}`);
    }
}

async function deleteEmployee(id) {
    const employee = employees.find(emp => emp._id === id);
    if (employee && confirm(`Are you sure you want to delete employee ${employee.name}?`)) {
        await deleteEmployee(id);
    }
}

function editUser(id) {
    const user = users.find(u => u._id === id);
    if (user) {
        alert(`Edit user: ${user.username}`);
    }
}

async function deleteUser(id) {
    const user = users.find(u => u._id === id);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        `Delete User`,
        `Are you sure you want to delete user "${user.name || user.email}"?`,
        'This action cannot be undone and will permanently remove the user from the system.'
    );

    if (confirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(`User "${user.name || user.email}" deleted successfully`, 'success');
                await fetchUsers(); // Refresh the table
                return true;
            } else {
                showNotification(data.message || 'Failed to delete user', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Error deleting user: ' + error.message, 'error');
            return false;
        }
    }
}

function editReservation(id) {
    const reservation = reservations.find(r => r._id === id);
    if (reservation) {
        alert(`Edit reservation: ${reservation.fullName} - ${reservation.service}`);
    }
}

async function deleteReservation(id) {
    const reservation = reservations.find(r => r._id === id);
    if (!reservation) {
        showNotification('Reservation not found', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        `Delete Reservation`,
        `Are you sure you want to delete reservation for "${reservation.fullName}"?`,
        'This action cannot be undone and will permanently remove the reservation from the system.'
    );

    if (confirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(`Reservation for "${reservation.fullName}" deleted successfully`, 'success');
                await fetchReservations(); // Refresh the table
                return true;
            } else {
                showNotification(data.message || 'Failed to delete reservation', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error deleting reservation:', error);
            showNotification('Error deleting reservation: ' + error.message, 'error');
            return false;
        }
    }
}

// Test server connection
async function testServerConnection() {
    try {
        console.log('Testing server connection...');
        const response = await fetch(`${API_BASE_URL}/test`);
        const data = await response.json();
        console.log('Server test response:', data);
        showNotification('Server connection successful!', 'success');
        return true;
    } catch (error) {
        console.error('Server connection test failed:', error);
        showNotification('Server connection failed: ' + error.message, 'error');
        return false;
    }
}

// Initialize the admin panel
function initializeAdminPanel() {
    // Check admin authentication first
    if (!checkAdminAuth()) {
        return; // Will redirect to admin login
    }
    
    // Test server connection first
    testServerConnection().then(connected => {
        if (connected) {
            // Setup search functionality
            setupSearchFunctionality();
            
            // Setup navigation event listeners
            document.querySelector('a[href="#employees"]').addEventListener('click', function(e) {
                e.preventDefault();
                showEmployees();
            });

            document.querySelector('a[href="#users"]').addEventListener('click', function(e) {
                e.preventDefault();
                showUsers();
            });

            document.querySelector('a[href="#reservation"]').addEventListener('click', function(e) {
                e.preventDefault();
                showReservations();
            });

            // Setup other event listeners
            setupEventListeners();
            
            // Show employees section by default and fetch data
            showEmployees();
        }
    });
}

// Setup additional event listeners
function setupEventListeners() {
    // Menu toggle
    document.getElementById('menu-toggle').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
        
        // Save state to localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', function() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // User dropdown toggle
    document.getElementById('user-avatar').addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('user-dropdown');
        const avatar = document.getElementById('user-avatar');
        
        if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

            // Sign out functionality
        document.getElementById('signout-button').addEventListener('click', function() {
            showAdminSignoutModal();
        });
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
    
    // Load saved sidebar state
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed');
    if (sidebarCollapsed === 'true') {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
    }
    
    // Initialize admin panel
    initializeAdminPanel();
});

// Admin Sign Out Modal Functions
function showAdminSignoutModal() {
    const modal = document.getElementById('signout-modal');
    modal.classList.add('show');
}

function closeAdminSignoutModal() {
    const modal = document.getElementById('signout-modal');
    modal.classList.remove('show');
}

function confirmAdminSignOut() {
    closeAdminSignoutModal();
    // Clear auth tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    sessionStorage.removeItem('adminToken');
    // Redirect to admin login page
    window.location.href = 'admin-login.html';
}

// Add event listeners for admin sign out modal
document.addEventListener('DOMContentLoaded', function() {
    // Sign out modal background click
    const signoutModal = document.getElementById('signout-modal');
    if (signoutModal) {
        signoutModal.addEventListener('click', function(e) {
            if (e.target.id === 'signout-modal') {
                closeAdminSignoutModal();
            }
        });
    }

    // Add keyboard support for closing modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAdminSignoutModal();
        }
    });
}); 