/**
 * ask command
 */

const request = require('request');

module.exports = (args, callback) => {
  request.get({
    uri: 'https://api.apigw.smt.docomo.ne.jp/knowledgeQA/v1/ask',
    timeout: 5000,
    qs: {
      APIKEY: process.env.DOCOMO_API_KEY,
      q: args.slice(2).join(' ')
    },
    json: true
  }, (err, res, answer) => {
    if (err || res.statusCode !== 200) {
      if(err) {
        console.error(err);
      } else {
        console.error('Error: HTTP ' + res.statusCode);
      }
      return callback('内部エラー: 回答を取得できませんでした。');
    } else {
      switch(answer.code) {
        case 'E010000':
          return callback('内部エラー: パラメータ不備のため回答不能です。');
        case 'E020000':
          return callback('エラー: 結果が0件でした。');
        case 'E099999':
          return callback('内部エラー: 知識Q&A API内部でエラーが発生しました。');
        default:
          if(answer.code.substr(0, 1) === 'E') {
            return callback(`内部エラー: 知識Q&A APIで不明なエラー(${answer.code})が発生しました。`);
          } else {
            var answers = '';
            answer.answers.forEach((val) => {
              answers += `${val.rank}. ${val.answerText}(${encodeURI(val.linkUrl)})\n`;
            });

            request.post({
              uri: 'https://paste.minecraft.jp/documents',
              timeout: 5000,
              body: answers
            }, (err, res, key) => {
              if (err || res.statusCode !== 200) {
                if(err) {
                  console.error(err);
                } else {
                  console.error('Error: HTTP ' + res.statusCode);
                }
                return callback('内部エラー: 回答を送信できませんでした。');
              } else {
                return callback(`${answer.message.textForDisplay}(${answer.code})\n(出典: ${encodeURI(answer.answers[0].linkUrl)})\nhttps://paste.minecraft.jp/${JSON.parse(key).key}.txt`);
              }
            });
          }
      }
    }
  });
};
