# 交通取締計画アラートアプリ

## セットアップ

### google maps api

index.html の script タグの src の"YOUR_API_KEY"に [google cloud platform](https://console.cloud.google.com) で作成した API キーを入れてください。

```
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" async defer></script>
```

google cloud platform で有効にする API

- Geocoding API
- Maps JavaScript API

### Firebase

main.js の下記設定部に[Firebase コンソール](https://console.firebase.google.com/u/0/?hl=ja)の 「Project OverView」 の「ウェブ」から取得で設定してください。

```
var config = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<BUCKET>.appspot.com",
  messagingSenderId: "<SENDER_ID>"
};
```

### google script app

googleScriptApp フォルダの.gs ファイルは [google script app](https://script.google.com) でファイルごとにプロジェクトを作成してソースをコピーしてください。

#### kotutoriPlan.gs

12 時間毎に実行するようにトリガーを設定してください。

#### lineAlert.gs

公開＞ウェブアプリケーションとして導入...>更新  
ウェブアプリケーションの URL を main.js に貼り付けてください

```
main.jsのlineAlertUrl
// googleScriptApp API
var lineAlertUrl = "===URL===";
```

# 出展

徳島県警察ホームページ (https://www.police.pref.tokushima.jp/index.html)  
「交通取締計画」(徳島県警察) (https://www.police.pref.tokushima.jp/24kotuanzen/torisimari/kotu-torisimari.html)
