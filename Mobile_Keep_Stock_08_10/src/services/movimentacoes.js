import { clientesCrud } from './clientes';
import { criarCrud } from './crudBase';
import { filtrarPorTermo, mapearPorId, toInt } from './helpers';
import { ajustarEstoqueProduto, produtosCrud } from './produtos';
import { Validator } from './validator';

// ROTAS DE MOVIMENTAÇÕES, ENTRADAS E SAÍDAS
// Espelha /movimentacoes e as rotas /entrada/*, /saida/* e /movimentacao/* do sistema web

export const entradasCrud = criarCrud('entradas_produtos', 'id_entrada');
export const saidasCrud = criarCrud('saidas_produtos', 'id_saida');
export const movimentacoesCrud = criarCrud(
  'movimentacoes_estoque',
  'id_movimentacoes_estoque'
);

// Normaliza os campos vindos do formulário (espelha get_entrada_form)
export function montarEntrada(dados) {
  return {
    id_produto: toInt(dados.id_produto, null),
    quantidade: toInt(dados.quantidade),
    data_entrada: (dados.data_entrada || '').trim() || new Date().toISOString(),
    id_usuario: toInt(dados.id_usuario, null),
  };
}

// Normaliza os campos vindos do formulário (espelha get_saida_form)
export function montarSaida(dados) {
  return {
    id_produto: toInt(dados.id_produto, null),
    quantidade: toInt(dados.quantidade),
    tipo_saida: (dados.tipo_saida || '').trim(),
    id_cliente: toInt(dados.id_cliente, null),
    data_saida: (dados.data_saida || '').trim() || new Date().toISOString(),
    id_usuario: toInt(dados.id_usuario, null),
  };
}

// Normaliza os campos vindos do formulário (espelha get_movimentacao_form)
export function montarMovimentacao(dados) {
  return {
    id_lote: toInt(dados.id_lote, null),
    id_usuario: toInt(dados.id_usuario, null),
    tipo_movimentacao: (dados.tipo_movimentacao || '').trim(),
    quantidade: toInt(dados.quantidade),
    data_hora: (dados.data_hora || '').trim() || new Date().toISOString(),
  };
}

// Espelha Entradas_produtos.validate() e Saidas_produtos.validate()
function validarMovimento(registro) {
  const erros = [
    Validator.required(registro.id_produto, 'produto'),
    Validator.positive(registro.quantidade, 'quantidade'),
  ];

  return erros.filter(Boolean);
}

export const validarEntrada = validarMovimento;
export const validarSaida = validarMovimento;

// Espelha Movimentacoes_estoque.validate()
export function validarMovimentacao(movimentacao) {
  const erros = [
    Validator.required(movimentacao.id_lote, 'id_lote'),
    Validator.required(movimentacao.id_usuario, 'id_usuario'),
    Validator.required(movimentacao.tipo_movimentacao, 'tipo_movimentacao'),
    Validator.required(movimentacao.quantidade, 'quantidade'),
    Validator.required(movimentacao.data_hora, 'data_hora'),
  ];

  return erros.filter(Boolean);
}

// Espelha a rota /movimentacoes: entradas e saídas já com o nome do produto e do cliente
export async function listarMovimentacoes(termo = '') {
  const [registrosEntradas, registrosSaidas, produtos, clientes] = await Promise.all([
    entradasCrud.findAll(),
    saidasCrud.findAll(),
    produtosCrud.findAll('nome'),
    clientesCrud.findAll('nome'),
  ]);

  const produtosMap = mapearPorId(produtos, 'id_produto');
  const clientesMap = mapearPorId(clientes, 'id_cliente');

  const entradas = registrosEntradas.map((entrada) => ({
    ...entrada,
    produto: produtosMap[entrada.id_produto] || '',
  }));

  const saidas = registrosSaidas.map((saida) => ({
    ...saida,
    produto: produtosMap[saida.id_produto] || '',
    cliente: clientesMap[saida.id_cliente] || '',
  }));

  return {
    entradas: filtrarPorTermo(entradas, termo, ['produto', 'data_entrada']),
    saidas: filtrarPorTermo(saidas, termo, [
      'produto',
      'cliente',
      'tipo_saida',
      'data_saida',
    ]),
    produtos,
    clientes,
    produtosMap,
    clientesMap,
  };
}

// Entradas de produtos

export async function salvarEntrada(dados) {
  const entrada = montarEntrada(dados);
  const erros = validarEntrada(entrada);

  if (erros.length) throw new Error(erros.join(' '));

  await entradasCrud.insert(entrada);
  await ajustarEstoqueProduto(entrada.id_produto, entrada.quantidade);
}

export async function atualizarEntrada(id, dados) {
  const entrada = montarEntrada(dados);
  const erros = validarEntrada(entrada);

  if (erros.length) throw new Error(erros.join(' '));

  const antiga = await entradasCrud.findById(id);

  if (!antiga) throw new Error('Entrada não encontrada.');

  // Reverte o efeito da entrada antiga e aplica o da nova
  await ajustarEstoqueProduto(antiga.id_produto, -(antiga.quantidade || 0));
  await entradasCrud.update(id, entrada);
  await ajustarEstoqueProduto(entrada.id_produto, entrada.quantidade);
}

export async function excluirEntrada(id) {
  const antiga = await entradasCrud.findById(id);

  if (!antiga) throw new Error('Entrada não encontrada.');

  await entradasCrud.delete(id);

  // Excluir uma entrada desfaz o que ela somou ao estoque
  await ajustarEstoqueProduto(antiga.id_produto, -(antiga.quantidade || 0));
}

// Saídas de produtos

export async function salvarSaida(dados) {
  const saida = montarSaida(dados);
  const erros = validarSaida(saida);

  if (erros.length) throw new Error(erros.join(' '));

  // Bloqueia a saída se não houver estoque suficiente
  const produto = await produtosCrud.findById(saida.id_produto);
  const estoque = produto ? produto.quantidade_atual || 0 : 0;

  if (saida.quantidade > estoque) {
    throw new Error(`Estoque insuficiente para a saída. Disponível: ${estoque}.`);
  }

  await saidasCrud.insert(saida);
  await ajustarEstoqueProduto(saida.id_produto, -saida.quantidade);
}

export async function atualizarSaida(id, dados) {
  const saida = montarSaida(dados);
  const erros = validarSaida(saida);

  if (erros.length) throw new Error(erros.join(' '));

  const antiga = await saidasCrud.findById(id);

  if (!antiga) throw new Error('Saída não encontrada.');

  // Estoque disponível considerando o retorno da saída antiga e a aplicação da nova
  const produto = await produtosCrud.findById(saida.id_produto);
  let estoque = produto ? produto.quantidade_atual || 0 : 0;

  if (antiga.id_produto === saida.id_produto) {
    estoque += antiga.quantidade || 0;
  }

  if (saida.quantidade > estoque) {
    throw new Error(`Estoque insuficiente para a saída. Disponível: ${estoque}.`);
  }

  await ajustarEstoqueProduto(antiga.id_produto, antiga.quantidade || 0);
  await saidasCrud.update(id, saida);
  await ajustarEstoqueProduto(saida.id_produto, -saida.quantidade);
}

export async function excluirSaida(id) {
  const antiga = await saidasCrud.findById(id);

  if (!antiga) throw new Error('Saída não encontrada.');

  await saidasCrud.delete(id);

  // Excluir uma saída retorna o valor da saída ao estoque
  await ajustarEstoqueProduto(antiga.id_produto, antiga.quantidade || 0);
}

// Movimentações de estoque

export async function salvarMovimentacao(dados) {
  const movimentacao = montarMovimentacao(dados);

  return movimentacoesCrud.insert(movimentacao);
}

export async function atualizarMovimentacao(id, dados) {
  const movimentacao = montarMovimentacao(dados);
  const erros = validarMovimentacao(movimentacao);

  if (erros.length) throw new Error(erros.join(' '));

  if (!(await movimentacoesCrud.findById(id))) {
    throw new Error('Movimentação não encontrada.');
  }

  return movimentacoesCrud.update(id, movimentacao);
}

// Espelha Movimentacoes_estoque.safe_delete()
export async function excluirMovimentacao(id) {
  if (!(await movimentacoesCrud.findById(id))) {
    throw new Error('Movimentação de estoque não encontrada.');
  }

  await movimentacoesCrud.delete(id);
}
