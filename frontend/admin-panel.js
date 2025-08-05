// API Configuration
const API_BASE_URL = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:5000/api';

// Global variables
let employees = [];
let users = [];
let reservations = [];
let beforeAfterImages = [];

// Helper function to handle expired tokens
function handleExpiredToken() {
    console.log('Token expired, redirecting to admin login');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    sessionStorage.removeItem('adminToken');
    showNotification('Session expired. Please log in again.', 'warning');
    setTimeout(() => {
        window.location.href = 'admin-login.html';
    }, 2000);
}

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
        const token = getAuthToken();
        console.log('Debug - fetchUsers - Using token:', token);
        
        console.log('Fetching users from:', `${API_BASE_URL}/users`);
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.status === 401) {
            handleExpiredToken();
            return;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Debug - Error response body:', errorText);
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
        const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.status === 401) {
            handleExpiredToken();
            return;
        }
        
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
        if (error.message.includes('jwt expired') || error.message.includes('401')) {
            handleExpiredToken();
        } else {
            showNotification('Error connecting to server: ' + error.message, 'error');
        }
    }
}

async function fetchBeforeAfterImages() {
    try {
        console.log('🔍 Fetching before & after images from:', `${API_BASE_URL}/before-after/admin`);
        console.log('🔍 Auth token:', getAuthToken() ? 'Present' : 'Missing');
        
        const response = await fetch(`${API_BASE_URL}/before-after/admin`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', response.headers);
        
        if (response.status === 401) {
            handleExpiredToken();
            return;
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        console.log('🔍 Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('🔍 Non-JSON response:', textResponse.substring(0, 200));
            throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            beforeAfterImages = data;
            populateBeforeAfterGrid(beforeAfterImages);
            updatePaginationInfo(beforeAfterImages.length, 'before-after');
            showNotification(`Successfully loaded ${beforeAfterImages.length} before & after images`, 'success');
        } else {
            console.error('Failed to fetch before & after images:', data.message);
            showNotification('Failed to fetch before & after images', 'error');
        }
    } catch (error) {
        console.error('Error fetching before & after images:', error);
        if (error.message.includes('jwt expired') || error.message.includes('401')) {
            handleExpiredToken();
        } else {
            showNotification('Error connecting to server: ' + error.message, 'error');
        }
    }
}

async function uploadBeforeAfterImages(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/before-after/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        
        if (response.status === 401) {
            handleExpiredToken();
            return false;
        }
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Before & After images uploaded successfully!', 'success');
            await fetchBeforeAfterImages(); // Refresh the list
            return true;
        } else {
            showNotification('Upload failed: ' + (data.message || 'Unknown error'), 'error');
            return false;
        }
    } catch (error) {
        console.error('Upload error:', error);
        if (error.message.includes('jwt expired') || error.message.includes('401')) {
            handleExpiredToken();
        } else {
            showNotification('Error uploading images: ' + error.message, 'error');
        }
        return false;
    }
}

async function updateBeforeAfterImage(id, updateData) {
    try {
        const response = await fetch(`${API_BASE_URL}/before-after/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Before & After image updated successfully!', 'success');
            await fetchBeforeAfterImages(); // Refresh the list
            return true;
        } else {
            showNotification('Update failed: ' + (data.message || 'Unknown error'), 'error');
            return false;
        }
    } catch (error) {
        console.error('Update error:', error);
        showNotification('Error updating image: ' + error.message, 'error');
        return false;
    }
}

async function deleteBeforeAfterImage(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/before-after/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Before & After image deleted successfully!', 'success');
            await fetchBeforeAfterImages(); // Refresh the list
            return true;
        } else {
            showNotification('Delete failed: ' + (data.message || 'Unknown error'), 'error');
            return false;
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error deleting image: ' + error.message, 'error');
        return false;
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
    const employee = employees.find(emp => emp._id === id);
    if (!employee) {
        showNotification('Employee not found', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        `Delete Employee`,
        `Are you sure you want to delete employee "${employee.name}"?`,
        'This action cannot be undone and will permanently remove the employee from the system.',
        'Delete',
        '#f44336'
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
    const cardsGrid = document.getElementById('employee-cards-grid');
    if (!cardsGrid) return;

    cardsGrid.innerHTML = '';

    data.forEach(employee => {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.setAttribute('data-employee-id', employee._id);
        
        // Get initials for avatar
        const initials = employee.name ? 
            employee.name.split(' ').map(name => name[0]).join('').toUpperCase() : 'E';
        
        // Map specialties to readable format
        const services = employee.specialties && employee.specialties.length > 0 
            ? employee.specialties.map(specialty => mapSpecialtyToReadable(specialty))
            : [];
        
        card.innerHTML = `
            <div class="employee-card-actions">
                <button class="card-action-btn card-edit-btn" onclick="event.stopPropagation(); editEmployee('${employee._id}')" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="card-action-btn card-delete-btn" onclick="event.stopPropagation(); deleteEmployee('${employee._id}')" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
            <div class="employee-card-header">
                <div class="employee-avatar">${initials}</div>
                <div class="employee-info">
                    <div class="employee-id">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        ${employee.employeeId || 'N/A'}
                    </div>
                    <div class="employee-name">${employee.name || 'N/A'}</div>
                    <div class="employee-contact">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z"/>
                        </svg>
                        ${employee.phone || 'N/A'}
                    </div>
                </div>
            </div>
            <div class="employee-services">
                <div class="services-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Services Offered
                </div>
                <div class="services-list">
                    ${services.length > 0 ? 
                        services.map(service => `<span class="service-tag">${service}</span>`).join('') : 
                        '<span class="no-services">No services assigned</span>'
                    }
                </div>
            </div>
            <div class="expand-indicator">Click to view services</div>
        `;
        
        // Add click event to expand/collapse services
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
        
        cardsGrid.appendChild(card);
    });

    updatePaginationInfo(data.length, 'employees');
}

function populateUserTable(data = users) {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';

    data.forEach((user, index) => {
        const statusClass = user.isActive ? 'status-active' : 'status-inactive';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
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
                    <button class="action-btn delete-btn" onclick="deleteUser('${user._id}')" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
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
            <td>
                <input type="checkbox" class="row-checkbox" data-reservation-id="${reservation._id}" data-booking-id="${reservation.bookingId || 'N/A'}">
            </td>
            <td>${reservation.bookingId || (reservation._id ? reservation._id.slice(-8).toUpperCase() : 'N/A')}</td>
            <td>${reservation.fullName || 'N/A'}</td>
            <td>${reservation.mobileNumber || 'N/A'}</td>
            <td>${reservation.email || 'N/A'}</td>
            <td>${mapSpecialtyToReadable(reservation.service) || 'N/A'}</td>
            <td>${reservation.stylistName || reservation.selectedEmployee || 'N/A'}</td>
            <td>${reservation.clientNotes ? `<span class="notes-badge" onclick="showNotesModal('${reservation.clientNotes.replace(/'/g, "\\'")}')" title="Click to view full notes">${reservation.clientNotes.length > 30 ? reservation.clientNotes.substring(0, 30) + '...' : reservation.clientNotes}</span>` : 'No notes'}</td>
            <td><span class="price-badge">₱${reservation.totalAmount || 'N/A'}</span></td>
            <td>${getServiceDuration(reservation.service) || 'N/A'}</td>
            <td>${formatDate(reservation.appointmentDate) || 'N/A'}</td>
            <td><span class="time-badge">${reservation.selectedTime || 'N/A'}</span></td>
            <td>
                <span class="status-badge ${statusClass}">${reservation.status || 'Pending'}</span>
            </td>
            <td>
                <div class="action-buttons">
                    ${reservation.status !== 'confirmed' && reservation.status !== 'completed' ? 
                        `<button class="action-btn confirm-btn" onclick="confirmReservation('${reservation._id}')" title="Confirm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </button>` : ''
                    }
                    ${reservation.status === 'confirmed' ? 
                        `<button class="action-btn complete-btn" onclick="completeReservation('${reservation._id}')" title="Complete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </button>` : ''
                    }
                    ${reservation.status !== 'cancelled' ? 
                        `<button class="action-btn cancel-btn" onclick="cancelReservation('${reservation._id}')" title="Cancel">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>` : ''
                    }
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Setup checkbox event listeners after populating the table
    setupReservationCheckboxes();
}

function populateBeforeAfterGrid(data = beforeAfterImages) {
    const grid = document.getElementById('before-after-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <h3>No Before & After Images</h3>
                <p>Start showcasing your amazing transformations by uploading some before and after images.</p>
            </div>
        `;
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'before-after-card';
        card.innerHTML = `
            <div class="before-after-images">
                <div class="before-image-container">
                    <img src="${API_BASE_URL}/before-after/images/${item.beforeImage}" alt="Before" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CZWZvcmU8L3RleHQ+Cjwvc3ZnPgo='">
                    <div class="image-label before-label">Before</div>
                </div>
                <div class="after-image-container">
                    <img src="${API_BASE_URL}/before-after/images/${item.afterImage}" alt="After" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BZnRlcjwvdGV4dD4KPC9zdmc+Cg=='">
                    <div class="image-label after-label">After</div>
                </div>
            </div>
            <div class="before-after-info">
                <div class="before-after-description">
                    ${item.description || 'No description provided'}
                </div>
                <div class="before-after-meta">
                    <span>Uploaded: ${formatDate(item.createdAt)}</span>
                    <span>By: ${item.uploadedBy ? item.uploadedBy.name : 'Unknown'}</span>
                </div>
            </div>
            <div class="before-after-actions">
                <button class="before-after-action-btn before-after-toggle-btn" onclick="toggleBeforeAfterStatus('${item._id}', ${item.isActive})" title="${item.isActive ? 'Deactivate' : 'Activate'}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="${item.isActive ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z' : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z'}"/>
                    </svg>
                </button>
                <button class="before-after-action-btn before-after-edit-btn" onclick="editBeforeAfterImage('${item._id}')" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="before-after-action-btn before-after-delete-btn" onclick="deleteBeforeAfterImage('${item._id}')" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
            <div class="status-indicator ${item.isActive ? 'status-active' : 'status-inactive'}"></div>
        `;
        grid.appendChild(card);
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
    const adminToken = localStorage.getItem('adminToken');
    const sessionToken = sessionStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    
    console.log('Debug - adminToken from localStorage:', adminToken);
    console.log('Debug - adminToken from sessionStorage:', sessionToken);
    console.log('Debug - userToken from localStorage:', userToken);
    
    const token = adminToken || sessionToken;
    console.log('Debug - Final token being used:', token);
    
    return token;
}

// Check if user is authenticated as admin
function checkAdminAuth() {
    const token = getAuthToken();
    const adminData = localStorage.getItem('adminData');
    const userData = localStorage.getItem('userData');
    
    console.log('Debug - checkAdminAuth - token:', token);
    console.log('Debug - checkAdminAuth - adminData:', adminData);
    console.log('Debug - checkAdminAuth - userData:', userData);
    
    if (!token || !adminData) {
        console.log('Debug - No token or adminData found, redirecting to admin login');
        // Redirect to admin login
        window.location.href = 'admin-login.html';
        return false;
    }
    
    try {
        const parsedAdminData = JSON.parse(adminData);
        console.log('Debug - Parsed adminData:', parsedAdminData);
        
        if (parsedAdminData.role !== 'admin') {
            console.log('Debug - User is not admin, redirecting');
            // Not an admin, redirect to admin login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            window.location.href = 'admin-login.html';
            return false;
        }
        console.log('Debug - Admin authentication successful');
        return true;
    } catch (error) {
        console.log('Debug - Error parsing adminData:', error);
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
function showConfirmDialog(title, message, description = '', confirmButtonText = 'Confirm', confirmButtonColor = '#4caf50') {
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
                    background: ${confirmButtonColor};
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 500;
                ">${confirmButtonText}</button>
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
    document.getElementById('before-after-section').style.display = 'none';
    
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
    document.getElementById('before-after-section').style.display = 'none';
    
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
    document.getElementById('before-after-section').style.display = 'none';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('a[href="#reservation"]').classList.add('active');
    
    // Fetch reservations if not already loaded
    if (reservations.length === 0) {
        fetchReservations();
    }
}

function showBeforeAfter() {
    document.getElementById('employees-section').style.display = 'none';
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('reservation-section').style.display = 'none';
    document.getElementById('before-after-section').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('a[href="#before-after"]').classList.add('active');
    
    // Fetch before & after images if not already loaded
    if (beforeAfterImages.length === 0) {
        fetchBeforeAfterImages();
    }
}

// Action Functions
async function editEmployee(id) {
    const employee = employees.find(emp => emp._id === id);
    if (!employee) {
        showNotification('Employee not found', 'error');
        return;
    }

    // Populate the edit modal
    document.getElementById('edit-employee-name').value = employee.name;
    document.getElementById('edit-employee-id').value = employee.employeeId;
    
    // Clear previous selections
    const editServicesSelect = document.getElementById('edit-services');
    for (let option of editServicesSelect.options) {
        option.selected = false;
    }
    
    // Select current services
    if (employee.specialties && employee.specialties.length > 0) {
        employee.specialties.forEach(specialty => {
            const option = Array.from(editServicesSelect.options).find(opt => opt.value === specialty);
            if (option) {
                option.selected = true;
            }
        });
    }
    
    // Store the employee ID for the form submission
    document.getElementById('edit-employee-form').setAttribute('data-employee-id', id);
    
    // Show the modal
    document.getElementById('edit-employee-modal').style.display = 'flex';
}

async function deleteEmployee(id) {
    const employee = employees.find(emp => emp._id === id);
    if (!employee) {
        showNotification('Employee not found', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        `Delete Employee`,
        `Are you sure you want to delete employee "${employee.name}"?`,
        'This action cannot be undone and will permanently remove the employee from the system.',
        'Delete',
        '#f44336'
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
        'This action cannot be undone and will permanently remove the user from the system.',
        'Delete',
        '#f44336'
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

async function confirmReservation(id) {
    const reservation = reservations.find(r => r._id === id);
    if (!reservation) {
        showNotification('Reservation not found', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        `Confirm Reservation`,
        `Are you sure you want to confirm reservation for "${reservation.fullName}"?`,
        'This will mark the reservation as confirmed and notify the customer.',
        'Confirm',
        '#4caf50'
    );

    if (confirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'confirmed' })
            });
            
            const data = await response.json();
            
            if (data.success) {
                let message = `Reservation for "${reservation.fullName}" confirmed successfully`;
                if (data.emailSent) {
                    message += ' - Confirmation email sent to customer';
                } else {
                    message += ' - Email notification failed to send';
                }
                showNotification(message, 'success');
                await fetchReservations(); // Refresh the table
                return true;
            } else {
                showNotification(data.message || 'Failed to confirm reservation', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error confirming reservation:', error);
            showNotification('Error confirming reservation: ' + error.message, 'error');
            return false;
        }
    }
}

async function cancelReservation(id) {
    const reservation = reservations.find(r => r._id === id);
    if (!reservation) {
        showNotification('Reservation not found', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        `Cancel Reservation`,
        `Are you sure you want to cancel reservation for "${reservation.fullName}"?`,
        'This will mark the reservation as cancelled and notify the customer.',
        'Cancel',
        '#f44336'
    );

    if (confirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'cancelled' })
            });
            
            const data = await response.json();
            
            if (data.success) {
                let message = `Reservation for "${reservation.fullName}" cancelled successfully`;
                if (data.emailSent) {
                    message += ' - Cancellation email sent to customer';
                } else {
                    message += ' - Email notification failed to send';
                }
                showNotification(message, 'success');
                await fetchReservations(); // Refresh the table
                return true;
            } else {
                showNotification(data.message || 'Failed to cancel reservation', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            showNotification('Error cancelling reservation: ' + error.message, 'error');
            return false;
        }
    }
}

async function completeReservation(id) {
    const reservation = reservations.find(r => r._id === id);
    if (!reservation) {
        showNotification('Reservation not found', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        `Complete Reservation`,
        `Are you sure you want to mark reservation for "${reservation.fullName}" as completed?`,
        'This will mark the reservation as completed and the service has been provided.',
        'Complete',
        '#2196f3'
    );

    if (confirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'completed' })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(`Reservation for "${reservation.fullName}" marked as completed successfully`, 'success');
                await fetchReservations(); // Refresh the table
                return true;
            } else {
                showNotification(data.message || 'Failed to complete reservation', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error completing reservation:', error);
            showNotification('Error completing reservation: ' + error.message, 'error');
            return false;
        }
    }
}

// Test server connection
async function testServerConnection() {
    try {
        console.log('🔍 Testing server connection to:', `${API_BASE_URL}/test`);
        const response = await fetch(`${API_BASE_URL}/test`);
        console.log('🔍 Test response status:', response.status);
        const data = await response.json();
        console.log('🔍 Server test response:', data);
        showNotification('Server connection successful!', 'success');
        return true;
    } catch (error) {
        console.error('🔍 Server connection test failed:', error);
        showNotification('Server connection failed: ' + error.message, 'error');
        return false;
    }
}

// Test before-after route specifically
async function testBeforeAfterRoute() {
    try {
        console.log('🔍 Testing before-after route:', `${API_BASE_URL}/before-after/test`);
        const response = await fetch(`${API_BASE_URL}/before-after/test`);
        console.log('🔍 Before-after test response status:', response.status);
        const data = await response.json();
        console.log('🔍 Before-after route test:', data);
        showNotification('Before-after route test successful', 'success');
    } catch (error) {
        console.error('🔍 Before-after route test failed:', error);
        showNotification('Before-after route test failed', 'error');
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

            document.querySelector('a[href="#before-after"]').addEventListener('click', function(e) {
                e.preventDefault();
                showBeforeAfter();
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

        // Before & After upload functionality
        document.getElementById('add-before-after').addEventListener('click', function() {
            document.getElementById('upload-before-after-modal').style.display = 'flex';
        });

        document.getElementById('close-upload-before-after-modal').addEventListener('click', function() {
            document.getElementById('upload-before-after-modal').style.display = 'none';
        });

        document.getElementById('cancel-upload-before-after').addEventListener('click', function() {
            document.getElementById('upload-before-after-modal').style.display = 'none';
        });

        document.getElementById('upload-before-after-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const beforeImage = document.getElementById('before-image').files[0];
            const afterImage = document.getElementById('after-image').files[0];
            const description = document.getElementById('description').value;

            if (!beforeImage || !afterImage) {
                showNotification('Please select both before and after images', 'error');
                return;
            }

            formData.append('beforeImage', beforeImage);
            formData.append('afterImage', afterImage);
            formData.append('description', description);

            const success = await uploadBeforeAfterImages(formData);
            if (success) {
                document.getElementById('upload-before-after-modal').style.display = 'none';
                document.getElementById('upload-before-after-form').reset();
            }
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
    console.log('🔍 Admin panel DOM loaded');
    console.log('🔍 API_BASE_URL:', API_BASE_URL);
    console.log('🔍 APP_CONFIG:', window.APP_CONFIG);
    
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

// Notes Modal Functions
function showNotesModal(notes) {
    const modal = document.getElementById('notes-modal');
    const notesContent = document.getElementById('notes-content');
    
    notesContent.textContent = notes;
    modal.style.display = 'flex';
}

function closeNotesModal() {
    const modal = document.getElementById('notes-modal');
    modal.style.display = 'none';
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
            window.closeAddEmployeeModal();
            closeNotesModal();
        }
    });

    // Notes Modal Functionality
    const notesModal = document.getElementById('notes-modal');
    const closeNotesModalBtn = document.getElementById('close-notes-modal');

    // Close notes modal event listeners
    if (closeNotesModalBtn) {
        closeNotesModalBtn.addEventListener('click', closeNotesModal);
    }

    // Close notes modal when clicking outside
    if (notesModal) {
        notesModal.addEventListener('click', function(e) {
            if (e.target === notesModal) {
                closeNotesModal();
            }
        });
    }

    // Add Employee Modal Functionality
    const addEmployeeBtn = document.getElementById('add-employee');
    const addEmployeeModal = document.getElementById('add-employee-modal');
    const closeEmployeeModal = document.getElementById('close-employee-modal');
    const cancelEmployeeBtn = document.getElementById('cancel-employee');
    const addEmployeeForm = document.getElementById('add-employee-form');

    // Open modal
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', function() {
            addEmployeeModal.style.display = 'flex';
        });
    }

    // Close modal functions
    window.closeAddEmployeeModal = function() {
        addEmployeeModal.style.display = 'none';
        addEmployeeForm.reset();
    };

    // Close modal event listeners
    if (closeEmployeeModal) {
        closeEmployeeModal.addEventListener('click', window.closeAddEmployeeModal);
    }

    if (cancelEmployeeBtn) {
        cancelEmployeeBtn.addEventListener('click', window.closeAddEmployeeModal);
    }

    // Close modal when clicking outside
    if (addEmployeeModal) {
        addEmployeeModal.addEventListener('click', function(e) {
            if (e.target === addEmployeeModal) {
                window.closeAddEmployeeModal();
            }
        });
    }

    // Handle form submission
    if (addEmployeeForm) {
        // Add multiple selection enhancement for services
        const specialtiesSelect = document.getElementById('employee-specialties');
        if (specialtiesSelect) {
            // Create a visual counter for selected items
            const counterSpan = document.createElement('span');
            counterSpan.id = 'selected-count';
            counterSpan.style.cssText = 'color: #667eea; font-size: 12px; margin-left: 10px; font-weight: 500;';
            specialtiesSelect.parentNode.insertBefore(counterSpan, specialtiesSelect.nextSibling);
            
            // Update counter function
            function updateSelectedCount() {
                const selectedCount = specialtiesSelect.selectedOptions.length;
                counterSpan.textContent = selectedCount > 0 ? `${selectedCount} service(s) selected` : '';
            }
            
            // Add event listener to update counter
            specialtiesSelect.addEventListener('change', updateSelectedCount);
            
            // Enable multiple selection without Ctrl/Cmd key
            specialtiesSelect.addEventListener('mousedown', function(e) {
                const option = e.target;
                if (option.tagName === 'OPTION') {
                    e.preventDefault();
                    
                    // Toggle selection state
                    if (option.selected) {
                        option.selected = false;
                    } else {
                        option.selected = true;
                    }
                    
                    // Trigger change event to update counter
                    this.dispatchEvent(new Event('change'));
                }
            });
            
            // Initial counter update
            updateSelectedCount();
            
            // Add Select All functionality
            const selectAllBtn = document.getElementById('select-all-services');
            const clearAllBtn = document.getElementById('clear-all-services');
            
            if (selectAllBtn) {
                selectAllBtn.addEventListener('click', function() {
                    for (let option of specialtiesSelect.options) {
                        option.selected = true;
                    }
                    updateSelectedCount();
                });
            }
            
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', function() {
                    for (let option of specialtiesSelect.options) {
                        option.selected = false;
                    }
                    updateSelectedCount();
                });
            }
        }

        // Add multiple selection enhancement for the main services select
        const mainServicesSelect = document.getElementById('services');
        if (mainServicesSelect) {
            // Create a visual counter for selected items
            const counterSpan = document.createElement('span');
            counterSpan.id = 'selected-count-main';
            counterSpan.style.cssText = 'color: #667eea; font-size: 12px; margin-left: 10px; font-weight: 500;';
            mainServicesSelect.parentNode.insertBefore(counterSpan, mainServicesSelect.nextSibling);
            
            // Update counter function
            function updateMainSelectedCount() {
                const selectedCount = mainServicesSelect.selectedOptions.length;
                counterSpan.textContent = selectedCount > 0 ? `${selectedCount} service(s) selected` : '';
            }
            
            // Add event listener to update counter
            mainServicesSelect.addEventListener('change', updateMainSelectedCount);
            
            // Enable multiple selection without Ctrl/Cmd key
            mainServicesSelect.addEventListener('mousedown', function(e) {
                const option = e.target;
                if (option.tagName === 'OPTION') {
                    e.preventDefault();
                    
                    // Toggle selection state
                    if (option.selected) {
                        option.selected = false;
                    } else {
                        option.selected = true;
                    }
                    
                    // Trigger change event to update counter
                    this.dispatchEvent(new Event('change'));
                }
            });
            
            // Initial counter update
            updateMainSelectedCount();
            
            // Add Select All functionality for main services
            const selectAllMainBtn = document.getElementById('select-all-services-main');
            const clearAllMainBtn = document.getElementById('clear-all-services-main');
            
            if (selectAllMainBtn) {
                selectAllMainBtn.addEventListener('click', function() {
                    for (let option of mainServicesSelect.options) {
                        option.selected = true;
                    }
                    updateMainSelectedCount();
                });
            }
            
            if (clearAllMainBtn) {
                clearAllMainBtn.addEventListener('click', function() {
                    for (let option of mainServicesSelect.options) {
                        option.selected = false;
                    }
                    updateMainSelectedCount();
                });
            }
        }

        // Edit Employee Modal Event Listeners
        const editEmployeeModal = document.getElementById('edit-employee-modal');
        const closeEditEmployeeModal = document.getElementById('close-edit-employee-modal');
        const cancelEditEmployee = document.getElementById('cancel-edit-employee');
        const editEmployeeForm = document.getElementById('edit-employee-form');
        const editServicesSelect = document.getElementById('edit-services');
        const selectAllEditServicesBtn = document.getElementById('select-all-edit-services');
        const clearAllEditServicesBtn = document.getElementById('clear-all-edit-services');

        // Close edit modal
        if (closeEditEmployeeModal) {
            closeEditEmployeeModal.addEventListener('click', function() {
                editEmployeeModal.style.display = 'none';
            });
        }

        if (cancelEditEmployee) {
            cancelEditEmployee.addEventListener('click', function() {
                editEmployeeModal.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        if (editEmployeeModal) {
            editEmployeeModal.addEventListener('click', function(e) {
                if (e.target === editEmployeeModal) {
                    editEmployeeModal.style.display = 'none';
                }
            });
        }

        // Edit services multiple selection
        if (editServicesSelect) {
            editServicesSelect.addEventListener('mousedown', function(e) {
                const option = e.target;
                if (option.tagName === 'OPTION') {
                    e.preventDefault();
                    
                    // Toggle selection state
                    if (option.selected) {
                        option.selected = false;
                    } else {
                        option.selected = true;
                    }
                }
            });
        }

        // Select All functionality for edit services
        if (selectAllEditServicesBtn) {
            selectAllEditServicesBtn.addEventListener('click', function() {
                for (let option of editServicesSelect.options) {
                    option.selected = true;
                }
            });
        }
        
        if (clearAllEditServicesBtn) {
            clearAllEditServicesBtn.addEventListener('click', function() {
                for (let option of editServicesSelect.options) {
                    option.selected = false;
                }
            });
        }

        // Edit employee form submission
        if (editEmployeeForm) {
            editEmployeeForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const employeeId = this.getAttribute('data-employee-id');
                if (!employeeId) {
                    showNotification('Employee ID not found', 'error');
                    return;
                }

                // Get selected services
                const selectedServices = Array.from(editServicesSelect.selectedOptions).map(option => option.value);
                
                const employeeData = {
                    specialties: selectedServices
                };

                const submitBtn = this.querySelector('.btn-submit');
                const originalText = submitBtn.innerHTML;

                try {
                    submitBtn.innerHTML = 'Updating...';
                    submitBtn.disabled = true;

                    const success = await updateEmployee(employeeId, employeeData);
                    
                    if (success) {
                        showNotification('Employee services updated successfully!', 'success');
                        editEmployeeModal.style.display = 'none';
                        // Refresh the employee list
                        await fetchEmployees();
                        populateEmployeeTable(employees);
                    }
                } catch (error) {
                    console.error('Error updating employee:', error);
                    showNotification('Failed to update employee services. Please try again.', 'error');
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        addEmployeeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form field values
            const employeeId = document.getElementById('employee-no').value;
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const phone = document.getElementById('contact-no').value;
            
            // Get selected services
            const servicesSelect = document.getElementById('services');
            const selectedServices = Array.from(servicesSelect.selectedOptions).map(option => option.value);
            
            // Combine name
            const fullName = `${firstName} ${lastName}`.trim();
            
            const employeeData = {
                employeeId: employeeId,
                name: fullName,
                phone: phone,
                specialties: selectedServices
            };

            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;

            try {
                submitBtn.innerHTML = 'Adding...';
                submitBtn.disabled = true;

                const success = await createEmployee(employeeData);
                
                if (success) {
                    showNotification('Employee added successfully!', 'success');
                    window.closeAddEmployeeModal();
                    // Refresh the employee list
                    await fetchEmployees();
                    populateEmployeeTable(employees);
                }
            } catch (error) {
                console.error('Error adding employee:', error);
                showNotification('Failed to add employee. Please try again.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Bulk Delete Functions for Reservations
function setupReservationCheckboxes() {
    const selectAllCheckbox = document.getElementById('select-all-reservations');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const bulkActions = document.getElementById('bulk-actions-reservations');
    const selectedCount = document.getElementById('selected-count');
    const bulkDeleteBtn = document.getElementById('bulk-delete-reservations');

    // Select all checkbox functionality
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBulkActionsVisibility();
        });
    }

    // Individual row checkbox functionality
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAllCheckbox();
            updateBulkActionsVisibility();
        });
    });

    // Bulk delete button functionality
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', handleBulkDelete);
    }

    function updateSelectAllCheckbox() {
        const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
        const totalBoxes = rowCheckboxes.length;
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = checkedBoxes.length === totalBoxes;
            selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < totalBoxes;
        }
    }

    function updateBulkActionsVisibility() {
        const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
        
        if (checkedBoxes.length > 0) {
            bulkActions.style.display = 'flex';
            selectedCount.textContent = checkedBoxes.length;
            bulkDeleteBtn.disabled = false;
        } else {
            bulkActions.style.display = 'none';
            bulkDeleteBtn.disabled = true;
        }
    }

    // Initialize visibility
    updateBulkActionsVisibility();
}

async function handleBulkDelete() {
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        showNotification('No reservations selected for deletion', 'error');
        return;
    }

    const selectedIds = Array.from(checkedBoxes).map(checkbox => checkbox.getAttribute('data-reservation-id'));
    const selectedBookingIds = Array.from(checkedBoxes).map(checkbox => checkbox.getAttribute('data-booking-id'));

    const result = await showConfirmDialog(
        'Delete Selected Reservations',
        `Are you sure you want to delete ${selectedIds.length} reservation(s)?`,
        `This will permanently delete the following booking(s): ${selectedBookingIds.join(', ')}. This action cannot be undone.`,
        'Delete',
        '#dc3545'
    );

    if (result) {
        try {
            const deletePromises = selectedIds.map(id => deleteReservation(id));
            await Promise.all(deletePromises);
            
            showNotification(`Successfully deleted ${selectedIds.length} reservation(s)`, 'success');
            
            // Refresh the reservations list
            await fetchReservations();
            
            // Reset select all checkbox
            const selectAllCheckbox = document.getElementById('select-all-reservations');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
            
        } catch (error) {
            console.error('Error during bulk delete:', error);
            showNotification('Some reservations could not be deleted. Please try again.', 'error');
        }
    }
}

async function deleteReservation(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return true;
        } else {
            throw new Error(data.message || 'Failed to delete reservation');
        }
    } catch (error) {
        console.error('Error deleting reservation:', error);
        throw error;
    }
}

// Before & After Action Functions
async function toggleBeforeAfterStatus(id, currentStatus) {
    try {
        const newStatus = !currentStatus;
        const success = await updateBeforeAfterImage(id, { isActive: newStatus });
        if (success) {
            showNotification(`Image ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
        }
    } catch (error) {
        console.error('Toggle status error:', error);
        showNotification('Error updating image status: ' + error.message, 'error');
    }
}

async function editBeforeAfterImage(id) {
    try {
        const item = beforeAfterImages.find(img => img._id === id);
        if (!item) {
            showNotification('Image not found', 'error');
            return;
        }

        const newDescription = prompt('Enter new description:', item.description || '');
        if (newDescription === null) return; // User cancelled

        const success = await updateBeforeAfterImage(id, { description: newDescription });
        if (success) {
            showNotification('Image description updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Edit error:', error);
        showNotification('Error updating image: ' + error.message, 'error');
    }
}

async function deleteBeforeAfterImage(id) {
    try {
        const confirmed = await showConfirmDialog(
            'Delete Before & After Image',
            'Are you sure you want to delete this before & after image pair?',
            'This action cannot be undone and will permanently remove both images from the system.',
            'Delete',
            '#d32f2f'
        );

        if (!confirmed) return;

        const success = await deleteBeforeAfterImage(id);
        if (success) {
            showNotification('Before & After image deleted successfully!', 'success');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error deleting image: ' + error.message, 'error');
    }
}