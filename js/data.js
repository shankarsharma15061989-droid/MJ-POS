/* ==========================================================================
   AuraPOS Data Store & Menu Database (INR Currency Edition)
   ========================================================================== */

const INITIAL_CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '🍽️' },
  { id: 'specials', name: "Chef's Specials", icon: '⭐' },
  { id: 'steaks', name: 'Steaks & Mains', icon: '🥩' },
  { id: 'pizzas', name: 'Wood-Fired Pizza', icon: '🍕' },
  { id: 'burgers', name: 'Gourmet Burgers', icon: '🍔' },
  { id: 'pasta', name: 'Fresh Pasta', icon: '🍝' },
  { id: 'cocktails', name: 'Craft Cocktails', icon: '🍸' },
  { id: 'desserts', name: 'Artisanal Desserts', icon: '🍰' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' }
];

const INITIAL_MENU_ITEMS = [
  {
    id: 'm1',
    name: 'Prime Grilled Ribeye Steak',
    category: 'steaks',
    price: 850.00,
    cost: 350.00,
    image: 'assets/steak.jpg',
    description: 'Dry-aged ribeye steak served with rosemary garlic butter and roasted asparagus.',
    isSpecial: true,
    tags: ['GF', 'High Protein'],
    stock: 18,
    lowStockThreshold: 5,
    modifiers: [
      {
        name: 'Meat Doneness',
        required: true,
        type: 'single',
        options: [
          { name: 'Rare', price: 0 },
          { name: 'Medium Rare', price: 0 },
          { name: 'Medium', price: 0 },
          { name: 'Medium Well', price: 0 },
          { name: 'Well Done', price: 0 }
        ]
      },
      {
        name: 'Extra Sides',
        required: false,
        type: 'multiple',
        options: [
          { name: 'Truffle Fries', price: 150.00 },
          { name: 'Loaded Mashed Potato', price: 120.00 },
          { name: 'Sauteed Mushrooms', price: 100.00 },
          { name: 'Extra Garlic Butter', price: 50.00 }
        ]
      }
    ]
  },
  {
    id: 'm2',
    name: 'Margherita Napoletana Pizza',
    category: 'pizzas',
    price: 450.00,
    cost: 140.00,
    image: 'assets/pizza.jpg',
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, aromatic basil, and extra virgin olive oil.',
    isSpecial: true,
    tags: ['V'],
    stock: 35,
    lowStockThreshold: 10,
    modifiers: [
      {
        name: 'Crust Style',
        required: true,
        type: 'single',
        options: [
          { name: 'Traditional Neapolitan', price: 0 },
          { name: 'Gluten-Free Crust', price: 80.00 },
          { name: 'Crispy Thin Crust', price: 0 }
        ]
      },
      {
        name: 'Topping Add-ons',
        required: false,
        type: 'multiple',
        options: [
          { name: 'Paneer Tikka', price: 90.00 },
          { name: 'Spicy Pepperoni', price: 120.00 },
          { name: 'Wild Mushrooms', price: 70.00 },
          { name: 'Extra Cheese Burst', price: 80.00 }
        ]
      }
    ]
  },
  {
    id: 'm3',
    name: 'The Smoky Bacon Double Burger',
    category: 'burgers',
    price: 490.00,
    cost: 180.00,
    image: 'assets/burger.jpg',
    description: 'Double juicy patties, crispy bacon, aged cheddar, caramelised onions, secret sauce on toasted brioche.',
    isSpecial: false,
    tags: ['Customer Favorite'],
    stock: 24,
    lowStockThreshold: 8,
    modifiers: [
      {
        name: 'Patty Doneness',
        required: true,
        type: 'single',
        options: [
          { name: 'Medium Well', price: 0 },
          { name: 'Well Done', price: 0 },
          { name: 'Medium', price: 0 }
        ]
      },
      {
        name: 'Burger Extras',
        required: false,
        type: 'multiple',
        options: [
          { name: 'Avocado Slice', price: 70.00 },
          { name: 'Fried Egg', price: 40.00 },
          { name: 'Upgrade to Truffle Fries', price: 90.00 }
        ]
      }
    ]
  },
  {
    id: 'm4',
    name: 'Smoky Old Fashioned Cocktail',
    category: 'cocktails',
    price: 550.00,
    cost: 150.00,
    image: 'assets/cocktail.jpg',
    description: 'Woodford Reserve Bourbon, Angostura bitters, maraschino cherry, infused with aromatic oak smoke.',
    isSpecial: true,
    tags: ['Signature Drink'],
    stock: 50,
    lowStockThreshold: 12,
    modifiers: [
      {
        name: 'Liquor Selection',
        required: false,
        type: 'single',
        options: [
          { name: 'Standard Bourbon', price: 0 },
          { name: 'Upgrade to Single Malt', price: 180.00 }
        ]
      }
    ]
  },
  {
    id: 'm5',
    name: 'Truffle Mushroom Fettuccine',
    category: 'pasta',
    price: 520.00,
    cost: 160.00,
    image: 'assets/steak.jpg',
    description: 'Handmade egg fettuccine, wild forest mushrooms, black truffle cream sauce, grated Parmigiano-Reggiano.',
    isSpecial: false,
    tags: ['V'],
    stock: 20,
    lowStockThreshold: 6,
    modifiers: [
      {
        name: 'Protein Additions',
        required: false,
        type: 'single',
        options: [
          { name: 'Grilled Chicken Breast', price: 140.00 },
          { name: 'Jumbo Tiger Prawns (3pcs)', price: 220.00 },
          { name: 'No Added Protein', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'm6',
    name: 'Crispy Calamari Fritti',
    category: 'specials',
    price: 380.00,
    cost: 110.00,
    image: 'assets/pizza.jpg',
    description: 'Wild-caught squid tossed with sea salt, lemon, and served with house spicy marinara and garlic aioli.',
    isSpecial: true,
    tags: ['Appetizer'],
    stock: 30,
    lowStockThreshold: 8,
    modifiers: []
  },
  {
    id: 'm7',
    name: 'Classic Espresso Tiramisu',
    category: 'desserts',
    price: 280.00,
    cost: 80.00,
    image: 'assets/burger.jpg',
    description: 'Savoiardi ladyfingers soaked in dark espresso, layered with whipped mascarpone cream and cocoa.',
    isSpecial: false,
    tags: ['V'],
    stock: 15,
    lowStockThreshold: 5,
    modifiers: []
  },
  {
    id: 'm8',
    name: 'Artisanal Sparkling Lemonade',
    category: 'beverages',
    price: 180.00,
    cost: 40.00,
    image: 'assets/cocktail.jpg',
    description: 'Freshly squeezed lemons, wild mint, sparkling mineral water, and organic agave syrup.',
    isSpecial: false,
    tags: ['VG'],
    stock: 60,
    lowStockThreshold: 15,
    modifiers: [
      {
        name: 'Ice Preference',
        required: true,
        type: 'single',
        options: [
          { name: 'Regular Ice', price: 0 },
          { name: 'Light Ice', price: 0 },
          { name: 'No Ice', price: 0 }
        ]
      }
    ]
  }
];

const INITIAL_TABLES = [
  { id: 't1', number: 'Table 1', zone: 'main', seats: 2, status: 'occupied', timeElapsed: '34m', currentOrder: { id: 'ORD-1042', total: 1650.00 } },
  { id: 't2', number: 'Table 2', zone: 'main', seats: 4, status: 'available', timeElapsed: null, currentOrder: null },
  { id: 't3', number: 'Table 3', zone: 'main', seats: 4, status: 'bill', timeElapsed: '52m', currentOrder: { id: 'ORD-1038', total: 2840.00 } },
  { id: 't4', number: 'Table 4', zone: 'main', seats: 6, status: 'occupied', timeElapsed: '18m', currentOrder: { id: 'ORD-1045', total: 3420.00 } },
  { id: 't5', number: 'Table 5', zone: 'main', seats: 2, status: 'available', timeElapsed: null, currentOrder: null },
  { id: 't6', number: 'Table 6', zone: 'main', seats: 8, status: 'reserved', timeElapsed: 'Res: 7:30 PM', currentOrder: null },
  { id: 't7', number: 'Table 7', zone: 'patio', seats: 4, status: 'available', timeElapsed: null, currentOrder: null },
  { id: 't8', number: 'Table 8', zone: 'patio', seats: 4, status: 'occupied', timeElapsed: '12m', currentOrder: { id: 'ORD-1047', total: 1160.00 } },
  { id: 't9', number: 'Patio 1', zone: 'patio', seats: 2, status: 'available', timeElapsed: null, currentOrder: null },
  { id: 't10', number: 'Patio 2', zone: 'patio', seats: 6, status: 'available', timeElapsed: null, currentOrder: null },
  { id: 'b1', number: 'Bar Seat 1', zone: 'bar', seats: 1, status: 'occupied', timeElapsed: '45m', currentOrder: { id: 'ORD-1040', total: 730.00 } },
  { id: 'b2', number: 'Bar Seat 2', zone: 'bar', seats: 1, status: 'available', timeElapsed: null, currentOrder: null },
  { id: 'vip1', number: 'VIP Suite A', zone: 'vip', seats: 10, status: 'occupied', timeElapsed: '1h 15m', currentOrder: { id: 'ORD-1035', total: 8450.00 } }
];

const INITIAL_STAFF = [
  { id: 's1', name: 'Alex Rivera', role: 'Manager', pin: '9999', avatar: 'AR' },
  { id: 's2', name: 'Sarah Jenkins', role: 'Cashier', pin: '1234', avatar: 'SJ' },
  { id: 's3', name: 'Marco Rossi', role: 'Head Chef', pin: '8888', avatar: 'MR' },
  { id: 's4', name: 'Elena Vance', role: 'Server', pin: '5555', avatar: 'EV' }
];

const INITIAL_KITCHEN_TICKETS = [
  {
    id: 'KDS-801',
    orderId: 'ORD-1047',
    tableNumber: 'Table 8',
    server: 'Elena Vance',
    timeSent: '14:21',
    elapsedMinutes: 12,
    urgent: false,
    items: [
      { name: 'The Smoky Bacon Double Burger', qty: 2, mods: ['Medium Well', 'Extra Avocado'] },
      { name: 'Artisanal Sparkling Lemonade', qty: 2, mods: ['Light Ice'] }
    ],
    status: 'preparing'
  },
  {
    id: 'KDS-802',
    orderId: 'ORD-1045',
    tableNumber: 'Table 4',
    server: 'Sarah Jenkins',
    timeSent: '14:14',
    elapsedMinutes: 19,
    urgent: true,
    items: [
      { name: 'Prime Grilled Ribeye Steak', qty: 2, mods: ['Medium Rare', 'Truffle Fries'] },
      { name: 'Margherita Napoletana Pizza', qty: 1, mods: ['Paneer Tikka'] },
      { name: 'Smoky Old Fashioned Cocktail', qty: 3, mods: [] }
    ],
    status: 'preparing'
  },
  {
    id: 'KDS-803',
    orderId: 'ORD-1048',
    tableNumber: 'Takeout #104',
    server: 'Sarah Jenkins',
    timeSent: '14:30',
    elapsedMinutes: 3,
    urgent: false,
    items: [
      { name: 'Truffle Mushroom Fettuccine', qty: 1, mods: ['Grilled Chicken Breast'] },
      { name: 'Classic Espresso Tiramisu', qty: 1, mods: [] }
    ],
    status: 'pending'
  }
];

const DEFAULT_SETTINGS = {
  restaurantName: 'Aura Fine Dining & Lounge',
  address: 'MG Road, Connaught Place, New Delhi',
  phone: '+91 98765 43210',
  taxRate: 5.0, // 5% GST
  serviceChargeRate: 5.0, // 5% Service Charge
  currencySymbol: '₹',
  receiptFooterText: 'Thank you for dining at Aura! Follow us @aurabistro',
  kitchenAlertSound: true
};
