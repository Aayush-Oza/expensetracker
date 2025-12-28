const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   LOGIN
===================================================== */
function login() {
  fetch(`${API_BASE}/api/login`, {
    method: "POST",
    credentials: "include", // keep sessions working
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data;
  })
  .then(data => {
    if (data.success) {
      // IMPORTANT: GitHub Pages has no /dashboard route
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid email or password");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Server error");
  });
}

/* =====================================================
   REGISTER
===================================================== */
function register() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!nameInput || !emailInput || !passwordInput) {
    alert("Form inputs not found");
    return;
  }

  fetch(`${API_BASE}/api/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim()
    })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data;
  })
  .then(data => {
    if (data.success) {
      // redirect to login page on GitHub Pages
      window.location.href = "index.html";
    } else {
      alert(data.error);
    }
  })
  .catch(err => {
    console.error(err);
    alert("Server error");
  });
}
