// 🔐 Verificación de sesión
if (localStorage.getItem("auth") !== "true") {
    window.location.href = "index.html";
}

// 6 datos ficticios (estado A)
const registroClienteFicticio = [
    { rucDNI: "10111111111", nombreCliente: "CORPORACION ALFA", estadoCliente: "A" },
    { rucDNI: "20222222222", nombreCliente: "SERVICIOS BETA SA", estadoCliente: "A" },
    { rucDNI: "10333333333", nombreCliente: "DISTRIBUIDORA GAMMA", estadoCliente: "A" },
    { rucDNI: "20444444444", nombreCliente: "CONSTRUCTORA DELTA", estadoCliente: "A" },
    { rucDNI: "10555555555", nombreCliente: "LOGISTICA EPSILON", estadoCliente: "A" },
    { rucDNI: "20666666666", nombreCliente: "TECNOLOGIA ZETA", estadoCliente: "A" }
];

document.addEventListener("DOMContentLoaded", () => {
    // Referencias
    const inputCliente = document.getElementById("inputCliente");
    const listaClientes = document.getElementById("listaClientes");
    const formComprobante = document.getElementById("formComprobante");
    const btnGenerarCuotas = document.getElementById("btnGenerarCuotas");
    const modalCuotas = document.getElementById("modalCuotas");
    const btnSiguienteCuota = document.getElementById("btnSiguienteCuota");
    const seccionResumen = document.getElementById("seccionResumen");

    let clienteSeleccionado = null;
    let cuotasTemporales = [];
    let iteracionActual = 1;
    let ultimaFechaIngresada = "";

    // Llenar lista de clientes
    registroClienteFicticio.forEach(c => {
        const option = document.createElement("option");
        option.value = c.nombreCliente;
        listaClientes.appendChild(option);
    });

    // Validar cliente al escribir/seleccionar
    inputCliente.addEventListener("input", () => {
        const valor = inputCliente.value;
        const encontrado = registroClienteFicticio.find(c => c.nombreCliente === valor && c.estadoCliente === "A");
        
        if (encontrado) {
            clienteSeleccionado = encontrado;
            formComprobante.classList.remove("hidden");
        } else {
            clienteSeleccionado = null;
            formComprobante.classList.add("hidden");
            seccionResumen.classList.add("hidden");
        }
    });

    // BOTÓN: "Ingresar Cuotas" -> Aquí es donde ÚNICAMENTE debe nacer el modal
    btnGenerarCuotas.addEventListener("click", (e) => {
        e.preventDefault(); // Evitar cualquier comportamiento default
        
        const fechaEmision = document.getElementById("fechaEmision").value;
        const nCuotas = parseInt(document.getElementById("nroCuotas").value);
        const montoTotal = parseFloat(document.getElementById("montoTotal").value);

        if (!fechaEmision || isNaN(montoTotal) || isNaN(nCuotas) || nCuotas < 1) {
            alert("Complete todos los campos del comprobante correctamente.");
            return;
        }

        // Si todo está bien, preparamos las variables y abrimos modal
        cuotasTemporales = [];
        iteracionActual = 1;
        ultimaFechaIngresada = fechaEmision;
        
        abrirModal();
    });

    function abrirModal() {
        document.getElementById("tituloModalCuota").innerText = `DATOS DE CUOTA ${iteracionActual}`;
        document.getElementById("cuotaMontoInput").value = "";
        document.getElementById("cuotaFechaInput").value = "";
        modalCuotas.style.display = "flex"; // Se muestra la ventana emergente
    }

    // BOTÓN: "Siguiente" dentro del modal
    btnSiguienteCuota.addEventListener("click", () => {
        const montoC = parseFloat(document.getElementById("cuotaMontoInput").value);
        const fechaV = document.getElementById("cuotaFechaInput").value;
        const fechaEmision = document.getElementById("fechaEmision").value;
        const totalCuotasDefinidas = parseInt(document.getElementById("nroCuotas").value);

        if (isNaN(montoC) || !fechaV) {
            alert("Ingrese datos válidos para la cuota.");
            return;
        }

        // Reglas de fecha
        if (fechaV <= fechaEmision) {
            alert("Error: La fecha de vencimiento debe ser posterior a la emisión.");
            return;
        }
        if (iteracionActual > 1 && fechaV <= ultimaFechaIngresada) {
            alert("Error: La fecha debe ser posterior a la cuota anterior.");
            return;
        }

        // Guardar temporal
        cuotasTemporales.push({
            cuotaNro: iteracionActual,
            cuotaMonto: montoC,
            fechaVencimientoCuota: fechaV
        });

        ultimaFechaIngresada = fechaV;

        if (iteracionActual < totalCuotasDefinidas) {
            iteracionActual++;
            abrirModal();
        } else {
            modalCuotas.style.display = "none";
            finalizarIngresoCuotas();
        }
    });

    function finalizarIngresoCuotas() {
        const montoEsperado = parseFloat(document.getElementById("montoTotal").value);
        let sumaActual = cuotasTemporales.reduce((acc, c) => acc + c.cuotaMonto, 0);
        sumaActual = Math.round(sumaActual * 100) / 100;

        if (sumaActual !== montoEsperado) {
            const dif = Math.round((montoEsperado - sumaActual) * 100) / 100;
            const idxUltima = cuotasTemporales.length - 1;
            cuotasTemporales[idxUltima].cuotaMonto = Math.round((cuotasTemporales[idxUltima].cuotaMonto + dif) * 100) / 100;
            
            alert("Aviso: La sumatoria no coincidía exactamente. Se ajustó la última cuota automáticamente. Verifique en 'Editar Deuda'.");
        }

        renderizarResumen();
    }

    function renderizarResumen() {
        const tabla = document.getElementById("tablaResumenCuerpo");
        tabla.innerHTML = "";
        
        cuotasTemporales.forEach(c => {
            tabla.innerHTML += `
                <tr class="border-b">
                    <td class="p-2">Cuota ${c.cuotaNro}</td>
                    <td class="p-2">${c.fechaVencimientoCuota}</td>
                    <td class="p-2 font-bold text-blue-700">S/ ${c.cuotaMonto.toFixed(2)}</td>
                </tr>
            `;
        });
        seccionResumen.classList.remove("hidden");
    }

    // Botón Guardar Final
    document.getElementById("btnGuardarTodo").addEventListener("click", () => {
        let db = JSON.parse(localStorage.getItem("registroCuotas")) || [];

        const cabecera = {
            rucDNI: clienteSeleccionado.rucDNI,
            nombreCliente: clienteSeleccionado.nombreCliente,
            fechaEmision: document.getElementById("fechaEmision").value,
            serieComprobante: document.getElementById("serieComprobante").value,
            nroComprobante: document.getElementById("nroComprobante").value,
            montoTotalComprobante: parseFloat(document.getElementById("montoTotal").value)
        };

        const registrosParaGuardar = cuotasTemporales.map(cuota => ({
            ...cabecera,
            ...cuota,
            estadoCuota: "P"
        }));

        db.push(...registrosParaGuardar);
        localStorage.setItem("registroCuotas", JSON.stringify(db));

        alert("Se registraron todas las cuotas exitosamente.");
        location.reload();
    });

    document.getElementById("btnCancelar").addEventListener("click", () => {
        if(confirm("¿Desea cancelar?")) location.reload();
    });

    document.getElementById("btnMenuPrincipal").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
});