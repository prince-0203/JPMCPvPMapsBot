/**
 * exit command
 */

module.exports = (args, callback) => {
  if(!isAdmin) {
    return callback('エラー: このコマンドは管理者のみ使用可能です。');
  } else {
    return callback('Botを終了します…', null, () => { process.exit(); });
  }
};
