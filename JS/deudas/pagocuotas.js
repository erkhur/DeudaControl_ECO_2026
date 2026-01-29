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
        
        const clientesConMora = [...new Set(db
            .filter(reg => reg.estadoCuota === "P")
            .map(reg => reg.nombreCliente))];

        clientesConMora.forEach(nombre => {
            const option = document.createElement("option");
            option.value = nombre;
            listaClientesDeudores.appendChild(option);
        });
    }

    inputClientePago.addEventListener("input", () => {
        const clienteBusqueda = inputClientePago.value;
        const db = JSON.parse(localStorage.getItem("registroCuotas")) || [];

        let cuotasPendientes = db.filter(reg => 
            reg.nombreCliente === clienteBusqueda && 
            reg.estadoCuota === "P"
        );

        if (cuotasPendientes.length > 0) {
            contenedorGridPago.classList.remove("hidden");
            renderizarGridPago(cuotasPendientes);
        } else {
            contenedorGridPago.classList.add("hidden");
            tablaPagoCuerpo.innerHTML = "";
        }
    });

    function renderizarGridPago(data) {
        // Ordenamiento especificado
        data.sort((a, b) => {
            if (a.fechaEmision !== b.fechaEmision) {
                return a.fechaEmision.localeCompare(b.fechaEmision);
            }
            const compA = `${a.serieComprobante}-${a.nroComprobante}`;
            const compB = `${b.serieComprobante}-${b.nroComprobante}`;
            if (compA !== compB) {
                return compA.localeCompare(compB);
            }
            return a.cuotaNro - b.cuotaNro;
        });

        tablaPagoCuerpo.innerHTML = "";

        data.forEach((item) => {
            const fila = document.createElement("tr");
            fila.className = "border-b hover:bg-blue-50 transition-colors";
            
            const monedaColor = item.monedaComprobante === "US$" ? "text-blue-700" : "text-black";

            fila.innerHTML = `
                <td class="p-3 text-[11px]">${item.fechaEmision}</td>
                <td class="p-3 text-blue-800">${item.serieComprobante}-${item.nroComprobante}</td>
                <td class="p-3">${item.monedaComprobante}</td>
                <td class="p-3 ${monedaColor}">${item.montoTotalComprobante.toFixed(2)}</td>
                <td class="p-3">
                    <span class="bg-gray-100 px-2 py-1 rounded text-xs">Cuota ${item.cuotaNro}</span>
                </td>
                <td class="p-3 text-blue-900 font-black">${item.cuotaMonto.toFixed(2)}</td>
                <td class="p-3 text-red-600">${item.fechaVencimientoCuota}</td>
                <td class="p-3">
                    <button onclick="procesarPago('${item.serieComprobante}', '${item.nroComprobante}', ${item.cuotaNro})" 
                            class="bg-blue-600 text-white px-4 py-1 rounded text-[10px] font-bold hover:bg-blue-800 uppercase shadow-sm transition-colors">
                        Pagar
                    </button>
                </td>
            `;
            tablaPagoCuerpo.appendChild(fila);
        });
    }
});

function procesarPago(serie, numero, cuotaNro) {
    if (confirm(`¿Desea marcar como PAGADA la cuota ${cuotaNro} del comprobante ${serie}-${numero}?`)) {
        let db = JSON.parse(localStorage.getItem("registroCuotas")) || [];
        
        const index = db.findIndex(reg => 
            reg.serieComprobante === serie && 
            reg.nroComprobante === numero && 
            reg.cuotaNro === cuotaNro
        );

        if (index !== -1) {
            db[index].estadoCuota = "C";
            localStorage.setItem("registroCuotas", JSON.stringify(db));
            alert("Pago registrado correctamente.");
            location.reload();
        }
    }
}