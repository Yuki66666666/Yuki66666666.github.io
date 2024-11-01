document.addEventListener('DOMContentLoaded', function() {
    // Navigation links functionality
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            if(targetId === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if(targetId === 'contact') {
                openContactForm();
            } else {
                const targetSection = document.getElementById(targetId);
                if(targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Projects button functionality
    document.querySelector('.cta-button').addEventListener('click', function() {
        const experienceSection = document.getElementById('experience');
        experienceSection.scrollIntoView({ behavior: 'smooth' });
    });

    // 添加展開/收起功能
    document.querySelectorAll('.section-title').forEach(title => {
        title.addEventListener('click', function() {
            // 切換當前部分的狀態
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.classList.toggle('active');

            // 關閉其他已打開的部分
            document.querySelectorAll('.section-title.active').forEach(otherTitle => {
                if (otherTitle !== this) {
                    otherTitle.classList.remove('active');
                    otherTitle.nextElementSibling.classList.remove('active');
                }
            });
        });
    });
});

// Contact form functionality
function openContactForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Contact Me</h2>
            <form id="bookingForm">
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Email" required>
                <textarea placeholder="Message" required></textarea>
                <button type="submit">Send Message</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const close = modal.querySelector('.close');
    close.onclick = function() {
        modal.remove();
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.remove();
        }
    }
} 