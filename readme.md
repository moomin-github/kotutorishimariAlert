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
