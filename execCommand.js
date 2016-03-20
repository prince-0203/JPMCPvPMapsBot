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

module.exports = (botInfo) => (args, isAdmin, callback) => {
  if(args[0] !== '@' + botInfo.screenName) {
    // 引数一つ目が'@JPMCPvPMapsBot'でなかった(コマンドでなかった)
    return callback(null);
  }
  console.log('Received: ' + args);

  switch(args[1]) {
    // 生存確認
    case 'おーい':
      return callback('Botは稼働中です!');
    // 終了
    case 'exit':
      if(!isAdmin) {
        return callback('エラー: このコマンドは管理者のみ使用可能です。');
      } else {
        return callback('Botを終了します…', null, () => {
          throw new Error('Received exit command.');
        });
      }
    // ローテーション確認
    case 'rotation':
    case 'r':
      if(!args[2]) {
        return callback('エラー: サーバー名を指定してください。');
      } else {
        request({
          uri: `http://maps.minecraft.jp/production/rotations/${args[2]}.txt`,
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
                return callback('内部エラー: 画像を生成できませんでした。');
              } else {
                return callback(args[2] + 'のローテーションです。', png);
              }
            });
          } else {
            return callback('内部エラー: maps.minecraft.jpからローテーションを取得できませんでした。');
          }
        });
      }
      break;
    // コマンドが存在しない
    default:
      return callback('エラー: コマンドが見つかりませんでした。');
  }
};
