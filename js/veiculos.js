const KEYV = 'veiculos';
function getArray(k) { return JSON.parse(localStorage.getItem(k) || '[]') }
function setArray(k, a) { localStorage.setItem(k, JSON.stringify(a)) }
function nextId(k) { const a = getArray(k); return a.length ? Math.max(...a.map(x => x.id)) + 1 : 1 }
function upsert(k, o) { const a = getArray(k); if (!o.id) { o.id = nextId(k); a.push(o) } else { const i = a.findIndex(x => x.id === o.id); if (i >= 0) a[i] = o; else a.push(o) } setArray(k, a); return o }
function removeById(k, id) { setArray(k, getArray(k).filter(x => x.id !== id)); }
const fV = document.getElementById('formVeiculo'); const tV = document.getElementById('tabelaVeiculos'); const bV = document.getElementById('busca');
let dV = getArray(KEYV);
if (!dV.length) {
  dV = [
    { id: 1, modelo: 'Onix 1.0', placa: 'ABC1D23', categoria: 'Hatch', diaria: 129.90 },
    { id: 2, modelo: 'Corolla 2.0', placa: 'EFG4H56', categoria: 'Sedan', diaria: 199.90 },
    { id: 3, modelo: 'HR-V 1.8', placa: 'IJK7L89', categoria: 'SUV', diaria: 219.90 }
  ]; setArray(KEYV, dV);
}
function refreshV() {
  dV = getArray(KEYV);
  const q = (bV?.value || '').toLowerCase();
  const l = dV.filter(x => x.modelo.toLowerCase().includes(q) || x.placa.toLowerCase().includes(q));
  tV.innerHTML = '';
  const thead = document.createElement('thead'); const trh = document.createElement('tr');
  ['id', 'modelo', 'placa', 'categoria', 'diaria', 'ações'].forEach(h => { const th = document.createElement('th'); th.textContent = h; trh.append(th); });
  thead.append(trh); tV.append(thead);
  const tbody = document.createElement('tbody');
  l.forEach(v => {
    const tr = document.createElement('tr');
    [v.id, v.modelo, v.placa, v.categoria, Number(v.diaria).toFixed(2)].forEach(val => { const td = document.createElement('td'); td.textContent = val; tr.append(td); });
    const tdA = document.createElement('td'); const btn = document.createElement('button'); btn.className = 'btn small'; btn.textContent = 'Excluir';
    btn.onclick = () => { if (confirm('Excluir o veículo "' + v.modelo + ' (' + v.placa + ')" ?')) { removeById(KEYV, v.id); refreshV(); } };
    tdA.append(btn); tr.append(tdA); tbody.append(tr);
  });
  tV.append(tbody);
}
fV?.addEventListener('submit', e => {
  e.preventDefault();
  const o = { id: fV.id.value ? Number(fV.id.value) : undefined, modelo: fV.modelo.value.trim(), placa: (fV.placa.value || '').trim().toUpperCase(), categoria: fV.categoria.value, diaria: Number(fV.diaria.value) };
  if (!o.modelo || !o.placa) return alert('Preencha modelo e placa.');
  upsert(KEYV, o); fV.reset(); refreshV();
});
bV?.addEventListener('input', refreshV);
document.addEventListener('DOMContentLoaded', refreshV);
refreshV();
