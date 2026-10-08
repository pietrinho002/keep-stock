import { clientesCrud } from './clientes';
import { criarCrud } from './crudBase';
import { filtrarPorTermo, mapearPorId, toInt } from './helpers';
import { Validator } from './validator';

// ROTAS DE PEDIDOS
// Espelha /pedidos e /pedido/salvar, /pedido/atualizar e /pedido/excluir do sistema web

export const pedidosCrud = criarCrud('pedidos', 'id_pedido');

// Normaliza os campos vindos do formulário (espelha get_pedido_form)
export function montarPedido(dados) {
  return {
    id_cliente: toInt(dados.id_cliente),
    data_pedido: (dados.data_pedido || '').trim(),
    status_pedido: (dados.status_pedido || '').trim(),
    data_prevista: (dados.data_prevista || '').trim(),
  };
}

// Espelha Pedido.validate()
export function validarPedido(pedido) {
  const erros = [
    Validator.required(pedido.id_cliente, 'id_cliente'),
    Validator.required(pedido.data_pedido, 'data_pedido'),
    Validator.required(pedido.status_pedido, 'status_pedido'),
    Validator.required(pedido.data_prevista, 'data_prevista'),
  ];

  return erros.filter(Boolean);
}

// Traz os pedidos já com o nome do cliente, para permitir a pesquisa por ele
export async function listarPedidos(termo = '') {
  const [registros, clientes] = await Promise.all([
    pedidosCrud.findAll(),
    clientesCrud.findAll('nome'),
  ]);

  const clientesMap = mapearPorId(clientes, 'id_cliente');

  const pedidos = registros.map((pedido) => ({
    ...pedido,
    cliente: clientesMap[pedido.id_cliente] || '',
  }));

  return filtrarPorTermo(pedidos, termo, [
    'id_pedido',
    'cliente',
    'status_pedido',
    'data_pedido',
    'data_prevista',
  ]);
}

export async function buscarPedido(id) {
  return pedidosCrud.findById(id);
}

export async function salvarPedido(dados) {
  const pedido = montarPedido(dados);

  return pedidosCrud.insert(pedido);
}

export async function atualizarPedido(id, dados) {
  const pedido = montarPedido(dados);
  const erros = validarPedido(pedido);

  if (erros.length) throw new Error(erros.join(' '));

  if (!(await pedidosCrud.findById(id))) {
    throw new Error('Pedido não encontrado.');
  }

  return pedidosCrud.update(id, pedido);
}

// Espelha Pedido.safe_delete()
export async function excluirPedido(id) {
  if (!(await pedidosCrud.findById(id))) {
    throw new Error('Pedido não encontrado.');
  }

  await pedidosCrud.delete(id);
}
