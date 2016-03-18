/* jshint esversion:2015 */

const LOG = console.log;
const ERROR = console.error;

LOG('App starts!');

const Twitter = require('twitter'),
      request = require('request'),
      phantom = require('phantom');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const botId = '710259769970286592';
const botScreenName = 'JPMCPvPMapsBot';

const execCommand = (args, isAdmin, callback) => {
  if(args[0] !== '@' + botScreenName) {
    // 引数一つ目が'@JPMCPvPMapsBot'でなかった(コマンドでなかった)
    callback(null);
    return;
  }
  LOG('Received: ' + args);

  switch(args[1]) {
    // 生存確認
    case 'おーい':
      callback('Botは稼働中です!');
      return;
    // 終了
    case 'exit':
      if(!isAdmin) {
        callback('エラー: このコマンドは管理者のみ使用可能です。');
      } else {
        callback('Botを終了します…', null, () => {
          LOG('Exiting...');
          process.exit();
        });
      }
      return;
    // ローテーション確認
    case 'rotation':
    case 'r':
      if(!args[2]) {
        callback('エラー: サーバー名を指定してください。');
      } else {
        request({
          uri : `http://maps.minecraft.jp/production/rotations/${args[2]}.txt`,
          timeout: 5000
        }, (err, res, body) => {
          if (!err && res.statusCode === 200) {
            phantom.create().then((ph) => {
              ph.createPage().then((page) => {
                // とりあえずHTML上でSVGを操作
                page.open('data:text/html,<html><body><div id="drawing"></div></body></html>').then((status) => {
                  if(status === 'success') {
                    page.injectJs('./svg.js').then(() => {
                      // SVG操作
                      page.evaluate(function(rotation) {
                        // この中ではES5のコードしか動作しない
                        var draw = SVG('drawing').size(400, 300);

                        // 背景
                        draw
                          .rect('100%', '100%')
                          .attr('fill', 'white');

                        // テキスト
                        var rotationText = draw
                          .text(rotation)
                          .attr({
                            x: 0,
                            y: 20,
                            fill: 'black'
                          });
                        rotationText.attr('y', 20 - rotationText.bbox().y);
                        var textBBox = rotationText.bbox();
                        draw.size(textBBox.width, textBBox.height);

                        return 'data:image/svg+xml,' + draw.svg();
                      }, body).then((svg) => {
                        // SVGを開いてJPEG書き出し
                        page.open(svg).then(() => {
                          page.renderBase64('PNG').then((image) => {
                            ph.exit();
                            callback(args[2] + 'のローテーションです。', new Buffer(image, 'base64'));
                          });
                        });
                      });
                    });
                  } else {
                    ERROR(err);
                    ph.exit();
                    callback('内部エラー: 画像を生成できませんでした。');
                  }
                });
              });
            });
          } else {
            callback('内部エラー: maps.minecraft.jpからローテーションを取得できませんでした。');
          }
        });
      }
      return;
    // コマンドが存在しない
    default:
      callback('エラー: コマンドが見つかりませんでした。');
      return;
  }
};

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
              ERROR(err);
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
                ERROR(err);
              } else {
                LOG('Replied with media: ' + text);
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
              ERROR(err);
            } else {
              LOG('Replied: ' + text);
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
