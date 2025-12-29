const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   JWT FETCH HELPER
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  });
}

/* =====================================================
   ADD TRANSACTION
===================================================== */
function addTransaction() {
  apiFetch("/api/add-transaction", {
    method: "POST",
    body: JSON.stringify({
      amount: amount.value,
      type: type.value,
      category: category.value,
      description: description.value,
      mode: mode.value,
      date: date.value
    })
  })
    .then(() => {
      showToast("Transaction added");

      amount.value = "";
      category.value = "";
      description.value = "";
      date.value = "";
    })
    .catch(err => {
      console.error(err);
      showToast(err.message || "Server error", "error");
    });
}

/* =====================================================
   LOGOUT (JWT)
===================================================== */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
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
