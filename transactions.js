const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   JWT FETCH HELPER (CLEAN & CONSISTENT)
===================================================== */
function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    // user is not logged in
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
      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.status === 401) {
        // token invalid / expired
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
      if (err.message === "NO_TOKEN" || err.message === "UNAUTHORIZED") {
        // let auth-guard handle redirect
        return;
      }

      console.error(err);
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
