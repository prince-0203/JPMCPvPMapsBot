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

const command = {
  /* eslint global-require: 0 */
  exit: require('./command/exit'),
  rotation: require('./command/rotation')
};

module.exports = (botInfo) => (args, isAdmin, callback) => {
  if(args[0] !== '@' + botInfo.screenName) {
    // 引数一つ目が'@JPMCPvPMapsBot'でなかった(コマンドでなかった)
    return callback(null);
  }
  console.log('Received: ' + args);

  args[1] = args[1].toLowerCase();

  switch(args[1]) {
    // 生存確認
    case 'おーい':
      return callback('Botは稼働中です!');
    // 終了
    case 'exit':
      return command.exit(args, callback);
    // ローテーション確認
    case 'rotation':
    case 'r':
      return command.rotation(args, callback);
    // コマンドが存在しない
    default:
      return callback('エラー: コマンドが見つかりませんでした。');
  }
};
