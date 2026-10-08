import { File } from 'expo-file-system';

import { supabase } from './supabase';

// Upload e remoção de imagens no Storage (espelha services/imagem_storage.py do sistema web)

export const BUCKET = 'Produtos';
export const BUCKET_CLIENTES = 'Clientes';
export const BUCKET_FORNECEDORES = 'Fornecedores';

const TIPOS_PERMITIDOS = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

// Nome único do arquivo, no lugar do uuid4 usado no sistema web
function gerarNomeArquivo(extensao) {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  const identificador = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  return `${identificador}${extensao}`;
}

function extrairExtensao(uri) {
  const caminho = uri.split('?')[0];
  const posicao = caminho.lastIndexOf('.');

  return posicao === -1 ? '' : caminho.slice(posicao).toLowerCase();
}

// Recebe a imagem no formato devolvido pelo seletor de imagens: { uri }
export async function uploadImagem(arquivo, bucket = BUCKET) {
  if (!arquivo || !arquivo.uri) return null;

  const extensao = extrairExtensao(arquivo.uri);
  const contentType = TIPOS_PERMITIDOS[extensao];

  // Formatos permitidos
  if (!contentType) {
    throw new Error('Formato de imagem não permitido. Use JPEG, PNG ou WEBP.');
  }

  const caminho = gerarNomeArquivo(extensao);
  const arquivoBytes = await new File(arquivo.uri).bytes();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(caminho, arquivoBytes, { contentType });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(caminho);

  return data.publicUrl;
}

export async function deletarImagem(url, bucket = BUCKET) {
  if (!url) return;

  try {
    const prefixo = `/storage/v1/object/public/${bucket}/`;

    if (!url.includes(prefixo)) {
      console.log('URL de imagem inválida:', url);
      return;
    }

    const caminho = url.split(prefixo)[1];

    await supabase.storage.from(bucket).remove([caminho]);
  } catch (erro) {
    console.log(`Erro ao deletar imagem: ${erro}`);
  }
}
