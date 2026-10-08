import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { listarMovimentacoes } from '../src/services/movimentacoes';

// Separa a data e a hora do timestamp do banco no formato usado nos cards
function formatarDataHora(valor) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return { date: '', hour: '' };

  return {
    date: data.toLocaleDateString('pt-BR'),
    hour: data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export default function HistoryScreen() {
  const [search, setSearch] =
    useState('');

  const [history, setHistory] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        try {
          const { entradas, saidas } = await listarMovimentacoes();

          const registros = [
            ...entradas.map((entrada) => ({
              id: `entrada-${entrada.id_entrada}`,
              type: 'Entrada',
              product: entrada.produto,
              quantity: entrada.quantidade,
              ...formatarDataHora(entrada.data_entrada),
            })),
            ...saidas.map((saida) => ({
              id: `saida-${saida.id_saida}`,
              type: 'Saída',
              product: saida.produto,
              quantity: saida.quantidade,
              ...formatarDataHora(saida.data_saida),
            })),
          ];

          setHistory(registros);
        } catch (erro) {
          console.log(`Erro ao carregar o histórico: ${erro.message}`);
        } finally {
          setCarregando(false);
        }
      }

      carregar();
    }, [])
  );


  const filteredHistory = history.filter(
    (item) =>
      item.product
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.type
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalEntradas = history.filter(
    (item) => item.type === 'Entrada'
  ).length;

  const totalSaidas = history.length - totalEntradas;

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Histórico
          </Text>

          <Text style={styles.subtitle}>
            Movimentações do estoque
          </Text>
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* PESQUISA */}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={22}
          color="#fff"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar movimentações..."
          placeholderTextColor="#fff"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ESTATÍSTICAS */}

      <View style={styles.statsContainer}>
        <View style={styles.statsCardGreen}>
          <Ionicons
            name="arrow-down-circle"
            size={24}
            color="#22C55E"
          />

          <Text style={styles.statsNumber}>
            {totalEntradas}
          </Text>

          <Text style={styles.statsLabel}>
            Entradas
          </Text>
        </View>

        <View style={styles.statsCardRed}>
          <Ionicons
            name="arrow-up-circle"
            size={24}
            color="#EF4444"
          />

          <Text style={styles.statsNumber}>
            {totalSaidas}
          </Text>

          <Text style={styles.statsLabel}>
            Saídas
          </Text>
        </View>
      </View>

      {/* LISTA */}

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) =>
          item.id.toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color="#148577" />
          ) : (
            <Text style={styles.vazio}>
              Nenhuma movimentação registrada.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* ÍCONE */}

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    item.type === 'Entrada'
                      ? '#052E16'
                      : '#450A0A',
                },
              ]}
            >
              <Ionicons
                name={
                  item.type === 'Entrada'
                    ? 'arrow-down-circle'
                    : 'arrow-up-circle'
                }
                size={30}
                color={
                  item.type === 'Entrada'
                    ? '#22C55E'
                    : '#EF4444'
                }
              />
            </View>

            {/* INFO */}

            <View style={styles.info}>
              <View style={styles.topRow}>
                <Text style={styles.product}>
                  {item.product}
                </Text>

                <Text
                  style={[
                    styles.type,
                    {
                      color:
                        item.type === 'Entrada'
                          ? '#86EFAC'
                          : '#FCA5A5',
                    },
                  ]}
                >
                  {item.type}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.quantity}>
                  Quantidade: {item.quantity}
                </Text>

                <Text style={styles.date}>
                  {item.date}
                </Text>
              </View>

              <Text style={styles.hour}>
                {item.hour}
              </Text>
            </View>
          </View>
        )}
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
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#148577',
    fontSize: 32,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#148577',
    marginTop: 5,
    fontSize: 15,
  },

  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: '#148577',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    backgroundColor: '#b9b4b4',
    height: 62,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 25,
    border: 1,
    
    
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
    fontSize: 16,
  },

  vazio: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statsCardGreen: {
    width: '48%',
    backgroundColor: '#148577',
    borderRadius: 24,
    padding: 20,
  },

  statsCardRed: {
    width: '48%',
    backgroundColor: '#148577',
    borderRadius: 24,
    padding: 20,
  },

  statsNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },

  statsLabel: {
    color: '#CBD5E1',
    marginTop: 6,
  },

  card: {
    backgroundColor: '#148577',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
  },

  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  info: {
    flex: 1,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  product: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },

  type: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  quantity: {
    color: '#CBD5E1',
    fontSize: 14,
  },

  date: {
    color: '#94A3B8',
    fontSize: 13,
  },

  hour: {
    color: '#64748B',
    marginTop: 8,
    fontSize: 13,
  },
});