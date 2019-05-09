// =============================================================
// 定数
// =============================================================

// LINEへアラートを送信するAPIのURL
const lineAlertUrl = "---URL---";
// firestore config
const config = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<BUCKET>.appspot.com",
  messagingSenderId: "<SENDER_ID>"
};
// LINEへ通知を開始するユーザと取締場所との距離(メートル)
const alertDis = 500000;

// =============================================================
// グローバル変数
// =============================================================
// google map
var map;
// ユーザの現在地マーカー
var userMarker;
// google map に配置した交通取締マーカーを管理する配列
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
  userMaker = new google.maps.Marker();
  arrMarker = new google.maps.MVCArray();
}

// ロード完了時に実行
window.onload = function() {
  // ユーザの現在地取得とマーカー設置
  getLocation();
};

// firebase
firebase.initializeApp(config);

// =============================================================
// main
// =============================================================

function main() {
  selectDb();
}

// =============================================================
// firestore
// =============================================================

// データ取得
function selectDb() {
  const firestore = firebase.firestore();

  // カレンダーから日付を取得
  const cal = document.getElementById("cal").value;
  // YYYY-MM-DDからMMとDDをそれぞれ切り出しString型に変換
  const strCalMonth = String(parseInt(cal.slice(5, 7), 10));
  const strCalDate = String(parseInt(cal.slice(-2), 10));

  let docRef = firestore.collection("kotutori").doc(strCalMonth);
  docRef
    .get()
    .then(function(doc) {
      if (doc.exists) {
        // firebaseにデータが存在する時
        let arrKotuTori = setArrkotuTori(doc.data().data);
        pickupInfo(strCalDate, arrKotuTori);
      } else {
        // firebaseにデータが存在しない時
        console.log("No such document!");
        alert("選択された日付の交通取締計画が公開されていません");
      }
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
    });
}

// =============================================================
// Google Map
// =============================================================

// 表示されているマーカーを削除
function deleteMarker() {
  arrMarker.forEach(function(marker, idx) {
    marker.setMap(null);
  });
}

function setMarker(argAmpm, argLocation, argRoute, argContent) {
  deleteMarker();
  // ジオコーダのコンストラクタ
  let geocoder = new google.maps.Geocoder();

  // geocode(request, callback)
  //  Parameters:
  //  ・request:  GeocoderRequest
  //  ・callback:  function(Array<GeocoderResult>, GeocoderStatus)
  geocoder.geocode(
    {
      address: "徳島県" + argLocation
    },
    function(results, status) {
      if (checkGeocoderStatus(status)) {
        for (let i in results) {
          if (results[i].geometry) {
            // 緯度経度を取得
            let latLng = results[i].geometry.location;

            // マーカーインスタンス
            let marker = new google.maps.Marker({
              position: latLng,
              map: map,
              icon: "	http://maps.google.co.jp/mapfiles/ms/icons/police.png"
            });

            //住所を取得
            let address = results[0].formatted_address.replace(/^日本,/, "");

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
      }
    }
  );
}

function getLocation() {
  console.log("getLocation");
  navigator.geolocation.watchPosition(
    setLocationInfo,
    function(e) {
      alert(e.message);
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 20000 }
  );
}

function setLocationInfo(position) {
  userMarker = new google.maps.Marker({
    map: map,
    position: {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    },
    icon: "./img/userIcon.png"
  });
  if (arrMarker.length > 0) {
    console.log("start checkDistance");
    checkDistance();
  }
}

// =============================================================
//
// =============================================================

//tbodyタグ内のデータを配列[オブジェクト]の形に変換
function setArrkotuTori(argkotuToriTbody) {
  // 取得した情報tbodyタグに入れて整理
  const tbody = document.createElement("tbody");
  tbody.innerHTML = argkotuToriTbody;

  let arr = [];
  let obj = {};
  let date = "";
  let week = "";

  for (let i = 1; i < tbody.rows.length; i++) {
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
    for (let j = 0; j < tbody.rows[i].cells.length; j++) {
      let cell = tbody.rows[i].cells[j];
      // 日付、曜日が存在する場合取得
      if (j === 0 && cell.innerHTML !== "") {
        date = cell.innerHTML;
      }
      if (j === 1 && cell.innerHTML !== "") {
        week = cell.innerHTML;
      }
      // オブジェクトにデータを代入
      // route,contentが空の場合「不明」を代入

      switch (j) {
        case 0:
          obj["date"] = date;
          break;
        case 1:
          obj["week"] = week;
          break;
        case 2:
          obj["ampm"] = cell.innerHTML;
          break;
        case 3:
          obj["location1"] = cell.innerHTML;
          break;
        case 4:
          if (!checkStrEmpty(cell.innerHTML)) {
            obj["route1"] = "不明";
          } else {
            obj["route1"] = cell.innerHTML;
          }
          break;
        case 5:
          if (!checkStrEmpty(cell.innerHTML)) {
            obj["content1"] = "不明";
          } else {
            obj["content1"] = cell.innerHTML;
          }
          break;
        case 6:
          obj["location2"] = cell.innerHTML;
          break;
        case 7:
          if (!checkStrEmpty(cell.innerHTML)) {
            obj["route2"] = "不明";
          } else {
            obj["route2"] = cell.innerHTML;
          }
          break;
        case 8:
          if (!checkStrEmpty(cell.innerHTML)) {
            obj["content2"] = "不明";
          } else {
            obj["content2"] = cell.innerHTML;
          }
          break;
      }
    }
    arr.push(obj);
  }
  return arr;
}

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

// 取締計画マーカーと ユーザの現在地との距離を求める。
function checkDistance() {
  let userPos = userMarker.getPosition();
  let kotuToriPos;
  // 距離の単位はm(メートル)
  let distance = 0;
  let mostShortDis = -1;
  arrMarker.forEach(function(marker, idx) {
    kotuToriPos = marker.getPosition();

    distance = google.maps.geometry.spherical.computeDistanceBetween(
      userPos,
      kotuToriPos
    );
    if (mostShortDis > distance || mostShortDis === -1) {
      mostShortDis = distance;
    }
  });
  console.log("dis:" + mostShortDis);
  // 最も近い交通取締場所がalertDis以内の場合
  if (mostShortDis < alertDis && mostShortDis !== -1) {
    console.log("sendLineAlert");
    sendLineAlert();
  }
}

function sendLineAlert() {
  fetch(lineAlertUrl)
    .then(function(response) {
      // ステータス異常ハンドリング
      if (response.status === 200) {
        return;
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch(function(error) {
      console.log(
        "There has been a problem with your fetch operation: ",
        error.message
      );
    });
}

function checkGeocoderStatus(status) {
  let result = false;
  switch (status) {
    case (status = google.maps.GeocoderStatus.OK):
      result = true;
      break;
    case (status = google.maps.GeocoderStatus.ERROR):
      result = false;
      alert("There was a problem contacting the Google servers.");
      break;
    case (status = google.maps.GeocoderStatus.INVALID_REQUEST):
      result = false;
      alert("This GeocoderRequest was invalid.");
      break;
    case (status = google.maps.GeocoderStatus.OVER_QUERY_LIMIT):
      result = false;
      alert(
        "The webpage has gone over the requests limit in too short a period of time."
      );
      break;
    case (status = google.maps.GeocoderStatus.REQUEST_DENIED):
      result = false;
      alert("The webpage is not allowed to use the geocoder.");
      break;
    case (status = google.maps.GeocoderStatus.UNKNOWN_ERROR):
      result = false;
      alert(
        "A geocoding request could not be processed due to a server error. The request may succeed if you try again."
      );
      break;
    case (status = google.maps.GeocoderStatus.ZERO_RESULTS):
      result = false;
      alert("No result was found for this GeocoderRequest.");
      break;
    default:
      result = false;
      alert("Unknown Error");
  }

  return result;
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
