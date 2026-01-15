// 1. The List of Schools (Exact data provided)
const schoolsList = [
    "Al-Hikma College", "Ananda Balika Vidyalaya", "Ananda College", "Ananda Sasthralaya Kotte",
    "Anula - Primary", "Anula - Senior", "Beyond International School - Moragahena",
    "Buddhist Ladies College", "Christ King College", "CMS-Sri Jayawardanapura College",
    "Colombo South International - Kohuwala", "Dharamapala Vidyalaya - Kottawa",
    "Dharamapala Vidyalaya - Pannipitiya", "DS Senanayake School Period",
    "I Gate College International - Thalawathugoda", "Herman Gmeiner School",
    "Highlands International Schools - Maharagama", "Khairiya MGS Primary",
    "Khairiya MGS Senior", "Lindsay - Primary", "Lindsay - Senior",
    "Lyceum - Katunayake", "Lyceum - Kohuwala", "Lyceum - Nugegoda", "Lyceum - Wattala",
    "Mahinda Vidyalaya Maradana", "Pre-Uni College International - Athurugiriya",
    "President College - Kotte", "President College - Maharagama",
    "President Primary School - Nawala", "Rathnavali Balika Vidyalaya Col",
    "Rotary International School", "Samudradevi - Senior", "Siyana National School",
    "St. Anthony's Girls School", "St. Bridget's Junior", "St. Bridget's Senior",
    "St. Clair's College", "St. Joseph's Boys College", "St. Lawrence Convent",
    "St. Paul's Junior", "St. Paul's Senior", "Sussex College - Malabe",
    "Sussex College - Nugegoda", "TB Jaya Zahira College", "Vidyakara Balika Vidyalaya",
    "Vidyakeerthi Vidyalaya Niyadagala", "Wellington International School",
    "Wijayawardena M V", "Willsden International School - Battaramulla",
    "Wycherley International School - Colombo", "Wycherley International School - Dehiwala",
    "Wycherley International School Period", "Yashodara Vidyalaya", "Zahira College"
];

// 2. Populate the Datalist on Load
document.addEventListener('DOMContentLoaded', () => {
    const dataList = document.getElementById('schoolOptions');
    schoolsList.forEach(school => {
        const option = document.createElement('option');
        option.value = school;
        dataList.appendChild(option);
    });

    // Start Live Clock
    updateClock();
    setInterval(updateClock, 1000);
});

// 3. Live Clock Function
function updateClock() {
    const now = new Date();
    const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
    document.getElementById('liveClock').innerText = now.toLocaleDateString('en-US', options);
}

// 4. Handle Form Submission
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // UI Loading State
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const submitBtn = document.getElementById('submitBtn');
    
    btnText.textContent = "Processing...";
    btnSpinner.classList.remove('d-none');
    submitBtn.disabled = true;

    // Gather Data
    const formData = {
        teacherID: document.getElementById('teacherID').value,
        teacherName: document.getElementById('teacherName').value,
        school: document.getElementById('schoolInput').value,
        status: document.querySelector('input[name="status"]:checked').value,
        timestamp: new Date().toLocaleString()
    };

    // Validation: Check if school is in our list
    if (!schoolsList.includes(formData.school)) {
        showAlert('error', 'Invalid School', 'Please select a valid school from the list.');
        resetBtn();
        return;
    }

    // --- SIMULATING SERVER REQUEST ---
    // In a real scenario, you would use fetch() here to send data to Google Sheets
    console.log("Submitting Data:", formData);

    setTimeout(() => {
        // Success Action
        showAlert('success', 'Success!', `Recorded: ${formData.status} at ${formData.school}`);
        
        // Reset Form
        document.getElementById('attendanceForm').reset();
        resetBtn();
    }, 1500);
});

function resetBtn() {
    document.getElementById('btnText').textContent = "Submit Record";
    document.getElementById('btnSpinner').classList.add('d-none');
    document.getElementById('submitBtn').disabled = false;
}

function showAlert(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonColor: '#667eea'
    });
}
