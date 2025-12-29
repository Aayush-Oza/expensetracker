const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   GLOBAL STATE
===================================================== */
let currentEditId = null;
let ledgerData = [];

/* =====================================================
   JWT FETCH WRAPPER
===================================================== */
function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return Promise.reject("No auth token");
  }

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    }
  }).then(async res => {
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
      console.warn("Ledger load failed:", err);
      showToast("Unable to load transactions", "error");
    });

  /* ===== LOAD BALANCE ===== */
  apiFetch("/api/ledger")
    .then(data => {
      balanceEl.textContent = data.balance ?? 0;
    })
    .catch(() => {
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
   DOWNLOAD LEDGER (PDF) – JWT SAFE
===================================================== */
function downloadLedger() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  fetch(`${API_BASE}/api/download-ledger`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Download failed");
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ledger.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(() => showToast("Download failed", "error"));
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
