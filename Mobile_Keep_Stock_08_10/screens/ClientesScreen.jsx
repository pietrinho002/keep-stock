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
  listarClientes,
  salvarCliente,
  atualizarCliente,
  excluirCliente,
} from '../src/services/clientes';

// Mesmos campos do formulário de clientes do sistema web
const CAMPOS = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'texto' },
  { nome: 'cpf_cnpj', rotulo: 'CPF / CNPJ', tipo: 'texto' },
  { nome: 'telefone', rotulo: 'Telefone', tipo: 'texto', exemplo: '(00) 00000-0000' },
  { nome: 'email', rotulo: 'E-mail', tipo: 'texto' },
  { nome: 'codigo_postal', rotulo: 'Código postal', tipo: 'texto', exemplo: '00000-000' },
];

export default function ClientesScreen() {
  const [search, setSearch] = useState('');
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setClientes(await listarClientes());
    } catch (erro) {
      console.log(`Erro ao carregar clientes: ${erro.message}`);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const filtrados = clientes.filter(
    (item) =>
      (item.nome || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item.cpf_cnpj || '')
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  async function confirmarSalvar(valores) {
    if (emEdicao) {
      await atualizarCliente(emEdicao.id_cliente, valores);
    } else {
      await salvarCliente(valores);
    }

    await carregar();
  }

  function confirmarExclusao(cliente) {
    Alert.alert(
      'Excluir cliente',
      `Deseja excluir "${cliente.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirCliente(cliente.id_cliente);
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
            Clientes
          </Text>

          <Text style={styles.subtitle}>
            Consulte os clientes cadastrados
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
          placeholder="Pesquisar clientes..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* LISTA */}

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id_cliente.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color="#0A4D46" />
          ) : (
            <Text style={styles.vazio}>
              Nenhum cliente encontrado.
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
                    {item.cpf_cnpj || 'Sem CPF/CNPJ'}
                  </Text>
                </View>

                <View style={styles.iconBadge}>
                  <Ionicons
                    name="person"
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
                CEP: {item.codigo_postal || '-'}
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
        titulo={emEdicao ? 'Editar cliente' : 'Novo cliente'}
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
