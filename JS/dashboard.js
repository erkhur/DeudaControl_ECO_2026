// Proteger acceso
if (localStorage.getItem("auth") !== "true") {
  window.location.href = "index.html";
}

// Logout
const logoutButtons = document.querySelectorAll("#logoutBtn, #logoutBtn2");

logoutButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.removeItem("auth");
    window.location.href = "index.html";
  });
});
