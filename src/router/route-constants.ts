export const routeNames = {
  login: Symbol('Login route'),
  home: Symbol('Home route'),
  tokens: Symbol('Tokens route'),
  results: Symbol('Results route'),
} as const;

export const routeQueryFields = {
  loginRedirect: 'r',
};
