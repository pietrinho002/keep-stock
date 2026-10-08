import { criarCrud } from './crudBase';
import { filtrarPorTermo, toFloat, toInt } from './helpers';
import { deletarImagem, uploadImagem } from './imagemStorage';
import { Validator } from './validator';

// ROTAS DE PRODUTOS
// Espelha /produtos e /produto/salvar, /produto/atualizar e /produto/excluir do sistema web

export const produtosCrud = criarCrud('produtos', 'id_produto');

// Tabelas que apontam para produtos e impedem a exclusão
const TABELAS_VINCULADAS = [
  'entradas_produtos',
  'saidas_produtos',
  'lotes',
  'pedido_itens',
];

// Normaliza os campos vindos do formulário (espelha get_produto_form)
export function montarProduto(dados) {
  return {
    nome: (dados.nome || '').trim(),
    fornecedor: (dados.fornecedor || '').trim(),
    categoria: (dados.categoria || '').trim(),
    unidade_medida: (dados.unidade_medida || '').trim(),
    descricao: (dados.descricao || '').trim(),
    valor_unitario_venda: toFloat(dados.valor_unitario_venda),
    valor_unitario_custo: toFloat(dados.valor_unitario_custo),
    quantidade_atual: toInt(dados.quantidade_atual),
    quantidade_minima: toInt(dados.quantidade_minima),
    controlado: dados.controlado,
  };
}

// validações gerais de produto
export function validarProduto(produto) {
  const erros = [
    Validator.required(produto.nome, 'nome'),
    Validator.required(produto.categoria, 'categoria'),
    Validator.required(produto.unidade_medida, 'unidade de medida'),
    Validator.required(produto.descricao, 'descrição'),
    Validator.required(produto.fornecedor, 'fornecedor'),
    Validator.nonNegative(produto.valor_unitario_venda, 'valor_unitario_venda'),
    Validator.nonNegative(produto.valor_unitario_custo, 'valor_unitario_custo'),
    Validator.nonNegative(produto.quantidade_atual, 'quantidade_atual'),
    Validator.nonNegative(produto.quantidade_minima, 'quantidade_minima'),
    Validator.required(produto.controlado, 'controlado'),
  ];

  return erros.filter(Boolean);
}

export async function listarProdutos(termo = '') {
  const produtos = await produtosCrud.findAll('nome');

  return filtrarPorTermo(produtos, termo, [
    'nome',
    'categoria',
    'fornecedor',
    'descricao',
    'unidade_medida',
  ]);
}

export async function buscarProduto(id) {
  return produtosCrud.findById(id);
}

// Busca pelo conteúdo lido do QR Code: o id do produto ou o nome cadastrado
export async function buscarProdutoPorCodigo(codigo) {
  const termo = String(codigo || '').trim();
  if (!termo) return null;
  if (/^\d+$/.test(termo)) {
    const porId = await produtosCrud.findById(Number(termo));
    if (porId) return porId;
  }
  const produtos = await produtosCrud.findAll('nome');
  return (
    produtos.find(
      (produto) => (produto.nome || '').toLowerCase() === termo.toLowerCase()
    ) || null
  );
}

export async function salvarProduto(dados, imagem = null) {
  const produto = montarProduto(dados);
  let imagemEnviada = null;
  try {
    imagemEnviada = imagem ? await uploadImagem(imagem) : null;
    produto.imagem_url = imagemEnviada;
    const erros = validarProduto(produto);
    if (erros.length) throw new Error(erros.join(' '));
    return await produtosCrud.insert(produto);
  } catch (erro) {
    // Não deixa imagem órfã no Storage quando o cadastro falha
    if (imagemEnviada) await deletarImagem(imagemEnviada);
    throw erro;
  }
}

export async function atualizarProduto(id, dados, imagem = null) {
  const produtoAtual = await produtosCrud.findById(id);
  if (!produtoAtual) throw new Error('Produto não encontrado.');
  const produto = montarProduto(dados);
  produto.imagem_url = produtoAtual.imagem_url;
  let novaImagem = null;
  try {
    if (imagem) {
      novaImagem = await uploadImagem(imagem);
      produto.imagem_url = novaImagem;
    }
    const erros = validarProduto(produto);
    if (erros.length) throw new Error(erros.join(' '));
    const atualizado = await produtosCrud.update(id, produto);
    // A imagem antiga só sai depois que a atualização deu certo
    if (novaImagem && produtoAtual.imagem_url) {
      await deletarImagem(produtoAtual.imagem_url);
    }
    return atualizado;
  } catch (erro) {
    if (novaImagem) await deletarImagem(novaImagem);

    throw erro;
  }
}

// Verifica se o produto possui registros relacionados em outras tabelas
export async function produtoPossuiVinculos(id) {
  try {
    for (const tabela of TABELAS_VINCULADAS) {
      const vinculados = await criarCrud(tabela).contarPor('id_produto', id);

      if (vinculados > 0) return true;
    }
    return false;
  } catch (erro) {
    console.log(`Erro ao verificar registros relacionados: ${erro}`);
    return false;
  }
}

// Espelha Produto.safe_delete()
export async function excluirProduto(id) {
  const produto = await produtosCrud.findById(id);
  if (!produto) throw new Error('Produto não encontrado.');
  if (await produtoPossuiVinculos(id)) {
    throw new Error(
      'Não é possível excluir o produto porque possui tabelas vinculadas.'
    );
  }
  await produtosCrud.delete(id);
  if (produto.imagem_url) await deletarImagem(produto.imagem_url);
}

// Soma o valor a quantidade_atual do produto (espelha ajustar_estoque_produto)
export async function ajustarEstoqueProduto(idProduto, delta) {
  if (!idProduto || !delta) return;
  const produto = await produtosCrud.findById(idProduto);
  if (!produto) return;
  const atual = produto.quantidade_atual || 0;
  await produtosCrud.update(idProduto, { quantidade_atual: atual + delta });
}