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
    credentials: "include", // REQUIRED for session cookie
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  })
    .then(async res => {
      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data;
    });
}

/* =====================================================
   LOAD LEDGER (TABLE + BALANCE)
===================================================== */
function loadLedger() {
  const tbody = document.getElementById("ledgerBody");
  const balanceEl = document.getElementById("balance");

  if (!tbody || !balanceEl) return;

  /* ===== LOAD TRANSACTIONS ===== */
  apiFetch("/api/transactions")
    .then(data => {
      ledgerData = data;
      tbody.innerHTML = "";

      if (!data.length) {
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
              <button class="edit-btn" onclick="openEdit(${t.id})">Edit</button>
              <button class="delete-btn" onclick="deleteTxn(${t.id})">Delete</button>
            </td>
          </tr>
        `);
      });
    })
    .catch(err => {
      console.warn("Ledger load failed:", err.message);
      showToast("Unable to load transactions", "error");
    });

  /* ===== LOAD BALANCE ===== */
  apiFetch("/api/ledger")
    .then(data => {
      balanceEl.textContent = data.balance ?? 0;
    })
    .catch(err => {
      console.warn("Balance load failed:", err.message);
      balanceEl.textContent = "—";
    });
}

/* =====================================================
   DELETE TRANSACTION
===================================================== */
function deleteTxn(id) {
  apiFetch(`/api/delete-transaction/${id}`, { method: "DELETE" })
    .then(() => {
      showToast("Transaction deleted");
      loadLedger();
    })
    .catch(() => showToast("Delete failed", "error"));
}

/* =====================================================
   EDIT TRANSACTION
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

function closeEdit() {
  document.getElementById("editModal").classList.add("hidden");
  currentEditId = null;
}

function saveEdit() {
  if (!currentEditId) return;

  apiFetch(`/api/edit-transaction/${currentEditId}`, {
    method: "PUT",
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
   DOWNLOAD LEDGER (PDF)
===================================================== */
function downloadLedger() {
  // MUST be absolute URL for cross-origin file download
  window.location.assign(`${API_BASE}/api/download-ledger`);
}

/* =====================================================
   TOAST
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
