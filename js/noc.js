/**
 * noc.js - MOC PROVEDORES Dashboard Operations Center
 * Engine de simulação de alta performance para 2.000+ clientes
 */

// Configurações e Estado
Chart.defaults.color = '#8A94A6';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

let clientsData = [];
let equipmentData = [
  { name: 'CCR-CORE-01', ip: '10.0.0.1', model: 'MikroTik CCR1036', status: 'online', cpu: 42, mem: 28, temp: 38, uptime: '45d 12h' },
  { name: 'SW-AGREG-01', ip: '10.0.0.2', model: 'Huawei S5700', status: 'online', cpu: 15, mem: 40, temp: 35, uptime: '120d 5h' },
  { name: 'OLT-ZTE-01', ip: '10.0.1.15', model: 'ZTE C320', status: 'offline', cpu: 0, mem: 0, temp: 0, uptime: '0d 0h' },
  { name: 'PTMP-LOUVRE', ip: '10.0.3.50', model: 'Rocket Prism', status: 'warning', cpu: 92, mem: 85, temp: 42, uptime: '5d 2h' },
  { name: 'SW-DIST-03', ip: '10.0.0.10', model: 'Cisco CBS350', status: 'online', cpu: 10, mem: 22, temp: 32, uptime: '30d 1h' }
];

// 1. Inicialização do Sistema
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  
  if(document.getElementById('trafficChart')) {
      initMainTrafficChart();
      initHistoryChart();
      initRealTimeSimulation();
  }
  if(document.getElementById('detailedTrafficChart')) {
      initDetailedTrafficChart();
      initDetailedSimulation();
  }
  if(document.getElementById('clients-table-body')) {
      generateClients(2000);
      renderClients(clientsData);
      initSearch();
  }
  if(document.getElementById('equipment-body')) {
      renderEquipment();
  }
});

// 3. Geração de Clientes (Big Data Simulation)
function generateClients(count) {
  const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Beatriz', 'Ricardo', 'Fernanda', 'Lucas', 'Juliana', 'Marcos', 'Aline', 'Rafael', 'Bruna', 'Gabriel', 'Larissa'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Carvalho', 'Ferreira', 'Costa', 'Rodrigues', 'Alves', 'Nascimento'];
  const plans = ['Ultra 1 Giga', 'Turbo 600 Mega', 'Premium 400 Mega', 'Basic 200 Mega', 'Link Dedicado'];
  const statuses = ['online', 'online', 'online', 'online', 'online', 'warning', 'offline']; // Peso maior para online

  for (let i = 0; i < count; i++) {
    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${i + 1}`;
    clientsData.push({
      id: i + 1,
      name: name,
      ip: `100.64.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      mac: `${Math.floor(Math.random()*16).toString(16)}:${Math.floor(Math.random()*16).toString(16)}:${Math.floor(Math.random()*16).toString(16)}:XX:XX:XX`.toUpperCase(),
      plan: plans[Math.floor(Math.random() * plans.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      consumption: (Math.random() * 500).toFixed(1) + ' Mbps',
      latency: Math.floor(Math.random() * 60) + ' ms',
      uptime: Math.floor(Math.random() * 30) + 'd ' + Math.floor(Math.random() * 24) + 'h'
    });
  }
}

function renderClients(data) {
  const tbody = document.getElementById('clients-table-body');
  const fragment = document.createDocumentFragment();
  
  // Limita renderização para performance se necessário, mas 2k o browser aguenta
  data.forEach(client => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${client.name}</strong></td>
      <td>${client.ip} <br/><small>${client.mac}</small></td>
      <td>${client.plan}</td>
      <td><span class="status-badge ${getStatusClass(client.status)}">${client.status}</span></td>
      <td>${client.consumption}</td>
      <td>${client.latency}</td>
      <td>${client.uptime}</td>
    `;
    fragment.appendChild(tr);
  });

  tbody.innerHTML = '';
  tbody.appendChild(fragment);
  document.getElementById('client-count-header').textContent = data.length.toLocaleString('pt-BR');
}

function getStatusClass(status) {
  if (status === 'online') return 'green';
  if (status === 'warning') return 'yellow';
  return 'red';
}

// 4. Pesquisa de Clientes
function initSearch() {
  const searchInput = document.getElementById('client-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = clientsData.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.ip.includes(term) || 
        c.plan.toLowerCase().includes(term)
      );
      renderClients(filtered);
    });
  }
}

// 5. Renderização de Equipamentos
function renderEquipment() {
  const tbody = document.getElementById('equipment-body');
  if(!tbody) return;
  tbody.innerHTML = equipmentData.map(eq => `
    <tr>
      <td><strong>${eq.name}</strong> <br/><small>${eq.model}</small></td>
      <td>${eq.ip}</td>
      <td><span class="status-badge ${getStatusClass(eq.status)}">${eq.status}</span></td>
      <td><div class="progress-bar"><div class="fill ${eq.cpu > 80 ? 'warning-bg' : ''}" style="width: ${eq.cpu}%;"></div></div> ${eq.cpu}%</td>
      <td>${eq.mem}%</td>
      <td>${eq.temp > 0 ? eq.temp + '°C' : '-'}</td>
      <td>${eq.uptime}</td>
    </tr>
  `).join('');
}

// 6. Configuração de Gráficos (Simulação)
let trafficChart;
function initMainTrafficChart() {
  const ctx = document.getElementById('trafficChart').getContext('2d');
  trafficChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: 30}, () => ''),
      datasets: [
        { label: 'Download', data: Array.from({length: 30}, () => 4 + Math.random()), borderColor: '#00d4ff', backgroundColor: 'rgba(0, 212, 255, 0.1)', fill: true, tension: 0.4, pointRadius: 0 },
        { label: 'Upload', data: Array.from({length: 30}, () => 1 + Math.random()), borderColor: '#8e2de2', backgroundColor: 'rgba(142, 45, 226, 0.1)', fill: true, tension: 0.4, pointRadius: 0 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 10 }, x: { display: false } }, animation: false }
  });
}

function initHistoryChart() {
  const ctx = document.getElementById('historyChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['00h','04h','08h','12h','16h','20h'],
      datasets: [{ label: 'Tráfego (Gbps)', data: [2.5, 3.8, 7.2, 8.5, 9.1, 8.8], backgroundColor: '#00E676', borderRadius: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
  });
}

// 7. Simulação de Tempo Real
function initRealTimeSimulation() {
  setInterval(() => {
    // Clock
    updateClock();

    // Traffic Update
    const newDown = 4 + Math.random() * 2;
    const newUp = 1 + Math.random() * 1;
    document.getElementById('val-down').textContent = newDown.toFixed(2) + ' Gbps';
    document.getElementById('val-up').textContent = newUp.toFixed(2) + ' Gbps';

    trafficChart.data.datasets[0].data.shift();
    trafficChart.data.datasets[0].data.push(newDown);
    trafficChart.data.datasets[1].data.shift();
    trafficChart.data.datasets[1].data.push(newUp);
    trafficChart.update('none');

    // Stats variation
    document.getElementById('val-online').textContent = (4890 + Math.floor(Math.random() * 10)).toLocaleString('pt-BR');

  }, 1000);
}

function initClock() {
  updateClock();
}

function updateClock() {
  const clockEl = document.getElementById('noc-clock');
  if(clockEl) {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('pt-BR');
  }
}

// 8. Análise de Tráfego Detalhada (Multi-Interface)
let detailedChart;
let interfaceData = [
  { id: 'wan1', name: 'WAN 1 (Fibra)', status: 'online', download: 4.2, upload: 1.2, peak: 9.8, color: '#00d4ff' },
  { id: 'wan2', name: 'WAN 2 (Rádio)', status: 'warning', download: 0.8, upload: 0.3, peak: 1.5, color: '#FFC400' },
  { id: 'lan', name: 'Rede Local (LAN)', status: 'online', download: 3.5, upload: 0.8, peak: 8.2, color: '#00E676' }
];

function initDetailedTrafficChart() {
  const ctx = document.getElementById('detailedTrafficChart').getContext('2d');
  detailedChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: 40}, () => ''),
      datasets: interfaceData.map(inter => ({
        label: inter.name,
        data: Array.from({length: 40}, () => inter.download + (Math.random() * 0.5)),
        borderColor: inter.color,
        backgroundColor: inter.color + '1A', // transparent version
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 10, padding: 20 } } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Gbps' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { display: false }
      }
    }
  });
  renderInterfaceTable();
}

function renderInterfaceTable() {
  const tbody = document.getElementById('interface-stats-body');
  if(!tbody) return;
  tbody.innerHTML = interfaceData.map(inter => `
    <tr>
      <td><div style="display:flex; align-items:center; gap:8px;"><span style="width:10px; height:10px; border-radius:50%; background:${inter.color}"></span> <strong>${inter.name}</strong></div></td>
      <td><span class="status-badge ${getStatusClass(inter.status)}">${inter.status}</span></td>
      <td id="td-in-${inter.id}">${inter.download.toFixed(2)} Gbps</td>
      <td id="td-out-${inter.id}">${inter.upload.toFixed(2)} Gbps</td>
      <td>${inter.peak.toFixed(1)} Gbps</td>
    </tr>
  `).join('');
}

function initDetailedSimulation() {
  setInterval(() => {
    interfaceData.forEach((inter, index) => {
      // Variar download e upload
      const variation = (Math.random() - 0.5) * 0.4;
      inter.download = Math.max(0.1, inter.download + variation);
      inter.upload = Math.max(0.05, inter.download * 0.3);

      // Atualizar gráfico
      detailedChart.data.datasets[index].data.shift();
      detailedChart.data.datasets[index].data.push(inter.download);

      // Atualizar tabela
      const tdIn = document.getElementById(`td-in-${inter.id}`);
      const tdOut = document.getElementById(`td-out-${inter.id}`);
      if(tdIn) tdIn.textContent = inter.download.toFixed(2) + ' Gbps';
      if(tdOut) tdOut.textContent = inter.upload.toFixed(2) + ' Gbps';
    });
    detailedChart.update('none');
    updateClock();
  }, 1000);
}
