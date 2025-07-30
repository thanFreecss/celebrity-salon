document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a nav link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !navMenu.contains(event.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    const promoNav = document.querySelector('nav ul li:nth-child(2) a');
    const homeNav = document.querySelector('nav ul li:first-child a');
    const promoSection = document.getElementById('promo-section');
    const main = document.querySelector('main');
    const gallery = document.querySelector('.gallery-section');
    const footer = document.querySelector('footer');
    const servicesNav = document.querySelector('nav ul li:nth-child(3) a');
    const servicesSection = document.getElementById('services-section');
    const contactNav = document.querySelector('nav ul li:nth-child(4) a');
    const contactSection = document.getElementById('contact-section');
    const seasonalNav = document.querySelector('nav ul li:nth-child(5) a');
    const seasonalSection = document.getElementById('seasonal-section');

    function setHomeBg(active) {
        if (active) {
            main.classList.add('home-bg');
        } else {
            main.classList.remove('home-bg');
        }
    }

    seasonalNav.addEventListener('click', function(e) {
        e.preventDefault();
        promoSection.style.display = 'none';
        main.style.display = 'none';
        gallery.style.display = 'none';
        servicesSection.style.display = 'none';
        contactSection.style.display = 'none';
        seasonalSection.style.display = '';
        setHomeBg(false);
    });

    contactNav.addEventListener('click', function(e) {
        e.preventDefault();
        promoSection.style.display = 'none';
        main.style.display = 'none';
        gallery.style.display = 'none';
        servicesSection.style.display = 'none';
        seasonalSection.style.display = 'none';
        contactSection.style.display = '';
        setHomeBg(false);
    });

    // Update other navs to hide seasonal section
    homeNav.addEventListener('click', function(e) {
        e.preventDefault();
        promoSection.style.display = 'none';
        main.style.display = '';
        gallery.style.display = '';
        servicesSection.style.display = 'none';
        contactSection.style.display = 'none';
        seasonalSection.style.display = 'none';
        setHomeBg(true);
    });
    promoNav.addEventListener('click', function(e) {
        e.preventDefault();
        promoSection.style.display = '';
        main.style.display = 'none';
        gallery.style.display = 'none';
        servicesSection.style.display = 'none';
        contactSection.style.display = 'none';
        seasonalSection.style.display = 'none';
        setHomeBg(false);
    });
    servicesNav.addEventListener('click', function(e) {
        e.preventDefault();
        promoSection.style.display = 'none';
        main.style.display = 'none';
        gallery.style.display = 'none';
        servicesSection.style.display = '';
        contactSection.style.display = 'none';
        seasonalSection.style.display = 'none';
        setHomeBg(false);
    });

    // Promo slider logic
    const slides = document.querySelectorAll('.promo-card');
    const prevBtn = document.querySelector('.promo-prev');
    const nextBtn = document.querySelector('.promo-next');
    const dots = document.querySelectorAll('.promo-dot');
    let currentSlide = 0;

    function showSlide(idx) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === idx);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === idx);
        });
        currentSlide = idx;
    }

    let autoSwipeInterval = null;
    function startAutoSwipe() {
        if (autoSwipeInterval) clearInterval(autoSwipeInterval);
        autoSwipeInterval = setInterval(() => {
            let idx = currentSlide + 1;
            if (idx >= slides.length) idx = 0;
            showSlide(idx);
        }, 3000);
    }

    // Start auto swipe on load
    startAutoSwipe();

    // Reset auto swipe on manual navigation
    prevBtn.addEventListener('click', function() {
        let idx = currentSlide - 1;
        if (idx < 0) idx = slides.length - 1;
        showSlide(idx);
        startAutoSwipe();
    });
    nextBtn.addEventListener('click', function() {
        let idx = currentSlide + 1;
        if (idx >= slides.length) idx = 0;
        showSlide(idx);
        startAutoSwipe();
    });
    dots.forEach((dot, i) => {
        dot.addEventListener('click', function() {
            showSlide(i);
            startAutoSwipe();
        });
    });

    // Seasonal haircare guide functionality
    const seasonTabs = document.querySelectorAll('.season-tab');
    const seasonInfos = document.querySelectorAll('.season-info');
    
    seasonTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const season = this.getAttribute('data-season');
            
            // Update active tab
            seasonTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            seasonInfos.forEach(info => {
                info.classList.remove('active');
                if (info.getAttribute('data-season') === season) {
                    info.classList.add('active');
                }
            });
        });
    });

    // Treatment slider functionality
    const treatmentCards = document.querySelectorAll('.treatment-card');
    const treatmentPrev = document.querySelector('.treatment-prev');
    const treatmentNext = document.querySelector('.treatment-next');
    const treatmentDots = document.querySelectorAll('.treatment-dots li');
    let currentTreatment = 0;

    function showTreatment(idx) {
        treatmentCards.forEach((card, i) => {
            card.classList.toggle('active', i === idx);
        });
        treatmentDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === idx);
        });
        currentTreatment = idx;
    }

    let treatmentAutoInterval = null;
    function startTreatmentAuto() {
        if (treatmentAutoInterval) clearInterval(treatmentAutoInterval);
        treatmentAutoInterval = setInterval(() => {
            let idx = currentTreatment + 1;
            if (idx >= treatmentCards.length) idx = 0;
            showTreatment(idx);
        }, 4000);
    }

    // Start auto treatment slider
    startTreatmentAuto();

    // Reset auto treatment on manual navigation
    treatmentPrev.addEventListener('click', function() {
        let idx = currentTreatment - 1;
        if (idx < 0) idx = treatmentCards.length - 1;
        showTreatment(idx);
        startTreatmentAuto();
    });
    
    treatmentNext.addEventListener('click', function() {
        let idx = currentTreatment + 1;
        if (idx >= treatmentCards.length) idx = 0;
        showTreatment(idx);
        startTreatmentAuto();
    });
    
    treatmentDots.forEach((dot, i) => {
        dot.addEventListener('click', function() {
            showTreatment(i);
            startTreatmentAuto();
        });
    });

    // Service category filtering
    const categoryBtns = document.querySelectorAll('.category-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-category');
            serviceCards.forEach(card => {
                if (cat === 'all' || card.getAttribute('data-category') === cat) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Initial state: show home background
    setHomeBg(true);

    // Booking Modal Functionality
    const serviceData = {
        'manicure': { price: '₱150', duration: '30 minutes', description: 'Basic manicure service' },
        'pedicure': { price: '₱199', duration: '45 minutes', description: 'Basic pedicure service' },
        'footspa': { price: '₱499', duration: '60 minutes', description: 'Relaxing foot spa treatment' },
        'manicure-gel': { price: '₱499', duration: '45 minutes', description: 'Manicure with gel polish' },
        'manipedi-gel': { price: '₱849', duration: '90 minutes', description: 'Manicure and pedicure with gel polish' },
        'pedi-gel-footspa': { price: '₱849', duration: '90 minutes', description: 'Pedicure with gel polish and foot spa' },
        'pedi-gel': { price: '₱499', duration: '45 minutes', description: 'Pedicure with gel polish' },
        'soft-gel-extension': { price: '₱999', duration: '60 minutes', description: 'Soft gel extension with gel polish' },
        'foot-massage': { price: '₱150', duration: '30 minutes', description: 'Foot massage service' },
        'hand-massage': { price: '₱150', duration: '30 minutes', description: 'Hand massage service' },
        'traditional-hamu': { price: '₱1000', duration: '120 minutes', description: 'Traditional hair and makeup' },
        'glam-hamu': { price: '₱1500', duration: '150 minutes', description: 'Glam hair and makeup' },
        'airbrush-hamu': { price: '₱2000', duration: '180 minutes', description: 'Air brush, hair and makeup' },
        'classic-lashes': { price: '₱499', duration: '90 minutes', description: 'Classic lash extension' },
        'cat-eye-lashes': { price: '₱599', duration: '120 minutes', description: 'Cat eye lash extension' },
        'wispy-lashes': { price: '₱599', duration: '120 minutes', description: 'Wispy lash extension' },
        'volume-lashes': { price: '₱699', duration: '150 minutes', description: 'Volume lash extension' },
        'lash-lift': { price: '₱399', duration: '60 minutes', description: 'Lash lift treatment' },
        'lash-removal': { price: '₱100', duration: '30 minutes', description: 'Lash removal service' },
        'brow-shave': { price: '₱50', duration: '15 minutes', description: 'Brow shaving service' },
        'brow-tint': { price: '₱600', duration: '45 minutes', description: 'Brow tint and lash tint' }
    };

    // Set minimum date to today
    const appointmentDateInput = document.getElementById('appointmentDate');
    if (appointmentDateInput) {
        appointmentDateInput.min = new Date().toISOString().split('T')[0];
    }

    // Service selection handler
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            const serviceDetails = document.getElementById('serviceDetails');
            const selectedService = this.value;
            
            if (selectedService && serviceData[selectedService]) {
                const data = serviceData[selectedService];
                document.getElementById('estimatedPrice').textContent = data.price;
                document.getElementById('estimatedDuration').textContent = data.duration;
                document.getElementById('serviceDescription').textContent = data.description;
                serviceDetails.style.display = 'block';
                
                // TODO: Backend Integration - Filter employees based on selected service
                // This will be implemented in the backend to show only employees
                // who are qualified for the selected service
                updateAvailableEmployees(selectedService);
            } else {
                serviceDetails.style.display = 'none';
            }
        });
    }

    // Function to update available employees based on selected service
    async function updateAvailableEmployees(selectedService) {
        const employeeSelect = document.getElementById('selectedEmployee');
        
        if (!selectedService) {
            // Clear employee options if no service is selected
            employeeSelect.innerHTML = '<option value="">Select an employee</option>';
            return;
        }
        
        try {
            console.log('Fetching employees for service:', selectedService);
            
            // Call the backend API to get employees for the selected service
            const apiUrl = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL + `/employees/service/${selectedService}` : `http://localhost:5000/api/employees/service/${selectedService}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                const employees = data.data;
                console.log(`Found ${employees.length} employees for service: ${selectedService}`);
                
                // Clear existing options
                employeeSelect.innerHTML = '<option value="">Select an employee</option>';
                
                if (employees.length === 0) {
                    // No employees available for this service
                    employeeSelect.innerHTML = '<option value="">No employees available for this service</option>';
                    employeeSelect.disabled = true;
                } else {
                    // Add employee options
                    employees.forEach(employee => {
                        const option = document.createElement('option');
                        option.value = employee._id;
                        
                        // Show indication if employee has no specialties
                        const specialtyIndicator = employee.specialties.length === 0 ? ' (Available for all services)' : '';
                        option.textContent = `${employee.name} (${employee.position})${specialtyIndicator}`;
                        
                        employeeSelect.appendChild(option);
                    });
                    employeeSelect.disabled = false;
                }
            } else {
                console.error('Failed to fetch employees:', data.message);
                employeeSelect.innerHTML = '<option value="">Error loading employees</option>';
                employeeSelect.disabled = true;
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            employeeSelect.innerHTML = '<option value="">Error loading employees</option>';
            employeeSelect.disabled = true;
        }
    }

    // Time slot selection
    const timeChips = document.querySelectorAll('.time-chip');
    timeChips.forEach(chip => {
        chip.addEventListener('click', function() {
            timeChips.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const selectedTimeChip = document.querySelector('.time-chip.selected');
            const selectedTime = selectedTimeChip ? selectedTimeChip.dataset.time : null;
            
            const bookingData = {
                fullName: formData.get('fullName'),
                mobileNumber: formData.get('mobileNumber'),
                email: formData.get('email'),
                service: formData.get('service'),
                selectedEmployee: formData.get('selectedEmployee'),
                appointmentDate: formData.get('appointmentDate'),
                selectedTime: selectedTime,
                clientNotes: formData.get('clientNotes')
            };
            
            // Validate time selection
            if (!selectedTime) {
                alert('Please select a time slot');
                return;
            }
            
            // Validate required fields
            if (!bookingData.fullName || !bookingData.mobileNumber || !bookingData.email || !bookingData.service || !bookingData.appointmentDate) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Validate phone number format
            if (!/^[0-9]{11}$/.test(bookingData.mobileNumber)) {
                alert('Please enter a valid 11-digit phone number');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(bookingData.email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Validate appointment date (must be in the future)
            const appointmentDate = new Date(bookingData.appointmentDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (appointmentDate < today) {
                alert('Please select a future date for your appointment');
                return;
            }
            
            try {
                // Debug: Log the booking data being sent
                console.log('Sending booking data:', bookingData);
                
                // Check if user is logged in to include auth token
                const userToken = localStorage.getItem('userToken');
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                // Add authorization header if user is logged in
                if (userToken) {
                    headers['Authorization'] = `Bearer ${userToken}`;
                }
                
                // Send booking data to backend API
                const apiUrl = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL + '/bookings' : 'http://localhost:5000/api/bookings';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(bookingData)
                });
                
                const result = await response.json();
                console.log('Server response:', result);
                
                if (result.success) {
                    // Show success message
                    let successMessage = 'Booking submitted successfully!\n\nName: ' + bookingData.fullName + 
                          '\nMobile: ' + bookingData.mobileNumber + 
                          '\nEmail: ' + bookingData.email + 
                          '\nService: ' + bookingData.service + 
                          '\nEmployee: ' + (bookingData.selectedEmployee || 'Not selected') + 
                          '\nDate: ' + bookingData.appointmentDate + 
                          '\nTime: ' + bookingData.selectedTime;
                    
                    // Add notes to success message if provided
                    if (bookingData.clientNotes && bookingData.clientNotes.trim()) {
                        successMessage += '\n\nSpecial Requests: ' + bookingData.clientNotes;
                    }
                    
                    alert(successMessage);
                    
                    // Close modal
                    closeBookingModal();
                    
                    // Show notification if user is logged in
                    if (window.userProfile) {
                        window.userProfile.showNotification('Booking created successfully! You can view it in your booking history.', 'success');
                        // Refresh booking history for logged-in users
                        window.userProfile.loadBookingHistory();
                    }
                } else {
                    // Show error message from backend
                    let errorMessage = 'Booking failed: ';
                    if (result.errors && result.errors.length > 0) {
                        errorMessage += result.errors.map(error => error.msg).join(', ');
                    } else {
                        errorMessage += result.message || 'Unknown error';
                    }
                    alert(errorMessage);
                }
            } catch (error) {
                console.error('Error submitting booking:', error);
                alert('Error submitting booking. Please try again.');
            }
        });
    }

    // Function to auto-fill user data in booking form
    function autoFillUserData() {
        // Check if user is logged in
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                const fullNameInput = document.getElementById('fullName');
                const mobileNumberInput = document.getElementById('mobileNumber');
                const emailInput = document.getElementById('email');
                
                // Auto-fill the form fields with user data
                // Use the correct field names from the user data
                if (fullNameInput && user.name) {
                    fullNameInput.value = user.name;
                    fullNameInput.readOnly = false; // Make it editable
                    fullNameInput.style.backgroundColor = '#fff'; // Normal background
                    fullNameInput.style.cursor = 'text'; // Normal cursor
                    fullNameInput.title = 'This field is auto-filled from your account. You can edit it if needed.';
                }
                if (mobileNumberInput && user.phone) {
                    mobileNumberInput.value = user.phone;
                    mobileNumberInput.readOnly = false; // Make it editable
                    mobileNumberInput.style.backgroundColor = '#fff'; // Normal background
                    mobileNumberInput.style.cursor = 'text'; // Normal cursor
                    mobileNumberInput.title = 'This field is auto-filled from your account. You can edit it if needed.';
                }
                if (emailInput && user.email) {
                    emailInput.value = user.email;
                    emailInput.readOnly = false; // Make it editable
                    emailInput.style.backgroundColor = '#fff'; // Normal background
                    emailInput.style.cursor = 'text'; // Normal cursor
                    emailInput.title = 'This field is auto-filled from your account. You can edit it if needed.';
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }

    // Modal functions
    window.openBookingModal = function() {
        document.getElementById('bookingModal').classList.add('show');
        // Auto-fill user data when modal opens
        autoFillUserData();
    };

    window.closeBookingModal = function() {
        document.getElementById('bookingModal').classList.remove('show');
        // Clear the form when modal is closed
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.reset();
            // Reset fields to normal state
            const fullNameInput = document.getElementById('fullName');
            const mobileNumberInput = document.getElementById('mobileNumber');
            const emailInput = document.getElementById('email');
            
            if (fullNameInput) {
                fullNameInput.readOnly = false;
                fullNameInput.style.backgroundColor = '';
                fullNameInput.style.cursor = '';
                fullNameInput.title = '';
            }
            if (mobileNumberInput) {
                mobileNumberInput.readOnly = false;
                mobileNumberInput.style.backgroundColor = '';
                mobileNumberInput.style.cursor = '';
                mobileNumberInput.title = '';
            }
            if (emailInput) {
                emailInput.readOnly = false;
                emailInput.style.backgroundColor = '';
                emailInput.style.cursor = '';
                emailInput.title = '';
            }
        }
    };

    // Function to select service and open booking modal
    window.selectServiceAndBook = function(serviceValue) {
        // Set the selected service in the booking form
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
            serviceSelect.value = serviceValue;
            
            // Trigger the change event to show service details
            const event = new Event('change');
            serviceSelect.dispatchEvent(event);
        }
        
        // Open the booking modal and auto-fill user data
        openBookingModal();
    };

    // Close modal when clicking outside
    const bookingModal = document.getElementById('bookingModal');
    if (bookingModal) {
        bookingModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeBookingModal();
            }
        });
    }

    // Global signOut function
    window.signOut = function() {
        if (window.userProfile) {
            window.userProfile.showSignOutConfirm();
        } else {
            // Fallback if userProfile is not available
            if (confirm('Are you sure you want to sign out?')) {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');
                window.location.reload();
            }
        }
    };

    // User dropdown functionality
    const userAvatar = document.getElementById('user-avatar');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (userAvatar && dropdownMenu) {
        // Toggle dropdown when clicking the avatar
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userAvatar.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });

        // Close dropdown when clicking on dropdown items
        dropdownMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Profile settings function
    window.openProfileSettings = function() {
        // Open the profile settings modal
        openProfileModal();
    };

    // History function (replaces the old history button)
    window.openHistoryModal = function() {
        if (window.userProfile) {
            window.userProfile.openHistoryModal();
        } else {
            alert('Please log in to view your booking history.');
        }
    };

    // Profile Modal Functions
    window.openProfileModal = function() {
        const modal = document.getElementById('profile-modal');
        modal.classList.add('show');
        loadUserProfile();
    };

    window.closeProfileModal = function() {
        const modal = document.getElementById('profile-modal');
        modal.classList.remove('show');
    };

    function loadUserProfile() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                
                // Update header
                document.getElementById('profile-name').textContent = user.name || 'User';
                document.getElementById('profile-email').textContent = user.email || 'No email';
                
                // Fill form fields
                document.getElementById('profile-name-input').value = user.name || '';
                document.getElementById('profile-phone-input').value = user.phone || '';
                document.getElementById('profile-email-input').value = user.email || '';
                
            } catch (error) {
                console.error('Error parsing user data:', error);
                showNotification('Error loading profile data', 'error');
            }
        } else {
            showNotification('No user data found. Please log in.', 'warning');
            setTimeout(() => {
                closeProfileModal();
            }, 2000);
        }
    }

    // Handle profile form submission
    document.getElementById('profile-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form data
        const name = document.getElementById('profile-name-input').value.trim();
        const phone = document.getElementById('profile-phone-input').value.trim();
        const email = document.getElementById('profile-email-input').value.trim();
        
        if (!name || !phone || !email) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!/^[0-9]{11}$/.test(phone)) {
            showNotification('Please enter a valid 11-digit phone number', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        const saveBtn = document.getElementById('save-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> Saving...';
        saveBtn.disabled = true;

        try {
            const formData = {
                name: document.getElementById('profile-name-input').value,
                phone: document.getElementById('profile-phone-input').value,
                email: document.getElementById('profile-email-input').value
            };

            const token = localStorage.getItem('userToken');
            const API_BASE_URL = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:5000/api';

            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update localStorage with new user data
                const updatedUserData = {
                    ...JSON.parse(localStorage.getItem('userData')),
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email
                };
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
                
                // Update header
                document.getElementById('profile-name').textContent = formData.name;
                document.getElementById('profile-email').textContent = formData.email;
                
                showNotification('Profile updated successfully!', 'success');
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Error updating profile. Please try again.', 'error');
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    });

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Close profile modal when clicking outside
    const profileModal = document.getElementById('profile-modal');
    if (profileModal) {
        profileModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProfileModal();
            }
        });
    }

    // Add keyboard support for closing profile modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const profileModal = document.getElementById('profile-modal');
            if (profileModal && profileModal.classList.contains('show')) {
                closeProfileModal();
            }
        }
    });

    // Phone number validation for all phone inputs
    function setupPhoneValidation() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        
        phoneInputs.forEach(input => {
            // Only allow numbers
            input.addEventListener('input', function(e) {
                // Remove any non-numeric characters
                this.value = this.value.replace(/[^0-9]/g, '');
                
                // Limit to 11 digits
                if (this.value.length > 11) {
                    this.value = this.value.slice(0, 11);
                }
            });

            // Prevent non-numeric key presses
            input.addEventListener('keypress', function(e) {
                const charCode = e.which ? e.which : e.keyCode;
                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                    e.preventDefault();
                }
            });

            // Validate on blur
            input.addEventListener('blur', function() {
                if (this.value.length > 0 && this.value.length !== 11) {
                    this.setCustomValidity('Phone number must be exactly 11 digits');
                } else {
                    this.setCustomValidity('');
                }
            });
        });
    }

    // Initialize phone validation when page loads
    setupPhoneValidation();

    // Re-initialize phone validation when profile modal opens
    const originalOpenProfileModal = window.openProfileModal;
    window.openProfileModal = function() {
        originalOpenProfileModal();
        setTimeout(setupPhoneValidation, 100); // Small delay to ensure modal is rendered
    };
});
