// Reverse lookup: product_id (DB) -> product name
// Derived from PRODUCT_ID_MAP in BuildOrderScreen.tsx
const PRODUCT_ID_TO_NAME: Record<number, string> = {
  // Perros calientes (normal y mini comparten IDs por sucursal)
  256: 'Perro Caliente',
  257: 'Perro Caliente',
  258: 'Perro Caliente',
  259: 'Perro Caliente',
  260: 'Perro Caliente',
  261: 'Perro Caliente',
  // Salchipapas
  262: 'Salchipapa',
  263: 'Salchipapa',
  264: 'Salchipapa',
  265: 'Salchipapa',
  266: 'Salchipapa',
  267: 'Salchipapa',
  // Hamburguesas
  268: 'Hamburguesa',
  269: 'Hamburguesa',
  270: 'Hamburguesa',
  271: 'Hamburguesa',
  // Coca Cola Personal
  272: 'Coca Cola Personal',
  273: 'Coca Cola Personal',
  274: 'Coca Cola Personal',
  275: 'Coca Cola Personal',
  276: 'Coca Cola Personal',
  277: 'Coca Cola Personal',
  // Coca Cola 1L
  278: 'Coca Cola 1L',
  279: 'Coca Cola 1L',
  280: 'Coca Cola 1L',
  281: 'Coca Cola 1L',
  282: 'Coca Cola 1L',
  283: 'Coca Cola 1L',
  // Coca Cola 2L
  284: 'Coca Cola 2L',
  285: 'Coca Cola 2L',
  286: 'Coca Cola 2L',
  287: 'Coca Cola 2L',
  288: 'Coca Cola 2L',
  289: 'Coca Cola 2L',
  // Agua Mineral
  290: 'Agua Mineral',
  291: 'Agua Mineral',
  292: 'Agua Mineral',
  293: 'Agua Mineral',
  294: 'Agua Mineral',
  295: 'Agua Mineral',
  // Nestea
  296: 'Nestea',
  297: 'Nestea',
  298: 'Nestea',
  299: 'Nestea',
};

export function getProductName(productId: number): string | undefined {
  return PRODUCT_ID_TO_NAME[productId];
}
