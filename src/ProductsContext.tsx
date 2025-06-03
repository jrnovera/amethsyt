import React, { createContext, useContext, useState } from 'react';

const ProductsContext = createContext({
  selectedProduct: null,
  setSelectedProduct: (_: any) => {},
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  return (
    <ProductsContext.Provider value={{ selectedProduct, setSelectedProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
