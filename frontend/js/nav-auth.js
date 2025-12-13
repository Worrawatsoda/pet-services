document.addEventListener('DOMContentLoaded', () => {
    // 1. ตรวจสอบ Token และชื่อผู้ใช้
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName') || 'User';
    
    // 2. อ้างอิง Element ทั้ง Desktop และ Mobile
    const desktopAuthContainer = document.querySelector('.header-nav-auth');
    const mobileAuthContainer = document.querySelector('.mobile-auth-links');

    // 3. ถ้าล็อกอินแล้ว (มี Token)
    if (token) {
        
        // --- A. จัดการส่วน Desktop (แสดง Dropdown) ---
        if (desktopAuthContainer) {
            desktopAuthContainer.innerHTML = `
                <div class="user-dropdown">
                    <button class="dropdown-toggle" id="userDropdownBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>${userName}</span>
                    </button>
                    <div class="dropdown-menu" id="userDropdownMenu">
                        <a href="/profile" class="dropdown-item">My Profile</a>
                        <div class="dropdown-divider"></div>
                        <button id="logoutBtn" class="dropdown-item text-danger">Sign Out</button>
                    </div>
                </div>
            `;

            // Logic เปิด-ปิด Dropdown
            const dropdownBtn = document.getElementById('userDropdownBtn');
            const dropdownMenu = document.getElementById('userDropdownMenu');

            if (dropdownBtn && dropdownMenu) {
                dropdownBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('show');
                });

                window.addEventListener('click', () => {
                    if (dropdownMenu.classList.contains('show')) {
                        dropdownMenu.classList.remove('show');
                    }
                });
            }

            // Logic ปุ่ม Logout (Desktop)
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        }

        // --- B. จัดการส่วน Mobile (เปลี่ยนปุ่ม Login เป็น Profile/Logout) ---
        if (mobileAuthContainer) {
            mobileAuthContainer.innerHTML = `
                <div style="padding: 0.75rem 0; font-weight: 600; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Hi, ${userName}
                </div>
                <a href="/profile" class="nav-link">My Profile</a>
                <a href="#" id="mobileLogoutBtn" class="nav-link" style="color: var(--destructive);">Sign Out</a>
            `;

            // Logic ปุ่ม Logout (Mobile)
            const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
            if (mobileLogoutBtn) {
                mobileLogoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleLogout();
                });
            }
        }
    }

    // ฟังก์ชัน Logout ใช้ร่วมกัน
    function handleLogout() {
        localStorage.clear();
        window.location.href = '/';
    }

    // ---------------------------------------------------------
    // [ส่วน Navbar Toggle] เปิด/ปิด เมนูมือถือ
    // ---------------------------------------------------------
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const headerNav = document.querySelector('.header-nav');
    const navOverlay = document.getElementById('navOverlay');

    if (hamburgerBtn && headerNav && navOverlay) {
        function toggleMenu() {
            headerNav.classList.toggle('active');
            navOverlay.classList.toggle('active');
        }

        hamburgerBtn.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', toggleMenu);
    }
});