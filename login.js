// Certifique-se de que o DOM esteja completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'https://brf1-identity.azurewebsites.net';
  
    // Função para fazer login
    async function loginUser() {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nomeUsuario: username, senha: password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          localStorage.setItem('jwt_token', data.token);
          document.getElementById('loginForm').style.display = 'none';
          document.getElementById('uploadForm').style.display = 'block';
        } else {
          alert('Falha no login: ' + data.error);
        }
      } catch (error) {
        alert('Erro ao fazer login: ' + error.toString());
      }
    }
  
    // Função para registrar usuário
    async function registerUser() {
      const username = document.getElementById('registerUsername').value;
      const password = document.getElementById('registerPassword').value;
      const email = document.getElementById('registerEmail').value;
      try {
        const response = await fetch(`${API_URL}/registro`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nomeUsuario: username, senha: password, email: email }),
        });
  
        if (response.ok) {
          alert('Registro bem-sucedido');
        } else {
          alert('Falha no registro');
        }
      } catch (error) {
        alert('Erro ao registrar: ' + error.toString());
      }
    }
  
    // Função para esqueceu a senha
    async function forgotPassword() {
      const username = document.getElementById('forgotUsername').value;
      try {
        const response = await fetch(`${API_URL}/recuperar-senha`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nomeUsuario: username }),
        });
  
        if (response.ok) {
          alert('Verifique seu e-mail para redefinir sua senha');
        } else {
          alert('Falha ao recuperar senha');
        }
      } catch (error) {
        alert('Erro ao recuperar senha: ' + error.toString());
      }
    }
  
    // Função para reenviar código
    async function resendCode() {
      const username = document.getElementById('resendUsername').value;
      try {
        const response = await fetch(`${API_URL}/reenviar-codigo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nomeUsuario: username }),
        });
  
        if (response.ok) {
          alert('Código reenviado com sucesso');
        } else {
          alert('Falha ao reenviar código');
        }
      } catch (error) {
        alert('Erro ao reenviar código: ' + error.toString());
      }
    }
  
    // Função para validar código
    async function validateCode() {
      const username = document.getElementById('validateUsername').value;
      const code = document.getElementById('validateCode').value;
      try {
        const response = await fetch(`${API_URL}/validar-codigo-verificacao`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nomeUsuario: username, codigoVerificacao: code }),
        });
  
        if (response.ok) {
          alert('Código validado com sucesso');
        } else {
          alert('Falha ao validar código');
        }
      } catch (error) {
        alert('Erro ao validar código: ' + error.toString());
      }
    }
  
    // Anexar funções aos botões
    document.getElementById('loginButton').addEventListener('click', loginUser);
    document.getElementById('registerButton').addEventListener('click', registerUser);
    document.getElementById('forgotPasswordButton').addEventListener('click', forgotPassword);
    document.getElementById('resendCodeButton').addEventListener('click', resendCode);
    document.getElementById('validateCodeButton').addEventListener('click', validateCode);
  
  });
  