// CONFIGURATION
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwmxO2LoEd8cumR5qF3eRuUm9UU_HS3E9KROL_dBNT0IBedS1IclZCGoVSRN0e5hwkE/exec'; 
const ADMIN_PASSWORD = "admin123"; 

// --- TEACHER FORM LOGIC ---
const attendanceForm = document.getElementById('attendanceForm');
if (attendanceForm) {
    attendanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verifying ID...';

        const payload = {
            teacherID: document.getElementById('teacherID').value,
            schoolSelect: document.getElementById('schoolSelect').value,
            checkStatus: document.querySelector('input[name="status"]:checked').value
        };

        // Note: Using 'no-cors' means we can't see the "INVALID_ID" text return easily.
        // For strict validation, we use a standard 'cors' fetch if configured, 
        // but to keep it simple for GitHub Pages:
        fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(payload)
        }).then(() => {
            showSuccess();
        }).catch(err => {
            alert("Connection Error. Check Internet.");
            btn.disabled = false;
        });
    });
}

function showSuccess() {
    const overlay = document.getElementById('successOverlay');
    if(overlay) {
        overlay.style.display = 'flex';
        overlay.classList.add('animate__fadeIn');
    }
}

function resetUI() {
    location.reload(); // Simplest way to reset everything for the next teacher
}

// --- ADMIN DASHBOARD LOGIC ---
function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    if (input === ADMIN_PASSWORD) {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');
        loadDashboardData();
    } else {
        const err = document.getElementById('loginError');
        err.classList.remove('hidden');
        setTimeout(() => err.classList.add('hidden'), 3000);
    }
}

function loadDashboardData() {
    fetch(WEB_APP_URL)
        .then(res => res.json())
        .then(data => {
            updateStats(data);
            updateTable(data);
            updateChart(data);
        });
}

function updateStats(data) {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = data.filter(r => r.date.includes(today));
    document.getElementById('totalCheckins').innerText = todayEntries.length;
    
    const schools = [...new Set(data.map(r => r.school))];
    document.getElementById('activeSchools').innerText = schools.length;
}

function updateTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = data.slice(-15).reverse().map(row => `
        <tr>
            <td>${row.time}</td>
            <td>${row.name}</td>
            <td>${row.school}</td>
            <td><span class="badge ${row.status === 'Check-In' ? 'bg-success' : 'bg-danger'}">${row.status}</span></td>
        </tr>
    `).join('');
}

function updateChart(data) {
    const ctx = document.getElementById('schoolChart').getContext('2d');
    const counts = {};
    data.forEach(r => counts[r.school] = (counts[r.school] || 0) + 1);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#4e54c8', '#8f94fb', '#4bb543', '#ffcc00']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}