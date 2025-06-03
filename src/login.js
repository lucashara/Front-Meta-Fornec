import { Auth } from "aws-amplify";

/* --- Elementos do DOM --- */
const loginForm = document.getElementById("loginForm");
const uploadForm = document.getElementById("uploadForm");
const forgotForm = document.getElementById("forgotForm");

const msgLogin = document.getElementById("msgLogin");
const msgForgot = document.getElementById("msgForgot");

const newPassWrap = document.getElementById("newPassWrapper");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const newPasswordInput = document.getElementById("newPassword");

const forgotUserInput = document.getElementById("forgotUser");
const forgotCodeInput = document.getElementById("forgotCode");
const forgotNewPassInput = document.getElementById("forgotNewPass");

const codeArea = document.getElementById("codeArea");

const loginButton = document.getElementById("loginButton");
const logoutBtn = document.getElementById("logoutBtn");
const forgotStartButton = document.getElementById("forgotStart");
const forgotSubmitButton = document.getElementById("forgotSubmit");

/* --- função de alerta --- */
function alertMsg(el, txt, type = "danger") {
  el.className = `alert alert-${type}`;
  el.style.display = "block";
  el.textContent = txt;
}
function hide(el) {
  el.style.display = "none";
}
function show(el) {
  el.style.display = "block";
}

/* --- se já houver sessão válida e grupo certo, já exibe upload --- */
(async () => {
  try {
    const session = await Auth.currentSession();
    const payload = session.getIdToken().decodePayload();
    const grupos = payload["cognito:groups"] || [];
    if (["Admin", "Comercial"].some((g) => grupos.includes(g))) {
      loginForm.style.display = "none";
      forgotForm.style.display = "none";
      uploadForm.style.display = "block";
    }
  } catch {
    /* sem sessão, fica na tela de login */
  }
})();

/* --- clique em Entrar (com spinner) --- */
loginButton.onclick = async () => {
  hide(msgLogin);

  // desabilita botão e mostra spinner
  loginButton.disabled = true;
  loginButton.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Entrando...
  `;

  try {
    const user = await Auth.signIn(
      usernameInput.value.trim(),
      passwordInput.value
    );

    // se for NEW_PASSWORD_REQUIRED
    if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
      show(newPassWrap);
      if (!newPasswordInput.value) {
        alertMsg(
          msgLogin,
          "Primeiro acesso: informe a nova senha e clique Entrar.",
          "warning"
        );
        loginButton.disabled = false;
        loginButton.innerHTML = "Entrar";
        return;
      }
      await Auth.completeNewPassword(user, newPasswordInput.value);
    }

    // checa grupos
    const session = await Auth.currentSession();
    const payload = session.getIdToken().decodePayload();
    const grupos = payload["cognito:groups"] || [];
    if (["Admin", "Comercial"].some((g) => grupos.includes(g))) {
      loginForm.style.display = "none";
      forgotForm.style.display = "none";
      uploadForm.style.display = "block";
    } else {
      await Auth.signOut();
      window.location.href = "/unauthorized.html";
    }
  } catch (e) {
    const code = e.code || e.name || "";
    let msg = e.message || "Erro desconhecido.";
    if (code === "UserNotFoundException") msg = "Usuário não encontrado.";
    if (code === "NotAuthorizedException") msg = "Usuário ou senha inválidos.";
    if (code === "PasswordResetRequiredException")
      msg = "Senha precisa ser redefinida (use Esqueci a senha).";
    if (code === "UserNotConfirmedException")
      msg = "Conta não confirmada. Verifique seu e-mail.";
    if (code === "LimitExceededException")
      msg = "Muitas tentativas. Tente novamente mais tarde.";
    if (code === "CodeMismatchException") msg = "Código incorreto.";
    if (code === "ExpiredCodeException") msg = "Código expirado.";
    alertMsg(msgLogin, msg);

    loginButton.disabled = false;
    loginButton.innerHTML = "Entrar";
  }
};

/* --- fluxo Esqueci a senha --- */
forgotLink.onclick = () => {
  loginForm.style.display = "none";
  forgotForm.style.display = "block";
};
backToLogin.onclick = () => {
  forgotForm.style.display = "none";
  loginForm.style.display = "block";
  hide(msgForgot);
  hide(msgLogin);
};

forgotStartButton.onclick = async () => {
  hide(msgForgot);
  try {
    await Auth.forgotPassword(forgotUserInput.value.trim());
    show(codeArea);
    alertMsg(msgForgot, "Código enviado para seu e-mail.", "success");
  } catch (e) {
    let msg = e.message || "Erro ao enviar código.";
    alertMsg(msgForgot, msg);
  }
};

forgotSubmitButton.onclick = async () => {
  hide(msgForgot);
  try {
    await Auth.forgotPasswordSubmit(
      forgotUserInput.value.trim(),
      forgotCodeInput.value.trim(),
      forgotNewPassInput.value
    );
    alert("Senha redefinida! Faça login novamente.");
    backToLogin.click();
  } catch (e) {
    let msg = e.message || "Erro ao redefinir senha.";
    alertMsg(msgForgot, msg);
  }
};

/* --- logout --- */
logoutBtn.onclick = async () => {
  await Auth.signOut();
  window.location.reload();
};
