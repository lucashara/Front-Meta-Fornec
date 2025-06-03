import { Auth } from "aws-amplify";

/* --- Upload apenas para Admin/Comercial --- */
const uploadButton = document.getElementById("uploadButton");

uploadButton.onclick = async () => {
  try {
    const session = await Auth.currentSession();
    const payload = session.getIdToken().decodePayload();
    const grupos = payload["cognito:groups"] || [];
    if (!["Admin", "Comercial"].some((g) => grupos.includes(g))) {
      window.location.href = "/unauthorized.html";
      return;
    }
  } catch {
    window.location.href = "/index.html";
    return;
  }

  const f = document.getElementById("fileInput").files[0];
  const msg = document.getElementById("uploadMessage");
  msg.textContent = "";
  msg.className = "";

  if (!f) return (msg.textContent = "Selecione um arquivo .xlsx.");
  if (
    f.type !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return (msg.textContent = "Envie apenas arquivos .xlsx.");

  try {
    const session = await Auth.currentSession();
    const idTok = session.getIdToken().getJwtToken();
    const fd = new FormData();
    fd.append("arquivo", f);

    const r = await fetch("https://sga.grupobrf1.com:10101/meta/fornec_rca", {
      method: "POST",
      headers: { Authorization: `Bearer ${idTok}` },
      body: fd,
    });
    const js = await r.json();
    if (r.ok) {
      msg.className = "text-success-custom";
      msg.textContent = "Sucesso ✅ " + JSON.stringify(js);
    } else {
      msg.className = "text-error-custom";
      msg.textContent = "Falha ❌ " + JSON.stringify(js);
    }
  } catch (e) {
    msg.className = "text-error-custom";
    msg.textContent = "Erro: " + e.toString();
  }
};
