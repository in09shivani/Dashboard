
// Sample dataset (converted from project)
const orders = [
  {id: "JM-1001", date: "2025-09-10", customer: "Anita Joshi", items: 2, amount: 12400, status: "pending", details: "2x Diamond stud, 1x polishing"},
  {id: "JM-1002", date: "2025-09-12", customer: "Ravi Mehra", items: 1, amount: 5600, status: "shipped", details: "Gold necklace"},
  {id: "JM-1003", date: "2025-09-14", customer: "Sana Kapoor", items: 3, amount: 27800, status: "delivered", details: "Custom ring set"},
  {id: "JM-1004", date: "2025-09-15", customer: "Arjun Patel", items: 1, amount: 4200, status: "cancelled", details: "Refund processed"},
  {id: "JM-1005", date: "2025-09-16", customer: "Leena Rao", items: 4, amount: 45200, status: "pending", details: "Engagement set + cleaning"},
];

// Utilities
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function formatCurrency(n){ return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n); }
function formatDate(d){ return new Date(d).toLocaleDateString('en-IN'); }

// State
let state = {
  filter: 'all',
  sort: 'date_desc',
  query: ''
};

// DOM nodes
const tbody = document.querySelector('#ordersTable tbody');
const totalOrdersEl = document.getElementById('totalOrders');
const totalRevenueEl = document.getElementById('totalRevenue');
const pendingCountEl = document.getElementById('pendingCount');
const deliveredCountEl = document.getElementById('deliveredCount');
const statusFilter = document.getElementById('statusFilter');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const downloadCsv = document.getElementById('downloadCsv');

// Render functions
function computeStats(list){
  const total = list.length;
  const revenue = list.reduce((s,o)=>s+o.amount,0);
  const pending = list.filter(o=>o.status==='pending').length;
  const delivered = list.filter(o=>o.status==='delivered').length;
  totalOrdersEl.textContent = total;
  totalRevenueEl.textContent = formatCurrency(revenue);
  pendingCountEl.textContent = pending;
  deliveredCountEl.textContent = delivered;
}

function renderTable(list){
  tbody.innerHTML = '';
  if(list.length===0){
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b">No orders found</td></tr>';
    return;
  }
  list.forEach(o=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${formatDate(o.date)}</td>
      <td>${o.customer}</td>
      <td>${o.items}</td>
      <td>${formatCurrency(o.amount)}</td>
      <td><span class="status-pill status-${o.status}">${o.status}</span></td>
      <td><button class="btn view-btn" data-id="${o.id}">View</button></td>
    `;
    tbody.appendChild(tr);
  });
  // attach view handlers
  $$('.view-btn').forEach(btn=>btn.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    openModal(id);
  }));
}

function applyFilters(){
  let filtered = orders.slice();
  if(state.filter !== 'all') filtered = filtered.filter(o=>o.status===state.filter);
  if(state.query && state.query.trim().length){
    const q = state.query.toLowerCase();
    filtered = filtered.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || String(o.amount).includes(q));
  }
  // sorting
  if(state.sort === 'date_desc') filtered.sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(state.sort === 'date_asc') filtered.sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(state.sort === 'amount_desc') filtered.sort((a,b)=>b.amount - a.amount);
  if(state.sort === 'amount_asc') filtered.sort((a,b)=>a.amount - b.amount);
  computeStats(filtered);
  renderTable(filtered);
}

function openModal(orderId){
  const ord = orders.find(o=>o.id===orderId);
  if(!ord) return;
  modalContent.innerHTML = `
    <h2>Order ${ord.id}</h2>
    <p><strong>Date:</strong> ${formatDate(ord.date)}</p>
    <p><strong>Customer:</strong> ${ord.customer}</p>
    <p><strong>Items:</strong> ${ord.items}</p>
    <p><strong>Amount:</strong> ${formatCurrency(ord.amount)}</p>
    <p><strong>Status:</strong> <span class="status-pill status-${ord.status}">${ord.status}</span></p>
    <hr>
    <p>${ord.details}</p>
  `;
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){ modal.setAttribute('aria-hidden','true'); modalContent.innerHTML=''; }

// CSV download
function toCSV(rows){
  const header = ['Order ID','Date','Customer','Items','Amount','Status','Details'];
  const lines = [header.join(',')];
  rows.forEach(r=>{
    const cols = [r.id, r.date, r.customer, r.items, r.amount, r.status, `"${(r.details||'').replace(/"/g,'""')}"`];
    lines.push(cols.join(','));
  });
  return lines.join('\n');
}
function download(filename, content){
  const blob = new Blob([content], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

// Event bindings
statusFilter.addEventListener('change', e=>{ state.filter = e.target.value; applyFilters(); });
sortSelect.addEventListener('change', e=>{ state.sort = e.target.value; applyFilters(); });
searchInput.addEventListener('input', e=>{ state.query = e.target.value; applyFilters(); });
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
downloadCsv.addEventListener('click', ()=>{
  const csv = toCSV(orders);
  download('jewel-market-orders.csv', csv);
});

// initial render
applyFilters();
