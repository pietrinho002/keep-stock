import React, { useCallback, useState, useMemo } from 'react';

import {
  View,
  Text,
  Alert,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ModalFormulario from '../src/components/ModalFormulario';
import { listarFornecedores } from '../src/services/fornecedores';
import {
  listarProdutos,
  salvarProduto,
  atualizarProduto,
  excluirProduto,
} from '../src/services/produtos';

// Mesmas opções dos selects da tela de produtos do sistema web
const CATEGORIAS = [
  'Alopático',
  'Homeopático',
  'Antibiótico',
  'Analgésico',
  'Anti-inflamatório',
  'Cardiovascular',
];

export default function ProductsScreen() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [fornecedores, setFornecedores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const [produtos, listaFornecedores] = await Promise.all([
        listarProdutos(),
        listarFornecedores(),
      ]);

      setProducts(
        produtos.map((produto) => ({
          id: produto.id_produto,
          name: produto.nome,
          category: produto.categoria || '',
          stock: produto.quantidade_atual || 0,
          minimo: produto.quantidade_minima || 0,
          price: produto.valor_unitario_venda || 0,
          image: produto.imagem_url,
          registro: produto,
        }))
      );

      setFornecedores(listaFornecedores);
    } catch (erro) {
      console.log(`Erro ao carregar produtos: ${erro.message}`);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega ao abrir a tela, para refletir as entradas e saídas registradas
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const campos = [
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto' },
    {
      nome: 'categoria',
      rotulo: 'Categoria',
      tipo: 'selecao',
      opcoes: CATEGORIAS.map((c) => ({ valor: c, rotulo: c })),
    },
    {
      nome: 'fornecedor',
      rotulo: 'Fornecedor',
      tipo: 'selecao',
      opcoes: fornecedores.map((f) => ({ valor: f.nome, rotulo: f.nome })),
    },
    { nome: 'unidade_medida', rotulo: 'Unidade de medida', tipo: 'texto', exemplo: 'L, ml, kg, g...' },
    { nome: 'descricao', rotulo: 'Descrição', tipo: 'longo' },
    { nome: 'valor_unitario_venda', rotulo: 'Valor un. venda', tipo: 'numero', exemplo: 'R$ 0,00' },
    { nome: 'valor_unitario_custo', rotulo: 'Valor un. custo', tipo: 'numero', exemplo: 'R$ 0,00' },
    { nome: 'quantidade_atual', rotulo: 'Quantidade atual', tipo: 'numero' },
    { nome: 'quantidade_minima', rotulo: 'Quantidade mínima', tipo: 'numero' },
    {
      nome: 'controlado',
      rotulo: 'Controlado',
      tipo: 'selecao',
      padrao: 'Sim',
      opcoes: [
        { valor: 'Sim', rotulo: 'Sim' },
        { valor: 'Não', rotulo: 'Não' },
      ],
    },
  ];

  async function confirmarSalvar(valores) {
    if (emEdicao) {
      await atualizarProduto(emEdicao.id_produto, valores);
    } else {
      await salvarProduto(valores);
    }

    await carregar();
  }

  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir produto',
      `Deseja excluir "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirProduto(item.id);
              await carregar();
            } catch (erro) {
              Alert.alert('Não foi possível excluir', erro.message);
            }
          },
        },
      ]
    );
  }


  const filteredProducts = products.filter(
    (item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.category
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Produtos
          </Text>

          <Text style={styles.subtitle}>
            Consulte os produtos cadastrados
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
          placeholder="Pesquisar produtos..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* LISTA */}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) =>
          item.id.toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color="#0A4D46" />
          ) : (
            <Text style={styles.vazio}>
              Nenhum produto encontrado.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* IMAGEM */}

            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
              />
            )}

            {/* CONTEÃšDO */}

            <View style={styles.content}>
              {/* TOPO */}

              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {item.name}
                  </Text>

                  <Text style={styles.category}>
                    {item.category}
                  </Text>
                </View>

                <View
                  style={[
                    styles.stockBadge,
                    {
                      backgroundColor:
                        item.stock <= item.minimo
                          ? '#7F1D1D'
                          : '#14532D',
                    },
                  ]}
                >
                  <Text style={styles.stockText}>
                    {item.stock}
                  </Text>
                </View>
              </View>

              {/* INFORMAÃ‡Ã•ES */}

              <View style={styles.infoRow}>
                <View style={styles.infoCard}>
                  <Ionicons
                    name="cube-outline"
                    size={18}
                    color="#16645c"
                  />

                  <Text style={styles.infoText}>
                    Estoque
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Ionicons
                    name="pricetag-outline"
                    size={18}
                    color="#22C55E"
                  />

                  <Text style={styles.infoText}>
                    Produto
                  </Text>
                </View>
              </View>

              {/* PREÃ‡O */}

              <View style={styles.bottomRow}>
                <Text style={styles.price}>
                  R$ {item.price.toFixed(2)}
                </Text>

                <Text
                  style={[
                    styles.stockStatus,
                    {
                      color:
                        item.stock <= item.minimo
                          ? '#FCA5A5'
                          : '#86EFAC',
                    },
                  ]}
                >
                  {item.stock <= item.minimo
                    ? 'Estoque baixo'
                    : 'Disponi­vel'}
                </Text>
              </View>

              {/* AÇÕES */}

              <View style={styles.acoes}>
                <TouchableOpacity
                  style={styles.acaoEditar}
                  onPress={() => {
                    setEmEdicao(item.registro);
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
        titulo={emEdicao ? 'Editar produto' : 'Novo produto'}
        campos={campos}
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

  vazio: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
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

  card: {
    backgroundColor: '#0A4D46',
    borderRadius: 29,
    overflow: 'hidden',
    marginBottom: 22,
  },

  image: {
    width: '100%',
    height: 220,
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

  stockBadge: {
    minWidth: 48,
    height: 48,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  stockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

  bottomRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  stockStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
});

