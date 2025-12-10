document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/');
    const vetId = pathParts[pathParts.length - 1];
    if (!vetId) return;

    try {
        const response = await fetch(`/api/veterinary/${vetId}`);
        if (!response.ok) throw new Error('Vet not found');
        const vet = await response.json();

        // Render Data
        document.title = `${vet.name} - PetCare Connect`;
        document.getElementById('vet-name').textContent = vet.name;
        document.getElementById('vet-rating').textContent = vet.rating || '0.0';
        document.getElementById('vet-reviews-count').textContent = `(${vet.review_count || 0} reviews)`;
        document.getElementById('vet-rating-large').textContent = vet.rating || '0.0';
        document.getElementById('vet-reviews-count-large').textContent = `Based on ${vet.review_count || 0} reviews`;
        document.getElementById('vet-desc').textContent = vet.description || 'No description available.';
        
        const fullAddress = [vet.address, vet.city, vet.state, vet.zip_code].filter(Boolean).join(', ');
        document.getElementById('vet-address').textContent = vet.city || vet.address || '';
        document.getElementById('vet-sidebar-address').textContent = fullAddress || '-';

        if (vet.image_url) {
            // *** สำคัญ: ต้องเป็น tag img ธรรมดา ไม่มี style="..." ***
            document.getElementById('vet-hero-image').innerHTML = `<img src="/img/${vet.image_url}" alt="${vet.name}">`;
        }

        const tagsContainer = document.getElementById('vet-tags-container');
        tagsContainer.innerHTML = vet.services_list ? vet.services_list.split(',').map(tag => `<span class="badge badge-secondary">${tag}</span>`).join(' ') : '<span class="text-muted">No services</span>';

        const hoursContainer = document.getElementById('vet-hours-container');
        if (vet.hours && vet.hours.length > 0) {
            hoursContainer.innerHTML = vet.hours.map(h => `
                <div class="hours-row" style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding: 4px 0;">
                    <span style="font-weight:500; text-transform:capitalize;">${h.day_of_week}</span>
                    <span class="text-muted">${h.open_time}</span>
                </div>`).join('');
        } else {
            hoursContainer.innerHTML = '<p class="text-muted">Contact for hours</p>';
        }

        setupLink('vet-phone', vet.phone, `tel:${vet.phone}`);
        setupLink('vet-email', vet.email, `mailto:${vet.email}`);
        setupLink('vet-website', vet.website ? 'Visit Website' : null, vet.website);

        document.getElementById('vet-emergency').textContent = vet.emergency_24_7 ? 'Available 24/7' : 'Not Available';
        document.getElementById('vet-walkin').textContent = vet.accepts_walk_ins ? 'Accepted' : 'Appointment Only';

        loadReviews('veterinary', vetId);

    } catch (err) { console.error(err); }

    // --- FAVORITE LOGIC ---
    const favBtn = document.getElementById('btn-favorite');
    const heartIcon = document.getElementById('icon-heart');
    const token = localStorage.getItem('token');

    if (token) {
        fetch(`/api/favorites/check?type=veterinary&targetId=${vetId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => updateHeartUI(data.isFavorite))
        .catch(err => console.error(err));
    }

    if(favBtn) {
        favBtn.addEventListener('click', async () => {
            if (!token) {
                alert('Please sign in to add favorites.');
                window.location.href = '/login';
                return;
            }
            try {
                const res = await fetch('/api/favorites/toggle', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ type: 'veterinary', targetId: vetId })
                });
                const data = await res.json();
                updateHeartUI(data.isFavorite);
            } catch (err) { console.error(err); }
        });
    }

    function updateHeartUI(isFav) {
        if (isFav) {
            heartIcon.setAttribute('fill', '#ef4444');
            heartIcon.style.color = '#ef4444';
            heartIcon.style.stroke = 'none';
        } else {
            heartIcon.setAttribute('fill', 'none');
            heartIcon.style.color = '#ccc';
            heartIcon.style.stroke = 'currentColor';
        }
    }

    // --- REVIEW FORM LOGIC ---
    const reviewBtn = document.getElementById('btn-open-review');
    const reviewFormContainer = document.getElementById('review-form-container');
    const cancelBtn = document.getElementById('btn-cancel-review');
    const reviewForm = document.getElementById('review-form');

    if (!token) {
        if(reviewBtn) {
            reviewBtn.textContent = 'Sign in to Review';
            reviewBtn.addEventListener('click', () => window.location.href = '/login');
        }
    } else {
        if(reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                reviewFormContainer.style.display = 'block';
                reviewBtn.style.display = 'none';
            });
        }
    }

    if(cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            reviewFormContainer.style.display = 'none';
            reviewBtn.style.display = 'block';
        });
    }

    if(reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = document.getElementById('input-rating').value;
            const title = document.getElementById('input-title').value;
            const comment = document.getElementById('input-comment').value;

            try {
                const res = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ targetId: vetId, targetType: 'veterinary', rating, title, comment })
                });

                if (res.ok) { alert('Review submitted!'); window.location.reload(); } 
                else { const data = await res.json(); alert(data.error || 'Submission failed'); }
            } catch (err) { alert('Error submitting review'); }
        });
    }
});

function setupLink(id, text, href) {
    const el = document.getElementById(id);
    if (text && href) { el.textContent = text; el.href = href; el.target = "_blank"; }
    else { el.textContent = '-'; el.style.pointerEvents = 'none'; el.style.color = '#999'; }
}

async function loadReviews(type, id) {
    try {
        const res = await fetch(`/api/reviews?type=${type}&id=${id}`);
        const reviews = await res.json();
        const container = document.getElementById('reviews-list');
        if (reviews.length === 0) { container.innerHTML = '<p class="text-muted">No reviews yet.</p>'; return; }
        container.innerHTML = reviews.map(r => `
            <div class="card review-card">
                <div class="card-content">
                    <div class="review-meta"><span class="reviewer-name">${r.reviewer_name || 'User'}</span><span class="dot">•</span><span class="review-date">${new Date(r.date).toLocaleDateString()}</span></div>
                    <div class="review-rating">${generateStarSVG(r.rating)}</div>
                    <h4 class="review-title">${r.title || ''}</h4>
                    <p class="review-body">${r.comment || ''}</p>
                </div>
            </div>`).join('');
    } catch (err) { console.error(err); }
}

function generateStarSVG(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        const color = i < rating ? '#f59e0b' : '#e5e5e5';
        stars += `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: ${color}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>`;
    }
    return stars;
}