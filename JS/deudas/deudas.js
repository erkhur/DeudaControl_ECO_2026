// 🔐 Verificación de sesión
if (localStorage.getItem("auth") !== "true") {
    window.location.href = "index.html";
}

// Datos ficticios (Simulación tabla registroCliente)
const registroClienteFicticio = [
    { rucDNI: "10111111111", nombreCliente: "CORPORACION ALFA", estadoCliente: "A" },
    { rucDNI: "20222222222", nombreCliente: "SERVICIOS BETA SA", estadoCliente: "A" },
    { rucDNI: "10333333333", nombreCliente: "DISTRIBUIDORA GAMMA", estadoCliente: "A" },
    { rucDNI: "20444444444", nombreCliente: "CONSTRUCTORA DELTA", estadoCliente: "A" },
    { rucDNI: "10555555555", nombreCliente: "LOGISTICA EPSILON", estadoCliente: "A" },
    { rucDNI: "20666666666", nombreCliente: "TECNOLOGIA ZETA", estadoCliente: "A" }
];

document.addEventListener("DOMContentLoaded", () => {
    // Referencias DOM
    const inputCliente = document.getElementById("inputCliente");
    const listaClientes = document.getElementById("listaClientes");
    const formComprobante = document.getElementById("formComprobante");
    const btnGenerarCuotas = document.getElementById("btnGenerarCuotas");
    const modalCuotas = document.getElementById("modalCuotas");
    const btnSiguienteCuota = document.getElementById("btnSiguienteCuota");
    const seccionResumen = document.getElementById("seccionResumen");
    const tablaResumenCuerpo = document.getElementById("tablaResumenCuerpo");
    const monedaSelect = document.getElementById("monedaComprobante");
    const montoPendienteTxt = document.getElementById("montoPendienteModal");

    let clienteSeleccionado = null;
    let cuotasTemporales = [];
    let iteracionActual = 1;
    let ultimaFechaIngresada = "";

    // Poblar clientes
    registroClienteFicticio.forEach(c => {
        const option = document.createElement("option");
        option.value = c.nombreCliente;
        listaClientes.appendChild(option);
    });

    // Mostrar formulario al elegir cliente válido
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

    // Iniciar Proceso de Cuotas
    btnGenerarCuotas.addEventListener("click", (e) => {
        e.preventDefault();
        
        const fechaE = document.getElementById("fechaEmision").value;
        const serie = document.getElementById("serieComprobante").value.trim().toUpperCase();
        const numero = document.getElementById("nroComprobante").value.trim();
        const nCuotas = parseInt(document.getElementById("nroCuotas").value);
        const montoT = parseFloat(document.getElementById("montoTotal").value);

        if (!fechaE || !serie || !numero || isNaN(montoT) || isNaN(nCuotas) || nCuotas < 1) {
            alert("Complete todos los datos del comprobante correctamente.");
            return;
        }

        // Validación de Duplicados
        let db = JSON.parse(localStorage.getItem("registroCuotas")) || [];
        const existe = db.some(reg => reg.serieComprobante === serie && reg.nroComprobante === numero);
        if (existe) {
            alert(`El comprobante ${serie}-${numero} ya está registrado.`);
            return;
        }

        // Reinicio de variables y UI
        cuotasTemporales = [];
        iteracionActual = 1;
        ultimaFechaIngresada = fechaE;
        tablaResumenCuerpo.innerHTML = "";
        seccionResumen.classList.remove("hidden");
        
        abrirModal();
    });

    function abrirModal() {
        const totalCuotas = document.getElementById("nroCuotas").value;
        const montoTotalComprobante = parseFloat(document.getElementById("montoTotal").value);
        const moneda = monedaSelect.value;

        // Calcular Pendiente
        const sumaIngresada = cuotasTemporales.reduce((acc, c) => acc + c.cuotaMonto, 0);
        const pendiente = Math.round((montoTotalComprobante - sumaIngresada) * 100) / 100;

        // Actualizar UI del Modal
        document.getElementById("tituloModalCuota").innerText = `DATOS DE CUOTA ${iteracionActual} / ${totalCuotas}`;
        montoPendienteTxt.innerText = `${moneda} ${pendiente.toFixed(2)}`;
        
        document.getElementById("cuotaMontoInput").value = "";
        document.getElementById("cuotaFechaInput").value = "";
        modalCuotas.style.display = "flex";
    }

    // Botón Continuar (dentro del modal)
    btnSiguienteCuota.addEventListener("click", () => {
        const montoC = parseFloat(document.getElementById("cuotaMontoInput").value);
        const fechaV = document.getElementById("cuotaFechaInput").value;
        const fechaEmision = document.getElementById("fechaEmision").value;
        const totalCuotas = parseInt(document.getElementById("nroCuotas").value);

        if (isNaN(montoC) || !fechaV) {
            alert("Ingrese datos válidos.");
            return;
        }

        if (fechaV <= fechaEmision) {
            alert("La fecha de vencimiento debe ser mayor a la emisión.");
            return;
        }
        if (iteracionActual > 1 && fechaV <= ultimaFechaIngresada) {
            alert("La fecha debe ser mayor a la cuota anterior.");
            return;
        }

        const nuevaCuota = {
            cuotaNro: iteracionActual,
            cuotaMonto: montoC,
            fechaVencimientoCuota: fechaV
        };

        cuotasTemporales.push(nuevaCuota);
        ultimaFechaIngresada = fechaV;

        // Actualizar el Grid inmediatamente
        agregarFilaAlGrid(nuevaCuota);

        if (iteracionActual < totalCuotas) {
            iteracionActual++;
            abrirModal();
        } else {
            modalCuotas.style.display = "none";
            validarCuadreFinal();
        }
    });

    function agregarFilaAlGrid(c) {
        const moneda = monedaSelect.value;
        const colorClase = (moneda === "US$") ? "text-blue-700" : "text-black";
        
        const fila = `
            <tr id="fila-cuota-${c.cuotaNro}" class="border-b hover:bg-gray-50">
                <td class="p-2 font-semibold">Cuota ${c.cuotaNro}</td>
                <td class="p-2">${c.fechaVencimientoCuota}</td>
                <td class="p-2 font-bold ${colorClase}">${moneda} ${c.cuotaMonto.toFixed(2)}</td>
            </tr>`;
        tablaResumenCuerpo.innerHTML += fila;
    }

    function validarCuadreFinal() {
        const totalEsperado = parseFloat(document.getElementById("montoTotal").value);
        let suma = cuotasTemporales.reduce((acc, c) => acc + c.cuotaMonto, 0);
        suma = Math.round(suma * 100) / 100;

        if (suma !== totalEsperado) {
            const diferencia = Math.round((totalEsperado - suma) * 100) / 100;
            const idxUltima = cuotasTemporales.length - 1;
            
            // Ajuste en objeto y en el grid
            cuotasTemporales[idxUltima].cuotaMonto = Math.round((cuotasTemporales[idxUltima].cuotaMonto + diferencia) * 100) / 100;
            
            // Refrescar el grid completo para mostrar el ajuste
            tablaResumenCuerpo.innerHTML = "";
            cuotasTemporales.forEach(c => agregarFilaAlGrid(c));

            alert("Aviso: Se ajustó la última cuota para cuadrar con el total. Verifique en 'Editar Deuda'.");
        }
    }

    // Guardar en LocalStorage
    document.getElementById("btnGuardarTodo").addEventListener("click", () => {
        let db = JSON.parse(localStorage.getItem("registroCuotas")) || [];

        const cabecera = {
            rucDNI: clienteSeleccionado.rucDNI,
            nombreCliente: clienteSeleccionado.nombreCliente,
            fechaEmision: document.getElementById("fechaEmision").value,
            serieComprobante: document.getElementById("serieComprobante").value.trim().toUpperCase(),
            nroComprobante: document.getElementById("nroComprobante").value.trim(),
            monedaComprobante: monedaSelect.value,
            montoTotalComprobante: parseFloat(document.getElementById("montoTotal").value)
        };

        const registrosFinales = cuotasTemporales.map(cuota => ({
            ...cabecera,
            ...cuota,
            estadoCuota: "P"
        }));

        db.push(...registrosFinales);
        localStorage.setItem("registroCuotas", JSON.stringify(db));

        alert("Registro de deuda guardado con éxito.");
        location.reload();
    });

    document.getElementById("btnCancelar").addEventListener("click", () => {
        if(confirm("¿Desea cancelar? Se perderán los datos no guardados.")) {
            location.reload();
        }
    });

    document.getElementById("btnMenuPrincipal").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
});