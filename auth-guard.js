(function () {
  function guard() {
    if (!localStorage.getItem("token")) {
      window.location.replace("index.html");
    }
  }

  guard();

  window.addEventListener("pageshow", function (event) {
    if (event.persisted ||
        performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
      guard();
    }
  });
})();
