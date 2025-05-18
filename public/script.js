document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const processBtn = document.getElementById('processBtn');
    const retryBtn = document.getElementById('retryBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const statusText = document.getElementById('statusText');
    const resultContainer = document.getElementById('resultContainer');
    const resultTableBody = document.getElementById('resultTableBody');
    const successCount = document.getElementById('successCount');
    
    // Data variables
    let schoolData = [];
    let processedData = [];
    
    // Initialize buttons state
    processBtn.disabled = true;
    downloadBtn.disabled = true;
    
    // Event Listeners
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-300', 'bg-blue-50/50');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-blue-300', 'bg-blue-50/50');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-300', 'bg-blue-50/50');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelection();
        }
    });
    
    fileInput.addEventListener('change', handleFileSelection);
    processBtn.addEventListener('click', processData);
    retryBtn.addEventListener('click', retryFailed);
    downloadBtn.addEventListener('click', downloadResults);
    
    // Functions
    function handleFileSelection() {
        if (fileInput.files.length) {
            const file = fileInput.files[0];
            uploadArea.innerHTML = `
                <div class="mx-auto w-12 h-12 mb-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p class="text-gray-700 font-medium mb-1">${file.name}</p>
                <p class="text-xs text-gray-400">${(file.size / 1024).toFixed(1)} KB</p>
            `;
            processBtn.disabled = false;
            readExcelFile(file);
        }
    }
    
    function readExcelFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get data from first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                schoolData = XLSX.utils.sheet_to_json(firstSheet);
                
                console.log('School data loaded:', schoolData);
            } catch (error) {
                console.error('Error reading Excel file:', error);
                alert('Gagal membaca file. Pastikan format file benar.');
                resetUploadArea();
            }
        };
        
        reader.onerror = function() {
            alert('Terjadi kesalahan saat membaca file.');
            resetUploadArea();
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    function resetUploadArea() {
        uploadArea.innerHTML = `
            <div class="mx-auto w-12 h-12 mb-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>
            <p class="text-gray-600 mb-1">Seret file Excel ke sini atau</p>
            <p class="text-sm text-gray-400 mb-3">Format harus mengandung kolom NPSN</p>
            <button class="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Pilih File
            </button>
        `;
        processBtn.disabled = true;
    }
    
    async function processData() {
        if (schoolData.length === 0) {
            showAlert('Tidak ada data sekolah yang bisa diproses', 'error');
            return;
        }
        
        // Prepare UI for processing
        processBtn.disabled = true;
        retryBtn.classList.add('hidden');
        downloadBtn.disabled = true;
        progressContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        processedData = [];
        
        // Filter valid NPSN data
        const validSchools = schoolData.filter(school => school.NPSN && String(school.NPSN).length >= 8);
        
        if (validSchools.length === 0) {
            statusText.textContent = 'Tidak ditemukan data dengan NPSN valid';
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            return;
        }
        
        // Process schools
        await processSchools(validSchools);
    }
    
    async function processSchools(schoolsToProcess, isRetry = false) {
        const total = schoolsToProcess.length;
        let completed = 0;
        
        // Reset progress
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        
        // If retry, remove previously failed data
        if (isRetry) {
            processedData = processedData.filter(item => item.status !== 'Gagal');
        }
        
        // Process each school
        for (const school of schoolsToProcess) {
            if (!school.NPSN) continue;
            
            try {
                statusText.textContent = `Memproses: ${school.NAMA_SEKOLAH || school['NAMA SEKOLAH'] || 'N/A'}`;
                
                // Random delay between 0.5-1.5 seconds
                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
                
                const email = await fetchSchoolEmail(school.NPSN);
                
                // Add to processed data
                processedData.push({
                    no: school.NO || school['NO'] || processedData.length + 1,
                    nama: school.NAMA_SEKOLAH || school['NAMA SEKOLAH'] || 'N/A',
                    npsn: school.NPSN,
                    email: email || 'Tidak ditemukan',
                    status: email ? 'Berhasil' : 'Gagal'
                });
                
                // Update progress
                completed++;
                const progress = Math.round((completed / total) * 100);
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
                
            } catch (error) {
                console.error(`Error processing NPSN ${school.NPSN}:`, error);
                processedData.push({
                    no: school.NO || school['NO'] || processedData.length + 1,
                    nama: school.NAMA_SEKOLAH || school['NAMA SEKOLAH'] || 'N/A',
                    npsn: school.NPSN,
                    email: 'Error: ' + (error.message || 'Gagal memproses'),
                    status: 'Gagal'
                });
            }
        }
        
        // Processing complete
        statusText.textContent = 'Proses selesai';
        displayResults();
        downloadBtn.disabled = false;
        processBtn.disabled = false;
        
        // Update success count
        const success = processedData.filter(d => d.status === 'Berhasil').length;
        const totalProcessed = processedData.length;
        successCount.textContent = `${success} Berhasil`;
        
        // Show retry button if there are failures
        const failedCount = processedData.filter(d => d.status === 'Gagal').length;
        if (failedCount > 0) {
            retryBtn.classList.remove('hidden');
        }
    }
    
    async function fetchSchoolEmail(npsn) {
        const url = `https://referensi.data.kemdikbud.go.id/tabs.php?npsn=${npsn}`;
        
        try {
            // Using CORS proxy to avoid CORS issues
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetchWithTimeout(proxyUrl, {
                timeout: 8000 // 8 seconds timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.contents) {
                throw new Error('Data tidak ditemukan');
            }
            
            // Parse HTML response
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data.contents, 'text/html');
            
            // Look for email in tables
            const tables = htmlDoc.querySelectorAll('table');
            let email = null;
            
            for (const table of tables) {
                const rows = table.querySelectorAll('tr');
                
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    
                    // Look for email pattern
                    for (let i = 0; i < cells.length; i++) {
                        const cellText = cells[i].textContent.trim();
                        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
                        const emailMatch = cellText.match(emailRegex);
                        
                        if (emailMatch) {
                            email = emailMatch[0].toLowerCase();
                            break;
                        } else if (cellText.toLowerCase().includes('email') && i < cells.length - 1) {
                            const nextCellText = cells[i + 1].textContent.trim();
                            const nextEmailMatch = nextCellText.match(emailRegex);
                            if (nextEmailMatch) {
                                email = nextEmailMatch[0].toLowerCase();
                                break;
                            }
                        }
                    }
                    
                    if (email) break;
                }
                
                if (email) break;
            }
            
            return email;
            
        } catch (error) {
            console.error(`Error fetching data for NPSN ${npsn}:`, error);
            return null;
        }
    }
    
    function fetchWithTimeout(url, options = {}) {
        const { timeout = 8000 } = options;
        
        const controller = new AbortController();
        const { signal } = controller;
        
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        return fetch(url, {
            ...options,
            signal
        }).finally(() => clearTimeout(timeoutId));
    }
    
    function displayResults() {
        resultTableBody.innerHTML = '';
        
        processedData.forEach(data => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            // NO
            const noCell = document.createElement('td');
            noCell.className = 'px-4 py-3 text-gray-500';
            noCell.textContent = data.no;
            row.appendChild(noCell);
            
            // Nama Sekolah
            const namaCell = document.createElement('td');
            namaCell.className = 'px-4 py-3';
            const namaText = document.createElement('div');
            namaText.className = 'max-w-xs truncate';
            namaText.textContent = data.nama;
            namaText.title = data.nama;
            namaCell.appendChild(namaText);
            row.appendChild(namaCell);
            
            // Email
            const emailCell = document.createElement('td');
            emailCell.className = `px-4 py-3 ${data.status === 'Gagal' ? 'text-red-500' : 'text-gray-700'}`;
            emailCell.textContent = data.email;
            row.appendChild(emailCell);
            
            // Status
            const statusCell = document.createElement('td');
            statusCell.className = 'px-4 py-3';
            const statusBadge = document.createElement('span');
            statusBadge.className = `text-xs px-2.5 py-0.5 rounded-full ${
                data.status === 'Berhasil' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`;
            statusBadge.textContent = data.status;
            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);
            
            resultTableBody.appendChild(row);
        });
        
        resultContainer.classList.remove('hidden');
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    async function retryFailed() {
        if (processedData.length === 0) {
            showAlert('Tidak ada data yang bisa diproses ulang', 'error');
            return;
        }
        
        const failedSchools = processedData
            .filter(item => item.status === 'Gagal')
            .map(item => ({
                NO: item.no,
                NAMA_SEKOLAH: item.nama,
                NPSN: item.npsn
            }));
        
        if (failedSchools.length === 0) {
            showAlert('Tidak ada data yang gagal untuk diproses ulang', 'info');
            return;
        }
        
        processBtn.disabled = true;
        retryBtn.classList.add('hidden');
        downloadBtn.disabled = true;
        progressContainer.classList.remove('hidden');
        
        await processSchools(failedSchools, true);
    }
    
    function downloadResults() {
        if (processedData.length === 0) {
            showAlert('Tidak ada data yang bisa didownload', 'error');
            return;
        }
        
        // Create filename with timestamp
        const now = new Date();
        const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Prepare worksheet
        const ws = XLSX.utils.json_to_sheet(processedData.map(d => ({
            'NO': d.no,
            'NAMA SEKOLAH': d.nama,
            'NPSN': d.npsn,
            'EMAIL': d.email,
            'STATUS': d.status
        })));
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hasil Ekstraksi');
        
        // Download file
        XLSX.writeFile(wb, `email_sekolah_${dateStr}_${timeStr}.xlsx`);
    }
    
    function showAlert(message, type = 'info') {
        // Implement a nice toast notification here if needed
        alert(message);
    }
});