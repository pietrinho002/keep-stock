import React, { useCallback, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Alert,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ModalFormulario from '../src/components/ModalFormulario';
import { listarClientes } from '../src/services/clientes';
import {
  listarPedidos,
  salvarPedido,
  atualizarPedido,
  excluirPedido,
} from '../src/services/pedidos';

// Mesmas opções do select de status da tela de pedidos do sistema web
const STATUS = ['Pendente', 'Processando', 'Concluído', 'Cancelado'];

const formatarData = (valor) => {
  if (!valor) return '-';

  const data = new Date(`${valor}T00:00:00`);

  return Number.isNaN(data.getTime())
    ? valor
    : data.toLocaleDateString('pt-BR');
};

export default function OrdersScreen() {
  const [expandedId, setExpandedId] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const [listaPedidos, listaClientes] = await Promise.all([
        listarPedidos(),
        listarClientes(),
      ]);

      setPedidos(listaPedidos);
      setClientes(listaClientes);
    } catch (erro) {
      console.log(`Erro ao carregar pedidos: ${erro.message}`);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  // Agrupa os pedidos por status e mantém a ordenação por data mais antiga
  const groupedOrders = useMemo(() => {
    const sorted = [...pedidos].sort((a, b) =>
      String(a.data_pedido || '').localeCompare(String(b.data_pedido || ''))
    );

    const groups = sorted.reduce((acc, order) => {
      const status = order.status_pedido || 'Sem status';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(order);
      return acc;
    }, {});

    // Retorna a estrutura esperada pela SectionList: [{ title, data }, ...]
    return Object.keys(groups).map((status) => ({
      title: status,
      data: groups[status],
    }));
  }, [pedidos]);

  const toggleExpand = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Concluído':
      case 'Entregue':
        return '#2e7d32';
      case 'Processando':
      case 'Para despache':
        return '#0288d1';
      case 'Transportando':
        return '#c5b50d';
      case 'Pendente':
        return '#d32f2f';
      case 'Cancelado':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const campos = [
    {
      nome: 'id_cliente',
      rotulo: 'Cliente',
      tipo: 'selecao',
      opcoes: clientes.map((c) => ({ valor: c.id_cliente, rotulo: c.nome })),
    },
    { nome: 'data_pedido', rotulo: 'Data do pedido', tipo: 'texto', exemplo: 'AAAA-MM-DD' },
    {
      nome: 'status_pedido',
      rotulo: 'Status',
      tipo: 'selecao',
      padrao: 'Pendente',
      opcoes: STATUS.map((s) => ({ valor: s, rotulo: s })),
    },
    { nome: 'data_prevista', rotulo: 'Data prevista', tipo: 'texto', exemplo: 'AAAA-MM-DD' },
  ];

  async function confirmarSalvar(valores) {
    if (emEdicao) {
      await atualizarPedido(emEdicao.id_pedido, valores);
    } else {
      await salvarPedido(valores);
    }

    await carregar();
  }

  function confirmarExclusao(pedido) {
    Alert.alert(
      'Excluir pedido',
      `Deseja excluir o pedido nº ${pedido.id_pedido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirPedido(pedido.id_pedido);
              await carregar();
            } catch (erro) {
              Alert.alert('Não foi possível excluir', erro.message);
            }
          },
        },
      ]
    );
  }

  const renderOrderItem = ({ item }) => {
    const isExpanded = expandedId === item.id_pedido;
    const cliente = clientes.find((c) => c.id_cliente === item.id_cliente);

    return (
      <View style={styles.card}>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleExpand(item.id_pedido)}
          style={styles.cardHeader}
        >
        <View style={[styles.card2, { backgroundColor: getStatusColor(item.status_pedido) }]}></View>
          <View style={styles.headerMain}>
            <Text style={styles.textID}>Pedido nº {item.id_pedido}</Text>
            <Text style={styles.productTitle}>{item.cliente || 'Sem cliente'}</Text>
          </View>

        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.cardDetails}>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cliente:</Text>
              <Text style={styles.detailValue}>{item.cliente || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>CPF/CNPJ:</Text>
              <Text style={styles.detailValue}>{cliente?.cpf_cnpj || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>E-mail:</Text>
              <Text style={styles.detailValue}>{cliente?.email || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telefone:</Text>
              <Text style={styles.detailValue}>{cliente?.telefone || '-'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data:</Text>
              <Text style={styles.detailValue}>{formatarData(item.data_pedido)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data prevista:</Text>
              <Text style={styles.detailValue}>{formatarData(item.data_prevista)}</Text>
            </View>

            <View style={styles.acoes}>
              <TouchableOpacity
                style={styles.acaoEditar}
                onPress={() => {
                  setEmEdicao(item);
                  setModalAberto(true);
                }}
              >
                <Ionicons name="create-outline" size={18} color="#fff" />
                <Text style={styles.acaoTexto}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acaoExcluir}
                onPress={() => confirmarExclusao(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.acaoTexto}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Renderiza o título da categoria/seção
  const renderSectionHeader = ({ section: { title, data } }) => (
    <View style={styles.sectionHeaderContainer}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(title) }]} />
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      <Text style={styles.sectionHeaderCount}>({data.length})</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6f8" />

      <View style={styles.tituloLinha}>
        <Text style={styles.screenTitle}> Pedidos</Text>

        <TouchableOpacity
          style={styles.botaoNovo}
          onPress={() => {
            setEmEdicao(null);
            setModalAberto(true);
          }}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={groupedOrders}
        keyExtractor={(item) => String(item.id_pedido)}
        renderItem={renderOrderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color="#148577" />
          ) : (
            <Text style={styles.vazio}>Nenhum pedido cadastrado.</Text>
          )
        }
      />

      <ModalFormulario
        visivel={modalAberto}
        titulo={emEdicao ? 'Editar pedido' : 'Novo pedido'}
        campos={campos}
        registro={emEdicao}
        onSalvar={confirmarSalvar}
        onFechar={() => setModalAberto(false)}
      />
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  seila: {
    width: 100,
    height: 100,

  },
  tituloLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 16,
  },
  botaoNovo: {
    width: 46,
    height: 46,
    backgroundColor: '#148577',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#148577',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionHeaderCount: {
    fontSize: 14,
    color: '#8c8c8c',
    marginLeft: 6,
  },
  card2: {
    height:'100%',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  card: {
    backgroundColor: '#148577',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderColor: '#D2D2D2',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMain: {
    flex: 1,
  },
  textID: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#262626',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  cardDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '400',
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  acaoEditar: {
    flex: 1,
    backgroundColor: '#0A4D46',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acaoExcluir: {
    flex: 1,
    backgroundColor: '#B91C1C',
    borderRadius: 10,
    paddingVertical: 10,
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
    color: '#8c8c8c',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
});
