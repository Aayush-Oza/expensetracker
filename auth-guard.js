const API_BASE = "https://exptrk-8ssb.onrender.com";

// 🔒 PAGE GUARD
(function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.replace("index.html");
  }
})();

// 🔒 AUTH FETCH
function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

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
        localStorage.clear();
        window.location.replace("index.html");
        throw new Error("UNAUTHORIZED");
      }
      return res.json();
    });
}
