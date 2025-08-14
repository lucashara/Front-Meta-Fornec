// src/meta.js
// -----------------------------------------------------------------------------
// Tela de upload de metas:
// - Exige grupo Admin ou Comercial (via Cognito).
// - Usa spinner Bootstrap enquanto envia (botão desabilitado).
// - Mostra resumo e detalhes (inclusão/alteração/sem alteração/falha).
// - Filtros por ação e busca rápida.
// - Link direto p/ baixar modelo da planilha (servido de /assets/...).
// -----------------------------------------------------------------------------

import { Auth } from "aws-amplify";

// Elementos de UI
const uploadButton = document.getElementById("uploadButton");
const btnText = uploadButton.querySelector(".btn-text");
const btnSpin = uploadButton.querySelector(".spinner-border");
const previewCheck = document.getElementById("previewCheck");

const msg = document.getElementById("uploadMessage");
const summary = document.getElementById("resultSummary");
const details = document.getElementById("resultDetails");
const tbody = document.getElementById("resultTableBody");
const filters = document.getElementById("filters");
const actionFilter = document.getElementById("actionFilter");
const searchBox = document.getElementById("searchBox");
const apiVersionBadge = document.getElementById("apiVersion");
const fileInput = document.getElementById("fileInput");

let lastPayload = []; // guarda detalhes do último processamento

// Util: liga/desliga estado de carregamento (spinner + desabilitar inputs)
function setLoading(loading) {
  uploadButton.disabled = loading;
  fileInput.disabled = loading;
  previewCheck.disabled = loading;
  if (loading) {
    btnSpin.classList.remove("d-none");
    btnText.textContent = "Enviando…";
  } else {
    btnSpin.classList.add("d-none");
    btnText.textContent = "Enviar";
  }
}

// Badge de ação
function badgeClass(acao) {
  switch (acao) {
    case "inclusao":
      return "text-bg-success";
    case "alteracao":
      return "text-bg-warning";
    case "sem_alteracao":
      return "text-bg-secondary";
    case "falha":
      return "text-bg-danger";
    default:
      return "text-bg-light";
  }
}

// Escape simples para exibir erros com segurança
function escapeHtml(str) {
  return (str || "").replace(
    /[&<>"']/g,
    (s) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[s])
  );
}

// Tabela de resumo por mês (MM/AAAA)
function renderResumoMes(agg) {
  if (!agg || typeof agg !== "object" || Object.keys(agg).length === 0)
    return "";
  const linhas = Object.entries(agg)
    .map(([mes, obj]) => {
      const inc = obj["inclusao"] || 0;
      const alt = obj["alteracao"] || 0;
      const sem = obj["sem_alteracao"] || 0;
      const fal = obj["falha"] || 0;
      return `<tr><td>${mes}</td><td>${inc}</td><td>${alt}</td><td>${sem}</td><td>${fal}</td></tr>`;
    })
    .join("");
  return `
    <div class="mt-2">
      <div class="fw-semibold mb-1">Resumo por mês (MM/AAAA)</div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered mb-0">
          <thead><tr><th>Mês</th><th>Inclusões</th><th>Alterações</th><th>Sem alteração</th><th>Falhas</th></tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </div>
  `;
}

// Card de resumo principal
function renderSummary(js) {
  const ok =
    js &&
    (js.status === "concluida" || js.status === "concluida_com_ressalvas");
  const cls = ok ? "alert alert-success" : "alert alert-danger";
  const sim = js?.simulacao
    ? `<span class="badge text-bg-info ms-1">Simulação</span>`
    : "";
  const ver = js?.versao_api
    ? `<span class="badge text-bg-light ms-1">API ${js.versao_api}</span>`
    : "";
  if (js?.versao_api) apiVersionBadge.textContent = `API ${js.versao_api}`;

  summary.innerHTML = `
    <div class="${cls}" role="alert">
      <div class="d-flex align-items-center justify-content-between">
        <strong>${js?.mensagem || "Retorno do servidor"}</strong>
        <div class="d-flex align-items-center">${sim}${ver}</div>
      </div>
      <div class="small mt-2">
        Total: <b>${js?.linhas_total ?? 0}</b> ·
        Inclusões: <b>${js?.inseridos ?? 0}</b> ·
        Alterações: <b>${js?.atualizados ?? 0}</b> ·
        Sem alteração: <b>${js?.inalterados ?? 0}</b> ·
        Falhas: <b>${js?.falhas ?? 0}</b> ·
        Duplicadas descartadas: <b>${js?.duplicadas_descartadas ?? 0}</b>
      </div>
      ${renderResumoMes(js?.resumo_por_mes)}
    </div>
  `;
}

// Tabela de detalhes + filtros
function renderDetails(js) {
  const det = js?.detalhes || [];
  lastPayload = det;
  applyFiltersAndRender();
  const hasRows = det.length > 0;
  details.style.display = hasRows ? "block" : "none";
  filters.style.display = hasRows ? "flex" : "none";
}

// Aplica filtro de ação e busca
function applyFiltersAndRender() {
  const det = lastPayload || [];
  const act = actionFilter.value;
  const q = (searchBox.value || "").trim().toLowerCase();

  const filtered = det.filter((d) => {
    let ok = true;
    if (act) ok = ok && d.acao === act;
    if (q) {
      const blob = JSON.stringify(d?.chave || {}).toLowerCase();
      ok = ok && blob.includes(q);
    }
    return ok;
  });

  tbody.innerHTML = "";
  filtered.forEach((d, i) => {
    const chave = d.chave
      ? `Código ${d.chave.codigo} · Filial ${d.chave.codfilial} · Usuário ${d.chave.codusur} · Data ${d.chave.data}`
      : "-";

    let alt = "-";
    if (
      d.alteracoes &&
      Array.isArray(d.alteracoes) &&
      d.alteracoes.length > 0
    ) {
      alt = d.alteracoes
        .map((x) => `${x.campo}: ${x.de} → ${x.para}`)
        .join("<br>");
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><span class="badge ${badgeClass(
        d.acao
      )} text-uppercase">${d.acao.replace("_", " ")}</span></td>
      <td>${chave}</td>
      <td>${alt}</td>
      <td>${d.erro ? `<code>${escapeHtml(d.erro)}</code>` : "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Eventos de filtro/busca
actionFilter.addEventListener("change", applyFiltersAndRender);
searchBox.addEventListener("input", applyFiltersAndRender);

// Clique em "Enviar"
uploadButton.onclick = async () => {
  // Gate por grupo
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

  // Reset de UI
  msg.className = "";
  msg.textContent = "";
  summary.innerHTML = "";
  details.style.display = "none";
  filters.style.display = "none";
  tbody.innerHTML = "";

  const f = document.getElementById("fileInput").files[0];
  if (!f) {
    msg.className = "text-error-custom";
    msg.textContent = "Selecione um arquivo .xlsx.";
    return;
  }
  if (
    f.type !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    msg.className = "text-error-custom";
    msg.textContent = "Envie apenas arquivos .xlsx.";
    return;
  }

  try {
    setLoading(true); // desabilita botão e mostra spinner
    const session = await Auth.currentSession();
    const idTok = session.getIdToken().getJwtToken();
    const fd = new FormData();
    fd.append("arquivo", f);

    const sim = document.getElementById("previewCheck").checked;
    const url = `https://sga.grupobrf1.com:10101/meta/fornec_rca${
      sim ? "?preview=1" : ""
    }`;

    msg.className = "text-muted";
    msg.textContent = sim
      ? "Enviando e processando (SIMULAÇÃO)..."
      : "Enviando e processando...";

    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${idTok}` },
      body: fd,
    });

    const js = await r.json();
    const ok = r.ok;

    msg.className = ok ? "text-success-custom" : "text-error-custom";
    msg.textContent = ok
      ? "Processamento concluído ✅"
      : js?.mensagem || "Falha no processamento ❌";

    renderSummary(js);
    renderDetails(js);
  } catch (e) {
    msg.className = "text-error-custom";
    msg.textContent = "Erro: " + e.toString();
  } finally {
    setLoading(false); // reabilita botão e oculta spinner
  }
};
