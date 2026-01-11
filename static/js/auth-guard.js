// auth-guard.js
// PAGE PROTECTION (runs immediately)
(function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.replace("../index.html");
  }
})();
// AUTHENTICATED FETCH
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
        window.location.replace("../index.html");
        throw new Error("UNAUTHORIZED");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "REQUEST_FAILED");
      }
      return data;
    });
}
