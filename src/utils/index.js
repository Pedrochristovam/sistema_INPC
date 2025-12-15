export const createPageUrl = (pageName) => {
  const routes = {
    'INPCUpdate': '/inpc-update',
    'Home': '/'
  };
  // HashRouter adiciona # automaticamente, então não precisa incluir aqui
  return routes[pageName] || '/';
};

