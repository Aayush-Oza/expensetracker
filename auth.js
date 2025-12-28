function login() {
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data;
  })
  .then(data => {
    if (data.success) {
      window.location.href = "/dashboard";
    } else {
      alert("Invalid email or password");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Server error");
  });
}

function register() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!nameInput || !emailInput || !passwordInput) {
    alert("Form inputs not found");
    return;
  }

  fetch("/api/register", {
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
    if (!res.ok) throw new Error(data.error || "Failed");
    return data;
  })
  .then(data => {
    if (data.success) {
      window.location.href = "/";
    } else {
      alert(data.error);
    }
  })
  .catch(err => {
    console.error(err);
    alert("Server error");
  });
}
