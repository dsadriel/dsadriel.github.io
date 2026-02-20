function initImageModal(imagesContainer, images, getDidDrag) {
    let currentIndex = 0;

    const modal = document.createElement('div');
    modal.className = 'img-modal';
    const dotsHtml = images.length > 1
        ? `<div class="img-modal-dots">${images.map((_, i) => `<span class="img-modal-dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>`
        : '';
    modal.innerHTML = `
        <div class="img-modal-dialog">
            <button class="img-modal-close" aria-label="Close">✕</button>
            <div class="img-modal-content">
                <button class="img-modal-btn img-modal-prev" aria-label="Previous">‹</button>
                <img class="img-modal-img" src="" alt="Screenshot preview">
                <button class="img-modal-btn img-modal-next" aria-label="Next">›</button>
            </div>
            ${dotsHtml}
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.img-modal-img');
    const prevBtn = modal.querySelector('.img-modal-prev');
    const nextBtn = modal.querySelector('.img-modal-next');
    const closeBtn = modal.querySelector('.img-modal-close');
    const dots = modal.querySelectorAll('.img-modal-dot');

    function updateDots() {
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function openModal(index) {
        currentIndex = index;
        modalImg.src = images[currentIndex];
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        updateNavButtons();
        updateDots();
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;
        modalImg.src = images[currentIndex];
        updateDots();
    }

    function updateNavButtons() {
        prevBtn.style.display = images.length <= 1 ? 'none' : '';
        nextBtn.style.display = images.length <= 1 ? 'none' : '';
    }

    imagesContainer.querySelectorAll('img').forEach((img, idx) => {
        img.addEventListener('click', () => {
            if (!getDidDrag()) openModal(idx);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
    nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

    // Click on backdrop closes modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('open')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    // Touch swipe support
    let touchStartX = 0;
    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    modal.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) > 40) {
            if (dx < 0) showImage(currentIndex + 1);
            else showImage(currentIndex - 1);
        }
    }, { passive: true });
}
