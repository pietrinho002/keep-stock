import { clientesCrud } from './clientes';
import { STATUS_PEDIDO_FINALIZADO, mapearPorId, toFloat } from './helpers';
import { entradasCrud, saidasCrud } from './movimentacoes';
import { pedidosCrud } from './pedidos';
import { produtosCrud } from './produtos';

// ROTA DO DASHBOARD
// Espelha a rota raiz do sistema web, que junta os dados das demais telas

// Ordena por data da mais recente para a mais antiga
function ordenarPorData(registros, campo) {
  return [...registros].sort((a, b) =>
    String(b[campo] || '').localeCompare(String(a[campo] || ''))
  );
}


//dados que são puxados 
export async function carregarDashboard() {
  const [produtos, pedidos, entradas, saidas, clientes] = await Promise.all([
    produtosCrud.findAll('nome'),
    pedidosCrud.findAll(),
    entradasCrud.findAll(),
    saidasCrud.findAll(),
    clientesCrud.findAll('nome'),
  ]);

  const produtosMap = mapearPorId(produtos, 'id_produto');
  const clientesMap = mapearPorId(clientes, 'id_cliente');

  // Produtos que atingiram ou passaram da quantidade mínima
  //produtos
  const estoqueBaixo = produtos.filter(
    (produto) =>
      (produto.quantidade_atual || 0) <= (produto.quantidade_minima || 0)
  );

  //pedidos
  const pedidosPendentes = pedidos.filter(
    (pedido) =>
      !STATUS_PEDIDO_FINALIZADO.includes(
        (pedido.status_pedido || '').trim().toLowerCase()
      )
  );

  //produto
  const valorEstoque = produtos.reduce(
    (total, produto) =>
      total +
      (produto.quantidade_atual || 0) * toFloat(produto.valor_unitario_venda),
    0
  );

  return {
    totalProdutos: produtos.length,
    totalEstoqueBaixo: estoqueBaixo.length,
    totalPedidosPendentes: pedidosPendentes.length,
    totalMovimentacoes: entradas.length + saidas.length,
    valorEstoque,
    estoqueBaixo: estoqueBaixo.slice(0, 5),
    entradas: ordenarPorData(entradas, 'data_entrada').slice(0, 5),
    saidas: ordenarPorData(saidas, 'data_saida').slice(0, 5),
    produtosMap,
    clientesMap,
  };
}
