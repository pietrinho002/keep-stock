import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';

// Dados simulados
const REPORT_DATA = {
  pedidos: {
    entraram: 150,
    sairam: 95, // Considerados pedidos que concluíram o fluxo (Entregues)
    statusCounts: [
      { status: 'Entregue', count: 95 },
      { status: 'Para despache', count: 20 },
      { status: 'Transportando', count: 25 },
      { status: 'Pendente', count: 10 },
    ],
  },
  produtos: {
    entraram: 1250,
    sairam: 830,
  },
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Entregue':
      return '#2e7d32';
    case 'Para despache':
      return '#0288d1';
    case 'Transportando':
      return '#c5b50d';
    case 'Pendente':
      return '#d32f2f';
    default:
      return '#757575';
  }
};

export default function ReportsScreen() {
  const saldoProdutos = REPORT_DATA.produtos.entraram - REPORT_DATA.produtos.sairam;

  return (
    <SafeAreaView style={styles.container}>
  
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.MainTitle}>Relatórios do Sistema</Text>
        <Text style={styles.headerSubtitle}>Relatórios gerais do sistema</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SEÇÃO: PEDIDOS */}
        <Text style={styles.sectionTitle}>Relatório de Pedidos</Text>
        
        <View style={styles.Cards}>
          <View style={styles.Card}>
            <Text style={styles.kpiLabel}>Total de Entrada de pedidos</Text>
            <Text style={[styles.kpiValue, { color: '#fff' }]}>
              {REPORT_DATA.pedidos.entraram}
            </Text>
            <Text style={styles.kpiSubtext}>Pedidos registrados</Text>
          </View>

          <View style={styles.Card}>
            <Text style={styles.kpiLabel}>Total de Saída de Pedidos</Text>
            <Text style={[styles.kpiValue, { color: '#fff' }]}>
              {REPORT_DATA.pedidos.sairam}
            </Text>
            <Text style={styles.kpiSubtext}>Saída de Pedidos</Text>
          </View>
        </View>

        {/* Detalhamento de Status dos Pedidos */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Quantidade por Status</Text>
          {REPORT_DATA.pedidos.statusCounts.map((item) => {
            const color = getStatusColor(item.status);
            return (
              <View key={item.status} style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View style={[styles.badgeDot, { backgroundColor: color }]} />
                  <Text style={styles.statusList}>{item.status}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: color + '15' }]}>
                  <Text style={[styles.statusCountText, { color }]}>
                    {item.count}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* SEÇÃO: PRODUTOS */}
        <Text style={styles.sectionTitle}>Relatório de Produtos</Text>
        
        <View style={styles.Cards}>
          <View style={[styles.Card, { borderTopColor: getStatusColor('Para despache') }]}>
            <Text style={styles.kpiLabel}>Produtos Recebidos</Text>
            <Text style={[styles.kpiValue, { color: getStatusColor('Para despache') }]}>
              {REPORT_DATA.produtos.entraram}
            </Text>
            <Text style={styles.kpiSubtext}>itens em estoque</Text>
          </View>

          <View style={[styles.Card, { borderTopColor: getStatusColor('Pendente') }]}>
            <Text style={styles.kpiLabel}>Produtos vendidos</Text>
            <Text style={[styles.kpiValue, { color: getStatusColor('Pendente') }]}>
              2.300
            </Text>
            <Text style={styles.kpiSubtext}>itens despachados</Text>
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  MainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#148577',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#148577',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
    marginTop: 12,
    marginBottom: 12,
  },
  Cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  Card: {
    backgroundColor: '#148577',
    width: 270,
    padding: 16,
    borderRadius: 12,
    borderTopWidth: 4,
    elevation: 2,
    borderColor: '#D2D2D2',
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  kpiSubtext: {
    fontSize: 11,
    color: '#fff',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    
  },
  statusList: {
    fontSize: 14,
    color: '#434343',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryBox: {
    backgroundColor: '#148577',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});