import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { cadastrarUsuario, login } from '../src/services/usuarios';


//formata o CPF para exibição
function formatarCpf(valor) {
  const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11);
  if (apenasNumeros.length <= 3) return apenasNumeros;
  if (apenasNumeros.length <= 6) {
    return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`;
  }
  if (apenasNumeros.length <= 9) {
    return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`;
  }
  return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9)}`;
}


//formata o email
function emailvalidator(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const cpfNumerico = cpf.replace(/\D/g, '');
  const cpfValido = cpfNumerico.length === 11;
  const emailValido = email === '' || emailvalidator(email);
  const senhaValida = senha === '' || senha.length >= 6;


  /* Formulario */
  async function Cadastrar() {
    if (!nome.trim()) {
      setMensagem('Informe o nome completo.');
      setSucesso(false);
      return;
    }

    if (!emailvalidator(email)) {
      setMensagem('Informe um e-mail válido.');
      setSucesso(false);
      return;
    }

    if (cpfNumerico.length !== 11) {
      setMensagem('CPF inválido. Digite 11 números.');
      setSucesso(false);
      return;
    }

    if (senha.length < 6) {
      setMensagem('A senha deve ter pelo menos 6 caracteres.');
      setSucesso(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem('As senhas não conferem.');
      setSucesso(false);
      return;
    }

    setCarregando(true);
    setMensagem('');

    try {
      await cadastrarUsuario({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpfNumerico,
        senha,
      });

      await login(email.trim().toLowerCase(), senha);

      setMensagem('Cadastro realizado com sucesso!');
      setSucesso(true);

      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }],
      });
    } catch (erro) {
      setMensagem(erro.message || 'Erro ao cadastrar usuário.');
      setSucesso(false);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>

      <TextInput
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
        style={[styles.input, !nome.trim() && nome !== '' ? styles.inputError : null]}
      />

      <TextInput
        placeholder="E-mail"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        style={[styles.input, !emailValido && email !== '' ? styles.inputError : null]}
      />

      <TextInput
        placeholder="CPF"
        value={cpf}
        keyboardType="numeric"
        onChangeText={(valor) => setCpf(formatarCpf(valor))}
        style={[styles.input, !cpfValido && cpf !== '' ? styles.inputError : null]}
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={[styles.input, !senhaValida && senha !== '' ? styles.inputError : null]}
      />

      <TextInput
        placeholder="Confirmar senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
        style={[styles.input, senha !== confirmarSenha && confirmarSenha !== '' ? styles.inputError : null]}
      />

      <TouchableOpacity style={styles.button} onPress={Cadastrar} disabled={carregando}>
        <Text style={styles.buttonText}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Já tenho conta</Text>
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
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#006e5a',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 14,
    marginBottom: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#d32f2f',
    backgroundColor: '#fff1f2',
  },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#00977b',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 18,
    textAlign: 'center',
    color: '#559b89',
    fontSize: 16,
  },
  mensagem: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
