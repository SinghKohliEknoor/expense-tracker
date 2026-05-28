export type CurrencyInfo = {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  flag: string;
};

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',      locale: 'en-IN', flag: '🇮🇳' },
  { code: 'USD', symbol: '$',   name: 'US Dollar',          locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',   name: 'Euro',               locale: 'de-DE', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',      locale: 'en-GB', flag: '🇬🇧' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham',         locale: 'en-AE', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',   locale: 'en-SG', flag: '🇸🇬' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',  locale: 'en-AU', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar',    locale: 'en-CA', flag: '🇨🇦' },
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc',        locale: 'de-CH', flag: '🇨🇭' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',       locale: 'ja-JP', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan',       locale: 'zh-CN', flag: '🇨🇳' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal',        locale: 'en-SA', flag: '🇸🇦' },
];
