// 🔐 Proteger acceso al dashboard
if (localStorage.getItem("auth") !== "true") {
  window.location.href = "index.html";
}

// 🚪 Cerrar sesión
const logoutButtons = document.querySelectorAll("#logoutBtn, #logoutBtn2");
logoutButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.removeItem("auth");
    window.location.href = "index.html";
  });
});

// 🚀 Navegación a Cuentas por Cobrar
const btnCuentas = document.getElementById("btnCuentasPorCobrar");
if (btnCuentas) {
  btnCuentas.addEventListener("click", () => {
    window.location.href = "deudas.html";
  });
}