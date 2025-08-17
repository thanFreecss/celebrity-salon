// User Profile and Authentication Management
class UserProfile {
    constructor() {
        this.userData = null;
        this.token = null;
        // Use backend server URL (port 5000) for API calls
        this.API_BASE_URL = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:5000/api';
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    checkAuthStatus() {
        // Check if user is logged in
        const token = localStorage.getItem('userToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
            try {
                this.token = token;
                this.userData = JSON.parse(userData);
                this.showUserProfile();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        } else {
            this.showLoginButtons();
        }
    }

    showUserProfile() {
        document.getElementById('user-actions').style.display = 'none';
        document.getElementById('user-profile').style.display = 'flex';
    }

    showLoginButtons() {
        document.getElementById('user-actions').style.display = 'flex';
        document.getElementById('user-profile').style.display = 'none';
    }

    setupEventListeners() {
        // History button click
        const historyBtn = document.getElementById('history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                this.openHistoryModal();
            });
        }

        // Profile button click (sign out) - now it's the signout button
        const signoutBtn = document.getElementById('signout-btn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', () => {
                this.showSignOutConfirm();
            });
        }

        // History modal close button
        const closeBtn = document.querySelector('#history-modal .close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeHistoryModal();
            });
        }

        // History modal background click
        const historyModal = document.getElementById('history-modal');
        if (historyModal) {
            historyModal.addEventListener('click', (e) => {
                if (e.target.id === 'history-modal') {
                    this.closeHistoryModal();
                }
            });
        }

        // Add keyboard support for closing modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeHistoryModal();
                this.closeSignoutModal();
            }
        });

        // Sign out modal background click
        const signoutModal = document.getElementById('signout-modal');
        if (signoutModal) {
            signoutModal.addEventListener('click', (e) => {
                if (e.target.id === 'signout-modal') {
                    this.closeSignoutModal();
                }
            });
        }

        // Filter changes
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterBookings();
            });
        }

        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.filterBookings();
            });
        }
    }

    async openHistoryModal() {
        const modal = document.getElementById('history-modal');
        modal.classList.add('show');
        
        // Check if user is authenticated
        if (!this.token) {
            this.showNotification('Please log in to view your booking history', 'warning');
            this.displayBookingHistory([]);
            return;
        }
        
        // Load booking history
        await this.loadBookingHistory();
        
        // Show notification about the booking history
        this.showNotification('Booking history loaded successfully', 'success');
    }

    closeHistoryModal() {
        const modal = document.getElementById('history-modal');
        modal.classList.remove('show');
    }

    showSignOutConfirm() {
        const modal = document.getElementById('signout-modal');
        modal.classList.add('show');
    }

    closeSignoutModal() {
        const modal = document.getElementById('signout-modal');
        modal.classList.remove('show');
    }

    confirmSignOut() {
        this.closeSignoutModal();
        this.logout();
    }

    logout() {
        // Clear local storage
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        
        // Reset state
        this.token = null;
        this.userData = null;
        
        // Show login buttons
        this.showLoginButtons();
        
        // Redirect to home page if not already there
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/index.html';
        }
        
        // Show notification
        this.showNotification('Successfully signed out', 'success');
    }

    async loadBookingHistory() {
        try {
            console.log('Loading booking history for user with token:', this.token ? 'Token exists' : 'No token');
            console.log('User data:', this.userData);
            
            if (!this.token) {
                console.error('No authentication token available');
                this.displayBookingHistory([]);
                return;
            }

            // Test the token first
            console.log('Testing token validity...');
            try {
                const testResponse = await fetch(`${this.API_BASE_URL}/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Token test response status:', testResponse.status);
                if (!testResponse.ok) {
                    console.error('Token is invalid, logging out user');
                    this.logout();
                    return;
                }
            } catch (error) {
                console.error('Error testing token:', error);
                this.logout();
                return;
            }

            const response = await fetch(`${this.API_BASE_URL}/bookings/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Booking history data:', data);
                this.displayBookingHistory(data.data || []);
            } else {
                const errorData = await response.json();
                console.error('Failed to load booking history:', errorData);
                this.displayBookingHistory([]);
            }
        } catch (error) {
            console.error('Error loading booking history:', error);
            this.displayBookingHistory([]);
        }
    }

    displayBookingHistory(bookings) {
        const tbody = document.getElementById('history-table-body');
        const emptyDiv = document.getElementById('history-empty');

        if (bookings.length === 0) {
            tbody.innerHTML = '';
            emptyDiv.style.display = 'block';
            return;
        }

        emptyDiv.style.display = 'none';
        tbody.innerHTML = '';

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            
            // Determine which action buttons to show
            const canReschedule = ['pending', 'confirmed', 'cancelled'].includes(booking.status);
            const canCancel = ['pending', 'confirmed'].includes(booking.status);
            
            row.innerHTML = `
                <td>${booking.bookingId || (booking._id ? booking._id.slice(-8).toUpperCase() : 'N/A')}</td>
                <td>${booking.service || 'N/A'}</td>
                <td>${this.formatDate(booking.appointmentDate)}</td>
                <td>${booking.selectedTime || 'N/A'}</td>
                <td>${booking.selectedEmployee || 'Not assigned'}</td>
                <td><span class="status-badge status-${booking.status || 'pending'}">${booking.status || 'Pending'}</span></td>
                <td>₱${booking.totalAmount || 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="userProfile.viewBooking('${booking._id}')" title="View Details">View</button>
                    ${canReschedule ? `<button class="action-btn reschedule-btn" onclick="userProfile.rescheduleBooking('${booking._id}')" title="Reschedule Booking">Reschedule</button>` : ''}
                    ${canCancel ? `<button class="action-btn delete-btn" onclick="userProfile.cancelBooking('${booking._id}')" title="Cancel Booking">Cancel</button>` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterBookings() {
        const statusFilter = document.getElementById('status-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        
        // This would typically filter the existing data or make a new API call
        // For now, we'll reload the data and apply filters
        this.loadBookingHistory();
    }

    async viewBooking(bookingId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/bookings/${bookingId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.showBookingDetails(data.data);
            } else {
                this.showNotification('Failed to load booking details', 'error');
            }
        } catch (error) {
            console.error('Error viewing booking:', error);
            this.showNotification('Error loading booking details', 'error');
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.showNotification('Booking cancelled successfully', 'success');
                await this.loadBookingHistory(); // Refresh the list
            } else {
                this.showNotification('Failed to cancel booking', 'error');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            this.showNotification('Error cancelling booking', 'error');
        }
    }

    async rescheduleBooking(bookingId) {
        try {
            // First, get the booking details to pre-fill the form
            const response = await fetch(`${this.API_BASE_URL}/bookings/${bookingId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                this.showNotification('Failed to load booking details', 'error');
                return;
            }

            const data = await response.json();
            const booking = data.data;

            // Open reschedule modal with pre-filled data
            this.openRescheduleModal(booking);
        } catch (error) {
            console.error('Error loading booking for reschedule:', error);
            this.showNotification('Error loading booking details', 'error');
        }
    }

    openRescheduleModal(booking) {
        // Remove any existing reschedule modal
        const existingModal = document.querySelector('.reschedule-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create reschedule modal
        const modalHTML = `
            <div class="reschedule-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Reschedule Booking</h3>
                        <button class="close-btn" onclick="userProfile.closeRescheduleModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="rescheduleForm">
                            <div class="form-group">
                                <label for="rescheduleService">Service</label>
                                <input type="text" id="rescheduleService" value="${booking.service}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="rescheduleDate">New Date <span class="required">*</span></label>
                                <input type="date" id="rescheduleDate" required>
                            </div>
                            <div class="form-group">
                                <label for="rescheduleTime">New Time <span class="required">*</span></label>
                                <select id="rescheduleTime" required>
                                    <option value="">Select time...</option>
                                    <option value="08:00">08:00 AM</option>
                                    <option value="09:00">09:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="13:00">01:00 PM</option>
                                    <option value="14:00">02:00 PM</option>
                                    <option value="15:00">03:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                    <option value="17:00">05:00 PM</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="rescheduleNotes">Additional Notes</label>
                                <textarea id="rescheduleNotes" rows="3" placeholder="Any additional notes for the reschedule...">${booking.clientNotes || ''}</textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="userProfile.closeRescheduleModal()">Cancel</button>
                                <button type="submit" class="btn-primary">Reschedule Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Set minimum date to today
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 14);
        
        const dateInput = document.getElementById('rescheduleDate');
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];

        // Set current booking time as default
        const timeSelect = document.getElementById('rescheduleTime');
        if (booking.selectedTime) {
            timeSelect.value = booking.selectedTime;
        }

        // Handle form submission
        const form = document.getElementById('rescheduleForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReschedule(booking._id);
        });

        // Show modal
        document.querySelector('.reschedule-modal').style.display = 'flex';
    }

    closeRescheduleModal() {
        const modal = document.querySelector('.reschedule-modal');
        if (modal) {
            modal.remove();
        }
    }

    async submitReschedule(bookingId) {
        const form = document.getElementById('rescheduleForm');
        const formData = new FormData(form);

        const rescheduleData = {
            appointmentDate: formData.get('rescheduleDate'),
            selectedTime: formData.get('rescheduleTime'),
            clientNotes: formData.get('rescheduleNotes')
        };

        try {
            const response = await fetch(`${this.API_BASE_URL}/bookings/${bookingId}/reschedule`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rescheduleData)
            });

            if (response.ok) {
                this.showNotification('Booking rescheduled successfully! It is now pending admin approval.', 'success');
                this.closeRescheduleModal();
                await this.loadBookingHistory(); // Refresh the list
            } else {
                const errorData = await response.json();
                this.showNotification(errorData.message || 'Failed to reschedule booking', 'error');
            }
        } catch (error) {
            console.error('Error rescheduling booking:', error);
            this.showNotification('Error rescheduling booking', 'error');
        }
    }

    showBookingDetails(booking) {
        // Remove any existing booking details modal
        const existingModal = document.querySelector('.booking-details-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create a modal to show booking details
        const detailsHTML = `
            <div class="booking-details-modal">
                <div class="booking-details-container">
                    <div class="booking-details-header">
                        <h3>Booking Details</h3>
                        <button class="close-btn" onclick="closeBookingDetailsModal()">&times;</button>
                    </div>
                    <div class="booking-details-content">
                        <p><strong>Booking ID:</strong> ${booking._id ? booking._id.slice(-8).toUpperCase() : 'N/A'}</p>
                        <p><strong>Service:</strong> ${booking.service || 'N/A'}</p>
                        <p><strong>Stylist:</strong> ${booking.selectedEmployee || 'Not assigned'}</p>
                        <p><strong>Date:</strong> ${this.formatDate(booking.appointmentDate)}</p>
                        <p><strong>Time:</strong> ${booking.selectedTime || 'N/A'}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${booking.status || 'pending'}">${booking.status || 'Pending'}</span></p>
                        <p><strong>Price:</strong> ₱${booking.totalAmount || 'N/A'}</p>
                        <p><strong>Notes:</strong> ${booking.clientNotes || 'No special requests'}</p>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', detailsHTML);

        // Add click outside to close functionality
        const modal = document.querySelector('.booking-details-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBookingDetailsModal();
            }
        });

        // Add keyboard support (Escape key)
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeBookingDetailsModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize user profile when page loads
let userProfile;
document.addEventListener('DOMContentLoaded', () => {
    userProfile = new UserProfile();
    // Make it globally available
    window.userProfile = userProfile;
});

// Global function for closing history modal
function closeHistoryModal() {
    if (window.userProfile) {
        window.userProfile.closeHistoryModal();
    } else if (userProfile) {
        userProfile.closeHistoryModal();
    } else {
        // Fallback: directly close the modal
        const modal = document.getElementById('history-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
}

// Global function for closing booking details modal
function closeBookingDetailsModal() {
    const modal = document.querySelector('.booking-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Global functions for sign out modal interactions
function closeSignoutModal() {
    if (window.userProfile) {
        window.userProfile.closeSignoutModal();
    }
}

function confirmSignOut() {
    if (window.userProfile) {
        window.userProfile.confirmSignOut();
    }
} 