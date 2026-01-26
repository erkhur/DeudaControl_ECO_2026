// 🔐 Proteger acceso (Seguridad básica)
if (localStorage.getItem("auth") !== "true") {
    window.location.href = "index.html";
}

// 🏠 Volver al Dashboard
document.addEventListener("DOMContentLoaded", () => {
    const btnMenuPrincipal = document.getElementById("btnMenuPrincipal");

    if (btnMenuPrincipal) {
        btnMenuPrincipal.addEventListener("click", () => {
            window.location.href = "dashboard.html";
        });
    }
});