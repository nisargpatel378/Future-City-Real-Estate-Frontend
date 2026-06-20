import { createContext, useContext, useState } from 'react';
import { message } from 'antd';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (property) => {
    if (compareList.find(p => p.id === property.id)) {
      message.info('Property already in comparison list');
      return;
    }
    if (compareList.length >= 4) {
      message.warning('You can compare up to 4 properties');
      return;
    }
    setCompareList(prev => [...prev, property]);
    message.success('Added to comparison');
  };

  const removeFromCompare = (id) => setCompareList(prev => prev.filter(p => p.id !== id));
  const clearCompare = () => setCompareList([]);
  const isInCompare = (id) => compareList.some(p => p.id === id);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
