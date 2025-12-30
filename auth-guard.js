const API_BASE = "https://exptrk-8ssb.onrender.com";

function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.clear();
    window.location.replace("index.html");
    return Promise.reject(new Error("NO_TOKEN"));
  }

  return fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })
    .then(async res => {
      if (res.status === 401) {
        // terminal auth failure
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
