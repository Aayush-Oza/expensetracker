const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   JWT FETCH HELPER (FINAL)
===================================================== */
function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.clear();
    window.location.replace("index.html");
    return Promise.reject(new Error("NO_TOKEN"));
  }

  return fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })
    .then(async res => {
      if (res.status === 401) {
        // hard fail – token is invalid
        localStorage.clear();
        window.location.replace("index.html");
        throw new Error("UNAUTHORIZED");
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "REQUEST_FAILED");
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
    body: {
      amount: amount.value,
      type: type.value,
      category: category.value,
      description: description.value,
      mode: mode.value,
      date: date.value
    }
  })
    .then(() => {
      showToast("Transaction added");

      amount.value = "";
      category.value = "";
      description.value = "";
      date.value = "";
    })
    .catch(err => {
      // only show toast for real app errors
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
