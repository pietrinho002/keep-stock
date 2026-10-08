import React, { useEffect } from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createDrawerNavigator,
} from '@react-navigation/drawer';

import { Ionicons } from '@expo/vector-icons';

import { logout } from '../services/usuarios';

/* TELAS */


import LoginScreen from '../../screens/LoginScreen';
import CadastroScreen from '../../screens/CadastroScreen';
import HomeScreen from '../../screens/HomeScreen';
import ProductsScreen from '../../screens/ProductsScreen';
import PedidosScreen from '../../screens/PedidosScreen';
import FornecedoresScreen from '../../screens/FornecedoresScreen';
import ClientesScreen from '../../screens/ClientesScreen';
import EntryScreen from '../../screens/EntryScreen';
import ExitScreen from '../../screens/ExitScreen';
import SettingsScreen from '../../screens/SettingsScreen';

//saida do sistema, limpa a sessão e redireciona para a tela de login

function SairScreen({ navigation }) {
  //useEffect é utilizado para disparar a função de encerramento de sessão automaticamente
  //assim que a tela é montada na memória.
  useEffect(() => {
    async function sair() {
      try {
        await logout();//limpa a sessão do usuário no backend
      } finally {
        navigation.reset({
          index: 0,//limpa o histórico de navegação para que o usuário não possa voltar para a tela anterior
          routes: [{ name: 'Login' }],//redireciona para a tela de login
        });
      }
    }

    sair();
  }, [navigation]);

  return null;
}

/* NAVIGATORS */

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const Drawer = createDrawerNavigator();

/* BOTTOM TABS */

function BottomRoutes() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 8,
          paddingTop: 5,
        },

        tabBarActiveTintColor: '#24b364',

        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      {/* HOME */}

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />




    </Tab.Navigator>
  );
}

/* DRAWER */

function DrawerRoutes() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E293B',
        },

        headerTintColor: '#fff',

        drawerStyle: {
          backgroundColor: '#053d38',
          width: 280,
        },

        drawerActiveBackgroundColor:
          '#CBD5E1',


        drawerActiveTintColor: '#0C816A',

        drawerInactiveTintColor:
          '#CBD5E1',




        drawerLabelStyle: {
          marginLeft: -10,
          fontSize: 15,
        },
      }}
    >
      {/* INÍCIO */}

      <Drawer.Screen
        name="Início"
        component={BottomRoutes}
        options={{
          drawerIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PRODUTOS */}

      <Drawer.Screen
        name="Produtos"
        component={ProductsScreen}
        options={{
          drawerIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="cube-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PEDIDOS */}

      <Drawer.Screen
        name="Pedidos"
        component={PedidosScreen}
        options={{
          drawerIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="cart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* FORNECEDORES */}

      <Drawer.Screen
        name="Fornecedores"
        component={FornecedoresScreen}
        options={{
          drawerIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="business-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* CLIENTES */}

      <Drawer.Screen
        name="Clientes"
        component={ClientesScreen}
        options={{
          drawerIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="people-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ENTRADA */}

      <Drawer.Screen
        name="Entrada"
        component={EntryScreen}
        options={{
          drawerIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="arrow-down-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* SAÍDA */}

      <Drawer.Screen
        name="Saída"
        component={ExitScreen}
        options={{
          drawerIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="arrow-up-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* CONFIGURAÇÕES */}

      <Drawer.Screen
        name="Configurações"
        component={SettingsScreen}
        options={{
          drawerIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Sair"
        component={SairScreen}
        options={{
          drawerLabel: 'Sair',
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="log-out-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}



/* ROTAS PRINCIPAIS */

export default function Routes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* LOGIN */}

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      {/* CADASTRO */}

      <Stack.Screen
        name="Cadastro"
        component={CadastroScreen}
      />

      {/* APP */}

      <Stack.Screen
        name="App"
        component={DrawerRoutes}
      />
    </Stack.Navigator>
  );
}
