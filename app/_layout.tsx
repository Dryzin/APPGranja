import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SalesProvider } from '../src/context/SalesContext';

export default function RootLayout() {
  return (
    <SalesProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: '#5b8c51' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Catálogo de Vendas' }} />
        <Stack.Screen name="cart" options={{ title: 'Resumo do Pedido' }} />
        <Stack.Screen name="checkout" options={{ title: 'Assinatura e Conclusão' }} />
      </Stack>
      <StatusBar style="light" />
    </SalesProvider>
  );
}
