// State
const DRIVER_NAME = "Driver Somchai";
const activeJobs = [];

// DOM Elements
const driverRevenue = document.getElementById('driver-revenue');
const driverJobs = document.getElementById('driver-jobs');
const currentJobContainer = document.getElementById('current-job-container');
const availableJobsContainer = document.getElementById('available-jobs-container');
const newJobsCount = document.getElementById('new-jobs-count');

// Init
function init() {
    renderJobs();

    // Auto refresh
    setInterval(renderJobs, 5000);
}

function renderJobs() {
    const allOrders = appStore.getOrders();

    // My Active Jobs (PICKED_UP)
    const myActiveJobs = allOrders.filter(o => o.driverName === DRIVER_NAME && o.status === 'PICKED_UP');

    // Available Jobs (READY and not assigned)
    const availableJobs = allOrders.filter(o => o.status === 'READY' && !o.driverName);

    // Completed Jobs Today (DELIVERED and mine)
    const completedJobs = allOrders.filter(o => o.driverName === DRIVER_NAME && o.status === 'DELIVERED');

    updateStats(completedJobs);
    renderCurrentJob(myActiveJobs);
    renderAvailableJobs(availableJobs);
}

function updateStats(completedJobs) {
    const count = completedJobs.length;
    // Mock revenue calculation: 40 base + 10% of order value
    const revenue = completedJobs.reduce((sum, job) => sum + 40 + (job.totalPrice * 0.1), 0);

    driverJobs.textContent = count;
    driverRevenue.textContent = appStore.formatCurrency(revenue);
}

function renderCurrentJob(jobs) {
    if (jobs.length === 0) {
        currentJobContainer.innerHTML = '';
        return;
    }

    // Driver can only have one active job usually, but let's handle list just in case
    const job = jobs[0]; // Take first one

    currentJobContainer.innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm mb-6">
            <div class="flex justify-between items-start mb-4">
                <h2 class="text-xl font-bold text-blue-800 thai-font">งานปัจจุบัน</h2>
                <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    กำลังจัดส่ง
                </span>
            </div>

            <div class="space-y-4 mb-6">
                <div class="flex items-start">
                    <div class="w-8 flex flex-col items-center mr-3">
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div class="w-0.5 h-10 bg-gray-300"></div>
                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div class="flex-1">
                        <div class="mb-4">
                            <p class="text-xs text-gray-500 font-bold">รับอาหารที่</p>
                            <h4 class="font-bold text-gray-800">${job.restaurantName}</h4>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 font-bold">ส่งให้</p>
                            <h4 class="font-bold text-gray-800">${job.customerName}</h4>
                            <p class="text-sm text-gray-600">${job.address}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg p-3 mb-4 border border-blue-100">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">ค่าอาหาร (เก็บเงินสด)</span>
                    <span class="font-bold">฿0</span> <!-- Mocking online payment always -->
                </div>
                <div class="flex justify-between text-sm text-green-600 font-bold">
                    <span>รายได้ของคุณ</span>
                    <span>${appStore.formatCurrency(40 + (job.totalPrice * 0.1))}</span>
                </div>
            </div>

            <button onclick="completeJob(${job.id})" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition">
                <i class="fas fa-check-circle mr-2"></i> ส่งมอบสำเร็จ
            </button>
        </div>
    `;
}

function renderAvailableJobs(jobs) {
    newJobsCount.textContent = jobs.length;

    if (jobs.length === 0) {
        availableJobsContainer.innerHTML = `
            <div class="text-center py-10 bg-white rounded-xl border border-gray-100 border-dashed">
                <i class="fas fa-search-location text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">ยังไม่มีงานในบริเวณนี้</p>
                <p class="text-xs text-gray-400 mt-2">ระบบกำลังค้นหางานใหม่อย่างต่อเนื่อง...</p>
            </div>
        `;
        return;
    }

    availableJobsContainer.innerHTML = jobs.map(job => `
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center">
                    <div class="bg-orange-100 p-2 rounded-lg text-orange-600 mr-3">
                        <i class="fas fa-utensils"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900">${job.restaurantName}</h3>
                        <p class="text-xs text-gray-500">2.5 กม. • ร้านอาหาร</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="block font-bold text-green-600 text-lg">${appStore.formatCurrency(40 + (job.totalPrice * 0.1))}</span>
                </div>
            </div>

            <div class="border-t border-gray-50 pt-3 flex justify-between items-center">
                 <div class="text-sm text-gray-600">
                    <i class="fas fa-map-marker-alt text-red-500 mr-1"></i> ส่ง: ${job.address.substring(0, 20)}...
                 </div>
                 <button onclick="acceptJob(${job.id})" class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition">
                    รับงาน
                 </button>
            </div>
        </div>
    `).join('');
}

function acceptJob(orderId) {
    if (confirm('ยืนยันรับงานนี้?')) {
        appStore.assignDriver(orderId, DRIVER_NAME);
        renderJobs();
        // Scroll to top to see current job
        window.scrollTo(0, 0);
    }
}

function completeJob(orderId) {
    if (confirm('ยืนยันการส่งมอบสำเร็จ?')) {
        appStore.updateOrderStatus(orderId, 'DELIVERED');
        renderJobs();
    }
}

// Start
window.addEventListener('DOMContentLoaded', init);
window.acceptJob = acceptJob;
window.completeJob = completeJob;
