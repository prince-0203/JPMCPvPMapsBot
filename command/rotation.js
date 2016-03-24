/**
 * rotation command
 */

const request = require('request'),
      fs = require('fs'),
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
        generateSVG(function(args) {
          const rotation = args[0], backgroundImagePath = args[1];

          var draw = SVG('drawing');

          // 背景
          var backgroundImage = draw.image(backgroundImagePath);

          // テキスト
          var rotationText = draw
            .text(rotation)
            .attr({
              x: 0,
              y: 20,
              fill: 'black'
            });
          rotationText.attr('y', 20 - rotationText.bbox().y);
          /*var textBBox = rotationText.bbox();
          draw.size(textBBox.width, textBBox.height);*/

          backgroundImage.loaded(function(loader) {
            draw.size(loader.width, loader.height);
            window.callPhantom({ width: draw.width(), height: draw.height() });
          });
        }, [body, 'data:image/png;base64,' + fs.readFileSync('Asset/background01.png').toString('base64')], (png) => {
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
