const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   JWT FETCH HELPER (SAFE)
===================================================== */
function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token");
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
      // token is invalid – clear it, but DO NOT redirect here
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

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
      if (err.message === "Unauthorized") {
        // auth-guard will redirect on next load
        return;
      }
      showToast("Unable to add transaction", "error");
    });
}

/* =====================================================
   LOGOUT (USER ACTION ONLY)
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
