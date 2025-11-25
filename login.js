// APONTA PARA O SEU BACKEND NO RENDER
const API_URL = 'https://meu-delivery-app.onrender.com'; 

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    const btnEntrar = document.getElementById('btn-entrar');
    const statusMsg = document.getElementById('login-status-msg');

    localStorage.clear(); 

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();

        btnEntrar.disabled = true;
        btnEntrar.textContent = 'Conectando...';
        statusMsg.style.display = 'none';

        try {
            // Faz a requisição para o Render
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Erro no login');

            // Salva o token para usar nas outras páginas
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('nomeLoja', data.nomeLoja || 'Mestre');

            // Direciona para a página correta
            if (data.role === 'master') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'painel.html';
            }

        } catch (error) {
            statusMsg.textContent = "Erro: " + error.message;
            statusMsg.className = 'status-msg status-error';
            statusMsg.style.display = 'block';
            btnEntrar.disabled = false;
            btnEntrar.textContent = 'Acessar Painel';
        }
    });
});