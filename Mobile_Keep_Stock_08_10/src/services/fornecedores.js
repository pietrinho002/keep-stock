import { criarCrud } from './crudBase';
import { filtrarPorTermo } from './helpers';
import { BUCKET_FORNECEDORES, deletarImagem, uploadImagem } from './imagemStorage';
import { Validator } from './validator';

// ROTAS DE FORNECEDORES
// Espelha /fornecedores e /fornecedor/salvar, /fornecedor/atualizar e /fornecedor/excluir

export const fornecedoresCrud = criarCrud('fornecedores', 'id_fornecedor');

// Normaliza os campos vindos do formulário (espelha get_fornecedor_form)
export function montarFornecedor(dados) {
  return {
    nome: (dados.nome || '').trim(),
    cnpj: (dados.cnpj || '').trim(),
    telefone: (dados.telefone || '').trim(),
    email: (dados.email || '').trim(),
    cep: (dados.cep || '').trim(),
  };
}

// Espelha Fornecedor.validate()
export function validarFornecedor(fornecedor) {
  const erros = [
    Validator.required(fornecedor.nome, 'nome'),
    Validator.required(fornecedor.cnpj, 'cnpj'),
    Validator.required(fornecedor.telefone, 'telefone'),
    Validator.telefone(fornecedor.telefone, 'telefone'),
    Validator.required(fornecedor.email, 'email'),
    Validator.email(fornecedor.email, 'email'),
    Validator.required(fornecedor.cep, 'cep'),
    Validator.cep(fornecedor.cep, 'cep'),
  ];

  return erros.filter(Boolean);
}

export async function listarFornecedores(termo = '') {
  const fornecedores = await fornecedoresCrud.findAll('nome');

  return filtrarPorTermo(fornecedores, termo, [
    'nome',
    'cnpj',
    'telefone',
    'email',
    'cep',
  ]);
}

export async function buscarFornecedor(id) {
  return fornecedoresCrud.findById(id);
}

export async function salvarFornecedor(dados, imagem = null) {
  const fornecedor = montarFornecedor(dados);
  let imagemEnviada = null;

  try {
    imagemEnviada = imagem ? await uploadImagem(imagem, BUCKET_FORNECEDORES) : null;
    fornecedor.imagem_url = imagemEnviada;

    const erros = validarFornecedor(fornecedor);

    if (erros.length) throw new Error(erros.join(' '));

    return await fornecedoresCrud.insert(fornecedor);
  } catch (erro) {
    if (imagemEnviada) await deletarImagem(imagemEnviada, BUCKET_FORNECEDORES);

    throw erro;
  }
}

export async function atualizarFornecedor(id, dados, imagem = null) {
  const fornecedorAtual = await fornecedoresCrud.findById(id);

  if (!fornecedorAtual) throw new Error('Fornecedor não encontrado.');

  const fornecedor = montarFornecedor(dados);
  fornecedor.imagem_url = fornecedorAtual.imagem_url;

  let novaImagem = null;

  try {
    if (imagem) {
      novaImagem = await uploadImagem(imagem, BUCKET_FORNECEDORES);
      fornecedor.imagem_url = novaImagem;
    }

    const erros = validarFornecedor(fornecedor);

    if (erros.length) throw new Error(erros.join(' '));

    const atualizado = await fornecedoresCrud.update(id, fornecedor);

    if (novaImagem && fornecedorAtual.imagem_url) {
      await deletarImagem(fornecedorAtual.imagem_url, BUCKET_FORNECEDORES);
    }

    return atualizado;
  } catch (erro) {
    if (novaImagem) await deletarImagem(novaImagem, BUCKET_FORNECEDORES);

    throw erro;
  }
}

// Verifica se o fornecedor possui registros vinculados (ex.: lotes)
export async function fornecedorPossuiVinculos(id) {
  try {
    const lotes = await criarCrud('lotes').contarPor('id_fornecedor', id);

    return lotes > 0;
  } catch (erro) {
    console.log(`Erro ao verificar registros relacionados: ${erro}`);
    return false;
  }
}

// Espelha Fornecedor.safe_delete()
export async function excluirFornecedor(id) {
  const fornecedor = await fornecedoresCrud.findById(id);

  if (!fornecedor) throw new Error('Fornecedor não encontrado.');

  if (await fornecedorPossuiVinculos(id)) {
    throw new Error(
      'Não é possível excluir o fornecedor porque possui tabelas vinculadas.'
    );
  }

  await fornecedoresCrud.delete(id);

  if (fornecedor.imagem_url) {
    await deletarImagem(fornecedor.imagem_url, BUCKET_FORNECEDORES);
  }
}
