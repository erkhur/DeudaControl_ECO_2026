// 🔐 Proteger acceso al dashboard
if (localStorage.getItem("auth") !== "true") {
  window.location.href = "index.html";
}

// 🚪 Cerrar sesión (desde ambos botones)
const logoutButtons = document.querySelectorAll("#logoutBtn, #logoutBtn2");

logoutButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.removeItem("auth");
    window.location.href = "index.html";
  });
});
