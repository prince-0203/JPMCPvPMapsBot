/**
 * JPMCPvP Maps Bot
 *  Author: prince <mc.prince.0203@gmail.com> (https://github.com/prince-0203)
 */

console.log('App starts!');

const Twit = require('twit'),
      OpenShiftServer = require('./OpenShiftServer'),
      fs = require('fs'),
      readline = require('readline'),
      request = require('request'),
      mysql = require('mysql');

const botInfo = {
  id: process.env.BOT_ID,
  screenName: process.env.BOT_SCREEN_NAME
};

const execCommand = require('./execCommand')(botInfo);

if(process.env.OPENSHIFT_APP_NAME) {
  OpenShiftServer();
}

const mysqlConnection = mysql.createConnection(process.env.OPENSHIFT_MYSQL_DB_URL);

mysqlConnection.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL: ' + mysqlConnection.threadId);
});

if(process.env.LOCAL_DEBUG === '1') {
  console.warn('Local debug mode!');

  readline.createInterface({
    input: process.stdin,
    output: process.stdout
  }).on('line', function (line) {
    execCommand(('@JPMCPvPMapsBot ' + line).split(' '), null, null, true, (text, mediaBuf, callback) => {
      console.log('Result: ' + text);
      if(mediaBuf) {
        fs.writeFile('temp.png', mediaBuf);
      }
      if(callback) {
        return callback();
      }
    });
  });
} else {
  const twit = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

  const stream = twit.stream('user', { with: 'user', stringify_friend_ids: true });

  // データ受信
  stream.on('tweet', (tweet) => {
    const start = new Date();

    if(tweet.user.id_str === botInfo.id) {
      // 無限ループこわい
      return;
    }

    const reply = (text, mediaId, callback) => {
      twit.post('statuses/update', {
        status: `@${tweet.user.screen_name} ${text}\n(${new Date().getTime() - start.getTime()}ms)`,
        in_reply_to_status_id: tweet.id_str,
        media_ids: mediaId ? [mediaId] : undefined
      }, (err) =>{
        if (err) {
          console.error(err);
        } else {
          console.log(`Replied ${typeof(media) !== 'undefined' ? 'with media' : ''}: ` + text);
        }

        return callback();
      });
    };

    // 引数に分割してコマンドを実行
    execCommand(tweet.text.split(' '), twit, tweet, tweet.user.id_str === process.env.ADMIN_ID, (text, mediaBase64, callback) => {
      if(text) {
        if(mediaBase64) {
          // mediaをアップロードする場合
          console.time('uploadMedia');
          twit.post('media/upload', { media: mediaBase64 }, function(err, media){
            var mediaIdString;
            if (err) {
              console.error(err);
              text = '内部エラー: Twitterに画像をアップロードできませんでした。';
            } else {
              mediaIdString = media.media_id_string;
            }
            console.timeEnd('uploadMedia');
            reply(text, mediaIdString, () => {
              if(callback) {
                return callback();
              }
            });
          });
        } else {
          // テキストのみのリプライ送信
          reply(text, null, () => {
            if(callback) {
              return callback();
            }
          });
        }
      }
    });
  });

  stream.on('direct_message', function(data) {
    const message = data.direct_message;

    console.log(`Received direct message from @${message.sender.screen_name}: ${message.text}`);

    if(message.sender.id_str === botInfo.id) {
      // 無限ループこわい
      return;
    }

    request.post({
      uri: 'https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue',
      timeout: 5000,
      json: true,
      qs: {
        APIKEY: process.env.DOCOMO_API_KEY
      },
      body: {
        utt: message.text,
        nickname: message.sender.name
      }
    }, (err, res, dialogue) => {
      if(err || res.statusCode !== 200) {
        if(err) {
          console.error(err);
        }
        twit.post('direct_messages/new', {
          user_id: message.sender.id_str,
          text: '内部エラー: 雑談対話APIからデータを取得できませんでした。'
        });
      } else {
        twit.post('direct_messages/new', {
          user_id: message.sender.id_str,
          text: dialogue.utt
        }, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`Replied direct message: ${dialogue.utt}`);
          }
        });
      }
    });
  });

  // Streamでエラー
  stream.on('error', (err) => {
    throw err;
  });
}
