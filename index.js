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
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
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

    const reply = (text, mediaIds, callback) => {
      client.post('statuses/update', {
        status: `@${tweet.user.screen_name} ${text}\n(${new Date().getTime() - start.getTime()}ms)`,
        in_reply_to_status_id: tweet.id_str,
        media_ids: mediaIds
      }, (err) =>{
        if (err) {
          console.error(err);
        } else {
          console.log(`Replied ${media ? 'with media' : ''}: ` + text);
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
            if (err) {
              console.error(err);
              text = '内部エラー: Twitterに画像をアップロードできませんでした。';
            } else {
              const mediaIdString = media.media_id_string;
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
