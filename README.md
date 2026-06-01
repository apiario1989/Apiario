<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<meta name="theme-color" content="#ffffff">
<title>Escáner de Tambores</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f3; color: #1a1a1a; }
  #app { padding: 12px; max-width: 480px; margin: 0 auto; }
  h1 { font-size: 17px; font-weight: 500; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; padding-top: 12px; }
  .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.12); border-radius: 12px; padding: 14px; margin-bottom: 12px; }
  .section-label { font-size: 11px; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  #reader { width: 100%; border-radius: 8px; overflow: hidden; background: #000; min-height: 200px; display: none; position: relative; }
  #reader video { width: 100%; display: block; }
  .scan-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 220px; height: 110px; border: 2px solid rgba(255,255,255,0.75); border-radius: 6px; pointer-events: none; }
  .scan-line { position: absolute; left: 0; right: 0; height: 2px; background: rgba(255,60,60,0.85); animation: scanMove 1.8s ease-in-out infinite; }
  @keyframes scanMove { 0%,100% { top: 8%; } 50% { top: 88%; } }
  #barcode-result { font-size: 13px; color: #888; padding: 10px 12px; background: #f5f5f3; border-radius: 8px; margin-top: 10px; min-height: 40px; display: flex; align-items: center; word-break: break-all; }
  .field-row { display: flex; gap: 8px; margin-top: 10px; }
  .field-row input { flex: 1; }
  input[type=text], input[type=number] {
    height: 40px; border: 0.5px solid rgba(0,0,0,0.2); border-radius: 8px;
    padding: 0 10px; font-size: 14px; background: #fff; color: #1a1a1a; width: 100%;
    -webkit-appearance: none;
  }
  input:focus { outline: none; border-color: rgba(0,0,0,0.4); }
  .btn {
    height: 40px; padding: 0 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
    cursor: pointer; border: 0.5px solid rgba(0,0,0,0.2); background: #fff; color: #1a1a1a;
    white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;
    -webkit-tap-highlight-color: transparent;
  }
  .btn:active { transform: scale(0.97); background: #f0f0ee; }
  .btn-primary { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
  .btn-primary:active { background: #333; }
  .btn-scan { width: 100%; justify-content: center; margin-bottom: 10px; }
  .add-row { display: flex; gap: 8px; margin-top: 10px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; font-size: 13px; border-collapse: collapse; table-layout: fixed; }
  th { font-weight: 500; color: #888; padding: 6px 8px; text-align: left; border-bottom: 0.5px solid rgba(0,0,0,0.1); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  td { padding: 8px 8px; border-bottom: 0.5px solid rgba(0,0,0,0.07); color: #1a1a1a; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  tr:last-child td { border-bottom: none; }
  td.del { text-align: center; cursor: pointer; color: #bbb; }
  td.del:active { color: #e44; }
  th:nth-child(1), td:nth-child(1) { width: 44%; }
  th:nth-child(2), td:nth-child(2) { width: 22%; }
  th:nth-child(3), td:nth-child(3) { width: 22%; }
  th:nth-child(4), td:nth-child(4) { width: 12%; }
  .empty { text-align: center; color: #aaa; font-size: 13px; padding: 24px 0; }
  .bottom-bar { display: flex; gap: 8px; margin-top: 4px; margin-bottom: 20px; }
  .bottom-bar .btn { flex: 1; justify-content: center; }
  .badge { display: inline-flex; align-items: center; justify-content: center; background: #eee; border-radius: 50%; width: 22px; height: 22px; font-size: 12px; font-weight: 500; color: #555; }
  #status-msg { font-size: 12px; color: #888; text-align: center; margin-top: 8px; min-height: 16px; }
  .manual-row { display: flex; gap: 8px; margin-top: 8px; }
  .manual-row input { flex: 1; }
  .divider { border: none; border-top: 0.5px solid rgba(0,0,0,0.08); margin: 12px 0; }
  .banner {
    background: linear-gradient(135deg, #f5a800 0%, #e8890a 100%);
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .banner-icon { font-size: 36px; line-height: 1; flex-shrink: 0; }
  .banner-text { flex: 1; }
  .banner-name { font-size: 20px; font-weight: 700; color: #5a3200; letter-spacing: -0.3px; line-height: 1.2; }
  .banner-slogan { font-size: 13px; color: #7a4600; margin-top: 3px; font-style: italic; }
  .banner-tel { font-size: 13px; font-weight: 600; color: #5a3200; margin-top: 6px; display: flex; align-items: center; gap: 5px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1a1a1a; color: #eee; }
    .card { background: #252525; border-color: rgba(255,255,255,0.1); }
    input[type=text], input[type=number] { background: #1a1a1a; color: #eee; border-color: rgba(255,255,255,0.2); }
    .btn { background: #252525; color: #eee; border-color: rgba(255,255,255,0.2); }
    .btn:active { background: #333; }
    .btn-primary { background: #eee; color: #111; }
    #barcode-result { background: #1a1a1a; color: #888; }
    td { color: #ddd; }
    td.del { color: #555; }
    .badge { background: #333; color: #aaa; }
    th { color: #666; }
  }
</style>
</head>
<body>
<div id="app">
  <div class="banner">
    <div class="banner-icon">🍯</div>
    <div class="banner-text">
      <div class="banner-name">Apiario La Reina</div>
      <div class="banner-slogan">Compramos miel todo el año</div>
      <div class="banner-tel"><i class="ti ti-phone" style="font-size:14px;"></i> 3537-589185</div>
    </div>
  </div>
  <h1><i class="ti ti-barcode"></i> Escáner de tambores <span class="badge" id="count-badge">0</span></h1>

  <div class="card">
    <div class="section-label">Escanear código de barras</div>
    <button class="btn btn-scan" id="btn-toggle-scan" onclick="toggleScan()">
      <i class="ti ti-camera"></i> Activar cámara
    </button>
    <div id="reader">
      <video id="video" playsinline autoplay muted></video>
      <div class="scan-overlay"><div class="scan-line"></div></div>
    </div>
    <div id="barcode-result" data-value="">El código escaneado aparece aquí</div>
    <div class="field-row">
      <input type="text" id="inp-precinto" placeholder="Precinto" />
      <input type="text" id="inp-peso" placeholder="Peso" inputmode="decimal" />
    </div>
    <div class="add-row">
      <button class="btn btn-primary" style="flex:1;" onclick="addEntry()">
        <i class="ti ti-plus"></i> Agregar registro
      </button>
    </div>
    <div id="status-msg"></div>
    <hr class="divider">
    <div class="section-label">O ingresá el código manualmente</div>
    <div class="manual-row">
      <input type="text" id="inp-manual" placeholder="Código de tambor" inputmode="numeric" />
      <button class="btn" onclick="useManual()">Usar</button>
    </div>
  </div>

  <div class="card">
    <div class="section-label">Registros <span id="rec-count">(0)</span></div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Código tambor</th>
            <th>Precinto</th>
            <th>Peso</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
    <div id="empty-msg" class="empty">Sin registros todavía</div>
  </div>

  <div class="bottom-bar">
    <button class="btn" onclick="clearAll()" style="max-width:130px;">
      <i class="ti ti-trash"></i> Limpiar
    </button>
    <button class="btn btn-primary" onclick="exportCSV()">
      <i class="ti ti-download"></i> Exportar CSV
    </button>
  </div>
</div>

<script>
const entries = [];
let scanning = false;
let videoStream = null;
let scanInterval = null;
let lastScanned = '';

function showStatus(msg, ok) {
  const el = document.getElementById('status-msg');
  el.textContent = msg;
  el.style.color = ok ? '#2a9' : '#888';
}

function updateTable() {
  const tbody = document.getElementById('tbody');
  const empty = document.getElementById('empty-msg');
  document.getElementById('rec-count').textContent = '(' + entries.length + ')';
  document.getElementById('count-badge').textContent = entries.length;
  if (!entries.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = entries.map((e, i) => `
    <tr>
      <td title="${e.codigo}">${e.codigo}</td>
      <td>${e.precinto}</td>
      <td>${e.peso}</td>
      <td class="del" onclick="deleteEntry(${i})"><i class="ti ti-x"></i></td>
    </tr>
  `).join('');
}

function deleteEntry(i) {
  entries.splice(i, 1);
  updateTable();
}

function setCode(code) {
  const el = document.getElementById('barcode-result');
  el.textContent = code;
  el.dataset.value = code;
  el.style.color = '#1a1a1a';
  el.style.fontWeight = '500';
  showStatus('Código listo. Completá precinto y peso.');
}

function addEntry() {
  const codigo = document.getElementById('barcode-result').dataset.value || '';
  const precinto = document.getElementById('inp-precinto').value.trim();
  const peso = document.getElementById('inp-peso').value.trim();
  if (!codigo) { showStatus('Escaneá o ingresá un código primero.'); return; }
  entries.push({ codigo, precinto, peso });
  document.getElementById('inp-precinto').value = '';
  document.getElementById('inp-peso').value = '';
  const resEl = document.getElementById('barcode-result');
  resEl.textContent = 'El código escaneado aparece aquí';
  resEl.style.color = '#888';
  resEl.style.fontWeight = '400';
  resEl.dataset.value = '';
  lastScanned = '';
  updateTable();
  showStatus('Registro agregado ✓', true);
}

function useManual() {
  const val = document.getElementById('inp-manual').value.trim();
  if (!val) return;
  setCode(val);
  document.getElementById('inp-manual').value = '';
}

async function toggleScan() {
  scanning ? stopScan() : await startScan();
}

async function startScan() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    const video = document.getElementById('video');
    video.srcObject = videoStream;
    document.getElementById('reader').style.display = 'block';
    document.getElementById('btn-toggle-scan').innerHTML = '<i class="ti ti-camera-off"></i> Detener cámara';
    scanning = true;
    await video.play();
    startDecoding();
  } catch(e) {
    showStatus('No se pudo acceder a la cámara: ' + e.message);
  }
}

function stopScan() {
  if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
  if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
  document.getElementById('reader').style.display = 'none';
  document.getElementById('btn-toggle-scan').innerHTML = '<i class="ti ti-camera"></i> Activar cámara';
  scanning = false;
}

function startDecoding() {
  if (!('BarcodeDetector' in window)) {
    showStatus('Tu navegador no soporta escaneo automático. Usá ingreso manual.');
    return;
  }
  const video = document.getElementById('video');
  const detector = new BarcodeDetector({
    formats: ['ean_13','ean_8','code_128','code_39','upc_a','upc_e','itf','codabar','qr_code','data_matrix']
  });
  scanInterval = setInterval(async () => {
    if (video.readyState < 2) return;
    try {
      const barcodes = await detector.detect(video);
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        if (code !== lastScanned) {
          lastScanned = code;
          setCode(code);
          if (navigator.vibrate) navigator.vibrate(80);
        }
      }
    } catch(e) {}
  }, 300);
}

function exportCSV() {
  if (!entries.length) { showStatus('No hay registros para exportar.'); return; }
  const header = 'Código de Tambor;precinto;peso\n';
  const rows = entries.map(e => `${e.codigo};${e.precinto};${e.peso}`).join('\n');
  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tambores_' + new Date().toISOString().slice(0,10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showStatus('CSV exportado ✓', true);
}

function clearAll() {
  if (!entries.length) return;
  if (confirm('¿Eliminar todos los registros?')) {
    entries.length = 0;
    updateTable();
    showStatus('Registros eliminados.');
  }
}

updateTable();
</script>
</body>
</html>
