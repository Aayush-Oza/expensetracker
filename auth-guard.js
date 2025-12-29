(function () {
  const token = localStorage.getItem("token");

  // Initial hard check
  if (!token) {
    window.location.replace("index.html");
    return;
  }

  // Prevent back / cache restore after logout
  window.addEventListener("pageshow", function (event) {
    if (!localStorage.getItem("token")) {
      window.location.replace("index.html");
    }
  });(function () {
  // Initial hard auth check
  if (!localStorage.getItem("token")) {
    window.location.replace("index.html");
    return;
  }

  // Handle back / cache restore (mobile-safe)
  window.addEventListener("pageshow", function (event) {
    if (event.persisted && !localStorage.getItem("token")) {
      window.location.replace("index.html");
    }
  });
})();

})();
