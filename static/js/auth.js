/* =========================
   LOGIN
========================= */
function login() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailInput.value.trim(),
      password: passwordInput.value
    })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data;
    })
    .then(data => {
      localStorage.setItem("token", data.token);
      window.location.replace("dashboard.html");
    })
    .catch(err => {
      alert(err.message);
      console.error("Login error:", err);
    });
}

/* =========================
   REGISTER
========================= */
function register() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value
    })
  })
    .then(async res => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      window.location.replace("index.html");
    })
    .catch(err => {
      alert(err.message);
      console.error("Register error:", err);
    });
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location.replace("index.html");
}
