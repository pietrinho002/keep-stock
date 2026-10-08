import { criarCrud } from './crudBase';
import { filtrarPorTermo } from './helpers';
import { BUCKET_CLIENTES, deletarImagem, uploadImagem } from './imagemStorage';
import { Validator } from './validator';

// ROTAS DE CLIENTES
// Espelha /clientes e /cliente/salvar, /cliente/atualizar e /cliente/excluir do sistema web

export const clientesCrud = criarCrud('clientes', 'id_cliente');

// Normaliza os campos vindos do formulário (espelha get_cliente_form)
export function montarCliente(dados) {
  return {
    nome: (dados.nome || '').trim(),
    cpf_cnpj: (dados.cpf_cnpj || '').trim(),
    telefone: (dados.telefone || '').trim(),
    email: (dados.email || '').trim(),
    codigo_postal: (dados.codigo_postal || '').trim(),
  };
}

// Espelha Cliente.validate()
export function validarCliente(cliente) {
  const erros = [
    Validator.required(cliente.nome, 'nome'),
    Validator.required(cliente.cpf_cnpj, 'cpf/cnpj'),
    Validator.required(cliente.telefone, 'telefone'),
    Validator.telefone(cliente.telefone, 'telefone'),
    Validator.required(cliente.email, 'email'),
    Validator.email(cliente.email, 'email'),
    Validator.required(cliente.codigo_postal, 'código postal'),
    Validator.cep(cliente.codigo_postal, 'código postal'),
  ];
  return erros.filter(Boolean);
}

//listagem de cliente
export async function listarClientes(termo = '') {
  const clientes = await clientesCrud.findAll('nome');
  return filtrarPorTermo(clientes, termo, [
    'nome',
    'cpf_cnpj',
    'telefone',
    'email',
    'codigo_postal',
  ]);
}

export async function buscarCliente(id) {
  return clientesCrud.findById(id);
}
//salvar imagem do cliente
export async function salvarCliente(dados, imagem = null) {
  const cliente = montarCliente(dados);
  let imagemEnviada = null;
  try {
    imagemEnviada = imagem ? await uploadImagem(imagem, BUCKET_CLIENTES) : null;
    cliente.imagem_url = imagemEnviada;
    const erros = validarCliente(cliente);
    if (erros.length) throw new Error(erros.join(' '));
    return await clientesCrud.insert(cliente);
  } catch (erro) {
    if (imagemEnviada) await deletarImagem(imagemEnviada, BUCKET_CLIENTES);
    throw erro;
  }
}
//atualiza cliente
export async function atualizarCliente(id, dados, imagem = null) {
  const clienteAtual = await clientesCrud.findById(id);
  if (!clienteAtual) throw new Error('Cliente não encontrado.');
  const cliente = montarCliente(dados);
  cliente.imagem_url = clienteAtual.imagem_url;
  let novaImagem = null;
  try {
    if (imagem) {
      novaImagem = await uploadImagem(imagem, BUCKET_CLIENTES);
      cliente.imagem_url = novaImagem;
    }
    const erros = validarCliente(cliente);
    if (erros.length) throw new Error(erros.join(' '));
    const atualizado = await clientesCrud.update(id, cliente);
    if (novaImagem && clienteAtual.imagem_url) {
      await deletarImagem(clienteAtual.imagem_url, BUCKET_CLIENTES);
    }
    return atualizado;
  } catch (erro) {
    if (novaImagem) await deletarImagem(novaImagem, BUCKET_CLIENTES);
    throw erro;
  }
}

// Verifica se o cliente possui registros relacionados (pedidos, saídas)
export async function clientePossuiVinculos(id) {
  try {
    const pedidos = await criarCrud('pedidos').contarPor('id_cliente', id);
    if (pedidos > 0) return true;
    const saidas = await criarCrud('saidas_produtos').contarPor('id_cliente', id);
    if (saidas > 0) return true;
    return false;
  } catch (erro) {
    console.log(`Erro ao verificar registros relacionados: ${erro}`);
    return false;
  }
}

// Espelha Cliente.safe_delete()
export async function excluirCliente(id) {
  const cliente = await clientesCrud.findById(id);
  if (!cliente) throw new Error('Cliente não encontrado.');
  if (await clientePossuiVinculos(id)) {
    throw new Error(
      'Não é possível excluir o cliente porque possui tabelas vinculadas.'
    );
  }
  await clientesCrud.delete(id);
  if (cliente.imagem_url) await deletarImagem(cliente.imagem_url, BUCKET_CLIENTES);
}
