/* =====================================================
   ADD TRANSACTION
===================================================== */
function addTransaction() {
  authFetch("/api/add-transaction", {
    method: "POST",
    body: {
      amount: amount.value,
      type: type.value,
      category: category.value,
      description: description.value,
      mode: mode.value,
      date: date.value
    }
  })
    .then(() => showToast("Transaction added"))
    .catch(err => {
      if (err.message === "REQUEST_FAILED") {
        showToast("Unable to add transaction", "error");
      }
    });
}

/* =====================================================
   LOGOUT (USER ACTION ONLY)
===================================================== */
function logout() {
  localStorage.clear();
  window.location.replace("index.html");
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
