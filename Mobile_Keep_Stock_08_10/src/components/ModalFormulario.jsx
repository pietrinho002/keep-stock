import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Seletor from './Seletor';
import { Validator } from '../services/validator';

// Formulário de cadastro e edição, equivalente aos modais do sistema web
export default function ModalFormulario({
  visivel,
  titulo,
  campos,
  registro,
  onSalvar,
  onFechar,
}) {
  const [valores, setValores] = useState({});
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Preenche os campos ao abrir: vazio no cadastro, dados atuais na edição
  useEffect(() => {
    if (!visivel) return;

    const iniciais = {};

    campos.forEach((campo) => {
      const valor = registro ? registro[campo.nome] : campo.padrao;
      iniciais[campo.nome] = valor === null || valor === undefined ? '' : String(valor);
    });

    setValores(iniciais);
    setErro('');
  }, [visivel, registro]);

  function validarFormulario() {
    for (const campo of campos) {
      const valor = valores[campo.nome];
      const nomeCampo = (campo.rotulo || campo.nome).toLowerCase();

      if (campo.nome === 'telefone') {
        const mensagem = Validator.telefone(valor, nomeCampo);
        if (mensagem) return mensagem;
      }

      if (campo.nome === 'email') {
        const mensagem = Validator.email(valor, nomeCampo);
        if (mensagem) return mensagem;
      }

      if (campo.nome === 'cep' || campo.nome === 'codigo_postal') {
        const mensagem = Validator.cep(valor, nomeCampo);
        if (mensagem) return mensagem;
      }
    }

    return '';
  }

  async function salvar() {
    setSalvando(true);
    setErro('');

    try {
      const mensagem = validarFormulario();
      if (mensagem) {
        setErro(mensagem);
        return;
      }

      await onSalvar(valores);
      onFechar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={onFechar}
    >
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>{titulo}</Text>

            <TouchableOpacity onPress={onFechar}>
              <Ionicons
                name="close"
                size={26}
                color="#0A4D46"
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {campos.map((campo) => (
              <View key={campo.nome}>
                <Text style={styles.rotulo}>{campo.rotulo}</Text>

                {campo.tipo === 'selecao' ? (
                  <Seletor
                    valor={valores[campo.nome]}
                    opcoes={campo.opcoes || []}
                    placeholder={campo.rotulo}
                    onChange={(valor) =>
                      setValores({ ...valores, [campo.nome]: valor })
                    }
                  />
                ) : (
                  <TextInput
                    style={styles.entrada}
                    value={valores[campo.nome]}
                    placeholder={campo.exemplo || campo.rotulo}
                    placeholderTextColor="#94A3B8"
                    keyboardType={
                      campo.tipo === 'numero' ? 'numeric' : 'default'
                    }
                    secureTextEntry={campo.tipo === 'senha'}
                    autoCapitalize={
                      campo.tipo === 'senha' ? 'none' : 'sentences'
                    }
                    multiline={campo.tipo === 'longo'}
                    onChangeText={(texto) =>
                      setValores({ ...valores, [campo.nome]: texto })
                    }
                  />
                )}
              </View>
            ))}

            {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

            <TouchableOpacity
              style={styles.botao}
              onPress={salvar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoTexto}>Salvar</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  caixa: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },

  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  titulo: {
    color: '#0A4D46',
    fontSize: 22,
    fontWeight: 'bold',
  },

  rotulo: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },

  entrada: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 50,
    color: '#0F172A',
    fontSize: 15,
    marginBottom: 14,
  },

  erro: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
  },

  botao: {
    backgroundColor: '#0A4D46',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  botaoTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
