/**
 * APIARIO LA REINA — Dashboard Patch
 * Agregá este archivo al repo y añadí al final de index.html (antes de </body>):
 *   <script src="dashboard-patch.js"></script>
 *
 * Qué hace:
 *  - Agrega botón "🏠 Inicio" en el nav como primera pestaña
 *  - Agrega sección #sec-inicio con dashboard de estado
 *  - Muestra KPIs, colmenares con visita vencida, alertas de Loque
 *  - Gráfico de evolución de colmenas con Chart.js
 *  - Cambia la pestaña activa por defecto a "Inicio"
 */

(function() {
  // ─── 1. Cargar Chart.js ───────────────────────────────────────────────────
  var chartScript = document.createElement('script');
  chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  document.head.appendChild(chartScript);

  // ─── 2. CSS del dashboard ─────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    .dash-kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 1rem;
    }
    @media (min-width: 500px) {
      .dash-kpi-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .dash-kpi {
      border-radius: 14px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .dash-kpi-num {
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
      color: var(--neg);
    }
    .dash-kpi-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #555;
    }
    .dash-kpi-sub {
      font-size: 11px;
      color: #777;
    }
    .dash-kpi-bee   { background: linear-gradient(135deg,#FFF0A0,#F5C518); border: 1.5px solid #E6B800; }
    .dash-kpi-alert { background: linear-gradient(135deg,#fde8d8,#f97316); border: 1.5px solid #ea580c; }
    .dash-kpi-loque { background: linear-gradient(135deg,#fde8d8,#ef4444); border: 1.5px solid #dc2626; }
    .dash-kpi-miel  { background: linear-gradient(135deg,#d1fae5,#a7f3d0); border: 1.5px solid #34d399; }

    .dash-section {
      background: #fff;
      border: 1.5px solid var(--bor);
      border-radius: 14px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .dash-section-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--na, #F28500);
      text-transform: uppercase;
      letter-spacing: .06em;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--aml, #FFF0A0);
    }
    .dash-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 1px solid var(--sua, #F2EDD8);
    }
    .dash-item:last-child { border-bottom: none; }
    .dash-item-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dash-item-dot-red    { background: #ef4444; }
    .dash-item-dot-orange { background: #f97316; }
    .dash-item-dot-green  { background: #22c55e; }
    .dash-item-name {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
    }
    .dash-item-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 99px;
    }
    .dash-badge-red    { background: #fde8d8; color: #b91c1c; }
    .dash-badge-orange { background: #fff3cd; color: #7d5a00; }
    .dash-badge-ok     { background: #d4edda; color: #1a5c2a; }
    .dash-empty {
      text-align: center;
      padding: 1.5rem;
      color: #aaa;
      font-size: 13px;
    }
    .dash-chart-wrap {
      position: relative;
      height: 200px;
    }
    .dash-nueva-btn {
      width: 100%;
      padding: 14px;
      background: var(--am, #F5C518);
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      color: var(--neg, #1A1200);
      margin-bottom: 1rem;
      font-family: inherit;
      transition: background .18s;
    }
    .dash-nueva-btn:hover { background: var(--amh, #E6B800); }
  `;
  document.head.appendChild(style);

  // ─── 3. Inyectar sección #sec-inicio en el DOM ────────────────────────────
  var secInicio = document.createElement('div');
  secInicio.id = 'sec-inicio';
  secInicio.className = 'sec';
  secInicio.innerHTML = `
    <button class="dash-nueva-btn" onclick="go('carga')">+ Nueva visita</button>

    <div class="dash-kpi-grid" id="dash-kpis"></div>

    <div class="dash-section">
      <div class="dash-section-title">⚠️ Visitas vencidas o por vencer</div>
      <div id="dash-vencidas"></div>
    </div>

    <div class="dash-section">
      <div class="dash-section-title">🦠 Alertas sanitarias (Loque Americana)</div>
      <div id="dash-loque"></div>
    </div>

    <div class="dash-section">
      <div class="dash-section-title">📈 Evolución de colmenas con abejas</div>
      <div class="dash-chart-wrap">
        <canvas id="chart-evolucion"></canvas>
      </div>
    </div>
  `;

  // Insertar ANTES de #sec-carga
  var secCarga = document.getElementById('sec-carga');
  if (secCarga) {
    secCarga.parentNode.insertBefore(secInicio, secCarga);
    // Quitar clase "on" de sec-carga para que empiece en inicio
    secCarga.classList.remove('on');
  }

  // ─── 4. Agregar botón "Inicio" en el nav ──────────────────────────────────
  var nav = document.querySelector('.nav');
  if (nav) {
    var btnInicio = document.createElement('button');
    btnInicio.id = 'nav-btn-inicio';
    btnInicio.className = 'on';
    btnInicio.textContent = '🏠 Inicio';
    btnInicio.onclick = function() { go('inicio'); };
    // Quitar "on" al botón de Nueva visita
    var primerBtn = nav.querySelector('button');
    if (primerBtn) primerBtn.classList.remove('on');
    // Insertar como primer botón
    nav.insertBefore(btnInicio, nav.firstChild);
  }

  // ─── 5. Parchear go() para incluir sec-inicio ────────────────────────────
  // Esperamos a que el DOM esté listo y go() esté definido
  window.addEventListener('load', function() {
    var originalGo = window.go;
    window.go = function(sec) {
      // Activar/desactivar botón Inicio
      var btnInicio = document.getElementById('nav-btn-inicio');
      if (btnInicio) btnInicio.classList.toggle('on', sec === 'inicio');
      // Mostrar/ocultar sección inicio
      var si = document.getElementById('sec-inicio');
      if (si) si.classList.toggle('on', sec === 'inicio');
      // Llamar al go original para las demás secciones
      if (sec !== 'inicio' && originalGo) {
        originalGo(sec);
      }
      // Renderizar dashboard cuando se activa
      if (sec === 'inicio') {
        renderInicio();
      }
    };
  });

  // ─── 6. renderInicio() ───────────────────────────────────────────────────
  window.renderInicio = function() {
    var today = new Date();
    today.setHours(0,0,0,0);

    // Helpers
    function parseDate(s) {
      if (!s) return null;
      var d = new Date(s + 'T00:00:00');
      return isNaN(d) ? null : d;
    }
    function addDays(d, n) {
      var r = new Date(d);
      r.setDate(r.getDate() + parseInt(n) || 0);
      return r;
    }
    function fmtDate(d) {
      if (!d) return '—';
      return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
    }
    function diffDays(a, b) {
      return Math.round((b - a) / 86400000);
    }

    // --- Último registro por colmenar ---
    var ultimoReg = {}; // colmenarId -> registro más reciente
    (window.registros || []).forEach(function(r) {
      var cid = String(r.colmenar);
      if (!ultimoReg[cid] || r.fecha > ultimoReg[cid].fecha) {
        ultimoReg[cid] = r;
      }
    });

    var colms = window.colmenares || [];
    var totalConAbejas = 0;
    var vencidas = [];
    var loqueAlertas = [];

    colms.forEach(function(c) {
      var reg = ultimoReg[String(c.id)];
      if (!reg) return;
      totalConAbejas += (parseInt(reg.camConAbejas) || 0);

      // Calcular próxima visita
      var fechaVisita = parseDate(reg.fecha);
      if (fechaVisita) {
        var diasRetorno = parseInt(reg['retorno-dias']) || 15;
        var proxima = addDays(fechaVisita, diasRetorno);
        var diff = diffDays(today, proxima); // negativo = vencida
        if (diff <= 3) { // vencida o por vencer en 3 días
          vencidas.push({ colm: c, proxima: proxima, diff: diff, reg: reg });
        }
        // Alerta Loque
        if ((parseInt(reg.mLA) || 0) > 0) {
          loqueAlertas.push({ colm: c, cant: parseInt(reg.mLA), fecha: reg.fecha });
        }
      }
    });

    // Ordenar vencidas: primero las más vencidas
    vencidas.sort(function(a, b) { return a.diff - b.diff; });

    // Total cosecha de la temporada actual
    var anioHoy = today.getFullYear();
    var mesHoy = today.getMonth() + 1;
    // Temporada: jul año anterior a jun año actual (hemisferio sur)
    var temporadaStart = mesHoy >= 7
      ? anioHoy + '-07-01'
      : (anioHoy - 1) + '-07-01';
    var temporadaEnd = mesHoy >= 7
      ? (anioHoy + 1) + '-06-30'
      : anioHoy + '-06-30';

    var cosechaTemporada = 0;
    (window.registros || []).forEach(function(r) {
      if (r.fecha >= temporadaStart && r.fecha <= temporadaEnd) {
        var alzas = parseInt(r.coA) || 0;
        var kgAlza = parseFloat(r.coKgAlza) || 0;
        cosechaTemporada += alzas * kgAlza;
      }
    });

    // ─── KPIs ───
    var kpiEl = document.getElementById('dash-kpis');
    if (kpiEl) {
      kpiEl.innerHTML = `
        <div class="dash-kpi dash-kpi-bee">
          <div class="dash-kpi-num">${totalConAbejas}</div>
          <div class="dash-kpi-label">Cámaras con abejas</div>
          <div class="dash-kpi-sub">${colms.length} colmenares</div>
        </div>
        <div class="dash-kpi dash-kpi-alert">
          <div class="dash-kpi-num">${vencidas.length}</div>
          <div class="dash-kpi-label">Visitas vencidas/urgentes</div>
          <div class="dash-kpi-sub">en los próximos 3 días</div>
        </div>
        <div class="dash-kpi dash-kpi-loque">
          <div class="dash-kpi-num">${loqueAlertas.length}</div>
          <div class="dash-kpi-label">Alertas Loque Am.</div>
          <div class="dash-kpi-sub">última visita registrada</div>
        </div>
        <div class="dash-kpi dash-kpi-miel">
          <div class="dash-kpi-num">${Math.round(cosechaTemporada)}<span style="font-size:14px;font-weight:600"> kg</span></div>
          <div class="dash-kpi-label">Cosecha temporada</div>
          <div class="dash-kpi-sub">desde ${fmtDate(parseDate(temporadaStart))}</div>
        </div>
      `;
    }

    // ─── Visitas vencidas ───
    var vEl = document.getElementById('dash-vencidas');
    if (vEl) {
      if (!vencidas.length) {
        vEl.innerHTML = '<div class="dash-empty">✅ Todas las visitas están al día</div>';
      } else {
        vEl.innerHTML = vencidas.map(function(v) {
          var dot = v.diff < 0 ? 'dash-item-dot-red' : 'dash-item-dot-orange';
          var badge = v.diff < 0
            ? '<span class="dash-item-badge dash-badge-red">Vencida hace ' + Math.abs(v.diff) + ' días</span>'
            : '<span class="dash-item-badge dash-badge-orange">Vence en ' + v.diff + ' día' + (v.diff!==1?'s':'') + '</span>';
          return `
            <div class="dash-item">
              <div class="dash-item-dot ${dot}"></div>
              <div class="dash-item-name">${v.colm.nombre}</div>
              <div style="font-size:12px;color:#888">${fmtDate(v.proxima)}</div>
              ${badge}
            </div>
          `;
        }).join('');
      }
    }

    // ─── Alertas Loque ───
    var lEl = document.getElementById('dash-loque');
    if (lEl) {
      if (!loqueAlertas.length) {
        lEl.innerHTML = '<div class="dash-empty">✅ Sin alertas sanitarias</div>';
      } else {
        lEl.innerHTML = loqueAlertas.map(function(a) {
          return `
            <div class="dash-item">
              <div class="dash-item-dot dash-item-dot-red"></div>
              <div class="dash-item-name">${a.colm.nombre}</div>
              <div style="font-size:12px;color:#888">Última visita: ${fmtDate(parseDate(a.fecha))}</div>
              <span class="dash-item-badge dash-badge-red">${a.cant} muerta${a.cant!==1?'s':''}</span>
            </div>
          `;
        }).join('');
      }
    }

    // ─── Gráfico de evolución ───
    renderEvolucionChart();
  };

  // ─── Chart de evolución ──────────────────────────────────────────────────
  var chartInstance = null;

  window.renderEvolucionChart = function() {
    var canvas = document.getElementById('chart-evolucion');
    if (!canvas || typeof Chart === 'undefined') {
      // Reintentar cuando Chart.js cargue
      setTimeout(window.renderEvolucionChart, 500);
      return;
    }

    // Agrupar por mes: yyyy-mm -> total camConAbejas (promedio por colmenar en ese mes)
    var byMonth = {};
    (window.registros || []).forEach(function(r) {
      if (!r.fecha) return;
      var mes = r.fecha.substring(0, 7); // "2024-11"
      if (!byMonth[mes]) byMonth[mes] = { sum: 0, count: 0 };
      byMonth[mes].sum += (parseInt(r.camConAbejas) || 0);
      byMonth[mes].count += 1;
    });

    var meses = Object.keys(byMonth).sort();
    if (meses.length < 2) {
      canvas.parentNode.innerHTML = '<div class="dash-empty">Necesitás al menos 2 meses de datos para ver el gráfico</div>';
      return;
    }

    // Mostrar últimos 18 meses
    meses = meses.slice(-18);

    var labels = meses.map(function(m) {
      var parts = m.split('-');
      var meses_nombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return meses_nombres[parseInt(parts[1])-1] + ' ' + parts[0].slice(2);
    });

    var data = meses.map(function(m) {
      return Math.round(byMonth[m].sum / byMonth[m].count * 10) / 10;
    });

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Promedio cámaras con abejas',
          data: data,
          borderColor: '#F5C518',
          backgroundColor: 'rgba(245,197,24,0.15)',
          borderWidth: 2.5,
          pointBackgroundColor: '#F5C518',
          pointRadius: 4,
          tension: 0.3,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) { return ctx.raw + ' cámaras (promedio)'; }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 11 }, color: '#888' }
          },
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 11 }, color: '#888' }
          }
        }
      }
    });
  };

  // ─── 7. Hook a syncAll para re-renderizar el dashboard ───────────────────
  // Esperar a que syncAll esté definido y parchear para llamar renderInicio
  var hookInterval = setInterval(function() {
    if (typeof window.syncAll === 'function') {
      clearInterval(hookInterval);
      var origSyncAll = window.syncAll;
      window.syncAll = function() {
        return origSyncAll.apply(this, arguments).then
          ? origSyncAll.apply(this, arguments).then(function(r) {
              // Si la sección activa es inicio, re-renderizar
              var si = document.getElementById('sec-inicio');
              if (si && si.classList.contains('on')) renderInicio();
              return r;
            })
          : origSyncAll.apply(this, arguments);
      };
    }
  }, 200);

})();
