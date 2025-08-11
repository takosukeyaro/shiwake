import { useState } from 'react';
import { accounts } from '../data/accounts';
import { validateJournalEntry } from '../utils/validation';
import { saveJournalEntry } from '../supabase/client';

const JournalEntryForm = ({ onEntryAdded }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    summary: '',
    debitAccount: '',
    debitAmount: '',
    creditAccount: '',
    creditAmount: ''
  });

  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 金額の同期（借方金額が変更されたら貸方金額も同じにする）
    if (name === 'debitAmount') {
      setFormData(prev => ({
        ...prev,
        creditAmount: value
      }));
    } else if (name === 'creditAmount') {
      setFormData(prev => ({
        ...prev,
        debitAmount: value
      }));
    }

    // エラーをクリア
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション
    const validation = validateJournalEntry(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await saveJournalEntry({
        date: formData.date,
        summary: formData.summary,
        debitAccount: formData.debitAccount,
        debitAmount: parseFloat(formData.debitAmount),
        creditAccount: formData.creditAccount,
        creditAmount: parseFloat(formData.creditAmount)
      });

      if (result.success) {
        // フォームをリセット
        setFormData({
          date: new Date().toISOString().split('T')[0],
          summary: '',
          debitAccount: '',
          debitAmount: '',
          creditAccount: '',
          creditAmount: ''
        });
        setErrors([]);
        
        // 親コンポーネントに通知
        if (onEntryAdded) {
          onEntryAdded();
        }

        alert('仕訳を保存しました！');
      } else {
        setErrors([result.error || '保存に失敗しました']);
      }
    } catch (error) {
      setErrors(['保存中にエラーが発生しました']);
      console.error('保存エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">仕訳入力</h2>
      
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 日付 */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1.5">
            日付
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-slate-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
        </div>

        {/* 摘要 */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1.5">
            摘要
          </label>
          <input
            type="text"
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            placeholder="例：昼食代、交通費など"
            className="w-full px-4 py-2 bg-slate-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
        </div>

        {/* 借方・貸方の入力エリア */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* 借方 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 pt-2">借方</h3>
            
            <div>
              <label htmlFor="debitAccount" className="block text-sm font-medium text-slate-700 mb-1.5">
                科目
              </label>
              <select
                id="debitAccount"
                name="debitAccount"
                value={formData.debitAccount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
                required
              >
                <option value="">科目を選択</option>
                {accounts.map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="debitAmount" className="block text-sm font-medium text-slate-700 mb-1.5">
                金額
              </label>
              <input
                type="number"
                id="debitAmount"
                name="debitAmount"
                value={formData.debitAmount}
                onChange={handleInputChange}
                min="1"
                placeholder="0"
                className="w-full px-4 py-2 bg-slate-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          {/* 貸方 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 pt-2">貸方</h3>
            
            <div>
              <label htmlFor="creditAccount" className="block text-sm font-medium text-slate-700 mb-1.5">
                科目
              </label>
              <select
                id="creditAccount"
                name="creditAccount"
                value={formData.creditAccount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
                required
              >
                <option value="">科目を選択</option>
                {accounts.map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="creditAmount" className="block text-sm font-medium text-slate-700 mb-1.5">
                金額
              </label>
              <input
                type="number"
                id="creditAmount"
                name="creditAmount"
                value={formData.creditAmount}
                onChange={handleInputChange}
                min="1"
                placeholder="0"
                className="w-full px-4 py-2 bg-slate-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition ${
              isSubmitting
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isSubmitting ? '保存中...' : '仕訳を保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryForm;
