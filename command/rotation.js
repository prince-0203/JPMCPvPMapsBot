/**
 * rotation command
 */

 const request = require('request'),
       generateSVG = require('../generateSVG.js');

module.exports = (args, callback) => {
  if(!args[2]) {
    return callback('エラー: サーバー名を指定してください。');
  } else {
    request({
      uri: `http://maps.minecraft.jp/production/rotations/${args[2]}.txt`,
      timeout: 5000
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        generateSVG(function(rotation) {
          var draw = SVG('drawing');

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

          return [draw.svg(), { width: draw.width(), height: draw.height() }];
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
};
