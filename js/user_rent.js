const KVE = 'veiculos', KLC = 'locacoes';
function getArray(k) { return JSON.parse(localStorage.getItem(k) || '[]') }
function setArray(k, a) { localStorage.setItem(k, JSON.stringify(a)) }
function nextId(k) { const a = getArray(k); return a.length ? Math.max(...a.map(x => x.id)) + 1 : 1 }
function upsert(k, o) { const a = getArray(k); if (!o.id) { o.id = nextId(k); a.push(o) } else { const i = a.findIndex(x => x.id === o.id); if (i >= 0) a[i] = o; else a.push(o) } setArray(k, a); return o }
const sess = JSON.parse(localStorage.getItem('clientSession') || 'null'); if (!sess || sess.role !== 'client') { try { location.href = 'login.html' } catch (e) { } }
const sel = document.getElementById('veiculoId'); const di = document.getElementById('dataIni'); const df = document.getElementById('dataFim'); const total = document.getElementById('total'); const tabela = document.getElementById('tabelaMeus');
function carregaVeiculos() { sel.innerHTML = '<option value="">Selecione…</option>'; getArray(KVE).forEach(v => sel.append(new Option(v.modelo + ' (' + v.placa + ')', v.id))); }
function diariaSelecionada() { const vId = Number(sel.value) || 0; const v = getArray(KVE).find(x => x.id === vId); return v ? Number(v.diaria || 0) : 0; }
function calculaTotal() { if (!di.value || !df.value) { total.value = ''; return; } const dias = Math.max(1, Math.ceil((new Date(df.value) - new Date(di.value)) / 86400000)); total.value = (dias * diariaSelecionada()).toFixed(2); }
function renderTabela() {
  const meus = getArray(KLC).filter(l => Number(l.clienteId) === Number(sess?.clienteId)); const veiculos = Object.fromEntries(getArray(KVE).map(v => [v.id, v]));
  tabela.innerHTML = ''; const thead = document.createElement('thead'), trh = document.createElement('tr');['id', 'veiculo', 'retirada', 'devolucao', 'total'].forEach(h => { const th = document.createElement('th'); th.textContent = h; trh.append(th); }); thead.append(trh); tabela.append(thead);
  const tbody = document.createElement('tbody'); meus.forEach(l => { const tr = document.createElement('tr');[l.id, (veiculos[l.veiculoId]?.modelo) || '-', l.dataIni, l.dataFim, Number(l.total).toFixed(2)].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td) }); tbody.append(tr); });
  tabela.append(tbody);
}
document.getElementById('formAluguel').addEventListener('submit', (e) => {
  e.preventDefault(); const veicId = Number(sel.value); if (!veicId) return alert('Selecione um veículo.');
  const o = { clienteId: Number(sess.clienteId), veiculoId: veicId, dataIni: di.value, dataFim: df.value, diaria: diariaSelecionada(), total: Number(total.value || 0), status: 'ativa' };
  upsert(KLC, o); e.target.reset(); renderTabela(); carregaVeiculos();
});
[sel, di, df].forEach(el => el.addEventListener('change', calculaTotal));
document.getElementById('logout')?.addEventListener('click', () => { localStorage.removeItem('clientSession'); location.href = 'login.html'; });
carregaVeiculos(); renderTabela();
