const API_BASE = "https://exptrk-8ssb.onrender.com";

/* =====================================================
   LOGIN (JWT)
===================================================== */
function login() {
  fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value.trim(),
      password: password.value
    })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data;
    })
    .then(data => {
      // 🔥 STORE JWT TOKEN
      localStorage.setItem("token", data.token);

      // Optional: store user info
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      console.error(err);
      alert(err.message || "Server error");
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim()
    })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      return data;
    })
    .then(() => {
      // After successful register → go to login
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error(err);
      alert(err.message || "Server error");
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
