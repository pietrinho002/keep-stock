import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ModalFormulario from '../src/components/ModalFormulario';
import { alterarSenha, logout, usuarioLogado } from '../src/services/usuarios';

// Mesmos campos do formulário de troca de senha do sistema web
const CAMPOS_SENHA = [
  { nome: 'senha_atual', rotulo: 'Senha atual', tipo: 'senha' },
  { nome: 'nova_senha', rotulo: 'Nova senha', tipo: 'senha' },
  { nome: 'confirmar_senha', rotulo: 'Confirmar nova senha', tipo: 'senha' },
];

export default function SettingsScreen({navigation}) {
  const [darkMode, setDarkMode] =
    useState(true);

  const [notifications, setNotifications] =
    useState(true);

  const [usuario, setUsuario] = useState(null);
  const [modalSenha, setModalSenha] = useState(false);
  const [confirmacaoSair, setConfirmacaoSair] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        setUsuario(await usuarioLogado());
      }

      carregar();
    }, [])
  );

  async function trocarSenha(valores) {
    if (!usuario) {
      throw new Error('Nenhum usuário logado.');
    }

    await alterarSenha(
      usuario.id,
      valores.senha_atual,
      valores.nova_senha,
      valores.confirmar_senha
    );

    Alert.alert('Senha alterada', 'Sua senha foi atualizada com sucesso.');
  }

  async function executarLogout() {
    await logout();

    const raiz = navigation.getParent()?.getParent() || navigation.getParent() || navigation;
    raiz.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  function confirmarSaida() {
    setConfirmacaoSair(true);
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Configurações
        </Text>

        <Text style={styles.subtitle}>
          Gerencie preferências do sistema
        </Text>
      </View>

      {/* PERFIL */}

      <View style={styles.profileCard}>
        <Image
          source={require('../assets/image/giga.jpg')}
            style={styles.logo}
        />

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {usuario ? usuario.nome : 'Não identificado'}
          </Text>

          <Text style={styles.userRole}>
            Operador de Estoque
          </Text>

          <Text style={styles.userEmail}>
            {usuario ? usuario.email : '-'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setModalSenha(true)}
        >
          <Ionicons
            name="create-outline"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* PREFERÊNCIAS */}

      <Text style={styles.sectionTitle}>
        Preferências
      </Text>

      <View style={styles.optionCard}>
        <View style={styles.optionLeft}>
          <View style={styles.iconBlue}>
            <Ionicons
              name="moon-outline"
              size={22}
              color="#3B82F6"
            />
          </View>

          <View>
            <Text style={styles.optionTitle}>
              Modo Escuro
            </Text>

            <Text style={styles.optionSubtitle}>
              Tema visual do aplicativo
            </Text>
          </View>
        </View>

        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      <View style={styles.optionCard}>
        <View style={styles.optionLeft}>
          <View style={styles.iconGreen}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#22C55E"
            />
          </View>

          <View>
            <Text style={styles.optionTitle}>
              Notificações
            </Text>

            <Text style={styles.optionSubtitle}>
              Alertas do sistema
            </Text>
          </View>
        </View>

        <Switch
          value={notifications}
          onValueChange={setNotifications}
        />
      </View>

      {/* SEGURANÇA */}

      <Text style={styles.sectionTitle}>
        Conta e Segurança
      </Text>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => setModalSenha(true)}
      >
        <View style={styles.menuLeft}>
          <View style={styles.iconPurple}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#A855F7"
            />
          </View>

          <View>
            <Text style={styles.menuTitle}>
              Alterar Senha
            </Text>

            <Text style={styles.menuSubtitle}>
              Atualizar credenciais
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#94A3B8"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard}>
        <View style={styles.menuLeft}>
          <View style={styles.iconOrange}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#F97316"
            />
          </View>

          <View>
            <Text style={styles.menuTitle}>
              Privacidade
            </Text>

            <Text style={styles.menuSubtitle}>
              Configurações de acesso
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#94A3B8"
        />
      </TouchableOpacity>


      {/* LOGOUT */}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={confirmarSaida}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color="#fff"
        />

        <Text style={styles.logoutText}>
          Sair da Conta
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={confirmacaoSair}
        onRequestClose={() => setConfirmacaoSair(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconContainer}>
              <Ionicons
                name="log-out-outline"
                size={32}
                color="#fff"
              />
            </View>

            <Text style={styles.modalTitle}>Sair da conta</Text>
            <Text style={styles.modalText}>
              Você será redirecionado para a tela de login.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmacaoSair(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  setConfirmacaoSair(false);
                  await executarLogout();
                }}
              >
                <Text style={styles.confirmButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 50 }} />

      <ModalFormulario
        visivel={modalSenha}
        titulo="Alterar senha"
        campos={CAMPOS_SENHA}
        registro={null}
        onSalvar={trocarSenha}
        onFechar={() => setModalSenha(false)}
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
    marginTop: 55,
    marginBottom: 30,
  },

  title: {
    marginBottom: 30,
    color: '#000000',
    fontSize: 32,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#535a65',
    marginTop: 5,
    fontSize: 15,
  },

  profileCard: {
    backgroundColor: '#1f5751',
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 22,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 18,
  },

  userName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  userRole: {
    color: '#3B82F6',
    marginTop: 5,
    fontWeight: '600',
  },

  userEmail: {
    color: '#94A3B8',
    marginTop: 6,
    fontSize: 14,
  },

  editButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#053d38',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 35,
    marginBottom: 18,
  },

  optionCard: {
    backgroundColor: '#1f5751',
    borderRadius: 22,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  optionSubtitle: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 13,
  },

  menuCard: {
    backgroundColor: '#1f5751',
    borderRadius: 22,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  menuSubtitle: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 13,
  },

  iconBlue: {
    width: 50,
    height: 50,
    backgroundColor: '#1f5751',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  iconGreen: {
    width: 50,
    height: 50,
    backgroundColor: '#052E16',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  iconPurple: {
    width: 50,
    height: 50,
    backgroundColor: '#3B0764',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  iconOrange: {
    width: 50,
    height: 50,
    backgroundColor: '#431407',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  iconRed: {
    width: 50,
    height: 50,
    backgroundColor: '#450A0A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  logoutButton: {
    backgroundColor: '#DC2626',
    height: 65,
    borderRadius: 22,
    marginTop: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  logo: {
    borderRadius: 28,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '85%',
    backgroundColor: '#1f5751',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },

  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B0764',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  modalText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },

  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#DC2626',
  },

  confirmButton: {
    backgroundColor: '#3B82F6',
  },

  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});