import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { carregarDashboard } from '../src/services/dashboard';


//define inicialmente 0 para que depois os dados sejam puxados e atualizados
export default function HomeScreen({ navigation }) {
  const [dados, setDados] = useState({
    totalProdutos: 0,
    totalEstoqueBaixo: 0,
    entradas: [],
    saidas: [],
    produtosMap: {},
  });


  // Recarrega os dados ao abrir a tela
  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        try {
          setDados(await carregarDashboard());
        } catch (erro) {
          console.log(`Erro ao carregar o dashboard: ${erro.message}`);
        }
      }
      carregar();
    }, [])
  );


  // Junta entradas e saídas em uma lista
  // aparece no histórico
  const atividades = [
    ...dados.entradas.map((entrada) => ({
      id: `entrada-${entrada.id_entrada}`,
      tipo: 'Entrada',
      quantidade: entrada.quantidade,
      produto: dados.produtosMap[entrada.id_produto] || 'Produto',
    })),
    ...dados.saidas.map((saida) => ({
      id: `saida-${saida.id_saida}`,
      tipo: 'Saída',
      quantidade: saida.quantidade,
      produto: dados.produtosMap[saida.id_produto] || 'Produto',
    })),
  ];





  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>


      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>
            Bem-vindo
          </Text>
          <Text style={styles.userName}>
            Keep Stock 
          </Text>
        </View>
        <Image
          source={require('../assets/image/Keep.jpg')} 
          style={styles.logo}
        />
        <TouchableOpacity style={styles.notification}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>




      {/* DASHBOARD */}

      <View style={styles.balanceCard}>
        <View style={styles.cardalign}>
          <Text style={styles.balanceLabel}>
            Produtos em Estoque
          </Text>
          <Text style={styles.balanceLabel}>
            Produtos com estoque baixo
          </Text>
        </View>
        
        {/* Aqui a quant. de produto é puxado*/}
        <View style={styles.cardalign}>
          <Text style={styles.balanceValue}>
            {dados.totalProdutos}
          </Text>
        {/* Aqui a quant. de produto com estoque baixo é puxado*/}
          <Text style={styles.redValue}>
            {dados.totalEstoqueBaixo}
          </Text>
        </View>
        
        <View style={styles.balanceFooterUp}>
          <Ionicons
            name="trending-up"
            size={18}
            color="#22C55E"
          />
          <Text style={styles.balanceGrowth}>
            +12% este mes
          </Text>
          <View style={styles.balanceFooterdown}>
            <Ionicons
              name="trending-down"
              size={18}
              color="#EF4444"
            />
            <Text style={styles.balanceGrowth}>
              -5% este mes
            </Text>
          </View>
        </View>
        
      </View>
        

        
     

      {/* CARDS */}

      <View style={styles.cardsContainer}>
        <View style={styles.smallCard}>
          <View style={styles.iconBlue}>
            <Ionicons
              name="cube"
              size={24}
              color="#31ab9f"
            />
          </View>

          {/* Aqui a quant. de produto é puxado*/}
          <Text style={styles.cardNumber}>
            {dados.totalProdutos}
          </Text>
          <Text style={styles.cardLabel}>
            Produtos
          </Text>
        </View>
        <View style={styles.smallCard}>

          <View style={styles.iconRed}>
            <Ionicons
              name="alert-circle"
              size={24}
              color="#EF4444"
            />
          </View>
          {/* Aqui a quant. de produto com estoque baixo é puxado*/}
          <Text style={styles.cardNumber}>
            {dados.totalEstoqueBaixo}
          </Text>
          <Text style={styles.cardLabel}>
            Estoque Baixo
          </Text>
        </View>
      </View>

      {/* MENU */}

      {/* viagem de tela */}
      

      <TouchableOpacity
        style={styles.actionButtonGreen}
        onPress={() =>
          navigation.navigate('Entrada')
        }
      >
        <View style={styles.buttonContent}>
          <Ionicons
            name="arrow-down-circle-outline"
            size={26}
            color="#fff"
          />

          <View>
            <Text style={styles.buttonTitle}>
              Entrada de Estoque
            </Text>
            <Text style={styles.buttonSubtitle}>
              Registrar novos produtos
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={22}
          color="#fff"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButtonRed}
        onPress={() =>
          navigation.navigate('Saída')
        }
      >
        <View style={styles.buttonContent}>
          <Ionicons
            name="arrow-up-circle-outline"
            size={26}
            color="#fff"
          />
          <View>
            <Text style={styles.buttonTitle}>
              Saída de Estoque
            </Text>
            <Text style={styles.buttonSubtitle}>
              Registrar retirada de produtos
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={22}
          color="#fff"
        />
      </TouchableOpacity>
         





      {/* ATIVIDADES */}

      <Text style={styles.sectionTitle}>
        Atividades Recentes
      </Text>
      {atividades.map((atividade) => (
        <View
          key={atividade.id}
          style={styles.activityCard}
        >
          <Ionicons
            name={
              atividade.tipo === 'Entrada'
                ? 'checkmark-circle'
                : 'remove-circle'
            }
            size={22}
            color={
              atividade.tipo === 'Entrada'
                ? '#22C55E'
                : '#EF4444'
            }
          />

          <Text style={styles.activityText}>
            {atividade.tipo} de {atividade.quantidade}{' '}
            {atividade.produto}
          </Text>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}






export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  logo: {
    width: 280,
    height: 80,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center'
  },

  header: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    color: '#148577',
    fontSize: 15,
  },

  userName: {
    color: '#148577',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 3,
  },

  notification: {
    width: 50,
    height: 50,
    backgroundColor: '#148577',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  balanceCard: {
    backgroundColor:  '#148577',
    padding: 15,
    marginTop: 20,
    borderRadius: 15,
    
  },
  cardalign: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  redValue: {
    color: "#de1616",
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 10,
    marginRight: 120
  },

  balanceLabel: {
    color: '#DBEAFE',
    fontSize: 16,
  },

  balanceValue: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 20
  },

  balanceFooterUp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  balanceFooterdown: {
    marginLeft: 190,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  balanceGrowth: {
    color: '#DCFCE7',
    marginLeft: 6,
    fontWeight: '600',
  },

  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },

  smallCard: {
    backgroundColor: '#148577',
    width: '48%',
    borderRadius: 15,
    padding: 20,
  },

  iconBlue: {
    width: 50,
    height: 50,
    backgroundColor: '#1f5751',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconRed: {
    width: 50,
    height: 50,
    backgroundColor: '#450A0A',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
  },

  cardLabel: {
    color: '#94A3B8',
    marginTop: 5,
  },

  sectionTitle: {
    color: '#053d38',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 35,
    marginBottom: 18,
  },

  actionButtonBlue: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actionButtonGreen: {
    backgroundColor: '#16A34A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    
  },

  actionButtonRed: {
    backgroundColor: '#DC2626',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  buttonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  buttonSubtitle: {
    color: '#E2E8F0',
    marginTop: 3,
    fontSize: 13,
  },

  activityCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  activityText: {
    color: '#fff',
    fontSize: 15,
  },
 
  TitleButton: {

    color: '#fff',
    backgroundColor: '#1E293B',
    fontSize: 20,

    marginBottom: 35,
    borderRadius: 10,
    padding: 10,
  }


}); 


