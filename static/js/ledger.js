/* =====================================================
   GLOBAL STATE
===================================================== */
let currentEditId = null;
let ledgerData = [];
/* =====================================================
   LOAD LEDGER
===================================================== */
function loadLedger() {
  const tbody = document.getElementById("ledgerBody");
  const balanceEl = document.getElementById("balance");
  if (!tbody || !balanceEl) return;
  authFetch("/api/transactions")
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
            <button class="edit-btn" onclick="openEdit(${t.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTxn(${t.id})">Delete</button>
            </td>
          </tr>
        `);
      });
    })
    .catch(() => showToast("Unable to load transactions", "error"));
  authFetch("/api/ledger")
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
  authFetch(`/api/delete-transaction/${id}`, { method: "DELETE" })
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
  if (!currentEditId) return;
  authFetch(`/api/edit-transaction/${currentEditId}`, {
    method: "PUT",
    body: {
      amount: editAmount.value,
      type: editType.value,
      category: editCategory.value,
      description: editDescription.value,
      mode: editMode.value,
      date: editDate.value
    }
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
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Download failed");
      return res.blob(); // ✅ THIS IS THE KEY
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ledger.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
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
