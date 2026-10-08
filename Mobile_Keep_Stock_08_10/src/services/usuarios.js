import bcrypt from 'bcryptjs';

import { criarCrud } from './crudBase';
import { limparSessao, lerSessao, salvarSessao } from './sessao';
import { supabase } from './supabase';
import { Validator } from './validator';

// ROTAS DE USUÁRIOS (LOGIN E CADASTRO)
// Espelha /cadastrar_user, /login, /logout e /usuario/alterar_senha do sistema web
export const usuariosCrud = criarCrud('usuarios', 'id_usuario');

// Mesmo custo do bcrypt usado no sistema web, para os hashes serem compatíveis
const CUSTO_HASH = 12;

export async function cadastrarUsuario(dados) {
  const nome = (dados.nome || '').trim();
  const email = (dados.email || '').trim().toLowerCase();
  const cpf = (dados.cpf || '').replace(/\D/g, '');
  const senha = dados.senha;



  // Validações Básicas de Presença
  //nome
  const erroNome = Validator.required(nome, 'Nome');
  if (erroNome) throw new Error(erroNome);
  if (!Validator.validarNome(nome)) {
    throw new Error('O nome deve ter entre 1 e 120 caracteres.');
  }

  //senha
  if (!senha || senha.length < 6) {
    throw new Error('A senha deve ter no mínimo 6 caracteres.');
  }

  // Validação de E-mail
  const resultadoEmail = await Validator.validarEmail(email);
  if (!resultadoEmail) {
    throw new Error('Falha ao conectar com o validador de e-mail.');
  }
  if (!resultadoEmail.valid_format || !resultadoEmail.valid_mx) {
    throw new Error('E-mail informado é inválido ou não existe.');
  }

  // Validação de CPF
  if (!cpf || cpf.length !== 11) {
    throw new Error('CPF inválido.');
  }
  const resultadoCpf = await Validator.validarCpf(cpf);
  if (!resultadoCpf) {
    throw new Error('Falha técnica ao validar CPF. Tente novamente mais tarde.');
  }
  if (!resultadoCpf.valid) {
    throw new Error('CPF inválido.');
  }






  // Gravação no Supabase
  try {
    const { error: signUpError } = await supabase.auth.signUp({ email, password: senha });
    if (signUpError) {
      throw signUpError;
    }
    await usuariosCrud.insert({
      nome,
      email,
      cpf,
      senha: await bcrypt.hash(senha, CUSTO_HASH),
    });
    try {
      await supabase.auth.signInWithPassword({ email, password: senha });
    } catch (erroAuth) {
      console.log('Aviso: cadastro concluído, mas não foi possível entrar automaticamente:', erroAuth.message || erroAuth);
    }
    return { mensagem: 'Cadastro realizado com sucesso!' };
  } catch (erro) {
    console.log(`Erro no Supabase: ${erro}`);
    throw new Error(
      'Erro ao salvar no banco de dados. Verifique se o CPF ou E-mail já existem.'
    );
  }
}

export async function login(email, senha) {
  const emailLogin = (email || '').trim().toLowerCase();
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', emailLogin);
  if (error) throw error;


  // Verifica se o usuário existe mesmo
  if (!data || !data.length) {
    throw new Error('E-mail não cadastrado.');
  }

  const usuario = data[0];
  // Verifica se a senha coincide
  if (!(await bcrypt.compare(senha, usuario.senha || ''))) {
    throw new Error('Senha incorreta.');
  }





  // Guarda os dados do usuário logado
  const logado = {
    id: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
  };

  salvarSessao(logado);

  // Autentica no Auth do Supabase de forma assíncrona (não bloqueia o retorno)
  supabase.auth.signInWithPassword({
    email: emailLogin,
    password: senha,
  }).catch(erroAuth => {
    console.log(`Aviso: falha ao autenticar no Supabase Auth: ${erroAuth.message}`);
  });
  return logado;
}





//Método de logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(`Aviso: falha ao encerrar sessão no Supabase Auth: ${error.message}`);
  }
  limparSessao();
}

// Usada pelas telas para saber quem está logado e preencher o id_usuario dos registros
export async function usuarioLogado() {
  return lerSessao();
}





//validação de nova senha
export async function alterarSenha(idUsuario, senhaAtual, novaSenha, confirmarSenha) {
  if (!senhaAtual || !novaSenha) {
    throw new Error('Preencha a senha atual e a nova senha.');
  }
  if (novaSenha !== confirmarSenha) {
    throw new Error('A nova senha e a confirmação não coincidem.');
  }
  if (novaSenha.length < 6) {
    throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
  }
  const usuario = await usuariosCrud.findById(idUsuario);
  if (!usuario) {
    throw new Error('Usuário não encontrado.');
  }
  if (!(await bcrypt.compare(senhaAtual, usuario.senha || ''))) {
    throw new Error('Senha atual incorreta.');
  }
  if (await bcrypt.compare(novaSenha, usuario.senha || '')) {
    throw new Error('A nova senha deve ser diferente da atual.');
  }
  await usuariosCrud.update(idUsuario, {
    senha: await bcrypt.hash(novaSenha, CUSTO_HASH),
  });


  // Mantém a senha do Supabase Auth sincronizada com a do banco
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) {
    console.log(`Aviso: falha ao atualizar senha no Supabase Auth: ${error.message}`);
  }
  return { mensagem: 'Senha alterada com sucesso.' };
}
