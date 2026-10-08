import React, { useState } from 'react';

import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';

export default function Userconfig({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');


  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.maintittle}>
                Perfil
            </Text>
        <View style={styles.card2}>
            

            <View>
              <Image
                source={require('../assets/image/giga.jpg')}
                style={styles.logo}
              />

              <Text style={styles.textin}>
                {(nome || "nome")}
              </Text>

              <Text style={styles.textin}>
                {(email || "*****@gmail.com")}
              </Text>
            </View>
        </View>




      <View style={styles.card2}>
        <Text style={styles.heading}>Mudança de Dados</Text>

        <Text style={styles.subtittle}>Nome</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite o nome"
                placeholderTextColor="#94A3B8"
                value={nome}
                onChangeText={setNome}>
            </TextInput>

            <Text style={styles.subtittle}>Nome</Text>

            <TextInput
                style={styles.input}
                placeholder="Digite o nome"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail }>
            </TextInput>
          
      </View>
    </ScrollView>
  );
}

export const styles = StyleSheet.create({
    maintittle: {

        fontWeight: 'bold', 
        fontSize: 25,
        marginLeft: 240,
        marginBottom: 30
    },
    card2: {
        backgroundColor: '#1f5751',
        marginTop: 20,
        borderRadius: 10,
        padding: 20,
        borderRadius: 20
    },
  container: { 
    padding: 20 
},
  heading: { 
    fontSize: 25, 
    fontWeight: 'bold', 
    marginTop: 25,
    marginBottom: 20, 
    marginLeft: 150,
    color: '#fff' 
},
  subtittle: { 
    color: '#94A3B8', 
    marginBottom: 6 
},
  input: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    color: '#000',
    marginBottom: 12,
  },
  textin: {
    padding: 15,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    color: '#000',
    marginBottom: 12,
  },
  note: { 
    color: '#94A3B8' 
},
  logo: {
    width: 100,
    height: 100,
    borderRadius: 28,
    marginBottom: 12,
  },
});



