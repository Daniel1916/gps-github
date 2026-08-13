const $ = (id) => document.getElementById(id);
const locateButton = $('locate'), sendButton = $('send'), result = $('result'), statusBox = $('status');
let lastPosition = null, installPrompt = null;

$('apiUrl').value = localStorage.getItem('gpsApiUrl') || '';
$('apiUrl').addEventListener('change', () => localStorage.setItem('gpsApiUrl', $('apiUrl').value.trim()));
$('appKey').addEventListener('input', () => sessionStorage.setItem('gpsAppKey', $('appKey').value));
$('appKey').value = sessionStorage.getItem('gpsAppKey') || '';

locateButton.addEventListener('click', () => {
  setStatus('Obtendo localização…'); setBusy(true);
  if (!window.isSecureContext) return fail('A localização exige HTTPS. Abra a página pelo GitHub Pages.');
  if (!navigator.geolocation) return fail('Este navegador não oferece localização.');
  navigator.geolocation.getCurrentPosition(showPosition, locationError, {
    enableHighAccuracy: true, timeout: 20000, maximumAge: 5000
  });
});

function showPosition(position) {
  const {latitude, longitude, accuracy} = position.coords;
  lastPosition = { latitude, longitude, accuracyMeters: accuracy, capturedAt: new Date(position.timestamp).toISOString() };
  const time = new Date(position.timestamp).toLocaleString('pt-BR');
  const map = `https://www.google.com/maps?q=${latitude},${longitude}`;
  result.innerHTML = `<b>Data/hora:</b> ${escapeHtml(time)}<br><b>Latitude:</b> ${latitude}<br><b>Longitude:</b> ${longitude}<br><b>Precisão:</b> ${Math.round(accuracy)} m<br><a href="${map}" target="_blank" rel="noopener">Abrir no Google Maps</a>`;
  setBusy(false); sendButton.disabled = false; setStatus('Localização obtida.', 'success');
}

function locationError(error) {
  const messages = {1:'Permissão de localização negada.',2:'Localização indisponível. Ative o GPS.',3:'Tempo esgotado ao procurar a localização.'};
  fail(messages[error.code] || 'Não foi possível obter a localização.');
}

sendButton.addEventListener('click', async () => {
  if (!lastPosition) return;
  const apiUrl = $('apiUrl').value.trim().replace(/\/$/, '');
  const appKey = $('appKey').value;
  if (!apiUrl.startsWith('https://')) return fail('Informe o endereço HTTPS do Worker.');
  if (!appKey) return fail('Informe a chave de acesso do aplicativo.');
  if (!confirm('Deseja enviar esta localização para o repositório GitHub configurado?')) return;
  setBusy(true); setStatus('Enviando arquivo TXT…');
  try {
    const response = await fetch(`${apiUrl}/location`, {
      method:'POST', headers:{'content-type':'application/json','x-app-key':appKey}, body:JSON.stringify(lastPosition)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || `Erro HTTP ${response.status}`);
    setStatus(`Arquivo enviado: ${data.path}`, 'success');
  } catch (error) { fail(`Falha no envio: ${error.message}`); }
  finally { setBusy(false); }
});

function setBusy(value){ locateButton.disabled=value; sendButton.disabled=value || !lastPosition; }
function setStatus(text, type=''){ statusBox.textContent=text; statusBox.className=`status ${type}`; }
function fail(text){ setBusy(false); setStatus(text,'error'); }
function escapeHtml(text){ const d=document.createElement('div'); d.textContent=text; return d.innerHTML; }

window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt=event; $('install').hidden=false; });
$('install').addEventListener('click', async () => { if(installPrompt){ installPrompt.prompt(); await installPrompt.userChoice; installPrompt=null; $('install').hidden=true; } });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
