// Funções auxiliares das rotas (espelham as do app.py do sistema web)

// Status que indicam um pedido já finalizado
export const STATUS_PEDIDO_FINALIZADO = [
  'concluido',
  'concluído',
  'entregue',
  'finalizado',
  'cancelado',
];

// Filtra os registros da tela pelo termo digitado na barra de pesquisa
export function filtrarPorTermo(registros, termo, campos) {
  if (!termo) return registros;

  const busca = termo.toLowerCase();

  return registros.filter((registro) =>
    campos.some((campo) =>
      String(registro[campo] ?? '')
        .toLowerCase()
        .includes(busca)
    )
  );
}

export function toInt(valor, padrao = 0) {
  const numero = parseInt(valor, 10);

  return Number.isNaN(numero) ? padrao : numero;
}

export function toFloat(valor, padrao = 0.0) {
  const numero = parseFloat(valor);

  return Number.isNaN(numero) ? padrao : numero;
}

// Monta o mapa id -> nome usado para exibir produtos e clientes nas listagens
export function mapearPorId(registros, chave, campo = 'nome') {
  return registros.reduce((mapa, registro) => {
    mapa[registro[chave]] = registro[campo];
    return mapa;
  }, {});
}
