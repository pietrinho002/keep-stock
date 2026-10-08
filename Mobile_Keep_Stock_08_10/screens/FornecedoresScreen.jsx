import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  Alert,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ModalFormulario from '../src/components/ModalFormulario';
import {
  listarFornecedores,
  salvarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
} from '../src/services/fornecedores';

// Mesmos campos do formulário de fornecedores do sistema web
const CAMPOS = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'texto' },
  { nome: 'cnpj', rotulo: 'CNPJ', tipo: 'numero', exemplo: '00.000.000/0000-00' },
  { nome: 'telefone', rotulo: 'Telefone', tipo: 'numero', exemplo: '(00) 00000-0000' },
  { nome: 'email', rotulo: 'E-mail', tipo: 'texto' },
  { nome: 'cep', rotulo: 'CEP', tipo: 'numero', exemplo: '00000-000' },
];

export default function FornecedoresScreen() {
  const [search, setSearch] = useState('');
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setFornecedores(await listarFornecedores());
    } catch (erro) {
      console.log(`Erro ao carregar fornecedores: ${erro.message}`);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const filtrados = fornecedores.filter(
    (item) =>
      (item.nome || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item.cnpj || '')
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  async function confirmarSalvar(valores) {
    if (emEdicao) {
      await atualizarFornecedor(emEdicao.id_fornecedor, valores);
    } else {
      await salvarFornecedor(valores);
    }

    await carregar();
  }

  function confirmarExclusao(fornecedor) {
    Alert.alert(
      'Excluir fornecedor',
      `Deseja excluir "${fornecedor.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirFornecedor(fornecedor.id_fornecedor);
              await carregar();
            } catch (erro) {
              Alert.alert('Não foi possível excluir', erro.message);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Fornecedores
          </Text>

          <Text style={styles.subtitle}>
            Consulte os fornecedores cadastrados
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setEmEdicao(null);
            setModalAberto(true);
          }}
        >
          <Ionicons
            name="add"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* PESQUISA */}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={22}
          color="#94A3B8"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar fornecedores..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* LISTA */}

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id_fornecedor.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color="#0A4D46" />
          ) : (
            <Text style={styles.vazio}>
              Nenhum fornecedor encontrado.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.content}>
              {/* TOPO */}

              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {item.nome}
                  </Text>

                  <Text style={styles.category}>
                    {item.cnpj || 'Sem CNPJ'}
                  </Text>
                </View>

                <View style={styles.iconBadge}>
                  <Ionicons
                    name="business"
                    size={24}
                    color="#fff"
                  />
                </View>
              </View>

              {/* CONTATO */}

              <View style={styles.infoRow}>
                <View style={styles.infoCard}>
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color="#22C55E"
                  />

                  <Text style={styles.infoText}>
                    {item.telefone || '-'}
                  </Text>
                </View>
              </View>

              <Text style={styles.detalhe}>
                {item.email || '-'}
              </Text>

              <Text style={styles.detalhe}>
                CEP: {item.cep || '-'}
              </Text>

              {/* AÇÕES */}

              <View style={styles.acoes}>
                <TouchableOpacity
                  style={styles.acaoEditar}
                  onPress={() => {
                    setEmEdicao(item);
                    setModalAberto(true);
                  }}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#fff"
                  />

                  <Text style={styles.acaoTexto}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acaoExcluir}
                  onPress={() => confirmarExclusao(item)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#fff"
                  />

                  <Text style={styles.acaoTexto}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <ModalFormulario
        visivel={modalAberto}
        titulo={emEdicao ? 'Editar fornecedor' : 'Novo fornecedor'}
        campos={CAMPOS}
        registro={emEdicao}
        onSalvar={confirmarSalvar}
        onFechar={() => setModalAberto(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  title: {
    color: '#0A4D46',
    fontSize: 32,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#94A3B8',
    marginTop: 5,
    fontSize: 15,
  },

  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: '#053d38',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    backgroundColor: '#042c28',
    height: 62,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 25,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
  },

  card: {
    backgroundColor: '#0A4D46',
    borderRadius: 29,
    overflow: 'hidden',
    marginBottom: 22,
  },

  content: {
    padding: 20,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  name: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
  },

  category: {
    color: '#94A3B8',
    marginTop: 6,
    fontSize: 15,
  },

  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: '#053d38',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },

  infoCard: {
    backgroundColor: '#053d38',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    color: '#CBD5E1',
    marginLeft: 8,
    fontSize: 13,
  },

  detalhe: {
    color: '#CBD5E1',
    marginTop: 10,
    fontSize: 14,
  },

  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  acaoEditar: {
    flex: 1,
    backgroundColor: '#148577',
    borderRadius: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  acaoExcluir: {
    flex: 1,
    backgroundColor: '#B91C1C',
    borderRadius: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  acaoTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  vazio: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
});
