document.addEventListener('DOMContentLoaded', function() {
   
    let galleryCards = document.querySelectorAll('.gallery-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryGrid = document.querySelector('.gallery-grid');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {

            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            galleryCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const renameBtn = document.getElementById('rename-btn');
    const deleteBtn = document.getElementById('delete-btn');

    let currentCard = null;
    let currentImageIndex = 0;
    let visibleImages = [];

    deleteBtn.addEventListener('click', function() {
        if (!currentCard) return;
    
        lightboxCaption.innerHTML = `
            <p>Delete this image permanently?</p>
            <div class="confirm-delete">
                <button id="confirm-delete" class="action-btn delete-btn">Confirm Delete</button>
                <button id="cancel-delete" class="action-btn">Cancel</button>
            </div>
        `;
        
        document.getElementById('confirm-delete').addEventListener('click', function() {

            currentCard.remove();
            
            galleryCards = document.querySelectorAll('.gallery-card');
            
            closeFullImage();
            
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            filterImages(activeFilter);
        });
        
        document.getElementById('cancel-delete').addEventListener('click', function() {
            
            const title = currentCard.querySelector('.image-title').textContent;
            lightboxCaption.textContent = title;
        });
    });

    function filterImages(filterValue) {
        galleryCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function openLightbox(index) {
        currentImageIndex = index;
        currentCard = visibleImages[currentImageIndex].closest('.gallery-card');
        const imgSrc = visibleImages[currentImageIndex].getAttribute('src');
        const imgAlt = visibleImages[currentImageIndex].getAttribute('alt');
        
        lightboxImg.setAttribute('src', imgSrc);
        lightboxImg.setAttribute('alt', imgAlt);
        
        const titleElement = visibleImages[currentImageIndex].parentElement.querySelector('.image-title');
        lightboxCaption.textContent = titleElement ? titleElement.textContent : 'Uploaded Image';
        
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    renameBtn.addEventListener('click', function() {
        const titleElement = currentCard.querySelector('.image-title');
        if (!titleElement) return;
        
        const currentName = titleElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'rename-input';
        
        lightboxCaption.innerHTML = '';
        lightboxCaption.appendChild(input);
        input.focus();
        
        input.addEventListener('blur', saveRename);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveRename();
            }
        });
        
        function saveRename() {
            const newName = input.value.trim();
            if (newName && newName !== currentName) {
                titleElement.textContent = newName;
                lightboxCaption.textContent = newName;
                
                if (visibleImages[currentImageIndex] === currentCard.querySelector('.gallery-image')) {
                    lightboxCaption.textContent = newName;
                }
            } else {
                lightboxCaption.textContent = currentName;
            }
        }
    });
    
    function setupCardClickHandlers() {
        galleryCards.forEach((card, index) => {
           
            card.removeEventListener('click', handleCardClick);
            
            card.addEventListener('click', handleCardClick);
        });
    }

    window.closeFullImage = function() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    function handleCardClick() {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        
        visibleImages = [];
        galleryCards.forEach(c => {
            if (c.style.display !== 'none' && (activeFilter === 'all' || c.getAttribute('data-category') === activeFilter)) {
                visibleImages.push(c.querySelector('.gallery-image'));
            }
        });
        
        const clickedImage = this.querySelector('.gallery-image');
        const visibleIndex = visibleImages.findIndex(img => img === clickedImage);
        
        if (visibleIndex !== -1) {
            openLightbox(visibleIndex);
        }
    }

    setupCardClickHandlers();
    
    lightboxClose.addEventListener('click', function() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    lightboxPrev.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
        openLightbox(currentImageIndex);
    });
    
    lightboxNext.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
        openLightbox(currentImageIndex);
    });
    
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else if (e.key === 'ArrowLeft') {
                currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
                openLightbox(currentImageIndex);
            } else if (e.key === 'ArrowRight') {
                currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
                openLightbox(currentImageIndex);
            }
        }
    });
    
    const uploadBtn = document.getElementById('upload-btn');
    const imageUpload = document.getElementById('image-upload');
    
    uploadBtn.addEventListener('click', function() {
        imageUpload.click();
    });
    
    imageUpload.addEventListener('change', function(e) {
        const files = e.target.files;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    
                    const card = document.createElement('div');
                    card.className = 'gallery-card';
                    card.setAttribute('data-category', 'uploaded');
                    
                    const img = document.createElement('img');
                    img.className = 'gallery-image';
                    img.src = event.target.result;
                    img.alt = 'Uploaded image ' + (i + 1);
                    
                    const overlay = document.createElement('div');
                    overlay.className = 'overlay';
                    
                    const title = document.createElement('div');
                    title.className = 'image-title';
                    title.textContent = file.name.split('.')[0] || 'Uploaded Image';
                    
                    const category = document.createElement('div');
                    category.className = 'image-category';
                    category.textContent = 'Uploaded';
                    
                    overlay.appendChild(title);
                    overlay.appendChild(category);
                    
                    card.appendChild(img);
                    card.appendChild(overlay);
                    
                    galleryGrid.appendChild(card);
                    
                    galleryCards = document.querySelectorAll('.gallery-card');
                    setupCardClickHandlers();

                    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
                    if (activeFilter !== 'all' && activeFilter !== 'uploaded') {
                        card.style.display = 'none';
                    }
                };
                
                reader.readAsDataURL(file);
            }
        }

        imageUpload.value = '';
    });
});
