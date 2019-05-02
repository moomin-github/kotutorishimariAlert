// グローバル変数
// google map
var map;
// google map に配置したマーカーを管理する配列
var arrMarker;

// =============================================================
// 初期化
// =============================================================
function initMap() {
  // マップの初期化
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    //center: { lat: 33.73, lng: 134.53 } //美波町の緯度経度
    center: { lat: 33.9, lng: 134.446 }
  });

  arrMarker = new google.maps.MVCArray();
}

// Firebase
var config = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<BUCKET>.appspot.com",
  messagingSenderId: "<SENDER_ID>"
};
firebase.initializeApp(config);

const firestore = firebase.firestore();

// =============================================================
// 取締情報取得(スクレイピング)
// =============================================================
// 徳島県警察署 交通取締計画情報をスクレイピング
// 取得元ページ：https://www.police.pref.tokushima.jp/24kotuanzen/torisimari/kotu-torisimari.html
function scrKotuToriPlan() {
  const request = new XMLHttpRequest();
  // GoogleAppsScriptで作成したAPIを利用してデータ取得元ページのテーブル部のHTMLを取得
  const url =
    "https://script.google.com/macros/s/AKfycbwlTZ7LVkw0i4hLVkojgheMU8YES07XL10QBqKnaVzz_PcgBRgp/exec";

  request.open("GET", url);
  request.addEventListener("load", event => {
    // ステータス異常ハンドリング
    if (event.target.status !== 200) {
      console.error(`${event.target.status}: ${event.target.statusText}`);
      return;
    }
    let month = event.target.responseText.slice(0, 1);
    let kotuToriTbody = event.target.responseText.slice(1);

    // 取得した情報tbodyタグに入れて整理
    const tbody = document.createElement("tbody");
    tbody.innerHTML = kotuToriTbody;

    let arrKotuTori = setArrkotuTori(tbody);

    updateDb(month, arrKotuTori);
  });
  //エラーハンドリング
  request.addEventListener("error", () => {
    console.error("Network Error");
  });
  request.send();
}

//tbodyタグ内のデータを配列[オブジェクト]の形に変換
function setArrkotuTori(argTbody) {
  let arr = [];
  let obj = {};
  let date = "";
  let week = "";

  for (let i = 1; i < argTbody.rows.length; i++) {
    // テーブル（交通取締情報）の１行分のデータ格納するオブジェクト
    obj = {
      date: "",
      week: "",
      ampm: "",
      location1: "",
      route1: "",
      content1: "",
      location2: "",
      route2: "",
      content2: ""
    };
    // テーブルデータの各行列のデータをオブジェクトに格納
    for (let j = 0; j < argTbody.rows[i].cells.length; j++) {
      let cell = argTbody.rows[i].cells[j];
      // 日付、曜日が存在する場合取得
      if (j === 0 && cell.innerHTML !== "") {
        date = cell.innerHTML;
      }
      if (j === 1 && cell.innerHTML !== "") {
        week = cell.innerHTML;
      }
      // オブジェクトにデータを代入
      // route,contentが空の場合「不明」を代入
      if (j === 0) {
        obj["date"] = date;
      } else if (j === 1) {
        obj["week"] = week;
      } else if (j === 2) {
        obj["ampm"] = cell.innerHTML;
      } else if (j === 3) {
        obj["location1"] = cell.innerHTML;
      } else if (j === 4) {
        if (!checkStrEmpty(cell.innerHTML)) {
          obj["route1"] = "不明";
        } else {
          obj["route1"] = cell.innerHTML;
        }
      } else if (j === 5) {
        if (!checkStrEmpty(cell.innerHTML)) {
          obj["content1"] = "不明";
        } else {
          obj["content1"] = cell.innerHTML;
        }
      } else if (j === 6) {
        obj["location2"] = cell.innerHTML;
      } else if (j === 7) {
        if (!checkStrEmpty(cell.innerHTML)) {
          obj["route2"] = "不明";
        } else {
          obj["route2"] = cell.innerHTML;
        }
      } else if (j === 8) {
        if (!checkStrEmpty(cell.innerHTML)) {
          obj["content2"] = "不明";
        } else {
          obj["content2"] = cell.innerHTML;
        }
      }
    }
    arr.push(obj);
  }
  return arr;
}

// =============================================================
// firestore
// =============================================================
// データ更新
function updateDb(argMonth, argArrKotuTori) {
  // データ追加ドキュメント(ID)は自動
  firestore
    .collection("kotutori")
    .doc(argMonth)
    .set({
      data: argArrKotuTori
    })
    .then(function() {
      //正常終了時
      console.log("Document successfully written!");
    })
    .catch(function(error) {
      // 異常終了時
      console.error("Error writing document: ", error);
    });
}

// データ取得
function selectDb() {
  // カレンダーから日付を取得
  let cal = document.getElementById("cal").value;
  // YYYY-MM-DDからMMとDDをそれぞれ切り出しString型に変換
  let strCalMonth = String(parseInt(cal.slice(5, 7), 10));
  let strCalDate = String(parseInt(cal.slice(-2), 10));

  let docRef = firestore.collection("kotutori").doc(strCalMonth);
  docRef
    .get()
    .then(function(doc) {
      if (doc.exists) {
        // firebaseにデータが存在する時
        pickupInfo(strCalDate, doc.data().data);
      } else {
        // firebaseにデータが存在しない時
        console.log("No such document!");
      }
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
    });
}

// =============================================================
//
// =============================================================
function pickupInfo(argDate, argArrInfo) {
  for (let arrCnt = 0; arrCnt < argArrInfo.length; arrCnt++) {
    if (argArrInfo[arrCnt].date === argDate) {
      if (checkStrEmpty(argArrInfo[arrCnt].location1)) {
        setMarker(
          argArrInfo[arrCnt].ampm,
          argArrInfo[arrCnt].location1,
          argArrInfo[arrCnt].route1,
          argArrInfo[arrCnt].content1
        );
      }
      if (checkStrEmpty(argArrInfo[arrCnt].location2)) {
        setMarker(
          argArrInfo[arrCnt].ampm,
          argArrInfo[arrCnt].location2,
          argArrInfo[arrCnt].route2,
          argArrInfo[arrCnt].content2
        );
      }
    }
  }
}
// =============================================================
// Google Map
// =============================================================
function setMarker(argAmpm, argLocation, argRoute, argContent) {
  // すでに表示されているマーカーを削除
  arrMarker.forEach(function(marker, idx) {
    marker.setMap(null);
  });

  // ジオコーダのコンストラクタ
  var geocoder = new google.maps.Geocoder();

  // geocode(request, callback)
  //  Parameters:
  //  ・request:  GeocoderRequest
  //  ・callback:  function(Array<GeocoderResult>, GeocoderStatus)
  geocoder.geocode(
    {
      address: "徳島県" + argLocation
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        for (var i in results) {
          if (results[i].geometry) {
            // 緯度経度を取得
            var latLng = results[i].geometry.location;

            // マーカーインスタンス
            var marker = new google.maps.Marker({
              position: latLng,
              map: map
            });

            //住所を取得
            var address = results[0].formatted_address.replace(/^日本,/, "");

            new google.maps.InfoWindow({
              content:
                address.slice(6) + //「日本, 徳島県」は切捨て
                "<br>路線：" +
                argRoute +
                "<br>取締内容：" +
                argContent +
                "<br>時間帯：" +
                argAmpm
            }).open(map, marker);
            arrMarker.push(marker);
          }
        }
        //エラーハンドリング
      } else if (status == google.maps.GeocoderStatus.ERROR) {
        alert("サーバとの通信時にエラーが発生");
      } else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
        alert("リクエストに問題アリ！geocode()に渡すGeocoderRequestを確認");
      } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
        alert("短時間にクエリを送りすぎ");
      } else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
        alert("ジオコーダの利用が許可されていない");
      } else if (status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
        alert("サーバ側でのトラブル");
      } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
        alert("見つかりません");
      } else {
        alert("その他のエラー");
      }
    }
  );
}

// =============================================================
// ユーティリティ
// =============================================================
// 空文字チェック 空文字=false
function checkStrEmpty(str) {
  let result = true;
  if (str === "" || str === null || str === undefined) {
    result = false;
  }
  return result;
}
