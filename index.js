/* jshint esversion:2015 */

/**
 * JPMCPvP Maps Bot
 *  Author: prince <mc.prince.0203@gmail.com> (https://github.com/prince-0203)
 */

console.log('App starts!');

const Twitter = require('twitter');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const botInfo = {
  id: process.env.BOT_ID,
  screenName: process.env.BOT_SCREEN_NAME
};

const execCommand = require('./execCommand.js')(botInfo);

client.stream('user', { with: 'user' }, stream => {
  // データ受信
  stream.on('data', (tweet) => {
    const start = new Date();

    if(tweet.friends) {
      // フォローしてるユーザー一覧が返ってきた
      return;
    }

    // 引数に分割してコマンドを実行
    execCommand(tweet.text.split(' '), tweet.user.id_str === '4637307672', (text, mediaBuf, callback) => {
      if(text) {
        var mediaIdString;
        if(mediaBuf) {
          // mediaをアップロードする場合
          client.post('media/upload', { media: mediaBuf }, function(err, media){
            if (err) {
              console.error(err);
              text = '内部エラー: Twitterに画像をアップロードできませんでした。';
              mediaIdString = undefined;
            } else {
              mediaIdString = media.media_id_string;
            }

            // リプライ送信
            client.post('statuses/update', {
              status: `@${tweet.user.screen_name} ${text}\n(${new Date().getTime() - start.getTime()}ms)`,
              in_reply_to_status_id: tweet.id_str,
              media_ids: mediaIdString
            }, (err) =>{
              if (err) {
                console.error(err);
              } else {
                console.log('Replied with media: ' + text);
              }

              // 管理コマンド送信時など…
              if(callback) {
                callback();
              }
            });
          });
        } else {
          // リプライ送信
          client.post('statuses/update', {
            status: `@${tweet.user.screen_name} ${text}\n(${new Date().getTime() - start.getTime()}ms)`,
            in_reply_to_status_id: tweet.id_str,
          }, (err) =>{
            if (err) {
              console.error(err);
            } else {
              console.log('Replied: ' + text);
            }

            if(callback) {
              callback();
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
