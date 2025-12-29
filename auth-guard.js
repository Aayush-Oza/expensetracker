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
  });
})();
