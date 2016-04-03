/**
 * map command
 */

 const request = require('request')/*,
       generateSVG = require('../generateSVG')*/;

module.exports = (args, callback) => {
  if(!args[2]) {
    return callback('エラー: マップ名を指定してください。');
  } else {
    request.post({
      uri: 'https://minecraft.jp/oauth/token',
      timeout: 5000,
      json: true,
      form: {
        grant_type: 'client_credentials',
        client_id: process.env.MINECRAFTJP_CLIENT_ID,
        client_secret: process.env.MINECRAFTJP_CLIENT_SECRET
      }
    }, (err, res, accessToken) => {
      if (err || res.statusCode !== 200) {
        if(err) {
          console.error(err);
        } else {
          console.error(accessToken);
        }
        return callback(`内部エラー: JPMCPvP APIからアクセストークンを取得できませんでした。(HTTP ${res.statusCode})`);
      } else {
        request.get({
          uri: encodeURI('https://pvp-api.minecraft.jp/v1/maps/' + args.slice(2).join(' ')),
          timeout: 5000,
          json: true,
          qs: {
            access_token: accessToken.access_token
          }
        }, (err, res, map) => {
          if (err || res.statusCode !== 200) {
            if(err) {
              console.error(err);
              return callback('内部エラー: JPMCPvP APIからマップ情報を取得できませんでした。(通信エラー)');
            } else if(res.statusCode === 404) {
              return callback('指定されたマップが見つかりませんでした。(HTTP 404)');
            } else {
              return callback(`内部エラー: JPMCPvP APIからマップ情報を取得できませんでした。(HTTP ${res.statusCode})`);
            }
          } else {
            return callback(map.name + ' Type: ' + map.type + '\nID: ' + map.id);
          }
        });
      }
    });
  }
};
