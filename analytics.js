const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   JWT FETCH HELPER (STRICT)
===================================================== */
function apiFetch(endpoint) {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.clear();
    window.location.replace("index.html");
    return Promise.reject(new Error("NO_TOKEN"));
  }

  return fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
    .then(async res => {
      if (res.status === 401) {
        // hard stop — token is invalid
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
   LOAD ANALYTICS
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  apiFetch("/api/analytics")
    .then(data => {

      /* ===== PAYMENT MODE ===== */
      const modeCanvas = document.getElementById("modeChart");
      if (modeCanvas && data.modes && Object.keys(data.modes).length) {
        new Chart(modeCanvas, {
          type: "pie",
          data: {
            labels: Object.keys(data.modes),
            datasets: [{ data: Object.values(data.modes) }]
          }
        });
      }

      /* ===== DEBIT VS CREDIT ===== */
      const typeCanvas = document.getElementById("typeChart");
      if (typeCanvas && data.types && Object.keys(data.types).length) {
        new Chart(typeCanvas, {
          type: "doughnut",
          data: {
            labels: Object.keys(data.types),
            datasets: [{ data: Object.values(data.types) }]
          }
        });
      }

      /* ===== CATEGORY EXPENSE ===== */
      const categoryCanvas = document.getElementById("categoryChart");
      if (categoryCanvas && data.categories && Object.keys(data.categories).length) {
        new Chart(categoryCanvas, {
          type: "bar",
          data: {
            labels: Object.keys(data.categories),
            datasets: [{
              label: "Expense",
              data: Object.values(data.categories)
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } }
          }
        });
      }

    })
    .catch(() => {
      // handled centrally (redirect already happened)
    });
});
