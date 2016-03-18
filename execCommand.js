/* jshint esversion: 2015 */

/**
 * execCommand Module
 *  注意: require時にBotの情報を指定する。例: require('./execCommand.js')({ id: '0000000', screenName: 'JPMCPvPMapsBot' })
 *  execCommand(args, isAdmin, callback)
 *   args: ユーザから送信されたコマンド。配列で指定する。
 *   isAdmin: コマンドを送信したユーザがBotの管理者かどうか。管理用コマンドの実行可否を判断するのに使用する。
 *   callback: コマンドの実行が完了したときに呼ばれる関数。下記の引数をとる。
 *    function(text, media, callback)
 *     text: ユーザに送信するツイートの内容。
 *     media: ツイートに添付するメディア。Bufferで渡される。メディアがない場合はnullまたはundefinedが渡される。
 *     callback: ツイートが送信された(あるいは送信に失敗した)ときに呼ぶ関数。管理用コマンドのexitでのみ使用される。関数がない場合はnullまたはundefinedが渡される。
 */

const request = require('request'),
      generateSVG = require('./generateSVG.js');

module.exports = (botInfo) => {
  return (args, isAdmin, callback) => {
    if(args[0] !== '@' + botInfo.screenName) {
      // 引数一つ目が'@JPMCPvPMapsBot'でなかった(コマンドでなかった)
      callback(null);
    } else {
      console.log('Received: ' + args);

      switch(args[1]) {
        // 生存確認
        case 'おーい':
          callback('Botは稼働中です!');
          break;
        // 終了
        case 'exit':
          if(!isAdmin) {
            callback('エラー: このコマンドは管理者のみ使用可能です。');
          } else {
            callback('Botを終了します…', null, () => {
              console.log('Exiting...');
              process.exit();
            });
          }
          break;
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
                generateSVG(function(rotation) {
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

                  return draw.svg();
                }, body, (png) => {
                  if(!png) {
                    callback('内部エラー: 画像を生成できませんでした。');
                  } else {
                    callback(args[2] + 'のローテーションです。', png);
                  }
                });
                /*phantom.create().then((ph) => {
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
                        console.error(err);
                        ph.exit();
                        callback('内部エラー: 画像を生成できませんでした。');
                      }
                    });
                  });
                });*/
              } else {
                callback('内部エラー: maps.minecraft.jpからローテーションを取得できませんでした。');
              }
            });
          }
          break;
        // コマンドが存在しない
        default:
          callback('エラー: コマンドが見つかりませんでした。');
          break;
      }
    }
  };
};
