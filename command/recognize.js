/**
 * recognize command
 */

const request = require('request');

module.exports = (args, originalTweet, callback) => {
  if(!originalTweet.entities.media) {
    return callback('エラー: 画像を指定してください。');
  } else {
    request.get({
      uri: originalTweet.entities.media[0].media_url,
      timeout: 5000,
      encoding: null
    }, (err, res, media) => {
      if (err || res.statusCode !== 200) {
        if(err) {
          console.error(err);
        } else {
          console.error('Error: HTTP ' + res.statusCode);
        }
        return callback('内部エラー: 画像を取得できませんでした。');
      } else {
        // 画像認識APIに送信
        request.post({
          uri: 'https://api.apigw.smt.docomo.ne.jp/imageRecognition/v1/recognize',
          timeout: 5000,
          qs: {
            APIKEY: process.env.DOCOMO_API_KEY,
            recog: 'product-all',
            numOfCandidates: 1
          },
          headers: {
            'Content-Type': 'application/octet-stream'
          },
          body: media
        }, (err, res, response) => {
          if (err || res.statusCode !== 200) {
            if(err) {
              console.log(err);
            } else {
              console.error('Error: HTTP ' + res.statusCode);
            }
            return callback('内部エラー: 画像を取得できませんでした。');
          } else {
            const item = JSON.parse(response).candidates[0];
            return callback(`${item.detail.itemName}\n著者: ${item.detail.author.join(', ')}\n${item.detail.releaseDate}発売\n${item.sites[0].url}`);
          }
        });
      }
    });
  }
};
/*
// 画像の場合
console.log('Media: ' + message.entities.media[0].media_url);
twit.post('direct_messages/new', {
  user_id: message.sender.id_str,
  text: '画像を検索中…'
}, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Replied direct message: ${data.text}`);
  }
});

// 画像をDL(twitではDMの画像を取得できないみたい)
request.get({
  uri: message.entities.media[0].media_url,
  timeout: 5000,
  headers: {
    Authorization: `OAuth oauth_consumer_key="${process.env.TWITTER_CONSUMER_KEY}", oauth_nonce="${nonce()}", oauth_signature="OAUTH_SIGNATURE", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${new Date().getTime()}", oauth_token="OAUTH_TOKEN", oauth_version="1.0"`
  }
}, (err, res, media) => {
  if(err || res.statusCode !== 200) {
    if(err) {
      console.error(err);
    }
    twit.post('direct_messages/new', {
      user_id: message.sender.id_str,
      text: '内部エラー: 画像を取得できませんでした。'
    }, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Replied direct message: ${data.text}`);
      }
    });
  } else {
    // 画像認識APIに送信
    request.post({
      uri: 'https://api.apigw.smt.docomo.ne.jp/imageRecognition/v1/recognize',
      timeout: 5000,
      qs: {
        APIKEY: process.env.DOCOMO_API_KEY,
        recog: 'product-all'
      },
      body: media
    }, (err, res, response) => {
      if(err || res.statusCode !== 200) {
        if(err) {
          console.error(err);
        }
        twit.post('direct_messages/new', {
          user_id: message.sender.id_str,
          text: '内部エラー: 画像認識APIからデータを取得できませんでした。'
        }, (err, data) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`Replied direct message: ${data.text}`);
          }
        });
      } else {
        const candidates = JSON.parse(response).candidates;
        twit.post('direct_messages/new', {
          user_id: message.sender.id_str,
          text: JSON.stringify(candidates, null, '  ')
        }, (err, data) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`Replied direct message: ${data.text}(Context: ${dialog.context}, Mode: ${dialog.mode})`);
          }
        });
      }
    });
  }
});*/
