// Sincronizar porcentaje y valor de abono/pie

document.getElementById('porcentajePie').addEventListener('input', function(e) {
  let porcentajeValue = e.target.value.replace(/[^\d\.]/g, '');
  // Limitar a dos dígitos enteros y dos decimales mientras se edita
  if (porcentajeValue.includes('.')) {
    let partes = porcentajeValue.split('.');
    partes[0] = partes[0].slice(0,2); // máximo dos dígitos enteros
    partes[1] = (partes[1] || '').slice(0,2); // máximo dos decimales
    porcentajeValue = partes[0] + '.' + partes[1];
  } else {
    porcentajeValue = porcentajeValue.slice(0,2); // máximo dos dígitos enteros
  }
  // Mostrar el símbolo % en el input
  if (porcentajeValue) {
    e.target.value = porcentajeValue + '%';
  } else {
    e.target.value = '';
  }
  let porcentajePie = parseFloat(porcentajeValue);
  let valorParcelaRaw = document.getElementById('valorParcela').value.replace(/[^\d]/g, '');
  let valorParcela = parseFloat(valorParcelaRaw);
  if (!isNaN(valorParcela) && !isNaN(porcentajePie)) {
    let abono = Math.round(valorParcela * (porcentajePie / 100));
    document.getElementById('valorPie').value = '$ ' + abono.toLocaleString('es-CL');
  } else {
    document.getElementById('valorPie').value = '';
  }
// Al perder el foco, formatear a dos decimales
document.getElementById('porcentajePie').addEventListener('blur', function(e) {
  let porcentajeValue = e.target.value.replace(/[^\d\.]/g, '');
  let porcentajePie = parseFloat(porcentajeValue);
  if (!isNaN(porcentajePie)) {
    porcentajeValue = porcentajePie.toFixed(2);
    e.target.value = porcentajeValue + '%';
  }
});
});

document.getElementById('valorPie').addEventListener('input', function(e) {
  let abonoValue = e.target.value.replace(/[^\d]/g, '');
  // Limitar solo a números enteros
  abonoValue = abonoValue.slice(0,12); // máximo 12 dígitos para CLP grandes
  if (abonoValue) {
    e.target.value = '$ ' + parseInt(abonoValue, 10).toLocaleString('es-CL');
  } else {
    e.target.value = '$ ';
  }
  let abono = parseInt(abonoValue, 10);
  let valorParcelaRaw = document.getElementById('valorParcela').value.replace(/[^\d]/g, '');
  let valorParcela = parseFloat(valorParcelaRaw);
  if (!isNaN(valorParcela) && !isNaN(abono) && valorParcela > 0) {
    const porcentaje = (abono / valorParcela) * 100;
    document.getElementById('porcentajePie').value = porcentaje.toFixed(2);
  } else {
    document.getElementById('porcentajePie').value = '';
  }
});

// Obtener UF automáticamente
fetch("https://mindicador.cl/api")
  .then(response => response.json())
  .then(data => {
    const uf = data.uf.valor;
    document.getElementById("valorUF").value = '$ ' + uf.toLocaleString('es-CL', { minimumFractionDigits: 2 });
  })
  .catch(() => {
    document.getElementById("valorUF").value = "Error al cargar UF";
  });

// Formatear con puntos el valor de la parcela en tiempo real
document.getElementById('valorParcela').addEventListener('input', function(e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value) {
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = '$ ' + value;
  } else {
    e.target.value = '$ ';
  }
});

document.getElementById("creditForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const nombreProyecto = document.getElementById("nombreProyecto")?.value || "";
  const agenteVentas = document.getElementById("agenteVentas")?.value || "";
  const numeroParcela = document.getElementById("numeroParcela")?.value || "";
  const nombreCliente = document.getElementById("nombreCliente")?.value || "";
  const valorParcelaRaw = document.getElementById("valorParcela").value.replace(/[^\d]/g, '');
  const valorParcela = parseFloat(valorParcelaRaw);
  let abonoRaw = document.getElementById("valorPie").value.replace(/\./g, '').replace(/[^\d]/g, '');
  let abonoFinal = parseFloat(abonoRaw);
  let porcentajePie = parseFloat(document.getElementById("porcentajePie").value.replace('%',''));
  if (!isNaN(abonoFinal) && abonoFinal > 0) {
    porcentajePie = valorParcela > 0 ? Math.round((abonoFinal / valorParcela) * 100) : 0;
  } else if (!isNaN(porcentajePie)) {
    abonoFinal = valorParcela * (porcentajePie / 100);
  } else {
    abonoFinal = 0;
    porcentajePie = 0;
  }
  const cuotas = parseInt(document.getElementById("cuotas").value);
  const interesMensual = parseFloat(document.getElementById("interesMensual").value);
  let valorUF = document.getElementById("valorUF").value;
  valorUF = valorUF.replace(/[^\d,\.]/g, '');
  valorUF = valorUF.replace(/\./g, '').replace(',', '.');
  valorUF = parseFloat(valorUF);
  if (isNaN(valorUF) || valorUF <= 0) valorUF = null;
  const saldoFinanciar = valorParcela - abonoFinal;
  let valorCuota = 0;
  let totalConIntereses = 0;
  if (interesMensual > 0 && cuotas > 0) {
    const i = interesMensual / 100;
    valorCuota = saldoFinanciar * (i * Math.pow(1 + i, cuotas)) / (Math.pow(1 + i, cuotas) - 1);
    totalConIntereses = valorCuota * cuotas;
  } else {
    valorCuota = saldoFinanciar / cuotas;
    totalConIntereses = saldoFinanciar;
  }
  const totalParcela = abonoFinal + totalConIntereses;
  const porcentajePieDisplay = (!isNaN(porcentajePie) ? porcentajePie.toFixed(2) + '%' : '—');
  const formatCLP = (num) => {
    // Formato CLP con espacio entre $ y el valor
    let clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(num);
    return clp.replace('$', '$ ');
  };
  const formatUF = (num) => (valorUF ? (new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + " UF") : '—');
  const safeUF = (num) => (valorUF ? formatUF(num / valorUF) : '—');
  const resultadoHTML = `
    <div class="resumen-datos">
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <div><strong>Proyecto:</strong> ${nombreProyecto}</div>
        <div><strong>Cliente:</strong> ${nombreCliente}</div>
      </div>
      <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:6px;">
        <div><strong>Agente de Ventas:</strong> ${agenteVentas}</div>
        <div><strong>N° Parcela:</strong> ${numeroParcela}</div>
      </div>
    </div>
    <table>
      <tr><th>Concepto</th><th style="border-right:2px solid #185a9d;">CLP</th><th>UF</th></tr>
      <tr><td>Valor Parcela</td><td><span class="resumen-valor-clp"><span class="simbolo">$</span>${valorParcela.toLocaleString('es-CL')}</span></td><td><span class="resumen-valor-uf"><span class="simbolo-uf">UF</span>${valorUF ? (valorParcela/valorUF).toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—'}</span></td></tr>
      <tr><td>Abono o Pie ${porcentajePieDisplay}</td><td><span class="resumen-valor-clp"><span class="simbolo">$</span>${abonoFinal.toLocaleString('es-CL')}</span></td><td><span class="resumen-valor-uf"><span class="simbolo-uf">UF</span>${valorUF ? (abonoFinal/valorUF).toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—'}</span></td></tr>
         <tr><td>Saldo a Financiar</td><td><span class="resumen-valor-clp"><span class="simbolo">$</span>${saldoFinanciar.toLocaleString('es-CL')}</span></td><td><span class="resumen-valor-uf"><span class="simbolo-uf">UF</span>${valorUF ? (saldoFinanciar/valorUF).toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—'}</span></td></tr>
         <tr><td>Número de Cuotas</td><td>${cuotas}</td><td>—</td></tr>
         <tr><td>Valor Cuota</td><td><span class="resumen-valor-clp"><span class="simbolo">$</span>${Math.round(valorCuota).toLocaleString('es-CL')}</span></td><td><span class="resumen-valor-uf"><span class="simbolo-uf">UF</span>${valorUF ? (valorCuota/valorUF).toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—'}</span></td></tr>
         <tr><td>Total Cuotas con Intereses</td><td><span class="resumen-valor-clp"><span class="simbolo">$</span>${Math.round(totalConIntereses).toLocaleString('es-CL')}</span></td><td><span class="resumen-valor-uf"><span class="simbolo-uf">UF</span>${valorUF ? (totalConIntereses/valorUF).toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—'}</span></td></tr>
         <tr><td>Valor Total Parcela</td><td><span class="resumen-valor-clp"><span class="simbolo">$</span>${Math.round(totalParcela).toLocaleString('es-CL')}</span></td><td><span class="resumen-valor-uf"><span class="simbolo-uf">UF</span>${valorUF ? (totalParcela/valorUF).toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—'}</span></td></tr>
    </table>
  `;
  document.getElementById("resumen-content").innerHTML = resultadoHTML;
  // Mostrar fecha de simulación
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById("fechaSimulacionTexto").textContent = `Fecha de Simulación: ${fechaStr}`;
  // ...no actualizar encabezado, ya que esos elementos no existen en el HTML...
});

document.getElementById("btnLimpiar").addEventListener("click", function () {
  document.getElementById("valorParcela").value = "$ ";
  document.getElementById("porcentajePie").value = "";
  document.getElementById("valorPie").value = "$ ";
  document.getElementById("cuotas").value = "";
  document.getElementById("interesMensual").value = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById('nombreProyecto').value = '';
  document.getElementById('agenteVentas').value = '';
  document.getElementById('nombreCliente').value = '';
  document.getElementById('numeroParcela').value = '';
});
