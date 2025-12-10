const registerform = document.getElementById('registerForm');

registerform.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value; // รับค่า Confirm Password

    // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return; // หยุดการทำงาน ไม่ส่งข้อมูลไป Server
    }

    try {
        // ใช้ Relative Path เพื่อความยืดหยุ่น (หรือจะใช้ http://localhost:3000 ก็ได้ถ้า run local)
        const response = await fetch('/api/auth/register', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! You can now log in.');
            window.location.href = 'login.html';
        } else {
            alert(`Registration failed: ${data.error || data.message}`);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again later.');    
    }
});