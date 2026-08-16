document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching Logic
    const tabButtons = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior

            const targetTab = this.getAttribute('data-tab');
            
            // 1. Update Active State for Buttons
            tabButtons.forEach(btn => {
                if(btn.getAttribute('data-tab') === targetTab) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // 2. Show/Hide Content
            tabContents.forEach(content => {
                if(content.id === `content-${targetTab}`) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    });
});
