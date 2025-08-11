import { useState, useEffect } from 'react';
import JournalEntryForm from './components/JournalEntryForm';
import EntryList from './components/EntryList';
import { signInAnonymously, supabase } from './supabase/client';

function App() {
  const [user, setUser] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 認証状態の確認
    const checkAuth = async () => {
      try {
        // デモモードの場合は直接ダミーユーザーを設定
        if (!supabase) {
          setUser({ id: 'demo-user', email: 'demo@example.com' });
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // 匿名認証を実行
          const result = await signInAnonymously();
          if (result.success) {
            setUser(result.data.user);
          } else {
            console.error('認証エラー:', result.error);
          }
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('認証チェックエラー:', error);
        // エラーの場合もデモユーザーで続行
        setUser({ id: 'demo-user', email: 'demo@example.com' });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // 認証状態の変更を監視（Supabaseが利用可能な場合のみ）
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleEntryAdded = () => {
    // 仕訳が追加されたら一覧を更新
    setRefreshList(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">初期化中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">認証エラー</h1>
          <p className="text-gray-600">アプリを再読み込みしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-12">
        
        {/* 新しいヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            📚 Shiwake
          </h1>
          <p className="text-slate-500">
            日々の取引を記録して、簿記の基礎を学びましょう。
          </p>
          {!supabase && (
            <div className="pt-2">
              <p className="text-xs text-blue-600 bg-blue-100 rounded-full inline-block px-3 py-1">
                🚀 <strong>デモモード</strong>で動作中です。データはブラウザに保存されます。
              </p>
            </div>
          )}
        </div>

        {/* 仕訳入力フォーム */}
        <section className="bg-white rounded-2xl shadow-sm">
          <JournalEntryForm onEntryAdded={handleEntryAdded} />
        </section>

        {/* 仕訳一覧 */}
        <section className="bg-white rounded-2xl shadow-sm">
          <EntryList refresh={refreshList} />
        </section>

        
      </main>
    </div>
  );
}

export default App;
