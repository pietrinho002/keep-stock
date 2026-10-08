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
import QRCodeScannerModal from '../src/components/QRCodeScannerModal'; // Componente para escanear QR Codes
import Seletor from '../src/components/Seletor';
import { listarClientes } from '../src/services/clientes';
import { buscarProdutoPorCodigo, listarProdutos } from '../src/services/produtos';
import { salvarSaida } from '../src/services/movimentacoes';
import { usuarioLogado } from '../src/services/usuarios';

export default function ExitScreen() {
  const [quantity, setQuantity] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [idProduto, setIdProduto] = useState('');
  const [idCliente, setIdCliente] = useState('');
  const [tipoSaida, setTipoSaida] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [scannerAberto, setScannerAberto] = useState(false);



  // busca de produto por QR Code 
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

  // Carrega produtos e clientes ao abrir o formulario
  const carregar = useCallback(async () => {
    try {
      const [listaProdutos, listaClientes] = await Promise.all([
        listarProdutos(),
        listarClientes(),
      ]);
      setProdutos(listaProdutos);
      setClientes(listaClientes);
    } catch (erro) {
      console.log(`Erro ao carregar dados: ${erro.message}`);
    }
  }, []);

  // Atualiza os dados sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const produto = produtos.find(
    (item) => String(item.id_produto) === String(idProduto)
  );
  const cliente = clientes.find(
    (item) => String(item.id_cliente) === String(idCliente)
  );
  const currentStock = produto ? produto.quantidade_atual || 0 : 0;
  {/*Verifica se o produto foi selecionado */}
  async function confirmarSaida() {
    if (!produto) {
      Alert.alert('Selecione o produto', 'Toque no campo Produto para escolher.');
      return;
    }

    {/*Salva info. e da print */}

    setSalvando(true);

    try {
      const usuario = await usuarioLogado();
      await salvarSaida({
        id_produto: produto.id_produto,
        quantidade: quantity,
        tipo_saida: tipoSaida,
        id_cliente: idCliente || null,
        id_usuario: usuario ? usuario.id : null,
      });

      Alert.alert(
        'Saída registrada',
        `${quantity} un. de ${produto.nome} retiradas do estoque.`
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Saída de Estoque
      </Text>

      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => setScannerAberto(true)}
      >
        <Ionicons
          name="qr-code-outline"
          size={28}
          color="#fff"
        />
        <Text style={styles.qrText}>
          Escanear Produto
        </Text>
      </TouchableOpacity>


    {/*Produto */}
      <Text style={styles.label}>
        Produto
      </Text>
      {/* habilita o seletor de produtos */}
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
            style={styles.seletor}
            onPress={abrir}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.seletorTexto}>
                {produto ? produto.nome : 'Selecione o produto'}
              </Text>

              {produto && (
                <Text style={styles.seletorApoio}>
                  Estoque atual: {currentStock}
                </Text>
              )}
            </View>

            <Ionicons
              name="chevron-down"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      />


        {/*Saida */}
      <Text style={styles.label}>
        Saída
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a quantidade"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />
      <Text style={styles.label}>
        Tipo de saída
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Venda, perda, transferência..."
        placeholderTextColor="#94A3B8"
        value={tipoSaida}
        onChangeText={setTipoSaida}
      />



        {/*Cliente */}

      <Text style={styles.label}>
        Cliente
      </Text>
      {/*Seleciona o cliente */}
      <Seletor
        valor={idCliente}
        opcoes={clientes.map((item) => ({
          valor: item.id_cliente,
          rotulo: item.nome,
        }))}
        placeholder="Selecione o cliente"
        onChange={setIdCliente}
        renderCampo={(abrir) => (
          <TouchableOpacity
            style={styles.seletor}
            onPress={abrir}
          >
            <Text style={styles.seletorTexto}>
              {cliente ? cliente.nome : 'Opcional'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      />



      <View style={styles.resultCard}>
        <Text style={styles.resultText}>
          Estoque Restante
        </Text>
        <Text style={styles.resultValue}>
          {currentStock -
            Number(quantity || 0)}
        </Text>
      </View>



      <TouchableOpacity
        style={styles.confirmButton}
        onPress={confirmarSaida}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name="remove-circle"
              size={24}
              color="#fff"
            />

            <Text style={styles.confirmText}>
              Confirmar Saída
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
    padding: 20,
  },

  title: {
    color: '#148577',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 30,
  },

  qrButton: {
    backgroundColor: '#148577',
    height: 70,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  qrText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  label: {
    color: '#0e0c0c',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 35,
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#1f5751',
    height: 65,
    borderRadius: 18,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 18,
  },

  seletor: {
    backgroundColor: '#1f5751',
    minHeight: 65,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  seletorTexto: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
  },

  seletorApoio: {
    color: '#22C55E',
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },

  resultCard: {
    backgroundColor: '#148577',
    borderRadius: 22,
    padding: 25,
    marginTop: 30,
    alignItems: 'center',
  },

  resultText: {
    color: '#FCA5A5',
    fontSize: 16,
  },

  resultValue: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 10,
  },

  confirmButton: {
    backgroundColor: '#DC2626',
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
