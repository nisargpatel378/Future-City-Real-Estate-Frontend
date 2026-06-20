export const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatArea = (area) => `${area.toLocaleString()} sq.ft`;

export const getPropertyTypeColor = (type) => {
  const colors = { Residential: 'blue', Commercial: 'orange', Apartment: 'green', Villa: 'purple', Penthouse: 'gold', Office: 'cyan', Shop: 'magenta', Land: 'lime' };
  return colors[type] || 'default';
};

export const getPurposeColor = (purpose) => purpose === 'Sale' ? 'red' : 'blue';

export const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
