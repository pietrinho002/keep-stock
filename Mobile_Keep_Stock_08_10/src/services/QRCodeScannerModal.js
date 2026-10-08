import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import QRCodeScannerModal from '../components/QRCodeScannerModal';
import api from '../services/api'; // Certifique-se de ajustar a rota da sua API caso necessário

export default function EntryScreen() {
  const [produto, setProduto] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Função disparada assim que o QR Code é lido pela câmera
  const handleReadQRCode = async (data) => {
    setIsScannerOpen(false); // Fecha a câmera
    try {
      // Faz a requisição na sua rota existente
      const response = await api.get(`/Produtos/code/${data}`);
      setProduto(response.data); // Preenche a tela com os dados retornados
    } catch (error) {
      Alert.alert('Erro', 'Produto não encontrado no banco.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Botão que ativa o leitor */}
      <TouchableOpacity onPress={() => setIsScannerOpen(true)}>
        <Text>Escanear QR Code</Text>
      </TouchableOpacity>

      {/* Exibe o produto caso tenha sido encontrado */}
      {produto && (
        <View style={{ marginTop: 20 }}>
          <Text>Produto: {produto.nome || JSON.stringify(produto)}</Text>
        </View>
      )}

      {/* Modal da Câmera inserido na tela */}
      <QRCodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onReadCode={handleReadQRCode}
      />
    </View>
  );
}