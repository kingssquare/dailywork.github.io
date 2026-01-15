// --- CONFIGURATION (Must match your form config) ---
const GITHUB_CONFIG = {
    username: "YOUR_GITHUB_USERNAME",
    repo: "YOUR_REPO_NAME",
    filename: "data.json",
    token: "ghp_xxxxxxxxxxxxxxxxxxxxxx" // ⚠️ Needed if repo is private
};

document.addEventListener('DOMContentLoaded', loadData);

// 1. Fetch and Display Data
async function loadData() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-white-50">Fetching updates...</td></tr>';

    const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filename}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error("Failed to load data");

        const data = await response.json();
        
        // Decode Base64 content from GitHub
        const records = JSON.parse(atob(data.content));
        
        // Sort by newest first (reverse order)
        renderTable(records.reverse());
        
        // Store globally for CSV export
        window.currentRecords = records;

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading data. Check console.</td></tr>`;
    }
}

// 2. Render HTML Rows
function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-white-50">No records found.</td></tr>';
        return;
    }

    data.forEach(row => {
        const badgeClass = row.status === 'Check-In' ? 'badge-in' : 'badge-out';
        const icon = row.status === 'Check-In' ? 'bi-box-arrow-in-right' : 'bi-box-arrow-left';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><small>${row.timestamp}</small></td>
            <td><span class="fw-bold text-white-50">${row.teacherID}</span></td>
            <td>${row.teacherName}</td>
            <td>${row.school}</td>
            <td><span class="badge ${badgeClass}"><i class="bi ${icon}"></i> ${row.status}</span></td>
        `;
        tableBody.appendChild(tr);
    });
}

// 3. Search Filter
function filterTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

// 4. Export to CSV Feature
function downloadCSV() {
    if (!window.currentRecords) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,ID,Name,School,Status\n"; // Header

    window.currentRecords.forEach(row => {
        const rowString = `${row.timestamp},${row.teacherID},${row.teacherName},"${row.school}",${row.status}`;
        csvContent += rowString + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}