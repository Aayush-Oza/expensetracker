const API_BASE = "https://exptrk-8ssb.onrender.com";

// 🔥 JWT-aware fetch
function apiFetch(endpoint) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  return fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  }).then(async res => {
    let data = {};
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid JSON response");
    }

    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  });
}

// ================================
// LOAD ANALYTICS
// ================================
apiFetch("/api/analytics")
  .then(data => {

    /* ===== PAYMENT MODE ===== */
    const modeCanvas = document.getElementById("modeChart");
    if (modeCanvas && data.modes && Object.keys(data.modes).length) {
      new Chart(modeCanvas, {
        type: "pie",
        data: {
          labels: Object.keys(data.modes),
          datasets: [{
            data: Object.values(data.modes)
          }]
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
          datasets: [{
            data: Object.values(data.types)
          }]
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
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

  })
  .catch(err => {
    // Silent for users, loud for devs
    console.warn("Analytics not loaded:", err.message);

    // Optional: force logout if token is invalid
    if (err.message.toLowerCase().includes("unauthorized")) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    }
  });
