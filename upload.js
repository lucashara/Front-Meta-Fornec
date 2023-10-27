async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Por favor, selecione um arquivo para upload.');
    return;
  }

  const formData = new FormData();
  formData.append('arquivo', file);

  const token = localStorage.getItem('jwt_token');

  try {
    const response = await fetch('https://bi.grupobrf1.com:4443/atualizar_meta_fornec_rca/', { // <-- Esta URL parece ser fixa
      method: 'POST',
      headers: {
        'token': token,
      },
      body: formData,
    });

    if (response.ok) {
      alert('Arquivo enviado com sucesso.');
    } else {
      alert('Falha no upload do arquivo.');
    }
  } catch (error) {
    alert('Erro ao fazer upload: ' + error.toString());
  }
}

document.getElementById('uploadButton').addEventListener('click', uploadFile);
