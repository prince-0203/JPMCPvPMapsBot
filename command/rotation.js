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
      if (err || res.statusCode !== 200) {
        return callback('内部エラー: maps.minecraft.jpからローテーションを取得できませんでした。');
      } else {
        generateSVG('./command/generateSVG/dest/rotation.js', [args[2], body.split('\n').filter((val) => (val !== "")), 'data:image/png;base64,' + fs.readFileSync('Asset/background01.png').toString('base64')], (png) => {
          if(!png) {
            return callback('内部エラー: 画像を生成できませんでした。');
          } else {
            return callback(args[2] + 'のローテーションです。', png);
          }
        });
      }
    });
  }
};
