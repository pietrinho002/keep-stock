import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const PRODUCTS_DATA = [
  { id: '1', name: 'Notebook Dell XPS 13', stock: 15 },
  { id: '2', name: 'Monitor LG UltraWide 29"', stock: 8 },
  { id: '3', name: 'Teclado Mecânico Logitech', stock: 25 },
  { id: '4', name: 'Mouse Sem Fio Ergonômico', stock: 40 },
  { id: '5', name: 'Cadeira Ergonômica Pro', stock: 5 },
];

const CUSTOMERS_DATA = [
  { id: '101', name: 'Empresa Alpha Ltda' },
  { id: '102', name: 'Tech Solutions S.A.' },
  { id: '103', name: 'João Silva ME' },
  { id: '104', name: 'Logística Brasil Eireli' },
];



export default function WithdrawalScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');

  // Limpa todos os campos do formulário
  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedCustomer(null);
    setQuantity('');
    setAddress('');
  };

  // Exibe o modal do formulário
  const handleOpenForm = () => {
    setModalVisible(true);
  };

  // reseta o formulário
  const handleCloseForm = () => {
    resetForm();
    setModalVisible(false);
  };


  
  // Validações
  const handleWithdrawalSubmit = () => {
    if (!selectedProduct) {
      Alert.alert('Validação', 'Por favor, selecione um produto disponível.');
      return;
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Validação', 'Insira uma quantidade válida superior a 0.');
      return;
    }

    if (parsedQuantity > selectedProduct.stock) {
      Alert.alert(
        'Estoque Insuficiente',
        `Quantidade solicitada (${parsedQuantity}) maior que a disponível (${selectedProduct.stock}).`
      );
      return;
    }

    if (!address.trim()) {
      Alert.alert('Validação', 'Por favor, insira o endereço de entrega/retirada.');
      return;
    }

    if (!selectedCustomer) {
      Alert.alert('Validação', 'Por favor, selecione um cliente.');
      return;
    }


    console.log('Saída de produto registrada com sucesso:', withdrawalPayload);

    Alert.alert('Sucesso', 'Saída de produto registrada com sucesso!', [
      { text: 'OK', onPress: handleCloseForm },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Painel de Estoque</Text>

        <TouchableOpacity style={styles.mainButton} onPress={handleOpenForm}>
          <Text style={styles.mainButtonText}>Saída de Produto</Text>
        </TouchableOpacity>
      </View>

      {/* Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar Saída de Produto</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Seletor Scrollável de Produtos */}
              <Text style={styles.label}>1. Selecione o Produto (Estoque):</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalList}
              >
                {PRODUCTS_DATA.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={[
                        styles.cardOption,
                        isSelected && styles.cardOptionSelected,
                      ]}
                      onPress={() => setSelectedProduct(product)}
                    >
                      <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                        {product.name}
                      </Text>
                      <Text style={styles.subText}>Estoque: {product.stock}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Input de Quantidade */}
              <Text style={styles.label}>2. Quantidade:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 5"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />

              {/* Input de Endereço */}
              <Text style={styles.label}>3. Endereço de Destino:</Text>
              <TextInput
                style={styles.input}
                placeholder="Rua, Número, Bairro, Cidade"
                value={address}
                onChangeText={setAddress}
              />

              {/* Seletor Scrollável de Clientes */}
              <Text style={styles.label}>4. Selecione o Cliente:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalList}
              >
                {CUSTOMERS_DATA.map((customer) => {
                  const isSelected = selectedCustomer?.id === customer.id;
                  return (
                    <TouchableOpacity
                      key={customer.id}
                      style={[
                        styles.cardOption,
                        isSelected && styles.cardOptionSelected,
                      ]}
                      onPress={() => setSelectedCustomer(customer)}
                    >
                      <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                        {customer.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Botões de Ação */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCloseForm}
                >
                  <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.submitButton]}
                  onPress={handleWithdrawalSubmit}
                >
                  <Text style={styles.actionButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  mainButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  mainButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#222',
  },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#444' },
  horizontalList: { marginBottom: 10, flexDirection: 'row' },
  cardOption: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 120,
  },
  cardOptionSelected: { backgroundColor: '#007AFF', borderColor: '#0056b3' },
  cardText: { fontSize: 14, color: '#333', fontWeight: '500' },
  cardTextSelected: { color: '#FFF' },
  subText: { fontSize: 11, color: '#666', marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#FF3B30', marginRight: 8 },
  submitButton: { backgroundColor: '#34C759', marginLeft: 8 },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});