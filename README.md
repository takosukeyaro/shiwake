# Shiwake

📚 日常生活の取引を使って簿記の仕訳を学習できるPWAアプリです。

## 特徴

- **簡単入力**: 日常の取引を仕訳として入力
- **リアルタイム保存**: Supabaseにデータを自動保存
- **PWA対応**: スマホのホーム画面に追加可能
- **レスポンシブデザイン**: PC・スマホ両対応
- **オフライン対応**: インターネット接続がなくても基本操作可能

## 技術スタック

- **フロントエンド**: React + Vite
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth (匿名認証)
- **PWA**: vite-plugin-pwa + Workbox

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウント作成
2. 新しいプロジェクトを作成
3. データベース画面でSQLエディタを開き、以下のテーブルを作成：

\`\`\`sql
```sql
-- 単式仕訳（借方1・貸方1）、等価CHECKは付けない
create table if not exists public.journal_tx (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  date            date not null,
  summary         text not null check (char_length(summary) <= 2000),

  debit_account   text not null,
  debit_amount    numeric(12,2) not null check (debit_amount  > 0),

  credit_account  text not null,
  credit_amount   numeric(12,2) not null check (credit_amount > 0),

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- よく使う絞り込み
create index if not exists idx_journal_tx_user_date
  on public.journal_tx (user_id, date desc);

-- RLS（前回と同じ）
alter table public.journal_tx enable row level security;

create policy "tx_select_own"
on public.journal_tx for select to authenticated
using (user_id = auth.uid());

create policy "tx_insert_own"
on public.journal_tx for insert to authenticated
with check (user_id = auth.uid());

create policy "tx_update_own"
on public.journal_tx for update to authenticated
using (user_id = auth.uid());

create policy "tx_delete_own"
on public.journal_tx for delete to authenticated
using (user_id = auth.uid());
```
\`\`\`

### 2. 環境変数の設定

1. \`env.example\`をコピーして\`.env.local\`を作成
2. SupabaseのProject Settings > APIから以下の値を取得：
   - \`VITE_SUPABASE_URL\`: Project URL
   - \`VITE_SUPABASE_ANON_KEY\`: Anon key

\`\`\`bash
cp env.example .env.local
\`\`\`

\`.env.local\`に実際の値を設定：
\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 3. アプリケーションの起動

\`\`\`bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
\`\`\`

### 4. PWAとしてインストール

1. ブラウザでアプリを開く
2. アドレスバーの「インストール」ボタンをクリック
3. または設定メニューから「ホーム画面に追加」を選択

## ディレクトリ構成

\`\`\`
src/
├── components/
│   ├── JournalEntryForm.jsx    # 仕訳入力フォーム
│   └── EntryList.jsx           # 仕訳一覧表示
├── data/
│   └── accounts.js             # 勘定科目リスト
├── supabase/
│   └── client.js               # Supabase設定・API
├── utils/
│   └── validation.js           # バリデーション関数
├── App.jsx                     # メインアプリケーション
└── main.jsx                    # エントリーポイント
\`\`\`

## 使い方

### 仕訳の入力

1. 日付を選択
2. 摘要（取引内容）を入力
3. 借方科目・金額を選択・入力
4. 貸方科目・金額を選択・入力
5. 「仕訳を保存」ボタンをクリック

### 例：昼食代800円を現金で支払った場合

- **日付**: 2025-01-09
- **摘要**: 昼食代
- **借方科目**: 食費
- **借方金額**: 800
- **貸方科目**: 現金
- **貸方金額**: 800

## 今後の拡張予定

- [ ] 仕訳の修正・編集機能
- [ ] 試算表の表示
- [ ] クイズ形式の仕訳練習モード
- [ ] 仕訳テンプレート機能
- [ ] データのエクスポート機能
- [ ] ダークモード対応

## ライセンス

MIT License

## 貢献

バグ報告や機能要望は、GitHubのIssuesまでお願いします。