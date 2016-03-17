/* jshint esversion:2015 */

console.log('App start!');

const fs = require('fs'),
      Twitter = require('twitter'),
      request = require('request'),
      jsdom = require('jsdom'),
      Canvas = require('canvas'),
      jquery = require('jquery'),
      jcanvas = require('jcanvas')/*,
      svg2png = require('svg2png')*/;

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const botId = '710259769970286592';
const botScreenName = 'JPMCPvPMapsBot';

// 画像処理用
/*const svg = $('svg').attr({
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.1',
    width: 400,
    height: 400,
  });*/

jsdom.env('', function ( err, window ) {
  if(err) {
    console.error(err);
  }

  var $ = jquery(window);
  jcanvas($, window);

  const execCommand = (args, isAdmin, callback) => {
    console.log('Received: ' + args);

    if(args[0] !== '@' + botScreenName) {
      // 引数一つ目が'@JPMCPvPMapsBot'でなかった(コマンドでなかった)
      callback(null);
      return;
    }

    switch(args[1]) {
      // 生存確認
      case 'おーい':
        callback('Botは稼働中です!');
        return;
      // 終了
      case 'exit':
        if(!isAdmin) {
          callback('このコマンドは管理者のみ使用可能です。');
        } else {
          callback('Botを終了します…', () => {
            console.log('Exiting...');
            process.exit();
          });
        }
        return;
      // ローテーション確認
      case 'rotation':
      case 'r':
        if(!args[2]) {
          callback('サーバー名を指定してください。');
        } else {
          request(`http://maps.minecraft.jp/production/rotations/${args[2]}.txt`, function (err, res, body) {
            if (!err && res.statusCode === 200) {
              const image = $('<canvas width="400" height="300">')
                .drawText({
                  fillStyle: '#9cf',
                  strokeStyle: '#25a',
                  strokeWidth: 2,
                  x: 150, y: 100,
                  fontSize: 48,
                  fontFamily: 'Verdana, sans-serif',
                  text: 'Hello'
                })
                .getCanvasImage('jpeg');

              callback(args[2] + 'のローテーションです。', new Buffer(image.match(/^data:.+\/(.+);base64,(.*)$/)[2], 'base64'));
              /*svg
                .append('<rect>')
                .children('rect')
                .attr({
                  width: svg.attr('width'),
                  height: svg.attr('height'),
                  fill: 'white'
                });
              const bBox = svg
                .append('<text>')
                .children('text')
                .text(body)
                .attr({
                  fill:'black',
                  'font-family': 'sans-serif',
                  'font-size': 10
                });
              console.log(bBox.outerHTML);
              svg.attr({
                y: 0 - bBox.y
              });
              console.log(svg.prop('outerHTML'));

              svg2png(new Buffer(svg.prop('outerHTML')))
                .then((buf) => {
                  svg.empty();
                  callback(args[2] + 'のローテーションです。', buf);
                })
                .catch((e) => {
                  svg.empty();
                  console.error(e);
                  callback('内部エラー: SVGをPNGに変換できませんでした。');
                });*/
            } else {
              callback('通信エラーが発生したためローテーションを取得できませんでした。');
            }
          });
        }
        return;
      // コマンドが存在しない
      default:
        callback('コマンドが見つかりませんでした。');
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

      if(tweet.in_reply_to_user_id_str !== botId) {
        // 自分に対するリプライではなかった
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
                text = 'エラー: Twitterに画像をアップロードできませんでした。';
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
            });
          }
        }

        // 管理コマンド送信時など…
        if(callback) {
          callback();
        }
      });
    });

    // Streamでエラー
    stream.on('error', (err) => {
      throw err;
    });
  });
});
