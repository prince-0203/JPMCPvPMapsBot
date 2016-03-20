/**
 * JPMCPvP Maps Bot
 *  Author: prince <mc.prince.0203@gmail.com> (https://github.com/prince-0203)
 */

const ipAddress = process.env.OPENSHIFT_NODEJS_IP || process.env.OPENSHIFT_INTERNAL_IP,
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.OPENSHIFT_INTERNAL_PORT || 8080;

if (!ipAddress) {
  console.warn('No OPENSHIFT_*_IP var, using 127.0.0.1');
  ipAddress = "127.0.0.1";
}

require('http').createServer((req, res) => { res.end(); }).listen(port, ipAddress);

console.log('App starts!');

const Twitter = require('twitter');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const botInfo = {
  id: process.env.BOT_ID,
  screenName: process.env.BOT_SCREEN_NAME
};

const execCommand = require('./execCommand.js')(botInfo);

client.stream('user', { with: 'user', stringify_friend_ids: true }, stream => {
  // データ受信
  stream.on('data', (tweet) => {
    const start = new Date();

    if(tweet.friends) {
      // フォローしてるユーザー一覧が返ってきた
      return;
    }

    const reply = (text, mediaIds, callback) => {
      client.post('statuses/update', {
        status: `@${tweet.user.screen_name} ${text}\n(${new Date().getTime() - start.getTime()}ms)`,
        in_reply_to_status_id: tweet.id_str,
        media_ids: mediaIds
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
    execCommand(tweet.text.split(' '), tweet.user.id_str === '4637307672', (text, mediaBuf, callback) => {
      if(text) {
        if(mediaBuf) {
          // mediaをアップロードする場合
          client.post('media/upload', { media: mediaBuf }, function(err, media){
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
          reply(text, undefined, () => {
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
});
