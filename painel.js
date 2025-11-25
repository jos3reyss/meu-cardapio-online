const API_URL = 'https://meu-delivery-app.onrender.com';
const token = localStorage.getItem('token');
const targetLoja = new URLSearchParams(window.location.search).get('targetLoja');

// Headers de Autenticação
const headers = { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${token}` 
};
if (targetLoja) headers['x-target-loja'] = targetLoja;

if (!token) window.location.href = 'login.html';

// Se for Mestre acessando loja
if (targetLoja) {
    document.getElementById('btn-voltar-admin').style.display = 'block';
    document.getElementById('nome-loja').innerText = `Loja ID: ${targetLoja}`;
}

// Carregar Pedidos
async function loadPedidos() {
    const res = await fetch(`${API_URL}/pedidos/loja`, { headers });
    const pedidos = await res.json();
    const div = document.getElementById('lista-pedidos');
    div.innerHTML = '';
    pedidos.forEach(p => {
        div.innerHTML += `
            <div class="pedido-card">
                <h3>#${p.id} - ${p.cliente_nome} (${p.horario})</h3>
                <p>${p.itens.map(i=> `${i.quantidade}x ${i.nome}`).join(', ')}</p>
                <p><strong>Total: R$ ${p.valor_total}</strong> - Status: ${p.status}</p>
            </div>
        `;
    });
}

// Carregar Produtos e Categorias
async function loadProdutos() {
    const resCat = await fetch(`${API_URL}/categorias`, { headers });
    const cats = await resCat.json();
    
    const select = document.getElementById('cat-select');
    select.innerHTML = '';
    cats.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nome}</option>`);

    if(cats.length > 0) {
        const resProd = await fetch(`${API_URL}/produtos/categoria/${cats[0].id}`, { headers });
        const prods = await resProd.json();
        document.getElementById('lista-produtos').innerHTML = prods.map(p => `<p>${p.nome} - R$ ${p.preco}</p>`).join('');
    }
}

async function addProduto() {
    const nome = document.getElementById('prod-nome').value;
    const preco = document.getElementById('prod-preco').value;
    const cat = document.getElementById('cat-select').value;
    
    await fetch(`${API_URL}/produtos`, {
        method: 'POST', headers,
        body: JSON.stringify({ nome, preco, id_categoria: cat, disponivel: true, type: 'simples' })
    });
    loadProdutos();
}

// Navegação
window.mostrar = (view) => {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${view}`).style.display = 'block';
    if(view === 'pedidos') loadPedidos();
    if(view === 'produtos') loadProdutos();
};

// Socket.IO
const socket = io(API_URL);
const lojaId = targetLoja || JSON.parse(atob(token.split('.')[1])).id_loja;
socket.emit('entrar_sala_loja', lojaId);
socket.on('novo_pedido', () => { alert('Novo Pedido!'); loadPedidos(); });

loadPedidos();