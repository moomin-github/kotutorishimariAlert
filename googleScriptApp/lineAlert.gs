function doGet(e) {
  var channel_access_token = 'アクセストークン';
  var user_id = 'Your user ID';
  var line_url = 'https://api.line.me/v2/bot/message/push';
  
  UrlFetchApp.fetch(line_url,{
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channel_access_token,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': user_id,
      'messages' : [
        {
          'type': 'text',
          'text': '近くで交通取締を行っています注意してください',
        }
      ]
    })
  });
  return ContentService.createTextOutput("Send alert");
}