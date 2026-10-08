import AsyncStorage from '@react-native-async-storage/async-storage';

// Sessão do usuário logado, em memória (equivale ao session do Flask no sistema web)
// Não usa armazenamento nativo: o app sempre entra pela tela de Login

const CHAVE_CREDENCIAIS_LEMBRADAS = 'keepstock:credenciaisLembradas'; //usada para identificar esses dados no armazenamento interno do celular.
let usuarioAtual = null;
export function salvarSessao(usuario) {
  usuarioAtual = usuario;
}
export function lerSessao() {
  return usuarioAtual;
}
export function limparSessao() {
  usuarioAtual = null;
}




//remove espaços em branco nas pontas e salva credenças
export async function salvarCredenciaisLembradas(email, senha) {  
  try {
    const valor = JSON.stringify({ email: (email || '').trim(), senha: senha || '' });
    await AsyncStorage.setItem(CHAVE_CREDENCIAIS_LEMBRADAS, valor);
  } catch (erro) {
    console.log('Erro ao salvar credenciais lembradas:', erro);
  }
}




//Busca os dados salvos no dispositivo
export async function lerCredenciaisLembradas() {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_CREDENCIAIS_LEMBRADAS);
    if (!valor) {
      return null;
    }
    return JSON.parse(valor);
  } catch (erro) {
    console.log('Erro ao ler credenciais lembradas:', erro);
    return null;
  }
}



//Deleta o registro do dispositivo quando o usuário desmarca a opção de lembrar ou altera senha
export async function limparCredenciaisLembradas() {
  try {
    await AsyncStorage.removeItem(CHAVE_CREDENCIAIS_LEMBRADAS);
  } catch (erro) {
    console.log('Erro ao limpar credenciais lembradas:', erro);
  }
}
