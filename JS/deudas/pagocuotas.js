// JS/deudas/pagocuotas.js

document.addEventListener("DOMContentLoaded", () => {
    const btnNavRegistro = document.getElementById("btnNavRegistro");
    const btnNavPago = document.getElementById("btnNavPago");
    const viewRegistro = document.getElementById("viewRegistro");
    const viewPago = document.getElementById("viewPago");

    const inputClientePago = document.getElementById("inputClientePago");
    const listaClientesDeudores = document.getElementById("listaClientesDeudores");
    const contenedorGridPago = document.getElementById("contenedorGridPago");
    const tablaPagoCuerpo = document.getElementById("tablaPagoCuerpo");

    // Elementos del Modal de Pago
    const modalPagarAccion = document.getElementById("modalPagarAccion");
    const infoCuotaPagar = document.getElementById("infoCuotaPagar");
    const btnCancelarPagoModal = document.getElementById("btnCancelarPagoModal");
    const btnConfirmarPago = document.getElementById("btnConfirmarPago");

    let cuotaActivaParaPagar = null;

    btnNavRegistro.addEventListener("click", () => {
        viewRegistro.classList.remove("hidden");
        viewPago.classList.add("hidden");
        btnNavRegistro.classList.add("active-nav");
        btnNavPago.classList.remove("active-nav");
    });

    btnNavPago.addEventListener("click", () => {
        viewRegistro.classList.add("hidden");
        viewPago.classList.remove("hidden");
        btnNavPago.classList.add("active-nav");
        btnNavRegistro.classList.remove("active-nav");
        cargarClientesConDeuda();
    });

    function cargarClientesConDeuda() {
        const db = JSON.parse(localStorage.getItem("registroCuotas")) || [];
        listaClientesDeudores.innerHTML = "";
        const clientesConMora = [...new Set(db.filter(reg => reg.estadoCuota === "P").map(reg => reg.nombreCliente))];
        clientesConMora.forEach(nombre => {
            const option = document.createElement("option");
            option.value = nombre;
            listaClientesDeudores.appendChild(option);
        });
    }

    inputClientePago.addEventListener("input", () => {
        const clienteBusqueda = inputClientePago.value;
        const db = JSON.parse(localStorage.getItem("registroCuotas")) || [];
        let cuotasPendientes = db.filter(reg => reg.nombreCliente === clienteBusqueda && reg.estadoCuota === "P");

        if (cuotasPendientes.length > 0) {
            contenedorGridPago.classList.remove("hidden");
            renderizarGridPago(cuotasPendientes);
        } else {
            contenedorGridPago.classList.add("hidden");
        }
    });

    function renderizarGridPago(data) {
        data.sort((a, b) => {
            if (a.fechaEmision !== b.fechaEmision) return a.fechaEmision.localeCompare(b.fechaEmision);
            const compA = `${a.serieComprobante}-${a.nroComprobante}`;
            const compB = `${b.serieComprobante}-${b.nroComprobante}`;
            if (compA !== compB) return compA.localeCompare(compB);
            return a.cuotaNro - b.cuotaNro;
        });

        tablaPagoCuerpo.innerHTML = "";
        data.forEach((item) => {
            const fila = document.createElement("tr");
            fila.className = "border-b hover:bg-blue-50 transition-colors";
            fila.innerHTML = `
                <td class="p-3 text-[11px]">${item.fechaEmision}</td>
                <td class="p-3 text-blue-800">${item.serieComprobante}-${item.nroComprobante}</td>
                <td class="p-3">${item.monedaComprobante}</td>
                <td class="p-3">${item.montoTotalComprobante.toFixed(2)}</td>
                <td class="p-3 text-xs">Cuota ${item.cuotaNro}</td>
                <td class="p-3 text-blue-900 font-black">${item.cuotaMonto.toFixed(2)}</td>
                <td class="p-3 text-red-600">${item.fechaVencimientoCuota}</td>
                <td class="p-3">
                    <button onclick="abrirModalPago('${item.serieComprobante}', '${item.nroComprobante}', ${item.cuotaNro})" 
                            class="bg-blue-600 text-white px-4 py-1 rounded text-[10px] font-bold hover:bg-blue-800 uppercase transition-colors">
                        Pagar
                    </button>
                </td>
            `;
            tablaPagoCuerpo.appendChild(fila);
        });
    }

    window.abrirModalPago = (serie, numero, cuotaNro) => {
        const db = JSON.parse(localStorage.getItem("registroCuotas")) || [];
        const item = db.find(r => r.serieComprobante === serie && r.nroComprobante === numero && r.cuotaNro === cuotaNro);
        
        if (!item) return;
        cuotaActivaParaPagar = item;

        infoCuotaPagar.innerHTML = `
            <div>Cliente: ${item.nombreCliente}</div>
            <div>Comprobante: ${item.serieComprobante}-${item.nroComprobante}</div>
            <div>Cuota: ${item.cuotaNro}</div>
            <div>Monto Cuota: ${item.monedaComprobante} ${item.cuotaMonto.toFixed(2)}</div>
        `;

        // Reset inicial de inputs
        document.getElementById("fechaPagoInput").value = "";
        document.getElementById("montoPagoInput").value = item.cuotaMonto.toFixed(2);
        document.getElementById("formaPagoInput").value = "D"; // Por defecto Depósito
        const opInput = document.getElementById("numOperacionInput");
        opInput.value = "";
        opInput.readOnly = false;

        modalPagarAccion.style.display = "flex";
    };

    // Ajuste solicitado: Efectivo (E) usa "00000000", Depósito (D) requiere ingreso manual
    document.getElementById("formaPagoInput").addEventListener("change", (e) => {
        const opInput = document.getElementById("numOperacionInput");
        if (e.target.value === "E") {
            opInput.value = "00000000";
            opInput.readOnly = true;
        } else {
            opInput.value = "";
            opInput.readOnly = false;
        }
    });

    btnConfirmarPago.addEventListener("click", () => {
        const fechaPago = document.getElementById("fechaPagoInput").value;
        const montoPago = parseFloat(document.getElementById("montoPagoInput").value);
        const formaPago = document.getElementById("formaPagoInput").value;
        const numOperacion = document.getElementById("numOperacionInput").value.trim();
        const hoy = new Date().toLocaleDateString('en-CA');

        // Validar Fecha de Pago
        if (!fechaPago || fechaPago > hoy || fechaPago < cuotaActivaParaPagar.fechaEmision) {
            alert("Fecha de Pago errónea");
            document.getElementById("fechaPagoInput").value = "";
            return;
        }

        // Validar Monto
        if (isNaN(montoPago) || montoPago <= 0) {
            alert("Ingrese un monto válido.");
            return;
        }
        if (montoPago > cuotaActivaParaPagar.cuotaMonto) {
            alert(`Error: El monto no puede ser mayor a la cuota (${cuotaActivaParaPagar.cuotaMonto.toFixed(2)})`);
            return;
        }
        if (montoPago < cuotaActivaParaPagar.cuotaMonto) {
            alert("Cuota no se ha pagado por completo");
        }

        // Validar Nro Operación Único (si no es Efectivo)
        if (!numOperacion) {
            alert("Debe ingresar un número de operación.");
            return;
        }

        const pagosDB = JSON.parse(localStorage.getItem("cuotasPagadas")) || [];
        if (formaPago !== "E") {
            const existeOp = pagosDB.some(p => p.numOperacion === numOperacion);
            if (existeOp) {
                alert("Este número de operación ya existe.");
                return;
            }
        }

        // Grabar Cambios
        let cuotasDB = JSON.parse(localStorage.getItem("registroCuotas")) || [];
        const idx = cuotasDB.findIndex(r => 
            r.serieComprobante === cuotaActivaParaPagar.serieComprobante && 
            r.nroComprobante === cuotaActivaParaPagar.nroComprobante && 
            r.cuotaNro === cuotaActivaParaPagar.cuotaNro
        );

        if (idx !== -1) {
            cuotasDB[idx].estadoCuota = "C";
            localStorage.setItem("registroCuotas", JSON.stringify(cuotasDB));

            const nuevoPago = {
                rucDNI: cuotaActivaParaPagar.rucDNI,
                nombreCliente: cuotaActivaParaPagar.nombreCliente,
                fechaEmision: cuotaActivaParaPagar.fechaEmision,
                serieComprobante: cuotaActivaParaPagar.serieComprobante,
                nroComprobante: cuotaActivaParaPagar.nroComprobante,
                montoTotalComprobante: cuotaActivaParaPagar.montoTotalComprobante,
                cuotaNro: cuotaActivaParaPagar.cuotaNro,
                fechaPago: fechaPago,
                monedaPago: cuotaActivaParaPagar.monedaComprobante,
                montoPago: montoPago,
                formaPago: formaPago,
                numOperacion: numOperacion
            };

            pagosDB.push(nuevoPago);
            localStorage.setItem("cuotasPagadas", JSON.stringify(pagosDB));

            alert("Pago registrado con éxito.");
            modalPagarAccion.style.display = "none";
            location.reload();
        }
    });

    btnCancelarPagoModal.addEventListener("click", () => {
        modalPagarAccion.style.display = "none";
    });
});