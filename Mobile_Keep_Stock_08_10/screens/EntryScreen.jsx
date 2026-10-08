import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import QRCodeScannerModal from '../src/components/QRCodeScannerModal';
import Seletor from '../src/components/Seletor';
import { buscarProdutoPorCodigo, listarProdutos } from '../src/services/produtos';
import { salvarEntrada } from '../src/services/movimentacoes';
import { usuarioLogado } from '../src/services/usuarios';


export default function EntryScreen() {
  const [produtos, setProdutos] = useState([]);
  const [idProduto, setIdProduto] = useState('');
  const [quantity, setQuantity] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [scannerAberto, setScannerAberto] = useState(false);

  //QR Code para registrar entrada de produtos
  async function lerQRCode(codigo) {
    setScannerAberto(false);
    try {
      const encontrado = await buscarProdutoPorCodigo(codigo);
      if (!encontrado) {
        Alert.alert('Erro', 'Produto não encontrado no banco.');
        return;
      }
      setIdProduto(encontrado.id_produto);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  // Carrega a lista de produtos ao abrir o formulário
  const carregar = useCallback(async () => {
    try {
      setProdutos(await listarProdutos());
    } catch (erro) {
      console.log(`Erro ao carregar produtos: ${erro.message}`);
    }
  }, []);

  // Atualiza a lista de produtos sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const produto = produtos.find(
    (item) => String(item.id_produto) === String(idProduto)
  );
  const estoqueAtual = produto ? produto.quantidade_atual || 0 : 0;
  async function confirmarEntrada() {
    {/*Verifica se o produto foi selecionado */}
    if (!produto) {
      Alert.alert('Selecione o produto', 'Toque no card para escolher o produto.');
      return;
    }

    {/*Salva info. e da print */}

    setSalvando(true);
    try {
      const usuario = await usuarioLogado();
      await salvarEntrada({
        id_produto: produto.id_produto,
        quantidade: quantity,
        id_usuario: usuario ? usuario.id : null,
      });
      Alert.alert(
        'Entrada registrada',
        `${quantity} un. de ${produto.nome} somadas ao estoque.`
      );
      setQuantity('');
      await carregar();
    } catch (erro) {
      Alert.alert('Não foi possível registrar', erro.message);
    } finally {
      setSalvando(false);
    }
  }






  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Entrada de Estoque
        </Text>
        <Text style={styles.subtitle}>
          Registre produtos rapidamente
        </Text>
      </View>

      {/* QR CODE */}

      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => setScannerAberto(true)}
      >
        <View style={styles.qrContent}>
          <Ionicons
            name="qr-code-outline"
            size={32}
            color="#fff"
          />
          <View>
            <Text style={styles.qrTitle}>
              Ler QR Code
            </Text>
            <Text style={styles.qrSubtitle}>
              Escanear produto
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={22}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Seleciona o produto */}

      <Text style={styles.sectionTitle}>
        Produto Encontrado
      </Text>
      <Seletor
        valor={idProduto}
        opcoes={produtos.map((item) => ({
          valor: item.id_produto,
          rotulo: item.nome,
        }))}
        placeholder="Selecione o produto"
        onChange={setIdProduto}
        renderCampo={(abrir) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={abrir}
          >
            <View style={styles.productIcon}>
              <Ionicons
                name="cube"
                size={28}
                color="#3B82F6"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>
                {produto ? produto.nome : 'Selecione o produto'}
              </Text>
              <Text style={styles.productCode}>
                Código: {produto ? produto.id_produto : '-'}
              </Text>
              <Text style={styles.productStock}>
                Estoque Atual: {estoqueAtual}
              </Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      />



      {/* QUANTIDADE */}

      <Text style={styles.sectionTitle}>
        Quantidade
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a quantidade"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      {/* Visualização de informações finais */}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          Resumo da Entrada
        </Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Produto
          </Text>
          <Text style={styles.summaryValue}>
            {produto ? produto.nome : '-'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Quantidade
          </Text>
          <Text style={styles.summaryValue}>
            {quantity || 0}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Estoque Final
          </Text>
          <Text style={styles.summaryValueGreen}>
            {estoqueAtual + Number(quantity || 0)}
          </Text>
        </View>
      </View>

      {/* BOTÃO */}

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={confirmarEntrada}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#fff"
            />

            <Text style={styles.confirmText}>
              Confirmar Entrada
            </Text>
          </>
        )}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
      <QRCodeScannerModal
        visible={scannerAberto}
        onClose={() => setScannerAberto(false)}
        onReadCode={lerQRCode}
      />
    </ScrollView>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 50,
  },

  title: {
    color: '#000000',
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#94A3B8',
    marginTop: 5,
    fontSize: 15,
  },

  qrButton: {
    backgroundColor: '#2563EB',
    borderRadius: 25,
    padding: 22,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  qrContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  qrTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  qrSubtitle: {
    color: '#DBEAFE',
    marginTop: 3,
  },

  sectionTitle: {
    color: '#0A4D46',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 35,
    marginBottom: 15,
  },

  productCard: {
    backgroundColor: '#1f5751',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  productIcon: {
    width: 65,
    height: 65,
    backgroundColor: '#1f5751',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  productCode: {
    color: '#94A3B8',
    marginTop: 5,
  },

  productStock: {
    color: '#22C55E',
    marginTop: 8,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: '#1f5751',
    height: 65,
    borderRadius: 18,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 18,
  },

  summaryCard: {
    backgroundColor: '#1f5751',
    borderRadius: 22,
    padding: 22,
    marginTop: 35,
  },

  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  summaryLabel: {
    color: '#94A3B8',
    fontSize: 15,
  },

  summaryValue: {
    color: '#fff',
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'right',
  },

  summaryValueGreen: {
    color: '#22C55E',
    fontWeight: 'bold',
  },

  confirmButton: {
    backgroundColor: '#16A34A',
    height: 65,
    borderRadius: 22,
    marginTop: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
