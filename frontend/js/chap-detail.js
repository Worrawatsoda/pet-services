document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/');
    const chapId = pathParts[pathParts.length - 1];
    if (!chapId) return;

    try {
        const response = await fetch(`/api/chaperone/${chapId}`);
        if (!response.ok) throw new Error('Service not found');
        const driver = await response.json();

        // Render Data
        document.title = `${driver.name} - PetCare Connect`;
        document.getElementById('chap-name').textContent = driver.name;
        document.getElementById('chap-operator').textContent = driver.business_name || '';
        document.getElementById('chap-rating').textContent = driver.rating || '0.0';
        document.getElementById('chap-reviews-count').textContent = `(${driver.review_count || 0} reviews)`;
        document.getElementById('chap-rating-large').textContent = driver.rating || '0.0';
        document.getElementById('chap-reviews-count-large').textContent = `Based on ${driver.review_count || 0} reviews`;
        document.getElementById('chap-desc').textContent = driver.description || 'No description';

        const fullAddress = [driver.address, driver.city, driver.state, driver.zip_code].filter(Boolean).join(', ');
        document.getElementById('chap-address').textContent = driver.city || driver.address || '';
        document.getElementById('chap-sidebar-address').textContent = fullAddress || '-';

        const imgContainer = document.getElementById('chap-hero-image');
        const badgesContainer = document.getElementById('chap-badges');
        if(driver.image_url) {
             const existingBadges = badgesContainer.outerHTML;
             imgContainer.innerHTML = `<img src="/img/${driver.image_url}" alt="${driver.name}"> ${existingBadges}`;
        }
        
        const newBadgesContainer = document.querySelector('#chap-hero-image .hero-badges') || document.getElementById('chap-badges');
        if(newBadgesContainer) {
            let badgesHtml = '';
            if (driver.licensed) badgesHtml += `<span class="badge badge-primary">Licensed</span> `;
            if (driver.insured) badgesHtml += `<span class="badge badge-accent">Insured</span>`;
            newBadgesContainer.innerHTML = badgesHtml;
        }

        fillTags('chap-tags-container', driver.services_list);
        fillTags('chap-vehicles-container', driver.vehicles_list);
        fillTags('chap-pets-container', driver.pet_types_list);

        setupLink('chap-phone', driver.phone, `tel:${driver.phone}`);
        setupLink('chap-email', driver.email, `mailto:${driver.email}`);
        document.getElementById('chap-hours').textContent = driver.availability || 'Contact for schedule';
        document.getElementById('chap-price').textContent = driver.price_range || '$$';

        document.getElementById('chap-quick-rating').textContent = `${driver.rating || 0} / 5.0`;
        document.getElementById('chap-quick-reviews').textContent = driver.review_count || 0;
        document.getElementById('chap-experience').textContent = driver.years_experience ? `${driver.years_experience} years` : '-';

        loadReviews('chaperone', chapId);

    } catch (err) { console.error(err); }

    // --- FAVORITE LOGIC ---
    const favBtn = document.getElementById('btn-favorite');
    const heartIcon = document.getElementById('icon-heart');
    const token = localStorage.getItem('token');

    if (token) {
        fetch(`/api/favorites/check?type=chaperone&targetId=${chapId}`, {
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
                    body: JSON.stringify({ type: 'chaperone', targetId: chapId })
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

    // --- REVIEW FORM ---
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
                    body: JSON.stringify({ targetId: chapId, targetType: 'chaperone', rating, title, comment })
                });
                if (res.ok) { alert('Review submitted!'); window.location.reload(); }
                else { const data = await res.json(); alert(data.error || 'Failed'); }
            } catch (err) { alert('Error submitting review'); }
        });
    }
});

function fillTags(id, list) {
    document.getElementById(id).innerHTML = list ? list.split(',').map(t => `<span class="badge badge-secondary">${t}</span>`).join(' ') : '<span class="text-muted">None</span>';
}

function setupLink(id, text, href) {
    const el = document.getElementById(id);
    if(text){ el.textContent=text; el.href=href; } else { el.textContent='-'; el.style.pointerEvents='none'; el.style.color='#999'; }
}

// [UPDATED] Load Reviews with Show More button
async function loadReviews(type, id) {
    try {
        const res = await fetch(`/api/reviews?type=${type}&id=${id}`);
        const reviews = await res.json();
        const container = document.getElementById('reviews-list');
        
        if (reviews.length === 0) { 
            container.innerHTML = '<p class="text-muted">No reviews yet.</p>'; 
            return; 
        }

        const createReviewCard = (r) => `
            <div class="card review-card">
                <div class="card-content">
                    <div class="review-meta">
                        <span class="reviewer-name">${r.reviewer_name || 'User'}</span>
                        <span class="dot">•</span>
                        <span class="review-date">${new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <div class="review-rating">${generateStarSVG(r.rating)}</div>
                    <h4 class="review-title">${r.title || ''}</h4>
                    <p class="review-body">${r.comment || ''}</p>
                </div>
            </div>`;

        // 1. Show only first 3
        const firstThree = reviews.slice(0, 3);
        container.innerHTML = firstThree.map(createReviewCard).join('');

        // 2. Show More Button if > 3
        if (reviews.length > 3) {
            const btnContainer = document.createElement('div');
            btnContainer.style.textAlign = 'center';
            btnContainer.style.marginTop = '1rem';

            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'button button-outline button-sm';
            showMoreBtn.innerText = 'Show More Reviews';
            showMoreBtn.style.minWidth = '150px';
            
            showMoreBtn.onclick = () => {
                const restReviews = reviews.slice(3);
                btnContainer.remove();
                container.insertAdjacentHTML('beforeend', restReviews.map(createReviewCard).join(''));
            };

            btnContainer.appendChild(showMoreBtn);
            container.appendChild(btnContainer);
        }
    } catch(e){console.error(e);}
}

function generateStarSVG(r){
    let s=''; for(let i=0;i<5;i++){ s+=`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color:${i<r?'#f59e0b':'#e5e5e5'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`; } return s;
}