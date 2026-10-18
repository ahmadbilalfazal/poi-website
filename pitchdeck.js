(() => {
    const slides = Array.from(document.querySelectorAll('.deck-slide'));
    const dotsContainer = document.querySelector('.deck-dots');
    const currentNumber = document.querySelector('[data-current-slide]');
    const currentTitle = document.querySelector('[data-current-title]');
    const totalNumber = document.querySelector('[data-total-slides]');
    const previousButton = document.querySelector('[data-prev-slide]');
    const nextButton = document.querySelector('[data-next-slide]');

    if (!slides.length || !dotsContainer || !previousButton || !nextButton) return;

    let currentIndex = -1;
    let updateQueued = false;
    const dots = slides.map((slide, index) => {
        const dot = document.createElement('button');
        dot.className = 'deck-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}: ${slide.dataset.title}`);
        dot.addEventListener('click', () => goTo(index));
        dotsContainer.append(dot);
        return dot;
    });

    totalNumber.textContent = String(slides.length).padStart(2, '0');

    function setCurrent(index) {
        if (index === currentIndex && currentNumber.textContent) return;
        currentIndex = index;
        currentNumber.textContent = String(index + 1).padStart(2, '0');
        currentTitle.textContent = slides[index].dataset.title;
        previousButton.disabled = index === 0;
        nextButton.disabled = index === slides.length - 1;
        dots.forEach((dot, dotIndex) => {
            if (dotIndex === index) dot.setAttribute('aria-current', 'step');
            else dot.removeAttribute('aria-current');
        });
    }

    function updateCurrent() {
        updateQueued = false;
        const marker = window.innerHeight * 0.42;
        let closestIndex = 0;
        let closestDistance = Infinity;

        slides.forEach((slide, index) => {
            const rect = slide.getBoundingClientRect();
            const distance = marker < rect.top ? rect.top - marker : marker > rect.bottom ? marker - rect.bottom : 0;
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        setCurrent(closestIndex);
    }

    function queueUpdate() {
        if (updateQueued) return;
        updateQueued = true;
        window.requestAnimationFrame(updateCurrent);
    }

    function goTo(index) {
        const boundedIndex = Math.max(0, Math.min(slides.length - 1, index));
        slides[boundedIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrent(boundedIndex);
    }

    previousButton.addEventListener('click', () => goTo(currentIndex - 1));
    nextButton.addEventListener('click', () => goTo(currentIndex + 1));
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate);
    window.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        if (event.key === 'ArrowRight' || event.key === 'PageDown') {
            event.preventDefault();
            goTo(currentIndex + 1);
        } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
            event.preventDefault();
            goTo(currentIndex - 1);
        }
    });

    setCurrent(0);
    queueUpdate();
})();
