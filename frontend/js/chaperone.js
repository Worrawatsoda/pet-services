document.addEventListener('DOMContentLoaded', async () => {
    fetchChaperones();

    const filterInputs = document.querySelectorAll('.filter-card input');
    filterInputs.forEach(input => {
        input.addEventListener('change', fetchChaperones);
    });
    
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
            fetchChaperones();
        });
    }

    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => fetchChaperones());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') fetchChaperones();
        });
    }

    // =========================================================
    // [START] ส่วนที่เพิ่มใหม่: Mobile Filter Toggle Logic
    // =========================================================
    const filterBtn = document.querySelector('.mobile-filter-toggle');
    const sidebar = document.querySelector('.chap-sidebar'); // เลือก Sidebar ของหน้า Chaperone
    const closeFilterBtn = document.getElementById('closeFilterBtn');

    if (filterBtn && sidebar) {
        // 1. กดปุ่ม Filter เพื่อเปิด Sidebar
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // ป้องกัน Event ชนกัน
            sidebar.classList.add('show');
        });

        // 2. กดปุ่ม Close เพื่อปิด Sidebar
        if (closeFilterBtn) {
            closeFilterBtn.addEventListener('click', () => {
                sidebar.classList.remove('show');
            });
        }

        // 3. กดพื้นที่ว่างๆ ด้านนอก (Overlay) เพื่อปิด Sidebar
        sidebar.addEventListener('click', (e) => {
            if (e.target === sidebar) {
                sidebar.classList.remove('show');
            }
        });
    }
    // =========================================================
    // [END] จบส่วนที่เพิ่มใหม่
    // =========================================================
});

async function fetchChaperones() {
    const container = document.getElementById('chap-card-container');
    const resultCount = document.getElementById('chap-result-count');

    const services = Array.from(document.querySelectorAll('input[name="chap_service"]:checked')).map(el => el.value);
    const vehicles = Array.from(document.querySelectorAll('input[name="vehicle"]:checked')).map(el => el.value);
    const pets = Array.from(document.querySelectorAll('input[name="pet_type"]:checked')).map(el => el.value);
    const rating = document.getElementById('filter-rating').value;
    const searchValue = document.getElementById('search-input') ? document.getElementById('search-input').value.trim() : '';

    const params = new URLSearchParams();
    if(services.length) params.append('services', services.join(','));
    if(vehicles.length) params.append('vehicle', vehicles.join(','));
    if(pets.length) params.append('pets', pets.join(','));
    if(rating > 0) params.append('rating', rating);
    if(searchValue) params.append('search', searchValue);

    container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">Loading...</p>';

    try {
        const response = await fetch(`/api/chaperone?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        const providers = data.data;

        // Fetch Favorites
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
                    favData.chaperone.forEach(c => favoriteIds.add(c.id));
                }
            } catch (err) { console.error(err); }
        }

        resultCount.textContent = `${providers.length} ผู้ให้บริการ`;
        container.innerHTML = '';

        if (providers.length === 0) {
            container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No providers match your filters.</p>';
            return;
        }

        providers.forEach(chap => {
             const imageHTML = chap.image_url 
             ? `<img src="img/${chap.image_url}" alt="${chap.name}">` 
             : `<div class="image-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" style="color: #a3a3a3;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>`;

            let tagsHTML = '';
            if(chap.services_list) {
                const tags = chap.services_list.split(',').slice(0, 2);
                tagsHTML = tags.map(t => `<span class="badge badge-secondary">${t}</span>`).join(' ');
            } else {
                tagsHTML = '<span class="text-muted" style="font-size:0.8em">No tags</span>';
            }

            const isFav = favoriteIds.has(chap.id);
            const activeClass = isFav ? 'active' : '';

            // Use Real Calculated Values
            const displayRating = chap.real_rating ? parseFloat(chap.real_rating).toFixed(1) : '0.0';
            const displayReviewCount = chap.real_review_count || 0;

            const cardHTML = `
                <div class="card chap-card">
                    <div class="chap-card-image">
                        ${imageHTML}
                        <button class="card-fav-btn ${activeClass}" data-id="${chap.id}" title="Add to favorites">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                    </div>
                    <div class="card-content chap-card-content">
                        <div class="chap-card-header">
                            <div style="flex: 1;">
                                <h3 class="chap-name">${chap.name}</h3>
                                <p class="text-muted text-sm" style="margin-bottom: 0.25rem;">${chap.business_name || 'Professional Driver'}</p>
                                <div class="chap-location">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                    <span>${chap.city || chap.address || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="chap-stats">
                            <div class="rating-group">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="star-filled" style="color: #f59e0b;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                <span>${displayRating}</span>
                                <span class="text-muted">(${displayReviewCount})</span>
                            </div>
                            <span class="price-range">${chap.price_range || '$$'}</span>
                        </div>
                        <div class="chap-tags">${tagsHTML}</div>
                        <a href="/transport/${chap.id}" class="button button-full-width">View Profile</a>
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
                        body: JSON.stringify({ type: 'chaperone', targetId: targetId })
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data.isFavorite) btn.classList.add('active');
                        else btn.classList.remove('active');
                    }
                } catch (err) { console.error(err); }
            });
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red; grid-column: 1/-1; text-align: center;">Error loading data.</p>';
    }
}