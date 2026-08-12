/* ============================================================
   CONSTANTS
   ============================================================ */

const APP_VERSION = '1.0.0';


const DEFAULT_CATEGORIES = [
  'Restaurant', 'Bakery', 'Fuel', 'Fashion', 'Bills', 'Entertainment',
  'Medical', 'Travel', 'EMI', 'Investment', 'Donation', 'Gifts', 'Other',
  'Stationary', 'Internet', 'Saloon', 'Gym', 'Groceries', 'Gadgets',
];

const CATEGORY_META = {
  Restaurant: { icon: 'restaurant', color: '#EF4444' },
  Bakery: { icon: 'bakery_dining', color: '#F97316' },
  Fuel: { icon: 'local_gas_station', color: '#F59E0B' },
  Fashion: { icon: 'checkroom', color: '#EC4899' },
  Bills: { icon: 'receipt_long', color: '#8B5CF6' },
  Entertainment: { icon: 'movie', color: '#06B6D4' },
  Medical: { icon: 'medical_services', color: '#10B981' },
  Travel: { icon: 'flight', color: '#34B896' },
  EMI: { icon: 'credit_card', color: '#6366F1' },
  Investment: { icon: 'trending_up', color: '#22C55E' },
  Donation: { icon: 'volunteer_activism', color: '#F43F5E' },
  Gifts: { icon: 'card_giftcard', color: '#A855F7' },
  Other: { icon: 'category', color: '#64748B' },
  Stationary: { icon: 'edit_note', color: '#0EA5E9' },
  Internet: { icon: 'wifi', color: '#0284C7' },
  Saloon: { icon: 'content_cut', color: '#D946EF' },
  Gym: { icon: 'fitness_center', color: '#84CC16' },
  Groceries: { icon: 'local_grocery_store', color: '#16A34A' },
  Gadgets: { icon: 'devices', color: '#6366F1' },
};

const NAME_CATEGORY_RULES = [
  { keywords: ['zomato', 'swiggy', 'restaurant', 'cafe', 'dhaba', 'burger', 'pizza', 'kfc', 'mcdonald', 'dominos', 'subway', 'biryani', 'biriyani', 'diner', 'dining', 'eatery', 'mess', 'canteen', 'food court', 'ikka', 'midtown', 'food', 'fried rice', 'noodles', 'chow mein', 'pasta', 'dosa', 'idli', 'vada', 'paratha', 'naan', 'roti', 'thali', 'sandwich', 'shawarma', 'roll', 'wrap', 'momos', 'pav bhaji', 'chole', 'paneer', 'chicken', 'mutton', 'fish fry', 'omelette'], category: 'Restaurant' },
  { keywords: ['bakery', 'cake', 'bread', 'pastry', 'bun', 'muffin', 'cookie', 'donut', 'biscuit', 'brownie', 'ice', 'incha'], category: 'Bakery' },
  { keywords: ['petrol', 'diesel', 'fuel', 'iocl', 'bpcl', 'hpcl', 'cng', 'filling station', 'shell', 'indian oil', 'bharat petroleum', 'hp fuel'], category: 'Fuel' },
  { keywords: ['myntra', 'ajio', 'zara', 'levis', 'adidas', 'nike', 'clothes', 'clothing', 'shirt', 'trouser', 'pants', 'shoes', 'sandal', 'bag', 'handbag', 'belt', 'dress', 'jeans', 'kurta', 'saree', 'fashion', 'footwear', 'sneaker'], category: 'Fashion' },
  { keywords: ['bsnl', 'jio', 'airtel', 'vodafone', 'vi plan', 'wifi', 'internet', 'broadband', 'recharge', 'mobile bill', 'landline', 'postpaid', 'prepaid', 'data pack', 'cable'], category: 'Internet' },
  { keywords: ['electricity', 'water bill', 'bescom', 'tneb', 'mseb', 'tata sky', 'd2h', 'dish tv', 'maintenance'], category: 'Bills' },
  { keywords: ['netflix', 'hotstar', 'prime video', 'youtube premium', 'movie', 'cinema', 'pvr', 'inox', 'theatre', 'concert', 'gaming', 'steam', 'playstation', 'xbox', 'bookmyshow'], category: 'Entertainment' },
  { keywords: ['spotify', 'Spotify',], category: 'Spotify' },
  { keywords: ['unknown', 'Unkown',], category: 'Other' },
  { keywords: ['hospital', 'clinic', 'pharmacy', 'medicine', 'doctor', 'apollo', 'medplus', 'blood test', 'xray', 'scan', 'medical', 'tablet', 'syrup', 'injection', 'health', 'dental', 'dentist', 'lab test', 'diagnostic'], category: 'Medical' },
  { keywords: ['uber', 'ola cab', 'metro', 'irctc', 'redbus', 'rapido', 'flight', 'indigo', 'air india', 'spicejet', 'bus ticket', 'train ticket', 'toll', 'highway', 'travel', 'cab', 'taxi', 'auto ride', 'airport', 'hotel stay'], category: 'Travel' },
  { keywords: ['emi', 'loan emi', 'home loan', 'car loan', 'personal loan', 'bajaj finance', 'hdfc loan', 'icici loan', 'axis loan', 'equitas', 'credit emi'], category: 'EMI' },
  { keywords: ['mutual fund', 'sip', 'zerodha', 'groww', 'stocks', 'shares', 'gold bond', 'fixed deposit', 'ppf', 'nps', 'elss', 'investment', 'lic premium', 'insurance premium'], category: 'Investment' },
  { keywords: ['church', 'donation', 'tithe', 'offering', 'charity', 'contribution'], category: 'Donation' },
  { keywords: ['gift', 'birthday', 'anniversary', 'wedding', 'present for'], category: 'Gifts' },
  { keywords: ['grocery', 'groceries', 'supermarket', 'dmart', 'bigbasket', 'blinkit', 'zepto', 'jiomart', 'more supermarket', 'reliance fresh', 'nature basket', 'vegetables', 'fruits', 'rice', 'dal', 'wheat', 'atta', 'oil', 'milk', 'eggs', 'provisions', 'traders'], category: 'Groceries' },
  { keywords: ['stationary', 'pen', 'pencil', 'notebook', 'notepad', 'paper', 'eraser', 'stapler', 'highlighter', 'marker', 'folder', 'file', 'ink', 'perfume'], category: 'Stationary' },
  { keywords: ['saloon', 'salon', 'hair', 'haircut', 'hair cut', 'barber', 'trimming', 'shaving', 'facial', 'grooming', 'waxing', 'manicure', 'pedicure', 'parlour', 'parlor'], category: 'Saloon' },
  { keywords: ['gym', 'fitness', 'workout', 'membership', 'protein', 'whey', 'supplement', 'crossfit', 'yoga', 'zumba', 'sports', 'mma'], category: 'Gym' },
  { keywords: ['gadget', 'laptop', 'mobile', 'smartphone', 'phone', 'tablet', 'smartwatch', 'earphone', 'earbuds', 'headphone', 'speaker', 'keyboard', 'mouse', 'monitor', 'webcam', 'charger', 'power bank', 'usb', 'hdmi', 'ssd', 'hard disk', 'ram', 'processor', 'graphics card', 'router', 'camera', 'drone', 'console', 'apple', 'samsung', 'xiaomi', 'oneplus', 'realme', 'oppo', 'vivo', 'lenovo', 'hp laptop', 'dell', 'asus'], category: 'Gadgets' },
];

const ICON_PICKER_OPTIONS = [
  'category', 'shopping_bag', 'local_grocery_store', 'coffee',
  'lunch_dining', 'fastfood', 'ramen_dining', 'local_pizza',
  'directions_car', 'two_wheeler', 'directions_bike', 'hiking',
  'sports_cricket', 'sports_soccer', 'sports_esports', 'self_improvement',
  'music_note', 'movie', 'celebration', 'camera_alt',
  'school', 'work', 'home', 'computer',
  'phone_android', 'pets', 'child_care', 'favorite',
  'local_bar', 'spa', 'construction', 'bolt',
];

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#06B6D4',
  '#0EA5E9', '#34B896', '#6366F1', '#8B5CF6',
  '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
  '#64748B', '#0284C7',
];

const CHART_COLORS = [
  '#279979', '#EF4444', '#22C55E', '#F59E0B', '#EC4899',
  '#06B6D4', '#8B5CF6', '#F97316', '#6366F1', '#10B981', '#64748B',
];

/* Default percentage allocations for the Budget Planner.
   expCat: the expense category key this maps to (null = reserved, not tracked as spending). */
const DEFAULT_BUDGET_ALLOCATIONS = [
  { key: 'emi', label: 'EMI', percentage: 43, expCat: ['EMI'] },
  { key: 'food', label: 'Food & Dining', percentage: 15, expCat: ['Restaurant', 'Bakery'] },
  { key: 'fuel', label: 'Fuel & Travel', percentage: 7, expCat: ['Fuel', 'Travel'] },
  { key: 'bills', label: 'Bills & Utilities', percentage: 5, expCat: ['Bills'] },
  { key: 'entertainment', label: 'Entertainment', percentage: 5, expCat: ['Entertainment'] },
  { key: 'fashion', label: 'Fashion & Shopping', percentage: 5, expCat: ['Fashion'] },
  { key: 'medical', label: 'Medical', percentage: 3, expCat: ['Medical'] },
  { key: 'savings', label: 'Savings', percentage: 12, expCat: null },
  { key: 'emergency', label: 'Emergency Fund', percentage: 5, expCat: null },
];

const DEFAULT_DATA = {
  version: APP_VERSION,
  createdAt: new Date().toISOString(),
  settings: {
    darkMode: false,
    currency: '₹',
    defaultSalary: 0,
    budgetAllocations: null,
    customCategoryMeta: {},
  },
  categories: [...DEFAULT_CATEGORIES],
  months: {},
  bills: [],
};
