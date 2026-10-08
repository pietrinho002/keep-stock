import React, { useState } from 'react';

import {
  View,
  Text,
  Modal,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

// Substitui o <select> do sistema web: abre a lista de opções em um modal
// renderCampo permite usar um card da própria tela como gatilho, no lugar do campo padrão
export default function Seletor({
  valor,
  opcoes,
  placeholder,
  onChange,
  renderCampo,
}) {
  const [aberto, setAberto] = useState(false);
  const selecionada = opcoes.find((opcao) => String(opcao.valor) === String(valor));
  return (
    <>
      {renderCampo ? (
        renderCampo(() => setAberto(true))
      ) : (
        <TouchableOpacity
          style={styles.campo}
          onPress={() => setAberto(true)}
        >
          <Text
            style={
              selecionada ? styles.textoSelecionado : styles.placeholder
            }
          >
            {selecionada ? selecionada.rotulo : placeholder}
          </Text>

          <Ionicons
            name="chevron-down"
            size={20}
            color="#94A3B8"
          />
        </TouchableOpacity>
      )}

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <TouchableOpacity
          style={styles.fundo}
          activeOpacity={1}
          onPress={() => setAberto(false)}
        >
          <View style={styles.caixa}>
            <Text style={styles.titulo}>{placeholder}</Text>

            <FlatList
              data={opcoes}
              keyExtractor={(item) => String(item.valor)}
              ListEmptyComponent={
                <Text style={styles.vazio}>Nenhuma opção disponível.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.opcao}
                  onPress={() => {
                    onChange(item.valor);
                    setAberto(false);
                  }}
                >
                  <Text style={styles.opcaoTexto}>{item.rotulo}</Text>

                  {String(item.valor) === String(valor) && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#24b364"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  campo: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  textoSelecionado: {
    color: '#0F172A',
    fontSize: 15,
    flex: 1,
  },

  placeholder: {
    color: '#94A3B8',
    fontSize: 15,
    flex: 1,
  },

  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 30,
  },

  caixa: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },

  titulo: {
    color: '#0A4D46',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  opcao: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  opcaoTexto: {
    color: '#0F172A',
    fontSize: 15,
    flex: 1,
  },

  vazio: {
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
