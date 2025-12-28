/* =====================================================
   ADD TRANSACTION
===================================================== */
function addTransaction() {
  let selectedCategory = category.value;

  fetch("/api/add-transaction", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amount.value,
      type: type.value,
      category: selectedCategory,
      description: description.value,
      mode: mode.value,
      date: date.value
    })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data;
  })
  .then(data => {
    if (!data.success) {
      showToast("Failed to add transaction", "error");
      return;
    }

    showToast("Transaction added");

    amount.value = "";
    category.value = "";
    description.value = "";
    date.value = "";
  })
  .catch(() => showToast("Server error", "error"));
}

/* =====================================================
   LOGOUT
===================================================== */
function logout() {
  window.location.href = "/logout";
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
