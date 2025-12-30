const API_BASE = "https://exptrk-8ssb.onrender.com";

/* ===========================
   AUTH FETCH
=========================== */
function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
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
        // token truly invalid
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

/* ===========================
   LOGIN
=========================== */
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data;
    })
    .then(data => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.replace("dashboard.html");
    })
    .catch(err => alert(err.message || "Login error"));
}

/* ===========================
   REGISTER
=========================== */
function register() {
  fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value.trim()
    })
  })
    .then(async res => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Registration failed");
      return data;
    })
    .then(() => window.location.replace("index.html"))
    .catch(err => alert(err.message || "Register error"));
}

/* ===========================
   LOGOUT
=========================== */
function logout() {
  localStorage.clear();
  window.location.replace("index.html");
}
