function getArray(k) { return JSON.parse(localStorage.getItem(k) || '[]') }
function setArray(k, a) { localStorage.setItem(k, JSON.stringify(a)) }
function nextId(k) { const a = getArray(k); return a.length ? Math.max(...a.map(x => x.id)) + 1 : 1 }
function upsert(k, o) { const a = getArray(k); if (!o.id) { o.id = nextId(k); a.push(o) } else { const i = a.findIndex(x => x.id === o.id); if (i >= 0) a[i] = o; else a.push(o) } setArray(k, a); return o }
const onlyDigits = s => (s || '').replace(/\D/g, '');
function ensureClienteFromUser(user) {
  let clientes = getArray('clientes');
  let cli = clientes.find(c => (c.email || '').toLowerCase() === (user.email || '').toLowerCase());
  if (!cli) { cli = { id: nextId('clientes'), nome: user.nome || user.email, cpf: onlyDigits(user.cpf || ''), telefone: user.telefone || '', email: user.email }; clientes.push(cli); setArray('clientes', clientes); }
  else { cli.nome = user.nome || cli.nome; cli.cpf = onlyDigits(user.cpf || cli.cpf || ''); cli.telefone = user.telefone || cli.telefone || ''; setArray('clientes', clientes); }
  return cli.id;
}
const signup = document.getElementById('signupForm');
if (signup) {
  signup.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = signup.nome.value.trim(), email = (signup.email.value || '').trim(), telefone = (signup.telefone.value || '').trim(), cpf = onlyDigits(signup.cpf.value), senha = signup.senha.value;
    if (!nome || !email || !telefone || cpf.length !== 11 || !senha) { alert('Preencha todos os campos. CPF deve ter 11 números.'); return; }
    const users = getArray('users');
    if (users.some(u => onlyDigits(u.cpf) === cpf || (u.email || '').toLowerCase() === email.toLowerCase())) { alert('E-mail ou CPF já cadastrados.'); return; }
    const user = upsert('users', { nome, email, telefone, cpf, senha });
    ensureClienteFromUser(user);
    sessionStorage.setItem('justSignedUpEmail', email);
    location.href = 'login.html';
  });
}
const login = document.getElementById('loginForm');
if (login) {
  const msg = document.getElementById('msg');
  const just = sessionStorage.getItem('justSignedUpEmail');
  if (just) { const e = document.getElementById('email'); if (e) e.value = just; if (msg) msg.textContent = 'Cadastro concluído! Faça login para continuar.'; sessionStorage.removeItem('justSignedUpEmail'); }
  login.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = (login.email.value || '').trim().toLowerCase(), senha = login.senha.value;
    if ((id === 'admin' || id === 'admin@renvy') && senha === '123') { localStorage.setItem('sessionUser', JSON.stringify({ role: 'admin', u: 'admin' })); location.href = '../admin.html'; return; }
    const u = getArray('users').find(u => (u.email || '').toLowerCase() === id && u.senha === senha);
    if (!u) { alert('E-mail/usuário ou senha inválidos.'); return; }
    const clienteId = ensureClienteFromUser(u);
    localStorage.setItem('clientSession', JSON.stringify({ role: 'client', userId: u.id, clienteId, nome: u.nome }));
    location.href = 'area.html';
  });
}
