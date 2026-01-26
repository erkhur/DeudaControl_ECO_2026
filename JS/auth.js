const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "admin" && password === "admin") {
    localStorage.setItem("auth", "true");
    window.location.href = "dashboard.html";
  } else {
    errorMsg.classList.remove("hidden");
  }
});
