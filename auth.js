const API_BASE = "https://exptrk-8ssb.onrender.com";

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
      localStorage.setItem("token", data.token);
      window.location.replace("dashboard.html");
    })
    .catch(err => alert(err.message));
}

function register() {
  fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value
    })
  })
    .then(res => res.ok ? window.location.replace("index.html") : null);
}

function logout() {
  localStorage.clear();
  window.location.replace("index.html");
}
