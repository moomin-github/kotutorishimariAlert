// このスクリプトは日次で実行するようにトリガーを設定してください

// 出展
// 徳島県警察ホームページ (https://www.police.pref.tokushima.jp/index.html)  
// 「交通取締計画」(徳島県警察) (https://www.police.pref.tokushima.jp/24kotuanzen/torisimari/kotu-torisimari.html)
function scrKotuToriPlan() {
   var url = "https://www.police.pref.tokushima.jp/24kotuanzen/torisimari/kotu-torisimari.html";
   var response = UrlFetchApp.fetch(url).getContentText(); 
   var kotuToriInfo = Parser.data(response).from('<tbody>').to('</tbody>').build();
   // Logger.log(kotuToriInfo);
   
   var month = Parser.data(response).from('<p class="center ExtraLarge">').to('</p>').build();
   var monthInfo = month.replace(/[^0-9]/g, '');
   // Logger.log(monthInfo);
   
   updateFirestore(monthInfo, kotuToriInfo);
   
}

// firestoreから下記の設定項目を取得してください
function firestoreConf() {
  var dateArray = {
    "email": "",
    "projectId": "",
    "key": "",
  }
  return dateArray;
}

function updateFirestore(argMonth, argKotutori) {
  var dateArray = firestoreConf();
  var firestore = FirestoreApp.getFirestore(dateArray.email, dateArray.key, dateArray.projectId);
  firestore.updateDocument("kotutori/" + argMonth, {data: argKotutori});
}

