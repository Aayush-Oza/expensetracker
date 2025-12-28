const API_BASE = "https://exptrk-8ssb.onrender.com";

fetch(`${API_BASE}/api/analytics`, {
  credentials: "include"
})
  .then(async res => {
    let data = {};
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid JSON response");
    }

    if (!res.ok) {
      throw new Error(data.error || "Analytics request failed");
    }

    return data;
  })
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
    // ❌ No alerts
    // ✅ Silent failure
    // ✅ Developer-only visibility
    console.warn("Analytics not loaded:", err.message);
  });
