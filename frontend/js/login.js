const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // ใช้ Relative Path เพื่อให้ยืดหยุ่นกับ Environment
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            // Store token AND user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);     // *สำคัญ* สำหรับหน้า Profile
            localStorage.setItem('userName', data.userName); // *สำคัญ* สำหรับแสดงชื่อ

            // Redirect to homepage
            window.location.href = '/';
        } else {
            alert(`Login failed: ${data.error || data.message}`);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again later.');
    }
});