const KEYC = 'clientes';
function getArray(k) { return JSON.parse(localStorage.getItem(k) || '[]') }
function setArray(k, a) { localStorage.setItem(k, JSON.stringify(a)) }
function nextId(k) { const a = getArray(k); return a.length ? Math.max(...a.map(x => x.id)) + 1 : 1 }
function upsert(k, o) { const a = getArray(k); if (!o.id) { o.id = nextId(k); a.push(o) } else { const i = a.findIndex(x => x.id === o.id); if (i >= 0) a[i] = o; else a.push(o) } setArray(k, a); return o }
function removeById(k, id) { setArray(k, getArray(k).filter(x => x.id !== id)); }
const f = document.getElementById('formCliente'); const t = document.getElementById('tabelaClientes'); const b = document.getElementById('busca');
function render() {
  const q = (b?.value || '').toLowerCase();
  const dados = getArray(KEYC).filter(c => (c.nome || '').toLowerCase().includes(q) || (c.cpf || '').includes(q));
  t.innerHTML = '';
  const thead = document.createElement('thead'), trh = document.createElement('tr');
  ['id', 'nome', 'cpf', 'telefone', 'email', 'ações'].forEach(h => { const th = document.createElement('th'); th.textContent = h; trh.append(th); });
  thead.append(trh); t.append(thead);
  const tbody = document.createElement('tbody');
  dados.forEach(c => {
    const tr = document.createElement('tr');
    [c.id, c.nome, c.cpf || '', c.telefone || '', c.email || ''].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); });
    const tdA = document.createElement('td');
    const btn = document.createElement('button'); btn.className = 'btn small'; btn.textContent = 'Excluir';
    btn.onclick = () => { if (confirm('Excluir cliente "' + c.nome + '"?')) { removeById(KEYC, c.id); render(); } };
    tdA.append(btn); tr.append(tdA);
    tbody.append(tr);
  });
  t.append(tbody);
}
f?.addEventListener('submit', e => {
  e.preventDefault();
  const o = { id: f.id.value ? Number(f.id.value) : undefined, nome: f.nome.value.trim(), cpf: (f.cpf.value || '').replace(/\D/g, ''), telefone: f.telefone.value.trim(), email: f.email.value.trim() };
  if (!o.nome || !o.cpf || !o.telefone) { alert('Preencha Nome, CPF e Telefone.'); return; }
  upsert(KEYC, o); f.reset(); render();
});
b?.addEventListener('input', render);
document.addEventListener('DOMContentLoaded', render);
render();
