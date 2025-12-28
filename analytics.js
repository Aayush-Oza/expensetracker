fetch("/api/analytics", { credentials: "include" })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data;
  })
  .then(data => {

    // ===== PAYMENT MODE =====
    new Chart(document.getElementById("modeChart"), {
      type: "pie",
      data: {
        labels: Object.keys(data.modes),
        datasets: [{
          data: Object.values(data.modes)
        }]
      }
    });

    // ===== DEBIT VS CREDIT =====
    new Chart(document.getElementById("typeChart"), {
      type: "doughnut",
      data: {
        labels: Object.keys(data.types),
        datasets: [{
          data: Object.values(data.types)
        }]
      }
    });

    // ===== CATEGORY EXPENSE =====
    new Chart(document.getElementById("categoryChart"), {
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

  });
