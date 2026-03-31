/**
 * Test data for US1: Order different products with different shipping methods
 */

export interface Product {
  name: string;
  category: string;
  price: number;
}

export interface ShippingMethod {
  name: string;
  fee: number;
  estimatedDays: string;
}

export interface OrderScenario {
  products: Product[];
  product: Product;
  shippingMethod: ShippingMethod;
  expectedTotal: number;
}

// Product catalog (sample nopcommerce products)
export const PRODUCTS: Record<string, Product> = {
  LAPTOP: {
    name: 'Lenovo IdeaPad',
    category: 'Computers',
    price: 1360.0,
  },
  PHONE: {
    name: 'iPhone 6 Plus',
    category: 'Electronics',
    price: 500.0,
  },
  SHIRT: {
    name: 'Casual T-Shirt',
    category: 'Apparel',
    price: 25.0,
  },
  BOOK: {
    name: 'Fiction Book',
    category: 'Books',
    price: 15.0,
  },
  GAMEPAD: {
    name: 'Wireless Gamepad',
    category: 'Electronics',
    price: 59.0,
  },
};

// Shipping methods as configured in this nopCommerce instance
// (Fixed-Rate By Weight plugin — Ground, Next Day Air, 2nd Day Air)
export const SHIPPING_METHODS: Record<string, ShippingMethod> = {
  GROUND: {
    name: 'Ground',
    fee: 0.0,
    estimatedDays: 'Shipping by land transport',
  },
  EXPRESS: {
    name: 'Next Day Air',
    fee: 0.0,
    estimatedDays: 'The one day air shipping',
  },
  OVERNIGHT: {
    name: '2nd Day Air',
    fee: 0.0,
    estimatedDays: 'The two day air shipping',
  },
};

// Test scenarios for US1
export const US1_TEST_SCENARIOS: OrderScenario[] = [
  {
    products: [PRODUCTS.SHIRT, PRODUCTS.BOOK],
    product: PRODUCTS.SHIRT,
    shippingMethod: SHIPPING_METHODS.GROUND,
    expectedTotal: 40.0, // 25 + 15 + 0 (ground shipping)
  },
  {
    products: [PRODUCTS.GAMEPAD],
    product: PRODUCTS.GAMEPAD,
    shippingMethod: SHIPPING_METHODS.EXPRESS,
    expectedTotal: 74.0, // 59 + 15 (express shipping)
  },
  {
    products: [PRODUCTS.PHONE, PRODUCTS.LAPTOP],
    product: PRODUCTS.PHONE,
    shippingMethod: SHIPPING_METHODS.OVERNIGHT,
    expectedTotal: 1895.0, // 500 + 1360 + 35 (overnight shipping)
  },
];

// Customer test data
export const TEST_CUSTOMER = {
  email: 'testuser@example.com',
  password: 'Test@1234',
  firstName: 'Test',
  lastName: 'User',
  company: 'QA Automation',
  phoneNumber: '1234567890',
};

// Billing and shipping address (for checkout)
export const TEST_ADDRESS = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  company: 'QA Automation',
  country: 'United States',
  state: 'NY',
  city: 'New York',
  address1: '123 Main Street',
  address2: 'Apt 4B',
  zipCode: '10001',
  phoneNumber: '1234567890',
};
