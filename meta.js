// Função para realizar o upload do arquivo
async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const messageElement = document.getElementById('uploadMessage'); // Elemento para mostrar mensagens ao usuário

  // Limpa mensagens anteriores
  messageElement.textContent = '';

  // Verifica se um arquivo foi selecionado
  if (!file) {
    messageElement.textContent = 'Por favor, selecione um arquivo para upload.';
    return;
  }

  // Verifica o tipo do arquivo
  if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    messageElement.textContent = 'Por favor, envie apenas arquivos .xlsx';
    return;
  }

  // Se tudo estiver ok, prossegue com o upload
  const formData = new FormData();
  formData.append('arquivo', file);

  // Recupera o token JWT do armazenamento local
  const token = localStorage.getItem('jwt_token');

  try {
    // Realiza o upload do arquivo
    const response = await fetch('https://bi.grupobrf1.com:4443/atualizar_meta_fornec_rca/', {
      method: 'POST',
      headers: { 'token': token },
      body: formData
    });

    // Captura a resposta da API
    const responseData = await response.json();

    // Verifica se o upload foi bem-sucedido
    if (response.ok) {
      messageElement.textContent = 'Arquivo enviado com sucesso. Resposta da API: ' + JSON.stringify(responseData);
    } else {
      messageElement.textContent = 'Falha no upload do arquivo. Resposta da API: ' + JSON.stringify(responseData);
    }
  } catch (error) {
    messageElement.textContent = 'Erro ao fazer upload: ' + error.toString();
  }
}

// Adiciona um event listener ao botão de upload
document.getElementById('uploadButton').addEventListener('click', uploadFile);
