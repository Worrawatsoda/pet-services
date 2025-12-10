document.addEventListener('DOMContentLoaded', () => {
    // 1. ตรวจสอบว่ามี Token หรือไม่
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'User'; // ดึงชื่อผู้ใช้
    
    // 2. อ้างอิงไปยัง Element ที่เก็บปุ่ม Login/Register
    const authContainer = document.querySelector('.header-nav-auth');

    if (token && authContainer) {
        // 3. ถ้าล็อกอินแล้ว ให้แสดง Dropdown Menu
        authContainer.innerHTML = `
            <div class="user-dropdown">
                <button class="dropdown-toggle" id="userDropdownBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>${userName}</span>
                </button>
                <div class="dropdown-menu" id="userDropdownMenu">
                    <a href="/profile" class="dropdown-item">My Account</a>
                    <a href="/profile" class="dropdown-item">Profile</a>
                    <div class="dropdown-divider"></div>
                    <button id="logoutBtn" class="dropdown-item text-danger">Sign Out</button>
                </div>
            </div>
        `;

        // 4. Logic การเปิด-ปิด Dropdown
        const dropdownBtn = document.getElementById('userDropdownBtn');
        const dropdownMenu = document.getElementById('userDropdownMenu');

        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // ป้องกันไม่ให้ event ไปถึง window
            dropdownMenu.classList.toggle('show');
        });

        // ปิด Dropdown เมื่อคลิกที่อื่นในหน้าเว็บ
        window.addEventListener('click', () => {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });

        // 5. เพิ่มฟังก์ชันให้ปุ่ม Logout
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/'; 
        });
    }
});