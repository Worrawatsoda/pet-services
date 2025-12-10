document.addEventListener('DOMContentLoaded', async () => {
    fetchClinics();

    // Filter Change Events
    const filterInputs = document.querySelectorAll('.filter-card input');
    filterInputs.forEach(input => {
        input.addEventListener('change', () => fetchClinics());
    });

    // Clear Button
    const clearBtn = document.querySelector('.filter-card .button-ghost');
    if(clearBtn) {
        clearBtn.addEventListener('click', () => {
            filterInputs.forEach(input => {
                if(input.type === 'checkbox') input.checked = false;
                if(input.type === 'range') input.value = 0;
            });
            document.getElementById('rating-val-display').innerText = 'Any';
            const searchInput = document.getElementById('search-input');
            if(searchInput) searchInput.value = '';
            fetchClinics();
        });
    }

    // Search Logic
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => fetchClinics());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') fetchClinics();
        });
    }
});

async function fetchClinics() {
    const container = document.getElementById('vet-card-container');
    const resultCount = document.getElementById('result-count');
    
    // Gather Filters
    const selectedServices = Array.from(document.querySelectorAll('input[name="service"]:checked')).map(el => el.value);
    const isEmergency = document.getElementById('filter-emergency').checked;
    const isWalkin = document.getElementById('filter-walkin').checked;
    const minRating = document.getElementById('filter-rating').value;
    const searchValue = document.getElementById('search-input') ? document.getElementById('search-input').value.trim() : '';

    const params = new URLSearchParams();
    if (selectedServices.length > 0) params.append('services', selectedServices.join(','));
    if (isEmergency) params.append('emergency', 'true');
    if (isWalkin) params.append('walkin', 'true');
    if (minRating > 0) params.append('rating', minRating);
    if (searchValue) params.append('search', searchValue);

    container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">Loading...</p>';

    try {
        const response = await fetch(`/api/veterinary?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        const clinics = data.data;

        // Fetch User Favorites (if logged in)
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const favoriteIds = new Set();

        if (token && userId) {
            try {
                const favRes = await fetch(`/api/users/${userId}/favorites`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (favRes.ok) {
                    const favData = await favRes.json();
                    favData.veterinary.forEach(v => favoriteIds.add(v.id));
                }
            } catch (err) { console.error("Error fetching favorites", err); }
        }

        resultCount.textContent = `${clinics.length} คลินิกสัตวแพทย์`;
        container.innerHTML = '';

        if (clinics.length === 0) {
            container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No clinics match your filters.</p>';
            return;
        }

        clinics.forEach(vet => {
            const imageHTML = vet.image_url 
                ? `<img src="img/${vet.image_url}" alt="${vet.name}">` // ลบ style ออกเพื่อให้ CSS จัดการ
                : `<div class="image-placeholder">
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z"/><path d="m3 14 5-5"/><path d="m8.5 8.5 5 5"/></svg>
                   </div>`;

            let tagsHTML = '';
            if(vet.services_list) {
                const tags = vet.services_list.split(',').slice(0, 3);
                tagsHTML = tags.map(t => `<span class="badge badge-secondary">${t}</span>`).join(' ');
            } else {
                tagsHTML = '<span class="text-muted" style="font-size:0.8em">No tags</span>';
            }

            const isFav = favoriteIds.has(vet.id);
            const activeClass = isFav ? 'active' : '';

            // Use Real Calculated Values
            const displayRating = vet.real_rating ? parseFloat(vet.real_rating).toFixed(1) : '0.0';
            const displayReviewCount = vet.real_review_count || 0;

            const cardHTML = `
                <div class="card vet-card">
                    <div class="vet-card-image">
                        ${imageHTML}
                        <button class="card-fav-btn ${activeClass}" data-id="${vet.id}" title="Add to favorites">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                    </div>
                    <div class="card-content vet-card-content">
                        <div class="vet-card-header">
                            <h3 class="vet-name">${vet.name}</h3>
                            <div class="vet-location">
                                <span class="text-muted" style="font-size:0.9em">${vet.address || vet.city || ''}</span>
                            </div>
                        </div>
                        <div class="vet-rating">
                            <div class="rating-stars">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="star-filled" style="color: #f59e0b;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                <span>${displayRating}</span>
                            </div>
                            <span class="text-muted">(${displayReviewCount} reviews)</span>
                        </div>
                        <div class="vet-tags">${tagsHTML}</div>
                        <a href="/veterinary/${vet.id}" class="button button-full-width">View Details</a>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Favorite Button Listeners
        document.querySelectorAll('.card-fav-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation(); 
                e.preventDefault();

                if (!token) {
                    alert('Please sign in to add favorites.');
                    window.location.href = '/login';
                    return;
                }

                const targetId = btn.dataset.id;
                try {
                    const res = await fetch('/api/favorites/toggle', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ type: 'veterinary', targetId: targetId })
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data.isFavorite) btn.classList.add('active');
                        else btn.classList.remove('active');
                    }
                } catch (err) { console.error(err); }
            });
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; grid-column: 1/-1; text-align: center;">Error loading data</p>';
    }
}