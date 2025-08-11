// 仕訳入力のバリデーション関数

export const validateJournalEntry = (entryData) => {
  const errors = [];

  // 日付チェック
  if (!entryData.date) {
    errors.push('日付を入力してください');
  }

  // 摘要チェック
  if (!entryData.summary || entryData.summary.trim() === '') {
    errors.push('摘要を入力してください');
  }

  // 借方科目チェック
  if (!entryData.debitAccount) {
    errors.push('借方科目を選択してください');
  }

  // 貸方科目チェック
  if (!entryData.creditAccount) {
    errors.push('貸方科目を選択してください');
  }

  // 借方金額チェック
  if (!entryData.debitAmount || entryData.debitAmount <= 0) {
    errors.push('借方金額を正しく入力してください');
  }

  // 貸方金額チェック
  if (!entryData.creditAmount || entryData.creditAmount <= 0) {
    errors.push('貸方金額を正しく入力してください');
  }

  // 借方金額と貸方金額の一致チェック
  if (entryData.debitAmount && entryData.creditAmount) {
    if (Number(entryData.debitAmount) !== Number(entryData.creditAmount)) {
      errors.push('借方金額と貸方金額が一致しません');
    }
  }

  // 同じ科目の重複チェック
  if (entryData.debitAccount && entryData.creditAccount) {
    if (entryData.debitAccount === entryData.creditAccount) {
      errors.push('借方と貸方に同じ科目を選択することはできません');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 数値フォーマット関数
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount);
};

// 日付フォーマット関数
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
