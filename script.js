// CONFIGURATION
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwmxO2LoEd8cumR5qF3eRuUm9UU_HS3E9KROL_dBNT0IBedS1IclZCGoVSRN0e5hwkE/exec'; 
const ADMIN_PASSWORD = "admin123"; 

// --- TEACHER FORM LOGIC ---
const attendanceForm = document.getElementById('attendanceForm');
if (attendanceForm) {
    attendanceForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('submitBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verifying ID...';
        }

        // Defensive element lookup
        const teacherIDEl = document.getElementById('teacherID');
        const teacherNameEl = document.getElementById('teacherName');
        const schoolEl = document.getElementById('schoolSelect'); // matches updated index.html
        const statusEl = document.querySelector('input[name="status"]:checked');

        if (!teacherIDEl || !teacherNameEl || !schoolEl || !statusEl) {
            alert("Form elements missing. Please refresh the page.");
            if (btn) { btn.disabled = false; btn.innerText = 'Submit Record'; }
            return;
        }

        const payload = {
            teacherID: teacherIDEl.value,
            teacherName: teacherNameEl.value,
            school: schoolEl.value,
            checkStatus: statusEl.value,
            timestamp: new Date().toISOString()
        };

        try {
            // Note: Using 'no-cors' will silently fail to give a readable response.
            // If your server supports CORS, remove mode: 'no-cors' to get real responses.
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            showSuccess();
        } catch (err) {
            console.error(err);
            alert("Connection Error. Check Internet.");
            if (btn) { btn.disabled = false; btn.innerText = 'Submit Record'; }
        }
    });
}

function showSuccess() {
    // If there's an overlay element in the future, it will be used.
    const overlay = document.getElementById('successOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.classList.add('animate__fadeIn');
        return;
    }

    // Fallback to SweetAlert2 (included in index.html)
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Submitted',
            text: 'Your attendance has been recorded.',
            confirmButtonText: 'OK'
        }).then(() => {
            resetUI();
        });
    } else {
        alert('Submitted. Thank you!');
        resetUI();
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

function logout() {
    // simple logout to show login section again
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
}

function loadDashboardData() {
    fetch(WEB_APP_URL)
        .then(res => res.json())
        .then(data => {
            updateStats(data);
            updateTable(data);
            updateChart(data);
        })
        .catch(err => {
            console.error('Failed to load dashboard data:', err);
        });
}

function updateStats(data) {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = data.filter(r => (r.date || r.timestamp || '').includes(today));
    document.getElementById('totalCheckins').innerText = todayEntries.length;
    
    const schools = [...new Set(data.map(r => r.school))];
    document.getElementById('activeSchools').innerText = schools.length;
}

function updateTable(data) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = data.slice(-15).reverse().map(row => `
        <tr>
            <td>${row.time || row.timestamp || ''}</td>
            <td>${row.name || row.teacherName || ''}</td>
            <td>${row.school || ''}</td>
            <td><span class="badge ${ (row.status === 'Check-In' || row.checkStatus === 'Check-In') ? 'bg-success' : 'bg-danger'}">${row.status || row.checkStatus || ''}</span></td>
        </tr>
    `).join('');
}

function updateChart(data) {
    const ctxEl = document.getElementById('schoolChart');
    if (!ctxEl) return;
    const ctx = ctxEl.getContext('2d');
    const counts = {};
    data.forEach(r => counts[(r.school || '')] = (counts[r.school] || 0) + 1);

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
