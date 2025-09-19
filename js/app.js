document.addEventListener('DOMContentLoaded', () => {
    // --- Sample Data (replace with actual fetched data or parsed Excel data) ---
    let ordersData = [
        { id: 'JM-1006', date: '2025-09-17', customer: 'Priya Sharma', items: 2, amount: 15200, status: 'pending' },
        { id: 'JM-1005', date: '2025-09-16', customer: 'Leena Rao', items: 4, amount: 45200, status: 'pending' },
        { id: 'JM-1004', date: '2025-09-15', customer: 'Arjun Patel', items: 1, amount: 4200, status: 'cancelled' },
        { id: 'JM-1003', date: '2025-09-14', customer: 'Sana Kapoor', items: 3, amount: 27800, status: 'delivered' },
        { id: 'JM-1002', date: '2025-09-12', customer: 'Ravi Mehra', items: 1, amount: 5600, status: 'shipped' },
        { id: 'JM-1001', date: '2025-09-10', customer: 'Anita Joshi', items: 2, amount: 12400, status: 'pending' },
        { id: 'JM-999', date: '2025-09-08', customer: 'Alok Verma', items: 5, amount: 35000, status: 'shipped' },
        { id: 'JM-998', date: '2025-09-05', customer: 'Deepa Singh', items: 1, amount: 8500, status: 'delivered' },
    ];

    let currentFilters = {
        status: 'all',
        sortBy: 'date-desc',
        searchQuery: ''
    };

    const ordersList = document.getElementById('orders-list');
    const statusFilter = document.getElementById('status-filter');
    const sortByFilter = document.getElementById('sort-by');
    const globalSearch = document.getElementById('global-search');
    const uploadInput = document.getElementById('excel-upload');
    const uploadStatus = document.getElementById('upload-status');

    // --- Utility Functions ---
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    // --- Render Orders Function ---
    const renderOrders = (data) => {
        // Clear previous orders, but keep the header
        while (ordersList.children.length > 1) {
            ordersList.removeChild(ordersList.lastChild);
        }

        data.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            // Add a border color based on status
            orderItem.style.borderLeftColor = `var(--${order.status}-color)`;

            orderItem.innerHTML = `
                <span class="order-id">${order.id}</span>
                <span class="date">${formatDate(order.date)}</span>
                <span class="customer">${order.customer}</span>
                <span class="items">${order.items}</span>
                <span class="amount">${formatCurrency(order.amount)}</span>
                <span class="status ${order.status}">${order.status}</span>
                <span class="actions"><button data-order-id="${order.id}">View</button></span>
            `;
            ordersList.appendChild(orderItem);
        });

        // Add event listeners for 'View' buttons
        ordersList.querySelectorAll('.actions button').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                alert(`Viewing details for Order ID: ${orderId}`);
                // In a real application, you would open a modal or navigate to a detail page
            });
        });
    };

    // --- Update Summary Cards ---
    const updateSummaryCards = (data) => {
        document.getElementById('total-orders-value').textContent = data.length;
        const totalRevenue = data.reduce((sum, order) => sum + order.amount, 0);
        document.getElementById('total-revenue-value').textContent = formatCurrency(totalRevenue);
        document.getElementById('pending-orders-value').textContent = data.filter(order => order.status === 'pending').length;
        document.getElementById('delivered-orders-value').textContent = data.filter(order => order.status === 'delivered').length;
    };

    // --- Filter & Sort Logic ---
    const applyFiltersAndSort = () => {
        let filteredData = [...ordersData]; // Create a shallow copy to avoid modifying original

        // 1. Apply Search Query
        if (currentFilters.searchQuery) {
            const query = currentFilters.searchQuery.toLowerCase();
            filteredData = filteredData.filter(order =>
                order.id.toLowerCase().includes(query) ||
                order.customer.toLowerCase().includes(query) ||
                order.status.toLowerCase().includes(query)
                // Add more fields to search as needed
            );
        }

        // 2. Apply Status Filter
        if (currentFilters.status !== 'all') {
            filteredData = filteredData.filter(order => order.status === currentFilters.status);
        }

        // 3. Apply Sorting
        filteredData.sort((a, b) => {
            if (currentFilters.sortBy === 'date-desc') {
                return new Date(b.date) - new Date(a.date);
            } else if (currentFilters.sortBy === 'date-asc') {
                return new Date(a.date) - new Date(b.date);
            } else if (currentFilters.sortBy === 'amount-desc') {
                return b.amount - a.amount;
            } else if (currentFilters.sortBy === 'amount-asc') {
                return a.amount - b.amount;
            }
            return 0;
        });

        renderOrders(filteredData);
        updateSummaryCards(filteredData); // Update cards based on filtered data
    };

    // --- Event Listeners for Filters ---
    statusFilter.addEventListener('change', (event) => {
        currentFilters.status = event.target.value;
        applyFiltersAndSort();
    });

    sortByFilter.addEventListener('change', (event) => {
        currentFilters.sortBy = event.target.value;
        applyFiltersAndSort();
    });

    globalSearch.addEventListener('input', (event) => {
        currentFilters.searchQuery = event.target.value;
        applyFiltersAndSort();
    });

    // --- Excel Upload Functionality ---
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadStatus.textContent = `Uploading: ${file.name}...`;
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0]; // Assuming first sheet
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    // Assuming the first row is headers, process subsequent rows
                    if (json.length > 1) {
                        const headers = json[0];
                        const newOrders = json.slice(1).map(row => {
                            let order = {};
                            // Map columns to your data structure. Adjust indices/keys as needed.
                            // Example: Order ID, Date, Customer, Items, Amount, Status
                            order.id = row[0];
                            order.date = row[1] ? new Date(Math.round((row[1] - 25569) * 86400 * 1000)).toISOString().split('T')[0] : ''; // Convert Excel date to YYYY-MM-DD
                            order.customer = row[2];
                            order.items = row[3];
                            order.amount = row[4];
                            order.status = row[5] ? row[5].toLowerCase() : 'unknown';
                            return order;
                        });

                        // Append new orders to existing data or replace. For this example, let's replace.
                        ordersData = newOrders;
                        uploadStatus.textContent = `Successfully uploaded: ${file.name}`;
                        currentFilters.searchQuery = ''; // Reset search on new data
                        globalSearch.value = '';
                        applyFiltersAndSort(); // Re-render with new data
                    } else {
                        uploadStatus.textContent = 'Excel file is empty or has no data rows.';
                    }
                } catch (error) {
                    console.error("Error reading Excel file:", error);
                    uploadStatus.textContent = `Error reading file: ${error.message}`;
                }
            };

            reader.onerror = (e) => {
                uploadStatus.textContent = `Failed to read file: ${reader.error.name}`;
                console.error("FileReader error:", reader.error);
            };

            reader.readAsArrayBuffer(file);
        } else {
            uploadStatus.textContent = 'No file chosen';
        }
    });


    // --- Initial Render ---
    applyFiltersAndSort();
});
