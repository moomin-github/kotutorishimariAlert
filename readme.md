# 交通取締計画アラートアプリ

## セットアップ

### Google Maps Api

index.html の script タグの src の"YOUR_API_KEY"に [Google Cloud Platform](https://console.cloud.google.com) で作成した API キーを入れてください。

```
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" async defer></script>
```

Google Cloud Platform で有効にする API

- Geocoding API
- Maps JavaScript API

### Firebase

main.js の下記設定部に[Firebase コンソール](https://console.firebase.google.com/u/0/?hl=ja)の 「Project OverView」 の「ウェブ」から取得して設定してください。

```
const config = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<BUCKET>.appspot.com",
  messagingSenderId: "<SENDER_ID>"
};
```

### Google App Script

googleScriptApp フォルダの.gs ファイルは [google script app](https://script.google.com) でファイルごとにプロジェクトを作成してソースをコピーして貼り付けてください。

#### kotutoriPlan.gs

ライブラリを追加  
リソース＞ライブラリ＞ライブラリを追加にプロジェクトキーを挿入して追加ボタンを押してください。
プロジェクトキーは下記 URL から
バージョン

- FirestoreApp 22
- Parser 7

FirestoreApp  
https://github.com/grahamearley/FirestoreGoogleAppsScript

Parser  
https://script.google.com/d/1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw/edit?usp=drive_web

上記の設定の後、日次で実行するようにトリガーを設定してください。

#### lineAlert.gs

LINE Developers にログインして新規プロバイダーを作成  
Messaging API のチャンネルを作成

作成したチャンネルのチャネル設定からアクセストークン及び Your user ID を取得して設定してください

```
function doGet(e) {
  var channel_access_token = 'アクセストークン';
  var user_id = 'Your user ID';
  var line_url = 'https://api.line.me/v2/bot/message/push';
```

上記の設定の後ツールバーより  
公開＞ウェブアプリケーションとして導入...>更新  
ウェブアプリケーションの URL を main.js の下記設定部に貼り付けてください

```
// LINEへアラートを送信するAPIのURL
const lineAlertUrl = "---URL---";
```

# 出典

徳島県警察ホームページ (https://www.police.pref.tokushima.jp/index.html)  
「交通取締計画」(徳島県警察) (https://www.police.pref.tokushima.jp/24kotuanzen/torisimari/kotu-torisimari.html)
