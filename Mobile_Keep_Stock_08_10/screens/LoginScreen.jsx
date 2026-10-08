import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';




//importações de validações e da função de "lembre-se de mim"
import { login } from '../src/services/usuarios';
import {
  lerCredenciaisLembradas,
  limparCredenciaisLembradas,
  salvarCredenciaisLembradas,
} from '../src/services/sessao';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const timeoutRef = useRef(null);
  const loginTimeoutRef = useRef(null);



  // Carrega as credenciais salvas ao iniciar o componente
  useEffect(() => {
    async function carregarCredenciaisSalvas() {
      try {
        const credenciais = await lerCredenciaisLembradas();

        // vai atras de dados usados da ultima vez (email, senha) e preenche campos novamente
        if (credenciais) {
          setEmail(credenciais.email || '');
          setPassword(credenciais.senha || '');
          setLembrar(true);
        }
      } catch (erro) {
        console.log('Erro ao carregar credenciais:', erro);
      }
    }

    // avança com um delay de 0,3 segundos para evitar problemas de renderização inicial
    timeoutRef.current = setTimeout(carregarCredenciaisSalvas, 300); 

    return () => clearTimeout(timeoutRef.current);
  }, []);



  // Se estiver ativo, grava e-mail e senha no dispositivo usado
  const salvarEstadoLembrar = useCallback(async () => {
    try {
      if (lembrar) {
        await salvarCredenciaisLembradas(email, password);
        return;
      }
      await limparCredenciaisLembradas();
    } catch (erro) {
      console.log('Erro ao ativar lembrar credenciais:', erro);
    }
  }, [lembrar, email, password]);



  // Verifica se o usuário existe no banco de dados
  const fazerlogin = useCallback(async (emailParam, passwordParam) => {

    // Previne multiplos 'clicks
    if (carregando) return;

    if (!emailParam || !passwordParam) {
      setMensagem('Preencha e-mail e senha');
      setSucesso(false);
      return;
    }

    // Limpa timeout anterior se existir
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
    }

    setCarregando(true);

    try {
      const usuario = await login(emailParam, passwordParam);
      salvarEstadoLembrar();
      setMensagem(`Login realizado com Sucesso, ${usuario.nome}!`);
      setSucesso(true);

      // delay pra mostra mensagem
      loginTimeoutRef.current = setTimeout(() => {
        navigation.navigate('App');
      }, 500);
    } catch (erro) {
      setMensagem(erro.message);
      setSucesso(false);
    } finally {
      setCarregando(false);
    }
  }, [carregando, navigation, salvarEstadoLembrar]);




  //resdto do código
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/image/Keep.jpg')}
        style={styles.logo}
      />

      <Text style={styles.txt_logo}>KeepStock</Text>

      <Text style={styles.subtitle}>
        Bem Vindo
      </Text>

      <TextInput
        placeholder="Usuario"
        placeholderTextColor="#202327"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#202327"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />



    {/* Lembre-se de mim */}
      <TouchableOpacity
        style={styles.rememberContainer}
        onPress={() => {
          const novoValor = !lembrar;
          setLembrar(novoValor);
        
          if (novoValor) {
            salvarCredenciaisLembradas(email, password).catch(erro =>
              console.log('Erro ao salvar credenciais:', erro)
            );
            return;
          }
          limparCredenciaisLembradas().catch(erro =>
            console.log('Erro ao limpar credenciais:', erro)
          );
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, lembrar && styles.checkboxChecked]}>
          {lembrar && <View style={styles.checkboxInner} />}
        </View>
        <Text style={styles.rememberText}>Lembre-se de mim</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>
        Já possui conta?
      </Text>



      {/* Cadastro  */}
      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.subtitle}>Cadastrar-se</Text>
      </TouchableOpacity>



      {/* Login */}
      <TouchableOpacity
        style={[styles.button, carregando && styles.buttonDisabled]}
        onPress={() => fazerlogin(email, password)}
        disabled={carregando}
        activeOpacity={carregando ? 0.5 : 0.8}
      >
        {carregando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
      {mensagem !== '' && (
        <Text style={[styles.mensagem, { color: sucesso ? '#2e7d32' : '#d32f2f' }]}>{mensagem}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 25,
  },

  txt_logo: {
    color: '#006e5a',
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    color: '#559b89',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },

  input: {
    backgroundColor: '#ccd3d2',
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#000',
    marginBottom: 15,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00977b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  checkboxChecked: {
    backgroundColor: '#00977b',
  },

  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#fff',
  },

  rememberText: {
    color: '#1f2937',
    fontSize: 15,
  },

  button: {
    backgroundColor: '#00977b',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  logo: {
    marginLeft: 90,
    width: 470,
    height: 150,
    alignSelf: 'center',
  },

  mensagem: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});


