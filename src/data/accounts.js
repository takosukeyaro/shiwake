// 勘定科目リスト
export const accounts = [
  '現金',
  '普通預金',
  '定期預金',
  '売掛金',
  '買掛金',
  '商品',
  '備品',
  '建物',
  '土地',
  '借入金',
  '資本金',
  '売上',
  '仕入',
  '給料',
  '家賃',
  '水道光熱費',
  '通信費',
  '交通費',
  '食費',
  '交際費',
  '雑費',
  '減価償却費',
  '支払利息',
  '受取利息'
];

// 勘定科目の分類
export const accountCategories = {
  assets: ['現金', '普通預金', '定期預金', '売掛金', '商品', '備品', '建物', '土地'],
  liabilities: ['買掛金', '借入金'],
  equity: ['資本金'],
  revenue: ['売上', '受取利息'],
  expenses: ['仕入', '給料', '家賃', '水道光熱費', '通信費', '交通費', '食費', '交際費', '雑費', '減価償却費', '支払利息']
};

// 勘定科目の性質を取得する関数
export const getAccountType = (account) => {
  for (const [type, accounts] of Object.entries(accountCategories)) {
    if (accounts.includes(account)) {
      return type;
    }
  }
  return 'unknown';
};
