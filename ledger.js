const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   GLOBAL STATE
===================================================== */
let currentEditId = null;
let ledgerData = [];

/* =====================================================
   JWT FETCH WRAPPER (PASSIVE)
===================================================== */
function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return Promise.reject(new Error("NO_TOKEN"));
  }

  return fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    },
    body: options.body
  }).then(async res => {
    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (res.status === 401) {
      return Promise.reject(new Error("UNAUTHORIZED"));
    }

    if (!res.ok) {
      return Promise.reject(
        new Error(data.error || "REQUEST_FAILED")
      );
    }

    return data;
  });
}

/* =====================================================
   LOAD LEDGER
===================================================== */
function loadLedger() {
  const tbody = document.getElementById("ledgerBody");
  const balanceEl = document.getElementById("balance");
  if (!tbody || !balanceEl) return;

  apiFetch("/api/transactions")
    .then(data => {
      ledgerData = data;
      tbody.innerHTML = "";

      if (!data.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center;opacity:.6">
              No transactions yet
            </td>
          </tr>
        `;
        return;
      }

      data.forEach(t => {
        tbody.insertAdjacentHTML("beforeend", `
          <tr>
            <td>${t.date}</td>
            <td>${t.type}</td>
            <td>${t.category}</td>
            <td>${t.description || "-"}</td>
            <td>${t.mode}</td>
            <td>${t.amount}</td>
            <td class="actions">
              <button onclick="openEdit(${t.id})">Edit</button>
              <button onclick="deleteTxn(${t.id})">Delete</button>
            </td>
          </tr>
        `);
      });
    })
    .catch(err => {
      if (err.message !== "UNAUTHORIZED") {
        showToast("Unable to load transactions", "error");
      }
      // auth-guard will redirect if token is truly gone
    });

  apiFetch("/api/ledger")
    .then(data => {
      balanceEl.textContent = data.balance ?? 0;
    })
    .catch(() => {
      balanceEl.textContent = "—";
    });
}

/* =====================================================
   DELETE
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
   EDIT
===================================================== */
function openEdit(id) {
  currentEditId = id;
  const txn = ledgerData.find(t => t.id === id);
  if (!txn) return;

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
   DOWNLOAD LEDGER
===================================================== */
function downloadLedger() {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API_BASE}/api/download-ledger`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ledger.pdf";
      a.click();
      URL.revokeObjectURL(url);
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
  setTimeout(() => (toast.className = "toast"), 2500);
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", loadLedger);
