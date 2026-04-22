import React, { createContext, useState, useContext } from 'react';

interface ClientData {
  nome: string;
  empresa: string;
  telefone: string;
}

interface Product {
  tipo: string;
  classificacao: string;
  embalagem: string;
  quantidade: string;
  valorUnidade: string;
  total: string;
}

interface SalesContextData {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (index: number) => void;
  clearSale: () => void;
  clientData: ClientData;
  setClientData: React.Dispatch<React.SetStateAction<ClientData>>;
  cartTotal: number;
}

export const SalesContext = createContext<SalesContextData | null>(null);

export const SalesProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [clientData, setClientData] = useState<ClientData>({
    nome: '',
    empresa: '',
    telefone: '',
  });

  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (indexToRemove: number) => {
    setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearSale = () => {
    setCart([]);
    setClientData({ nome: '', empresa: '', telefone: '' });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

  return (
    <SalesContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearSale,
      clientData,
      setClientData,
      cartTotal
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) throw new Error('useSales must be used within a SalesProvider');
  return context;
};
