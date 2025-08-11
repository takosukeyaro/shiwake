import { createClient } from '@supabase/supabase-js';



// 環境変数からSupabaseの設定を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// デモモードかどうかをチェック
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabaseクライアントを作成（デモモードの場合はダミー）
export const supabase = isDemoMode ? null : createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 匿名認証を有効にする
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// データベース操作関数

// 仕訳エントリを保存
export const saveJournalEntry = async (entryData) => {
  if (isDemoMode) {
    // デモモード：ローカルストレージに保存
    try {
      const entries = JSON.parse(localStorage.getItem('demo_journal_tx') || '[]');
      const newEntry = {
        id: Date.now().toString(),
        user_id: 'demo-user',
        date: entryData.date,
        summary: entryData.summary,
        debit_account: entryData.debitAccount,
        debit_amount: entryData.debitAmount,
        credit_account: entryData.creditAccount,
        credit_amount: entryData.creditAmount,
        created_at: new Date().toISOString()
      };
      entries.unshift(newEntry);
      localStorage.setItem('demo_journal_tx', JSON.stringify(entries));
      return { success: true, data: newEntry };
    } catch (error) {
      console.error('デモモード保存エラー:', error);
      return { success: false, error: error.message };
    }
  }

  try {
    const { data, error } = await supabase
      .from('journal_tx')
      .insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id,
        date: entryData.date,
        summary: entryData.summary,
        debit_account: entryData.debitAccount,
        debit_amount: entryData.debitAmount,
        credit_account: entryData.creditAccount,
        credit_amount: entryData.creditAmount
      }]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('仕訳の保存エラー:', error);
    return { success: false, error: error.message };
  }
};

// 仕訳エントリを取得
export const getJournalEntries = async () => {
  if (isDemoMode) {
    // デモモード：ローカルストレージから取得
    try {
      const entries = JSON.parse(localStorage.getItem('demo_journal_tx') || '[]');
      return { success: true, data: entries };
    } catch (error) {
      console.error('デモモード取得エラー:', error);
      return { success: false, error: error.message };
    }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('journal_tx')
      .select('id, created_at, date, summary, debit_account, debit_amount, credit_account, credit_amount')
      .eq('user_id', user?.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('仕訳の取得エラー:', error);
    return { success: false, error: error.message };
  }
};

// 仕訳エントリを削除
export const deleteJournalEntry = async (id) => {
  if (isDemoMode) {
    // デモモード：ローカルストレージから削除
    try {
      const entries = JSON.parse(localStorage.getItem('demo_journal_tx') || '[]');
      const filteredEntries = entries.filter(entry => entry.id !== id);
      localStorage.setItem('demo_journal_tx', JSON.stringify(filteredEntries));
      return { success: true };
    } catch (error) {
      console.error('デモモード削除エラー:', error);
      return { success: false, error: error.message };
    }
  }

  try {
    const { error } = await supabase
      .from('journal_tx')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('仕訳の削除エラー:', error);
    return { success: false, error: error.message };
  }
};

// 匿名認証
export const signInAnonymously = async () => {
  if (isDemoMode) {
    // デモモード：ダミーユーザーを返す
    return {
      success: true,
      data: {
        user: {
          id: 'demo-user',
          email: 'demo@example.com'
        }
      }
    };
  }

  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('匿名認証エラー:', error);
    return { success: false, error: error.message };
  }
};
