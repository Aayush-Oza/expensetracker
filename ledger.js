const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   GLOBAL STATE
===================================================== */
let currentEditId = null;
let ledgerData = [];

/* =====================================================
   FETCH WRAPPER (SESSION SAFE)
===================================================== */
function apiFetch(endpoint, options = {}) {
  return fetch(`${API_BASE}${endpoint}`, {
    credentials: "include", // 🔥 REQUIRED FOR SESSIONS
    ...options
  }).then(res => {
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  });
}

/* =====================================================
   LOAD LEDGER (TABLE + BALANCE)
===================================================== */
function loadLedger() {
  const tbody = document.getElementById("ledgerBody");
  const balanceEl = document.getElementById("balance");

  if (!tbody || !balanceEl) return;

  // Load transactions
  apiFetch("/api/transactions")
    .then(data => {
      ledgerData = data;
      tbody.innerHTML = "";

      if (data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; opacity:.6">
              No transactions yet
            </td>
          </tr>
        `;
        return;
      }

      data.forEach(t => {
        tbody.insertAdjacentHTML("beforeend", `
          <tr>
            <td data-label="Date">${t.date}</td>
            <td data-label="Type">${t.type}</td>
            <td data-label="Category">${t.category}</td>
            <td data-label="Description">${t.description || "-"}</td>
            <td data-label="Mode">${t.mode}</td>
            <td data-label="Amount">${t.amount}</td>
            <td data-label="Actions" class="actions">
              <button type="button" class="edit-btn" onclick="openEdit(${t.id})">
                Edit
              </button>
              <button type="button" class="delete-btn" onclick="deleteTxn(${t.id})">
                Delete
              </button>
            </td>
          </tr>
        `);
      });
    })
    .catch(() => showToast("Failed to load transactions", "error"));

  // Load balance
  apiFetch("/api/ledger")
    .then(data => {
      balanceEl.innerText = data.balance;
    })
    .catch(() => showToast("Failed to load balance", "error"));
}

/* =====================================================
   DELETE TRANSACTION (AJAX)
===================================================== */
function deleteTxn(id) {
  apiFetch(`/api/delete-transaction/${id}`, {
    method: "DELETE"
  })
    .then(() => {
      showToast("Transaction deleted");
      loadLedger();
    })
    .catch(() => showToast("Delete failed", "error"));
}

/* =====================================================
   OPEN EDIT MODAL
===================================================== */
function openEdit(id) {
  currentEditId = id;

  const txn = ledgerData.find(t => t.id === id);
  if (!txn) {
    showToast("Transaction not found", "error");
    return;
  }

  editAmount.value = txn.amount;
  editType.value = txn.type;
  editCategory.value = txn.category;
  editDescription.value = txn.description || "";
  editMode.value = txn.mode;
  editDate.value = txn.date;

  document.getElementById("editModal").classList.remove("hidden");
}

/* =====================================================
   CLOSE EDIT MODAL
===================================================== */
function closeEdit() {
  document.getElementById("editModal").classList.add("hidden");
  currentEditId = null;
}

/* =====================================================
   SAVE EDIT (FULL UPDATE, AJAX)
===================================================== */
function saveEdit() {
  if (!currentEditId) return;

  apiFetch(`/api/edit-transaction/${currentEditId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: editAmount.value,
      type: editType.value,
      category: editCategory.value,
      description: editDescription.value,
      mode: editMode.value,
      date: editDate.value
    })
  })
    .then(() => {
      showToast("Transaction updated");
      closeEdit();
      loadLedger();
    })
    .catch(() => showToast("Update failed", "error"));
}

/* =====================================================
   DOWNLOAD LEDGER
===================================================== */
function downloadLedger() {
  window.location.href = `${API_BASE}/api/download-ledger`;
}

/* =====================================================
   TOAST (SAFE GUARD)
===================================================== */
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", loadLedger);
