import React from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function FornecedorScreen({ navigation }) {
    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >

            <View style={styles.begin
            }>
                <View>
                    <Text style={styles.updatrequest}>
                        Pedidos Realizados
                    </Text>
                </View>
            
                <Image
                    source={require('../assets/image/Keep.jpg')} 
                    style={styles.logo}
                />

            </View>

            <View style={styles.bodycard}>
                <View style={styles.cardtitle}>
                    <Text style={styles.titleCard}>
                        Pedidos: 
                    </Text>
                </View>

            <View style={styles.pedidosList}>     

                <View style={styles.imagePosition}>
                    <Image
                        source={require('../assets/image/perfil.png')}
                        style={styles.perfil}
                    /> 
                </View> 
            
                    <View style={styles.ContentList}>
                        <Text style={styles.balanceLabel}>
                        Pedido #001
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Nome: Santa casa
                        </Text>
                        <Text style={styles.balanceLabel}>
                            telefone: (**) *****-****
                        </Text>
                        <Text style={styles.balanceLabel}>
                            email:  ********@gmail.com
                        </Text>
                        <Text style={styles.balanceLabel}>
                            produto: ibruprofeno 600mg
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Status: Aguardando
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Data: 01/10/2026
                        </Text>
                    </View>
                



                    
            </View>
                

                <View style={styles.pedidosList}>

                    <View style={styles.imagePosition}>
                        <Image
                            source={require('../assets/image/perfil.png')}
                            style={styles.perfil}
                        />  
                    </View>

                    
                    <View style={styles.ContentList}>
                        <Text style={styles.balanceLabel}>
                        Pedido #002
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Nome:  Drogaria Vida Nova
                        </Text>
                        <Text style={styles.balanceLabel}>
                            telefone: (**) *****-****
                        </Text>
                        <Text style={styles.balanceLabel}>
                            email:  ********@gmail.com
                        </Text>
                        <Text style={styles.balanceLabel}>
                            produto: Paracetamol 500mg
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Status: Entregue
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Data: 04/02/2026
                        </Text>
                    </View>

                  

                </View>

                <View style={styles.pedidosList}>

                    <View style={styles.imagePosition}>
                        <Image
                            source={require('../assets/image/perfil.png')}
                            style={styles.perfil}
                        />  
                    </View>



                    
                    <View style={styles.ContentList}>
                        <Text style={styles.balanceLabel}>
                        Pedido #003
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Nome: Droga raia
                        </Text>
                        <Text style={styles.balanceLabel}>
                            telefone: (**) *****-****
                        </Text>
                        <Text style={styles.balanceLabel}>
                            email:  ********@gmail.com
                        </Text>
                        <Text style={styles.balanceLabel}>
                            produto: dorflex 500mg
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Status:Prepara para SaÃ­da
                        </Text>
                        <Text style={styles.balanceLabel}>
                            Data: 17/06/2026
                        </Text>
                    </View>

                </View>
            </View>
    
            


            

            


        </ScrollView>
    )
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dae0e8',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 70,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  perfil: {
    marginLeft: 50,
    marginTop: 10,
    width: 80,
    height: 60,
    resizeMode: 'contain',
    
  },

  begin: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  allPosition: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  updatrequest: {
    color: '#141a2c',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 3,
  },
  pedidosList: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
  },
 
  ContentList: {
    width: 200,
    gap: 3,
  },
  imagePosition: {
    marginLeft: -50,

  },

  InfoList: {
    color: '#000000',
    marginBottom: 15,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    width: 200,
    backgroundColor: '#10b5ac',
    padding: 12,
    borderRadius: 15,
  },

  infoposition: {
    width: 270,
    alignItems: 'flex-end',
  },

  buttonTitle: {
    color: '#120c0c',
    fontSize: 16,
    
  },
});


