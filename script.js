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
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';
        }

        const teacherIDEl = document.getElementById('teacherID');
        const teacherNameEl = document.getElementById('teacherName');
        const schoolEl = document.getElementById('schoolSelect'); // must match index.html
        const statusEl = document.querySelector('input[name="status"]:checked');

        if (!teacherIDEl || !teacherNameEl || !schoolEl || !statusEl) {
            console.error('Form elements missing:', { teacherIDEl, teacherNameEl, schoolEl, statusEl });
            alert("Form elements missing. Please refresh the page.");
            if (btn) { btn.disabled = false; btn.innerText = 'Submit Record'; }
            return;
        }

        const payload = {
            teacherID: teacherIDEl.value.trim(),
            teacherName: teacherNameEl.value.trim(),
            school: schoolEl.value,
            checkStatus: statusEl.value,
            timestamp: new Date().toISOString()
        };

        console.log('Submitting payload:', payload);

        // Try normal fetch with CORS first (preferred)
        try {
            const res = await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // If server responds and CORS allowed, handle success
            if (res.ok) {
                console.log('Fetch cors succeeded, status:', res.status);
                showSuccess();
                return;
            } else {
                console.warn('Fetch cors returned non-ok status:', res.status, await res.text().catch(()=>'<no-text>'));
                // fall through to fallback attempts
            }
        } catch (err) {
            console.warn('Fetch cors failed (likely CORS error):', err);
        }

        // Fallback 1: navigator.sendBeacon (fire-and-forget, widely accepted for cross-origin)
        try {
            if (navigator && typeof navigator.sendBeacon === 'function') {
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                const beaconOk = navigator.sendBeacon(WEB_APP_URL, blob);
                console.log('navigator.sendBeacon result:', beaconOk);
                if (beaconOk) {
                    // give the beacon a moment to be sent
                    setTimeout(() => showSuccess(), 500);
                    return;
                }
            } else {
                console.log('sendBeacon not available in this environment');
            }
        } catch (err) {
            console.warn('sendBeacon failed:', err);
        }

        // Fallback 2: fetch no-cors (won't give readable response but often reaches the server)
        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload)
            });
            console.log('Fetch no-cors attempted (opaque response). Assuming success if server accepts it.');
            showSuccess();
            return;
        } catch (err) {
            console.error('Final fetch no-cors failed:', err);
        }

        // If we reach here everything failed
        alert('Submission failed — check console for details (F12).');
        if (btn) { btn.disabled = false; btn.innerText = 'Submit Record'; }
    });
}

function showSuccess() {
    const btn = document.getElementById('submitBtn');
    if (btn) { btn.disabled = false; btn.innerText = 'Submit Record'; }

    const overlay = document.getElementById('successOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.classList.add('animate__fadeIn');
        return;
    }

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Submitted',
            text: 'Your attendance has been recorded.',
            confirmButtonText: 'OK'
        }).then(() => resetUI());
    } else {
        alert('Submitted. Thank you!');
        resetUI();
    }
}

function resetUI() {
    // Better UX could clear fields instead of reloading; reload for a clean state:
    location.reload();
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
    const totalEl = document.getElementById('totalCheckins');
    if (totalEl) totalEl.innerText = todayEntries.length;
    
    const schools = [...new Set(data.map(r => r.school))];
    const activeEl = document.getElementById('activeSchools');
    if (activeEl) activeEl.innerText = schools.length;
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
