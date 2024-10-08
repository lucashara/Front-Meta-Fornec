// Certifique-se de que o DOM esteja completamente carregado
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://brf1-identity.azurewebsites.net";

  // Usuários hardcoded para fins de demonstração
  const usuarios = [
    { nomeUsuario: "lucas", senha: "Senha.123" },
    { nomeUsuario: "ana", senha: "Senha.123" },
  ];

  // Função para fazer login
  async function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Verificando as credenciais do usuário
    const usuario = usuarios.find(
      (u) => u.nomeUsuario === username && u.senha === password
    );

    if (usuario) {
      // Simulando um token JWT para fins de autenticação
      const fakeToken = "simulated-jwt-token";
      localStorage.setItem("jwt_token", fakeToken);
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("uploadForm").style.display = "block";
      alert("Login bem-sucedido");
    } else {
      alert("Falha no login: Usuário ou senha incorretos");
    }
  }

  // Função para registrar usuário
  async function registerUser() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const email = document.getElementById("registerEmail").value;
    try {
      const response = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeUsuario: username,
          senha: password,
          email: email,
        }),
      });

      if (response.ok) {
        alert("Registro bem-sucedido");
      } else {
        alert("Falha no registro");
      }
    } catch (error) {
      alert("Erro ao registrar: " + error.toString());
    }
  }

  // Função para esqueceu a senha
  async function forgotPassword() {
    const username = document.getElementById("forgotUsername").value;
    try {
      const response = await fetch(`${API_URL}/recuperar-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nomeUsuario: username }),
      });

      if (response.ok) {
        alert("Verifique seu e-mail para redefinir sua senha");
      } else {
        alert("Falha ao recuperar senha");
      }
    } catch (error) {
      alert("Erro ao recuperar senha: " + error.toString());
    }
  }

  // Função para reenviar código
  async function resendCode() {
    const username = document.getElementById("resendUsername").value;
    try {
      const response = await fetch(`${API_URL}/reenviar-codigo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nomeUsuario: username }),
      });

      if (response.ok) {
        alert("Código reenviado com sucesso");
      } else {
        alert("Falha ao reenviar código");
      }
    } catch (error) {
      alert("Erro ao reenviar código: " + error.toString());
    }
  }

  // Função para validar código
  async function validateCode() {
    const username = document.getElementById("validateUsername").value;
    const code = document.getElementById("validateCode").value;
    try {
      const response = await fetch(`${API_URL}/validar-codigo-verificacao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeUsuario: username,
          codigoVerificacao: code,
        }),
      });

      if (response.ok) {
        alert("Código validado com sucesso");
      } else {
        alert("Falha ao validar código");
      }
    } catch (error) {
      alert("Erro ao validar código: " + error.toString());
    }
  }

  // Anexar funções aos botões
  document.getElementById("loginButton").addEventListener("click", loginUser);
  document
    .getElementById("registerButton")
    .addEventListener("click", registerUser);
  document
    .getElementById("forgotPasswordButton")
    .addEventListener("click", forgotPassword);
  document
    .getElementById("resendCodeButton")
    .addEventListener("click", resendCode);
  document
    .getElementById("validateCodeButton")
    .addEventListener("click", validateCode);
});
