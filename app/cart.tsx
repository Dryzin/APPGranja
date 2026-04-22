import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useSales } from '../src/context/SalesContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CLIENTES_CADASTRADOS = [
  { nome: 'João da Padaria', empresa: 'Padaria Pão Quente', telefone: '11999990000' },
  { nome: 'Mercadinho Silva', empresa: 'Silva Mercearia Ltda', telefone: '11988887777' },
  { nome: 'Restaurante Sabor', empresa: 'Sabor da Vila', telefone: '11977776666' }
];

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, cartTotal, clientData, setClientData } = useSales();
  const insets = useSafeAreaInsets();

  const handleProceed = () => {
    if (!clientData.nome || !clientData.empresa) {
      Alert.alert('Atenção', 'Por favor, preencha pelo menos o Nome e a Empresa do cliente.');
      return;
    }
    router.push('/checkout');
  };

  const selecionarCliente = (cliente: typeof CLIENTES_CADASTRADOS[0]) => {
    setClientData({
      nome: cliente.nome,
      empresa: cliente.empresa,
      telefone: cliente.telefone
    });
    router.push('/checkout');
  };

  return (
    <View style={styles.container}>
      {/* Banner Superior Compacto */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Resumo do Pedido</Text>
          <View style={styles.miniCartPill}>
             <FontAwesome5 name="shopping-cart" size={14} color="#3d4d2d" style={{marginRight: 6}} />
             <Text style={styles.miniCartText}>{cart.length} itens</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}>

            <View style={styles.section}>
              {cart.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum item adicionado ao pedido ainda.</Text>
              ) : (
                <View style={styles.card}>
                  {cart.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>{item.quantidade}x {item.embalagem}</Text>
                        <Text style={styles.itemSubtitle}>{item.tipo} - {item.classificacao}</Text>
                        <Text style={styles.itemUnit}>R$ {item.valorUnidade} / un</Text>
                      </View>
                      <View style={styles.itemAction}>
                        <Text style={styles.itemTotal}>R$ {item.total}</Text>
                        <TouchableOpacity onPress={() => removeFromCart(index)} style={styles.removeBtn}>
                          <FontAwesome5 name="trash" size={16} color="#DC3545" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Geral:</Text>
                    <Text style={styles.totalValue}>R$ {cartTotal.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados do Cliente</Text>
              
              <Text style={styles.hintText}>Clientes Anteriores:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientesContainer}>
                {CLIENTES_CADASTRADOS.map((cli, idx) => (
                  <TouchableOpacity key={idx} style={styles.clientePill} onPress={() => selecionarCliente(cli)}>
                    <Text style={styles.clientePillText}>{cli.empresa}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.card}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nome do responsável"
                  value={clientData.nome}
                  onChangeText={(text) => setClientData(prev => ({ ...prev, nome: text }))}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Empresa / Razão Social"
                  value={clientData.empresa}
                  onChangeText={(text) => setClientData(prev => ({ ...prev, empresa: text }))}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Telefone de contato"
                  keyboardType="phone-pad"
                  value={clientData.telefone}
                  onChangeText={(text) => setClientData(prev => ({ ...prev, telefone: text }))}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
              <Text style={styles.proceedButtonText}>Avançar para Assinatura</Text>
              <FontAwesome5 name="arrow-right" size={16} color="#3d4d2d" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Menu Inferior Curvado com 3 itens */}
      <View style={[styles.bottomNavContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <FontAwesome5 name="clipboard-list" size={22} color="#a79c8b" />
          <Text style={styles.navItemText}>Pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navActionBtn} onPress={() => router.push('/cart')}>
          <View style={[styles.navActionCircle, { backgroundColor: '#5b8c51' }]}>
            <FontAwesome5 name="shopping-cart" size={22} color="#fffef0" />
            {cart.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cart.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/checkout')}>
          <FontAwesome5 name="check-circle" size={22} color="#a79c8b" />
          <Text style={styles.navItemText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: '#5b8c51',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingHorizontal: 20,
    paddingBottom: 25, 
    position: 'relative',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fffef0',
  },
  miniCartPill: {
    backgroundColor: '#fef200',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  miniCartText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3d4d2d',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c5f3a',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  clientesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  clientePill: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  clientePillText: {
    color: '#5b8c51',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4d2d',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemAction: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5b8c51',
  },
  removeBtn: {
    marginTop: 10,
    padding: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4d2d',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5b8c51',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  proceedButton: {
    backgroundColor: '#fef200',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 30,
    marginTop: 10,
    shadowColor: '#fef200',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    color: '#3d4d2d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e6efe3',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 60,
  },
  navItemText: {
    fontSize: 12,
    color: '#a79c8b',
    marginTop: 4,
  },
  navActionBtn: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navActionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5b8c51',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fef200',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#3d4d2d',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});
