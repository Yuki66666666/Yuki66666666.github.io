const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 將 sendEmail 函數移到全局作用域
function sendEmail(event) {
    event.preventDefault();
    const senderEmail = document.getElementById('sender-email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // 使用 mailto 協議，但添加更多郵件資訊
    const mailtoLink = `mailto:ericyu32.ee10@nycu.edu.tw?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('From: ' + senderEmail + '\n\n' + message)}`;
    
    // 開啟默認郵件客戶端
    window.location.href = mailtoLink;
    
    // 清空表單
    document.getElementById('sender-email').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('message').value = '';
    
    // 關閉模態框
    setTimeout(() => {
        closeModal();
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    // 添加网格项目点击事件
    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showModal(section);
        });
    });

    // 关闭按钮功能
    document.querySelector('.close').addEventListener('click', function() {
        closeModal();
    });

    // 點擊模態框外部關閉
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('contentModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Contact Me 按鈕事件
    document.querySelector('.book-button').addEventListener('click', function(e) {
        e.preventDefault();
        const modal = document.getElementById('contentModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <h3>Contact Me</h3>
            <form class="contact-form" onsubmit="sendEmail(event)">
                <input type="email" id="sender-email" placeholder="Your Email" required>
                <input type="text" id="subject" placeholder="Subject" required>
                <textarea id="message" placeholder="Your Message" required></textarea>
                <div class="form-buttons">
                    <button type="submit">Send Message</button>
                    <span class="or-divider">or</span>
                    <a href="https://www.linkedin.com/in/%E6%A3%8B%E7%BF%94-%E6%B8%B8-a22908273" target="_blank" class="social-icon">
                        <i class="fab fa-linkedin"></i>
                    </a>
                </div>
            </form>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // 修改導航點擊事件
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            if (targetId === 'home') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // 修改 View My Work 按鈕的功能
    document.querySelector('.cta-button').addEventListener('click', function() {
        const modal = document.getElementById('contentModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <h2>Some of My Other Side Projects</h2>
            <div class="projects-grid">
                <div class="project-card">
                    <h3>Line-following-obstacle-avoiding-car</h3>
                    <div class="pdf-viewer">
                        <div class="pdf-controls">
                            <button id="prev-car">Previous</button>
                            <span>Page: <span id="page-num-car">1</span> / <span id="page-count-car">1</span></span>
                            <button id="next-car">Next</button>
                        </div>
                        <canvas id="pdf-render-car"></canvas>
                    </div>
                    <div class="link-container">
                        <a href="https://youtu.be/PghSKBrntiM" target="_blank" class="project-link">Watch Demo Video</a>
                    </div>
                </div>
                <div class="project-card">
                    <h3>stm32f407-embedded-monitor-game</h3>
                    <div class="link-container">
                        <a href="https://youtu.be/D2WXBB-nEds" target="_blank" class="project-link">Watch Demo Video</a>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // 初始化 PDF
        setTimeout(() => {
            initPDF('self_driving_car.pdf', 'pdf-render-car', 'page-num-car', 'page-count-car', 'prev-car', 'next-car');
        }, 100);
    });
});

function showModal(section) {
    const modal = document.getElementById('contentModal');
    const modalBody = modal.querySelector('.modal-body');
    
    // 根据不同部分显示不同内容
    const content = getContentForSection(section);
    modalBody.innerHTML = content;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // 如果是需要显示 PDF 的部分，初始化 PDF
    if (section === 'industry-analysis') {
        initPDF('value.pdf', 'pdf-render', 'page-num', 'page-count', 'prev', 'next');
    } else if (section === 'ml-project') {
        initPDF('Research.pdf', 'pdf-render-research', 'page-num-research', 'page-count-research', 'prev-research', 'next-research');
    }
}

function closeModal() {
    const modal = document.getElementById('contentModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 修改 PDF 初始化函數，使其更通用
function initPDF(pdfPath, canvasId, pageNumId, pageCountId, prevBtnId, nextBtnId) {
    let pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 1.5;

    pdfjsLib.getDocument(pdfPath).promise.then(function(pdf) {
        pdfDoc = pdf;
        document.getElementById(pageCountId).textContent = pdf.numPages;
        
        // 渲染第一頁
        renderPage(pageNum);

        // 添加按鈕事件監聽器
        document.getElementById(prevBtnId).addEventListener('click', onPrevPage);
        document.getElementById(nextBtnId).addEventListener('click', onNextPage);
    });

    function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function(page) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            const viewport = page.getViewport({scale: scale});

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            page.render(renderContext).promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });

            document.getElementById(pageNumId).textContent = num;
        });
    }

    function onPrevPage() {
        if (pageNum <= 1) return;
        pageNum--;
        renderPage(pageNum);
    }

    function onNextPage() {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        renderPage(pageNum);
    }
}

function getContentForSection(section) {
    const contents = {
        'ai-software-engineer': `
            <h3>AI Robotic Software Engineering Intern (startup team)</h3>
            <p>Sep. 2023 – Jun 2024</p>
            <p>ITRI (Industrial Technology Research Institute)</p>
            <p>In a startup team in ITRI, aiming to finish some industrial work by automation. Mainly in charge of image processing and integrating manufacturing functions like welding into different brand of robotic arm.</p>
            <p>Entrepreneurship Potential Award by Taiwan's Ministry of Economic Affairs – 1st place (awarded 1 million NT dollars)</p>
            <div class="image-container">
                <img src="./images/itri.jpg" alt="ITRI Experience">
            </div>
        `,
        'memory-fae': `
            <h3>Memory FAE intern (SSD team)</h3>
            <p>Jun. 2024 – Aug 2024</p>
            <p>Samsung electronics</p>
            <p>Deal with technical problems from our customers (American server/computer company). As a summer vacation intern, I'm mainly learning about server and SSD structure, pcie architecture, and technical analysis method.</p>
            <div class="image-container">
                <img src="./images/samsung.jpg" alt="Samsung Experience">
            </div>
        `,
        'yef-representative': `
            <h3>2023 YEF Representative</h3>
            <p>Jan. 2023 – Jul 2023</p>
            <p>In this startup mock competition, I learned about how to develop an idea to business implementation, became one of the nine outstanding participants in YEF (Epoch School Future Entrepreneurs) thus got a free trip to Silicon Valley, visiting a bunch of outstanding enterprises.</p>
            <div class="image-container">
                <img src="./images/yef.jpg" alt="YEF Experience">
            </div>
            <div class="link-container">
                <a href="https://medium.com/%E4%BB%98%E8%AB%B8%E8%A1%8C%E5%8B%95%E7%9A%84%E5%A4%A2%E6%83%B3%E5%AE%B6/take-the-risk-%E9%9B%BB%E6%A9%9F%E4%BA%BA%E7%9A%84%E5%95%86%E6%A5%AD%E7%9F%A5%E8%AD%98%E5%95%9F%E8%92%99%E4%B9%8B%E6%97%85-e7740ea94cb6" target="_blank" class="project-link">Read My Story</a>
            </div>
        `,
        'atcc': `
            <h3>ATCC 20th - National Third Place</h3>
            <p>Feb. 2022 – Jul. 2022</p>
            <p>Helping TSMC build connection between enterprise and college. By holding tea party and Installation art, we promoted femininity and succeed to become the representative team of TSMC, got the third place at last (from over thousands of teams around Taiwan).</p>
            <div class="image-container">
                <img src="./images/atcc.jpg" alt="ATCC Experience">
            </div>
            <div class="link-container">
                <a href="https://atcc.co/%E6%AD%B7%E5%B1%86%E7%AB%B6%E8%B3%BD%E5%9B%9E%E9%A1%A7-20th-atcc/" target="_blank" class="project-link">View Competition Details</a>
            </div>
        `,
        'student-ambassador': `
            <h3>Student Ambassador of NYCU</h3>
            <p>Sep. 2021 – present</p>
            <p>Responsible for receiving guests at NYCU on special occasions.</p>
            <div class="image-container">
                <img src="./images/student_ambassador.jpg" alt="Student Ambassador Experience">
            </div>
        `,
        'student-council': `
            <h3>NYCU Student Council (Department of Welfare)</h3>
            <p>Sep. 2023 – Jan 2023</p>
            <p>Holding some events such as meetups and podcasts for the welfare of NYCU students.</p>
        `,
        'industry-analysis': `
            <h3>Industry Analysis Study Group (NYCU)</h3>
            <p>Jan. 2023 – Jul 2023</p>
            <p>Learned Enhance industry analysis knowledge and shared my learnings during classes held by investment club.</p>
            <div class="pdf-viewer">
                <div class="pdf-controls">
                    <button id="prev">Previous</button>
                    <span>Page: <span id="page-num">1</span> / <span id="page-count">1</span></span>
                    <button id="next">Next</button>
                </div>
                <canvas id="pdf-render"></canvas>
            </div>
        `,
        'ml-project': `
            <h3>Machine Learning Project</h3>
            <p>Sep. 2023 – Jul 2024</p>
            <p>Have a paper (2nd author) about Deep Learning (fine-grained ood), inclusive of a new architecture baseline and present a new dataset.</p>
            <canvas id="pdf-render-research"></canvas>
        `,
        'academic-poster': `
            <h3>Academic Poster Competition 3rd place</h3>
            <p>Jul. 2021 – Sep 2022</p>
            <p>Just learned Adobe illustrator myself so I decided to reorganize our ATCC's project into a poster and a proposal.</p>
            <div class="image-container">
                <img src="./images/academic_poster.jpg" alt="Academic Poster">
            </div>
        `
    };
    
    return contents[section] || '';
}