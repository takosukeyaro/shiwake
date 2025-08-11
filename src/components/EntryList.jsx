import { useState, useEffect } from 'react';
import { getJournalEntries, deleteJournalEntry } from '../supabase/client';
import { formatCurrency, formatDate } from '../utils/validation';

const EntryList = ({ refresh }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getJournalEntries();
      if (result.success) {
        setEntries(result.data || []);
      } else {
        setError(result.error || '仕訳の読み込みに失敗しました');
      }
    } catch (err) {
      setError('仕訳の読み込み中にエラーが発生しました');
      console.error('読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!confirm('この仕訳を削除しますか？')) {
      return;
    }

    try {
      const result = await deleteJournalEntry(id);
      if (result.success) {
        // 削除成功後、リストを再読み込み
        loadEntries();
        alert('仕訳を削除しました');
      } else {
        alert('削除に失敗しました: ' + result.error);
      }
    } catch (error) {
      alert('削除中にエラーが発生しました');
      console.error('削除エラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">仕訳一覧</h2>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-600">まだ仕訳が登録されていません</p>
          <p className="text-sm text-slate-500 mt-2">上のフォームから最初の仕訳を入力してください</p>
        </div>
      ) : (
        <div>
          {/* デスクトップ表示（テーブル） */}
          <div className="hidden md:block">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">
                    摘要
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">
                    借方
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">
                    貸方
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                      {entry.summary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {entry.debit_account}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {entry.credit_account}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-mono text-right">
                      {formatCurrency(entry.debit_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 transition-colors text-xs font-semibold"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイル表示（カード） */}
          <div className="md:hidden space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-slate-800">
                    {entry.summary}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-500 hover:text-red-700 transition-colors text-xs font-semibold flex-shrink-0 ml-4"
                  >
                    削除
                  </button>
                </div>
                
                <div className="text-right mb-3">
                  <span className="text-xl font-mono text-slate-900">
                    {formatCurrency(entry.debit_amount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-500 block text-xs">借方</span>
                    <span className="text-slate-700 font-medium">{entry.debit_account}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">貸方</span>
                    <span className="text-slate-700 font-medium">{entry.credit_account}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-left">
                  <span className="text-slate-500 text-xs">{formatDate(entry.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            合計 {entries.length} 件の仕訳が登録されています
          </p>
        </div>
      )}
    </div>
  );
};

export default EntryList;
