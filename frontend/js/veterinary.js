document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('vet-card-container');
    const resultCount = document.getElementById('result-count');

    try {
        // 1. ดึงข้อมูลจาก Backend
        const response = await fetch('/api/veterinary');
        if (!response.ok) throw new Error('Failed to fetch data');
        const clinics = await response.json();

        // อัปเดตจำนวนรายการที่เจอ
        if (resultCount) resultCount.textContent = `${clinics.length} clinics found`;

        // ล้างข้อมูลเก่า (ถ้ามี)
        container.innerHTML = '';

        if (clinics.length === 0) {
            container.innerHTML = '<p class="text-muted">ไม่พบข้อมูลคลินิก</p>';
            return;
        }

        // 2. Loop สร้างการ์ดแบบ vet-card
        clinics.forEach(vet => {
            
            // ตรวจสอบรูปภาพ (ถ้าไม่มีใน DB ให้ใช้ Placeholder เดิมของคุณ)
            const imageHTML = vet.image_url 
                ? `<img src="img/${vet.image_url}" alt="${vet.name}" style="width:100%; height:100%; object-fit:cover;">`
                : `<div class="image-placeholder" style="background-color: #e5e5e5; width:100%; height:100%; display:flex; align-items:center; justify-content:center; color: #a3a3a3;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z" />
                            <path d="m3 14 5-5" />
                            <path d="m8.5 8.5 5 5" />
                        </svg>
                   </div>`;

            // สร้าง HTML Card
            const cardHTML = `
                <div class="card vet-card">
                    <div class="vet-card-image">
                        ${imageHTML}
                    </div>
                    <div class="card-content vet-card-content">
                        <div class="vet-card-header">
                            <h3 class="vet-name">${vet.name}</h3>
                            <div class="vet-location">
                                <span class="text-muted" style="font-size:0.9em">${vet.address || ''}</span>
                            </div>
                        </div>

                        <div class="vet-rating">
                            <div class="rating-stars">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="star-filled" style="color: #f59e0b;">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <span>${vet.rating || '0.0'}</span>
                            </div>
                            <span class="text-muted">(${vet.reviews_count || 0} reviews)</span>
                        </div>

                        <div class="vet-tags">
                            <span class="badge badge-secondary">General Care</span>
                            <span class="badge badge-secondary">Emergency</span>
                        </div>

                        <a href="/veterinary/${vet.id}" class="button button-full-width">View Details</a>
                    </div>
                </div>
            `;

            // แทรก HTML ลงใน container
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
});
