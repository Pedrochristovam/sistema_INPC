export function cn(...inputs) {
  const classes = inputs
    .filter(Boolean)
    .flat()
    .map((cls) => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
  
  return classes;
}




