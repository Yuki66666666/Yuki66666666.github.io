const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5;

function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        const canvas = document.getElementById('pdf-render');
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

        document.getElementById('page-num').textContent = num;
    });
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// 加載 PDF
pdfjsLib.getDocument('value.pdf').promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum);

    document.getElementById('prev').addEventListener('click', onPrevPage);
    document.getElementById('next').addEventListener('click', onNextPage);
});

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
});

function showModal(section) {
    const modal = document.getElementById('contentModal');
    const modalBody = modal.querySelector('.modal-body');
    
    // 根据不同部分显示不同内容
    const content = getContentForSection(section);
    modalBody.innerHTML = content;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

function closeModal() {
    const modal = document.getElementById('contentModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function getContentForSection(section) {
    const contents = {
        'ml-project': `
            <h3>Machine Learning Project</h3>
            <p>Sep. 2023 – Jul 2024</p>
            <p>Have a paper (2nd author) about Deep Learning (fine-grained ood), inclusive of a new architecture baseline and present a new dataset.</p>
            <div class="pdf-viewer">
                <div class="pdf-controls">
                    <button id="prev-research">Previous</button>
                    <span>Page: <span id="page-num-research">1</span> / <span id="page-count-research">1</span></span>
                    <button id="next-research">Next</button>
                </div>
                <canvas id="pdf-render-research"></canvas>
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
        'yef-representative': `
            <h3>2023 YEF Representative</h3>
            <p>Jan. 2023 – Jul 2023</p>
            <p>In this startup mock competition, I learned about how to develop an idea to business implementation, became one of the nine outstanding participants in YEF (Epoch School Future Entrepreneurs) thus got a free trip to Silicon Valley, visiting a bunch of outstanding enterprises.</p>
            <div class="image-container">
                <img src="./images/yef.jpg" alt="YEF Experience">
            </div>
        `,
        'atcc': `
            <h3>ATCC 20th - National Third Place</h3>
            <p>Feb. 2022 – Jul. 2022</p>
            <p>Helping TSMC build connection between enterprise and college. By holding tea party and Installation art, we promoted femininity and succeed to become the representative team of TSMC, got the third place at last (from over thousands of teams around Taiwan).</p>
            <div class="image-container">
                <img src="./images/atcc.jpg" alt="ATCC Experience">
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
        'academic-poster': `
            <h3>Academic Poster Competition 3rd place</h3>
            <p>Jul. 2021 – Sep 2022</p>
            <p>Just learned Adobe illustrator myself so I decided to reorganize our ATCC's project into a poster and a proposal.</p>
            <div class="image-container">
                <img src="./images/academic_poster.jpg" alt="Academic Poster">
            </div>
        `
        // ... 其他內容保持不變 ...
    };
    
    const content = contents[section] || '';
    
    if (section === 'industry-analysis') {
        setTimeout(() => {
            pageNum = 1;
            
            const loadingTask = pdfjsLib.getDocument('value.pdf');
            loadingTask.promise.then(function(pdf) {
                pdfDoc = pdf;
                document.getElementById('page-count').textContent = pdf.numPages;
                
                renderPage(1);
                
                const prevButton = document.getElementById('prev');
                const nextButton = document.getElementById('next');
                
                prevButton.replaceWith(prevButton.cloneNode(true));
                nextButton.replaceWith(nextButton.cloneNode(true));
                
                document.getElementById('prev').addEventListener('click', onPrevPage);
                document.getElementById('next').addEventListener('click', onNextPage);
            }).catch(function(error) {
                console.error('Error loading PDF:', error);
                document.querySelector('.pdf-viewer').innerHTML += `<p style="color: red;">Error loading PDF: ${error.message}</p>`;
            });
        }, 100);
    }
    
    return content;
}

// 將 PDF 初始化邏輯封裝成函數
function initPDF() {
    pdfjsLib.getDocument('value.pdf').promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderPage(pageNum);

        document.getElementById('prev').addEventListener('click', onPrevPage);
        document.getElementById('next').addEventListener('click', onNextPage);
    });
} 