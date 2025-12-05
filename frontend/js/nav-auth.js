document.addEventListener('DOMContentLoaded', () => {
    // 1. ตรวจสอบว่ามี Token หรือไม่
    const token = localStorage.getItem('token');
    
    // 2. อ้างอิงไปยัง Element ที่เก็บปุ่ม Login/Register
    const authContainer = document.querySelector('.header-nav-auth');

    if (token && authContainer) {
        // 3. ถ้ามี Token (ล็อกอินแล้ว) ให้เปลี่ยน HTML ภายในเป็นปุ่ม Profile และ Logout
        authContainer.innerHTML = `
            <a href="/profile" class="button button-ghost button-sm">Profile</a>
            <button id="logoutBtn" class="button button-sm button-outline" style="margin-left: 10px;">Logout</button>
        `;

        // 4. เพิ่มฟังก์ชันให้ปุ่ม Logout
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            // ลบ Token ออกจากเครื่อง
            localStorage.removeItem('token');
            // รีโหลดหน้าเว็บเพื่อกลับไปสถานะยังไม่ล็อกอิน
            window.location.href = '/'; 
        });
    }
});