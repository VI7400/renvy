const KLC = 'locacoes', KCL = 'clientes', KVE = 'veiculos';
function getArray(k) { return JSON.parse(localStorage.getItem(k) || '[]') }
function setArray(k, a) { localStorage.setItem(k, JSON.stringify(a)) }
function nextId(k) { const a = getArray(k); return a.length ? Math.max(...a.map(x => x.id)) + 1 : 1 }
function upsert(k, o) { const a = getArray(k); if (!o.id) { o.id = nextId(k); a.push(o) } else { const i = a.findIndex(x => x.id === o.id); if (i >= 0) a[i] = o; else a.push(o) } setArray(k, a); return o }
function removeById(k, id) { setArray(k, getArray(k).filter(x => x.id !== id)); }
const f = document.getElementById('formLocacao'); const selCliente = document.getElementById('clienteId'); const selVeiculo = document.getElementById('veiculoId');
const tab = document.getElementById('tabelaLocacoes'); const busca = document.getElementById('busca'); const diaria = document.getElementById('diaria'); const total = document.getElementById('total');
function carregaCombos() { selCliente.innerHTML = ''; selVeiculo.innerHTML = ''; getArray(KCL).forEach(c => selCliente.append(new Option(c.nome + ' (' + (c.cpf || '') + ')', c.id))); getArray(KVE).forEach(v => selVeiculo.append(new Option(v.modelo + ' (' + v.placa + ')', v.id))); }
function calculaTotal() { const di = f.dataIni.value, df = f.dataFim.value || f.dataIni.value; const dias = Math.max(1, Math.ceil((new Date(df) - new Date(di)) / 86400000)); total.value = (Number(diaria.value || 0) * dias).toFixed(2); }
selVeiculo?.addEventListener('change', () => { const vId = Number(selVeiculo.value) || 0; const v = getArray(KVE).find(x => x.id === vId); diaria.value = v ? Number(v.diaria || 0).toFixed(2) : ''; calculaTotal(); });
f?.addEventListener('input', calculaTotal);
f?.addEventListener('submit', e => { e.preventDefault(); const o = { id: f.id.value ? Number(f.id.value) : undefined, clienteId: Number(selCliente.value), veiculoId: Number(selVeiculo.value), dataIni: f.dataIni.value, dataFim: f.dataFim.value, diaria: Number(diaria.value || 0), total: Number(total.value || 0), status: 'ativa' }; if (!o.clienteId || !o.veiculoId) return alert('Selecione cliente e veículo.'); upsert(KLC, o); f.reset(); calculaTotal(); render(); });
function render() {
  const clientes = Object.fromEntries(getArray(KCL).map(c => [c.id, c])); const veiculos = Object.fromEntries(getArray(KVE).map(v => [v.id, v])); const dados = getArray(KLC).map(l => ({ id: l.id, cliente: (clientes[l.clienteId]?.nome) || '-', veiculo: (veiculos[l.veiculoId]?.modelo) || '-', retirada: l.dataIni, devolucao: l.dataFim, diaria: Number(l.diaria).toFixed(2), total: Number(l.total).toFixed(2), status: l.status || 'ativa' }));
  const q = (busca?.value || '').toLowerCase(); const fil = dados.filter(x => x.cliente.toLowerCase().includes(q) || x.veiculo.toLowerCase().includes(q));
  tab.innerHTML = ''; const thead = document.createElement('thead'), trh = document.createElement('tr');['id', 'cliente', 'veiculo', 'retirada', 'devolucao', 'diaria', 'total', 'status', 'ações'].forEach(h => { const th = document.createElement('th'); th.textContent = h; trh.append(th); }); thead.append(trh); tab.append(thead);
  const tbody = document.createElement('tbody'); fil.forEach(r => {
    const tr = document.createElement('tr');[r.id, r.cliente, r.veiculo, r.retirada, r.devolucao, r.diaria, r.total, r.status].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); });
    const tdA = document.createElement('td'); const btn = document.createElement('button'); btn.className = 'btn small'; btn.textContent = 'Excluir'; btn.onclick = () => { if (confirm('Excluir a locação #' + r.id + ' de ' + r.cliente + ' (' + r.veiculo + ') ?')) { removeById(KLC, r.id); render(); } }; tdA.append(btn); tr.append(tdA); tbody.append(tr);
  });
  tab.append(tbody);
}
document.addEventListener('DOMContentLoaded', () => { carregaCombos(); calculaTotal(); render(); });
carregaCombos(); calculaTotal(); render();
