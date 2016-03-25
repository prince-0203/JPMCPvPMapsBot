/**
 * JPMCPvP Maps Bot
 *  Author: prince <mc.prince.0203@gmail.com> (https://github.com/prince-0203)
 */

console.log('App starts!');

const Twit = require('twit'),
      OpenShiftServer = require('./OpenShiftServer'),
      fs = require('fs'),
      readline = require('readline');

const botInfo = {
  id: process.env.BOT_ID,
  screenName: process.env.BOT_SCREEN_NAME
};

const execCommand = require('./execCommand')(botInfo);

if(process.env.OPENSHIFT_APP_NAME) {
  OpenShiftServer();
}

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
          twit.post('media/upload', { media: mediaBase64 }, function(err, media){
            var mediaIdString;
            if (err) {
              console.error(err);
              text = '内部エラー: Twitterに画像をアップロードできませんでした。';
            } else {
              mediaIdString = media.media_id_string;
            }
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

  // Streamでエラー
  stream.on('error', (err) => {
    throw err;
  });
}
