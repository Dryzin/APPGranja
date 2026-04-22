import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SignatureScreen from 'react-native-signature-canvas';
import { useSales } from '../src/context/SalesContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, cartTotal, clientData, clearSale } = useSales();
  const ref = useRef<any>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const [authMethod, setAuthMethod] = useState<'signature' | 'facial'>('signature');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const bgStyle = `.m-signature-pad {box-shadow: none; border: none; margin: 0; padding: 0;} 
                   .m-signature-pad--body {border: none;}
                   .m-signature-pad--footer {display: none;}
                   body,html {width: 100%; height: 100%; background-color: #fff; border-radius: 8px;}`;

  const handleFinalSubmission = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Venda Concluída!',
        'A venda e confirmação foram salvas com sucesso e enviadas para o servidor.',
        [
          {
            text: 'OK', onPress: () => {
              clearSale();
              router.replace('/');
            }
          }
        ]
      );
    }, 1500);
  };

  const handleSignature = (signature: string) => {
    handleFinalSubmission();
  };

  const handleEmpty = () => {
    Alert.alert('Assinatura Obrigatória', 'O cliente precisa assinar antes de concluir a venda.');
  };

  const submitSale = () => {
    if (authMethod === 'signature') {
      if (ref.current) {
        ref.current.readSignature();
      }
    } else {
      if (!photoUri) {
        return Alert.alert('Atenção', 'Você precisa tirar uma selfie para validação facial antes de finalizar.');
      }
      handleFinalSubmission();
    }
  };

  const clearSignature = () => {
    if (ref.current) {
      ref.current.clearSignature();
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permissão negada', 'O aplicativo precisa de permissão da câmera para ler imagens.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Banner Superior Compacto */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Assinatura</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.receiptCard}>
          <Text style={styles.receiptHeader}>NOTA DE VENDA</Text>

          <View style={styles.clientInfo}>
            <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Cliente:</Text> {clientData.nome || 'N/A'}</Text>
            <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Empresa:</Text> {clientData.empresa || 'N/A'}</Text>
            <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Telefone:</Text> {clientData.telefone || 'N/A'}</Text>
          </View>

          <View style={styles.divider} />

          {cart.map((item, idx) => (
            <View key={idx} style={styles.receiptItem}>
              <View style={styles.itemMain}>
                <Text style={styles.receiptItemQty}>{item.quantidade}x</Text>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.receiptItemName}>{item.tipo} - {item.classificacao}</Text>
                  <Text style={styles.receiptItemDesc}>{item.embalagem} (R$ {item.valorUnidade}/un)</Text>
                </View>
              </View>
              <Text style={styles.receiptItemTotal}>R$ {item.total}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>TOTAL A PAGAR</Text>
            <Text style={styles.totalValue}>R$ {cartTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Confirmação</Text>

          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[styles.authToggleBtn, authMethod === 'signature' && styles.authToggleBtnActive]}
              onPress={() => setAuthMethod('signature')}
            >
              <FontAwesome5 name="pen-nib" size={14} color={authMethod === 'signature' ? '#3d4d2d' : '#888'} />
              <Text style={[styles.authToggleText, authMethod === 'signature' && styles.authToggleTextActive]}> Assinatura</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authToggleBtn, authMethod === 'facial' && styles.authToggleBtnActive]}
              onPress={() => setAuthMethod('facial')}
            >
              <FontAwesome5 name="camera" size={14} color={authMethod === 'facial' ? '#3d4d2d' : '#888'} />
              <Text style={[styles.authToggleText, authMethod === 'facial' && styles.authToggleTextActive]}> Selfie Retrato</Text>
            </TouchableOpacity>
          </View>

          {authMethod === 'signature' ? (
            <>
              <View style={styles.signatureContainer}>
                <SignatureScreen
                  ref={ref}
                  onEnd={() => setScrollEnabled(true)}
                  onBegin={() => setScrollEnabled(false)}
                  onOK={handleSignature}
                  onEmpty={handleEmpty}
                  descriptionText="Assine aqui"
                  clearText="Limpar"
                  confirmText="Salvar"
                  webStyle={bgStyle}
                  backgroundColor="#fff"
                />
              </View>
              <TouchableOpacity style={styles.clearSignBtn} onPress={clearSignature}>
                <FontAwesome5 name="eraser" size={14} color="#666" />
                <Text style={styles.clearSignText}>Limpar assinatura</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.photoContainer}>
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.retakeBtn} onPress={openCamera}>
                    <FontAwesome5 name="redo" size={14} color="#5b8c51" />
                    <Text style={styles.retakeText}>Tirar novamente</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.takePhotoBtn} onPress={openCamera}>
                  <FontAwesome5 name="camera" size={36} color="#5b8c51" style={{ marginBottom: 10 }} />
                  <Text style={styles.takePhotoText}>Toque para abrir a câmera</Text>
                  <Text style={styles.takePhotoSubText}>e tirar uma selfie</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
          onPress={submitSale}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="large" color="#3d4d2d" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Finalizar Venda</Text>
              <FontAwesome5 name="check-double" size={18} color="#3d4d2d" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Menu Inferior 3 itens */}
      <View style={[styles.bottomNavContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <FontAwesome5 name="clipboard-list" size={22} color="#a79c8b" />
          <Text style={styles.navItemText}>Pedido</Text>
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
          <FontAwesome5 name="check-circle" size={24} color="#5b8c51" />
          <Text style={[styles.navItemText, { color: '#5b8c51', fontWeight: 'bold' }]}>Finalizar</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fffef0',
  },
  scrollContent: {
    padding: 20,
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 24,
  },
  receiptHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
    letterSpacing: 1,
  },
  clientInfo: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  receiptItemQty: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d4d2d',
    marginRight: 10,
    width: 25,
  },
  receiptItemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptItemDesc: {
    fontSize: 13,
    color: '#888',
  },
  receiptItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5b8c51',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5b8c51',
  },
  signatureSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c5f3a',
    marginBottom: 12,
  },
  authToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  authToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  authToggleBtnActive: {
    backgroundColor: '#fef200',
  },
  authToggleText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#888',
  },
  authToggleTextActive: {
    color: '#3d4d2d',
  },
  signatureContainer: {
    height: 200,
    borderWidth: 2,
    borderColor: '#5b8c51',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  clearSignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  clearSignText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  takePhotoBtn: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#5b8c51',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f0f5ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  takePhotoText: {
    color: '#5b8c51',
    fontSize: 16,
    fontWeight: 'bold',
  },
  takePhotoSubText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
  },
  retakeText: {
    color: '#5b8c51',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  confirmButton: {
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
  confirmButtonDisabled: {
    backgroundColor: '#ffe2aa',
  },
  confirmButtonText: {
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
