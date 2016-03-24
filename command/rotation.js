/**
 * rotation command
 */

const request = require('request'),
      fs = require('fs'),
      generateSVG = require('../generateSVG');

module.exports = (args, callback) => {
  if(!args[2]) {
    return callback('エラー: サーバー名を指定してください。');
  } else {
    request({
      uri: `http://maps.minecraft.jp/production/rotations/${args[2]}.txt`,
      timeout: 5000
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        generateSVG((args) => {
          const server = args[0],
                rotation =  args[1],
                backgroundImagePath = args[2];

          const draw = SVG('drawing');

          // 背景
          const backgroundImage = draw.image(backgroundImagePath);

          // タイトル
          draw
            .text('JPMCPvP ' + server + ' Server')
            .attr({
              x: 15,
              y: -5,
              fill: '#FF8E8E'
            })
            .font({
              'size': 40
            });

          // テキスト
          draw
            .text((add) => {
              rotation.forEach((val, i) => {
                const tspan = add.tspan((i + 1) + '. ' + val).newLine();
                if(i >= 8) {
                  tspan.dx(i >= 9 ? 250 : 0);
                }
                if(i % 9 === 0) {
                  tspan.attr('y', 50);
                }
              });
            })
            .attr({
              x: 50,
              y: 50,
              fill: '#D4F0FF'
            })
            .font({
              'size': 25
            });
          /*rotationText.attr('y', 20 - rotationText.bbox().y);
          var textBBox = rotationText.bbox();
          draw.size(textBBox.width, textBBox.height);*/

          backgroundImage.loaded((loader) => {
            draw.size(loader.width, loader.height);
            window.callPhantom({ width: draw.width(), height: draw.height() });
          });
        }, [args[2], body.split('\n').filter((val) => (val !== "")), 'data:image/png;base64,' + fs.readFileSync('Asset/background01.png').toString('base64')], (png) => {
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
