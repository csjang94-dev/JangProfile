// PDF Modal Functions
function openPdfModal(pdfFile, title) {
    const modal = document.getElementById('pdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    const modalTitle = document.getElementById('modalTitle');
    
    // Set PDF source and title
    pdfViewer.src = pdfFile;
    modalTitle.textContent = title;
    
    // Show modal
    modal.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    
    // Hide modal
    modal.classList.remove('active');
    
    // Clear PDF source
    pdfViewer.src = '';
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Close modal when clicking outside
document.getElementById('pdfModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closePdfModal();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePdfModal();
    }
});

// Prevent right-click and text selection to protect content
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IFRAME') {
        e.preventDefault();
        return false;
    }
});

// Disable text selection on PDF viewer
document.addEventListener('selectstart', function(e) {
    if (e.target.closest('.pdf-container')) {
        e.preventDefault();
        return false;
    }
});