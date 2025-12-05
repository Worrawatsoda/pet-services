document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('chap-card-container');
    const resultCount = document.getElementById('chap-result-count');

    try {
        // 1. ดึงข้อมูลจาก API
        const response = await fetch('/api/chaperone');
        if (!response.ok) throw new Error('Failed to fetch data');
        const providers = await response.json();

        // อัปเดตจำนวนผลลัพธ์
        if (resultCount) resultCount.textContent = `${providers.length} providers found`;

        // ล้างข้อมูลเก่า
        container.innerHTML = '';

        if (providers.length === 0) {
            container.innerHTML = '<p class="text-muted">No providers found.</p>';
            return;
        }

        // 2. Loop สร้างการ์ด
        providers.forEach(chap => {
            // เช็ครูปภาพ
            const imageHTML = chap.image_url 
                ? `<img src="img/${chap.image_url}" alt="${chap.name}" style="width:100%; height:100%; object-fit:cover;">`
                : `<div class="image-placeholder" style="background-color: #e5e5e5; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #a3a3a3;">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                   </div>`;

            // สร้าง HTML Card (ตามแบบ chap-card)
            const cardHTML = `
                <div class="card chap-card">
                    <div class="chap-card-image">
                        ${imageHTML}
                    </div>
                    <div class="card-content chap-card-content">
                        <div class="chap-card-header">
                            <div style="flex: 1;">
                                <h3 class="chap-name">${chap.name}</h3>
                                <p class="text-muted text-sm" style="margin-bottom: 0.25rem;">Professional Driver</p>
                                <div class="chap-location">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span>${chap.address || 'Unknown Location'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="chap-stats">
                            <div class="rating-group">
                                <div class="rating-stars">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="star-filled" style="color: #f59e0b;">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                    <span>${chap.rating || '0.0'}</span>
                                </div>
                                <span class="text-muted">(${chap.reviews_count || 0} reviews)</span>
                            </div>
                            <span class="price-range">$$</span>
                        </div>

                        <div class="chap-details">
                            <div class="detail-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                                    <circle cx="7" cy="17" r="2" />
                                    <path d="M9 17h6" />
                                    <circle cx="17" cy="17" r="2" />
                                </svg>
                                <span style="font-size: 0.9em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">
                                    ${chap.description || 'Service details...'}
                                </span>
                            </div>
                        </div>

                        <div class="chap-tags">
                            <span class="badge badge-secondary">Vet Appointments</span>
                            <span class="badge badge-secondary">Transport</span>
                        </div>

                        <a href="/transport/${chap.id}" class="button button-full-width">View Profile</a>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red;">Error loading data.</p>';
    }
});