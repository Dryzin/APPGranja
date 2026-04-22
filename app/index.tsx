import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSales } from '../src/context/SalesContext';

const { width } = Dimensions.get('window');

const TIPOS_OVOS = [
  { nome: 'Branco', iconUrl: 'egg', color: '#ffecb3', iconColor: '#d4a11c' },
  { nome: 'Vermelho', iconUrl: 'egg', color: '#f8d1c1', iconColor: '#c5521b' },
  { nome: 'Codorna', iconUrl: 'egg', color: '#e0d6c8', iconColor: '#8a6e45' }
];

const CLASSIFICACOES = ['Jumbo', 'Extra', 'Grande', 'Médio', 'Pequeno', 'Tipo 1'];
const EMBALAGENS = [
  { nome: 'Caixa 30dz', icon: 'box' },
  { nome: 'Estojo Grande', icon: 'box-open' },
  { nome: 'Estojo Pequeno', icon: 'archive' },
  { nome: 'Bandeja', icon: 'layer-group' }
];

export default function CatalogScreen() {
  const router = useRouter();
  const { cart, addToCart, cartTotal } = useSales();
  const insets = useSafeAreaInsets();

  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [embalagem, setEmbalagem] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [valorUnidade, setValorUnidade] = useState('');
  const [valorTotalStr, setValorTotalStr] = useState('');
  const [showTotalInput, setShowTotalInput] = useState(false);

  useEffect(() => {
    const qty = parseInt(quantidade, 10);
    const unit = parseFloat(valorUnidade.replace(',', '.'));
    if (!isNaN(qty) && !isNaN(unit)) {
      setValorTotalStr((unit * qty).toFixed(2));
    }
  }, [quantidade]);

  const handleChangeUnidade = (text: string) => {
    setValorUnidade(text);
    const unit = parseFloat(text.replace(',', '.'));
    const qty = parseInt(quantidade, 10);
    if (!isNaN(unit) && !isNaN(qty)) {
      setValorTotalStr((unit * qty).toFixed(2));
    } else {
      setValorTotalStr('');
    }
  };

  const handleChangeTotal = (text: string) => {
    setValorTotalStr(text);
    const total = parseFloat(text.replace(',', '.'));
    const qty = parseInt(quantidade, 10);
    if (!isNaN(total) && !isNaN(qty) && qty > 0) {
      setValorUnidade((total / qty).toFixed(2));
    } else {
      setValorUnidade('');
    }
  };

  const handleAddToCart = () => {
    if (!tipoSelecionado || !classificacao || !embalagem || !quantidade || !valorUnidade) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos do produto antes de adicionar.');
      return;
    }

    const price = parseFloat(valorUnidade.replace(',', '.'));
    const qty = parseInt(quantidade, 10);

    if (isNaN(price) || isNaN(qty)) {
      Alert.alert('Erro', 'Quantidade ou Valor inválidos.');
      return;
    }

    const totalItem = (price * qty).toFixed(2);

    addToCart({
      tipo: tipoSelecionado,
      classificacao,
      embalagem,
      quantidade: quantidade,
      valorUnidade: price.toFixed(2),
      total: totalItem,
    });

    setTipoSelecionado('');
    setClassificacao('');
    setEmbalagem('');
    setQuantidade('1');
    setValorUnidade('');
    setValorTotalStr('');
    setShowTotalInput(false);
    Alert.alert('Sucesso', 'Produto adicionado ao pedido.');
  };

  const renderOvosSquares = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. Tipo de Ovo</Text>
      <View style={styles.gridContainerSq}>
        {TIPOS_OVOS.map((ovo) => (
          <TouchableOpacity
            key={ovo.nome}
            style={[
              styles.squareButton,
              { backgroundColor: tipoSelecionado === ovo.nome ? '#5b8c51' : ovo.color }
            ]}
            onPress={() => setTipoSelecionado(ovo.nome)}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name={ovo.iconUrl as any} size={28} color={tipoSelecionado === ovo.nome ? '#5b8c51' : ovo.iconColor} />
            </View>
            <Text style={[styles.squareText, tipoSelecionado === ovo.nome && styles.squareTextActive]}>{ovo.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSelectorGrid = (title: string, options: string[], selected: string, setSelected: (val: string) => void) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.gridContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.gridOptionButton, selected === opt && styles.gridOptionButtonActive]}
            onPress={() => setSelected(opt)}
          >
            <Text style={[styles.optionText, selected === opt && styles.optionTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPackagingGrid = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. Tipo de Embalagem</Text>
      <View style={styles.gridContainer}>
        {EMBALAGENS.map((emb) => (
          <TouchableOpacity
            key={emb.nome}
            style={[styles.gridOptionButtonPill, embalagem === emb.nome && styles.gridOptionButtonPillActive]}
            onPress={() => setEmbalagem(emb.nome)}
          >
            <FontAwesome5 name={emb.icon as any} size={16} color={embalagem === emb.nome ? '#fff' : '#627a4e'} style={{ marginRight: 8 }} />
            <Text style={[styles.optionText, embalagem === emb.nome && styles.optionTextActive]}>{emb.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Banner Superior Compacto */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Novo Pedido</Text>
          <View style={styles.miniCartPill}>
            <FontAwesome5 name="shopping-basket" size={14} color="#3d4d2d" style={{ marginRight: 6 }} />
            <Text style={styles.miniCartText}>R$ {cartTotal.toFixed(2)}</Text>
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

            {renderOvosSquares()}
            {renderSelectorGrid('2. Classificação/Tamanho', CLASSIFICACOES, classificacao, setClassificacao)}
            {renderPackagingGrid()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Quantidade</Text>
              <TextInput
                style={styles.textInputFull}
                keyboardType="number-pad"
                value={quantidade}
                onChangeText={setQuantidade}
                placeholder="Ex: 3"
              />
            </View>

            <View style={styles.inputsRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.sectionTitle}>5. Valor Unit.</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={valorUnidade}
                  onChangeText={handleChangeUnidade}
                  placeholder="R$:0.00"
                />
              </View>
              <View style={[styles.inputContainer, { marginLeft: 15 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: showTotalInput ? 10 : 0, marginTop: showTotalInput ? 0 : 25 }}>
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                    {showTotalInput ? 'Valor Total (R$)' : ''}
                  </Text>
                  {!showTotalInput && (
                    <TouchableOpacity onPress={() => setShowTotalInput(true)} style={styles.iconToggle}>
                      <FontAwesome5 name="calculator" size={14} color="#5b8c51" />
                      <Text style={styles.iconToggleText}>Soma Total?</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {showTotalInput && (
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={styles.textInputTotal}
                      keyboardType="decimal-pad"
                      value={valorTotalStr}
                      onChangeText={handleChangeTotal}
                      placeholder="0.00"
                    />
                    <TouchableOpacity
                      onPress={() => { setShowTotalInput(false); setValorTotalStr(''); }}
                      style={styles.closeIconToggle}
                    >
                      <FontAwesome5 name="times" size={16} color="#999" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
              <Text style={styles.addButtonText}>Adicionar ao Pedido</Text>
            </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Menu Inferior Curvado com 3 itens */}
      <View style={[styles.bottomNavContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <FontAwesome5 name="clipboard-list" size={22} color="#5b8c51" />
          <Text style={[styles.navItemText, { color: '#5b8c51', fontWeight: 'bold' }]}>Pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navActionBtn} onPress={() => router.push('/cart')}>
          <View style={[styles.navActionCircle, { backgroundColor: '#a79c8b' }]}>
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
    backgroundColor: '#5b8c51', // Primary Green
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
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d4d2d',
    borderRadius: 20,
    height: 30,
    paddingHorizontal: 5,
    position: 'relative',
    overflow: 'hidden'
  },
  progressBarFill: {
    backgroundColor: '#fef200',
    height: 20,
    borderRadius: 15,
    position: 'absolute',
    left: 5,
    top: 5,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3d4d2d',
    position: 'absolute',
    right: 15,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4c5f3a',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4c5f3a',
    marginBottom: 12,
  },
  gridContainerSq: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  squareButton: {
    flex: 1,
    height: 110,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  squareText: {
    color: '#3d4d2d',
    fontWeight: 'bold',
    fontSize: 14,
  },
  squareTextActive: {
    color: '#fffef0',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridOptionButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: '30%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gridOptionButtonActive: {
    backgroundColor: '#627a4e',
  },
  gridOptionButtonPill: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gridOptionButtonPillActive: {
    backgroundColor: '#5b8c51',
  },
  optionText: {
    color: '#627a4e',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fffef0',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  textInputTotal: {
    backgroundColor: '#fef200',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: '#3d4d2d',
    fontWeight: 'bold',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textInputFull: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  iconToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F0E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  iconToggleText: {
    color: '#5b8c51',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 13,
  },
  closeIconToggle: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 2,
  },
  addButton: {
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
  addButtonText: {
    color: '#3d4d2d',
    fontSize: 18,
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
    backgroundColor: '#5b8c51',
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
