export const generateRandomOrders = (count = 30) => {
    return Array.from({ length: count }, (_, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      orderNumber: `SO-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customer: `Cliente ${String.fromCharCode(65 + (index % 26))}${Math.floor(index / 26) + 1}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: Number((Math.random() * 10000).toFixed(2))
    }));
  };
  
  export const sortOrders = (items, config) => {
    if (!config.key) return items;
    
    return [...items].sort((a, b) => {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'ascending' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };
  