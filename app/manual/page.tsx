export default function ManualPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 pb-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">マニュアル</h1>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-3">
          5-1. アプリの概要
        </h2>
        <p className="text-gray-700 mb-3">このアプリでできること：</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>備品の所在をガントチャートで一目確認</li>
          <li>ダブルブッキングの自動検出</li>
          <li>備品担当へのメール本文を自動生成</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-3">
          5-2. 基本的な使い方
        </h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: '備品マスタに備品を登録する',
              desc: '「備品マスタ」画面から、備品名・カテゴリ・総在庫数を登録します。初回は初期データがプリセットされています。',
            },
            {
              step: 2,
              title: 'イベントを登録し、使用備品と数量を設定する',
              desc: '「イベント」画面からイベントを作成し、使用する備品と数量を設定します。',
            },
            {
              step: 3,
              title: 'タイムラインで備品の競合がないか確認する',
              desc: '「タイムライン」画面でガントチャートを確認し、赤いバーがないかチェックします。',
            },
            {
              step: 4,
              title: 'メール作成画面でイベントを選び、担当者にメールを送る',
              desc: '「メール作成」画面でイベントを選択すると、備品一覧入りのメール文が自動生成されます。',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {step}
              </div>
              <div>
                <p className="font-medium text-gray-800">{title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-3">
          5-3. タイムラインの見方
        </h2>

        <h3 className="font-bold text-gray-700 mb-2">バーの色の意味</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {[
            { color: 'bg-yellow-400', label: '出荷準備', desc: '開始2日前' },
            { color: 'bg-blue-400', label: '輸送中（往路）', desc: '開始1日前〜開始日直前' },
            { color: 'bg-green-500', label: '会場', desc: '開始日〜終了日' },
            { color: 'bg-orange-400', label: '輸送中（復路）', desc: '終了翌日〜終了2日後' },
            { color: 'bg-red-500', label: 'ダブルブッキング', desc: '在庫数を超過・重複あり' },
          ].map(({ color, label, desc }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded flex-shrink-0 ${color}`} />
              <div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-xs text-gray-500 ml-1">（{desc}）</span>
              </div>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-gray-700 mb-2">輸送ステータスの自動計算ルール</h3>
        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 space-y-1 mb-4">
          <p>開始2日前：出荷準備開始</p>
          <p>開始1日前〜開始当日：輸送中（往路）</p>
          <p>開始日〜終了日：会場にて展示中</p>
          <p>終了翌日〜終了2日後：輸送中（復路）</p>
          <p>終了2日後以降：オフィスに戻る（バー非表示）</p>
        </div>

        <h3 className="font-bold text-gray-700 mb-2">折りたたみ操作</h3>
        <p className="text-sm text-gray-700">
          カテゴリ名の左側にある ▼/▶ ボタンをクリックすると、そのカテゴリの備品行を折りたたむことができます。
          表示したい備品だけを展開して確認できます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-3">
          5-4. ダブルブッキングが出たときの対処法
        </h2>
        <div className="space-y-3">
          {[
            {
              step: 1,
              text: '在庫数の確認：備品マスタで該当備品の総在庫数を確認します。不足しているなら増数を検討してください。',
            },
            {
              step: 2,
              text: 'イベント日程の調整：重複しているイベントの日程を変更できないか検討します。イベント管理画面から編集できます。',
            },
            {
              step: 3,
              text: '担当者への確認：メール作成画面から担当者に連絡し、代替備品の手配や日程調整を相談します。',
            },
          ].map(({ step, text }) => (
            <div key={step} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {step}
              </div>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-3">
          5-5. よくある質問（FAQ）
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'データはどこに保存されますか？',
              a: 'ブラウザのlocalStorageに保存されます。別のブラウザやデバイスでは共有されません。',
            },
            {
              q: 'データが消えてしまいました',
              a: 'ブラウザのキャッシュクリア時に削除されることがあります。定期的にメモ等でバックアップしてください。',
            },
            {
              q: '備品を削除したらイベントのデータはどうなりますか？',
              a: '紐付いているイベントの割当からも自動的に削除されます。',
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
