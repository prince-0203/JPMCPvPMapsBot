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
  feedback: require('./command/feedback'),
  kusoripu: require('./command/kusoripu'),
  rotation: require('./command/rotation'),
  map: require('./command/map'),
  recognize: require('./command/recognize'),
  ask: require('./command/ask')
};

module.exports = (botInfo) => (args, client, originalTweet, isAdmin, callback) => {
  if(args[0] !== '@' + botInfo.screenName) {
    // 引数一つ目が'@JPMCPvPMapsBot'でなかった(コマンドでなかった)
    return callback(null);
  }
  console.log(`Received from @${originalTweet ? originalTweet.user.screen_name : ''}: ` + args);

  args[1] = args[1].toLowerCase();

  switch(args[1]) {
    // 生存確認
    case 'おーい':
      return callback('Botは稼働中です!');
    // 終了
    case 'exit':
      return command.exit(args, callback);
    // Feedback
    case 'feedback':
      return command.feedback(args, client, originalTweet, callback);
    // kusoripu
    case 'kusoripu':
      return command.kusoripu(args, client, originalTweet, callback);
    // ローテーション
    case 'rotation':
    case 'r':
      return command.rotation(args, callback);
    // マップ情報
    case 'map':
      return command.map(args, callback);
    // 画像認識(商品認識)
    case 'recognize':
      return command.recognize(args, originalTweet, callback);
    // 知識Q&A
    case 'ask':
      return command.ask(args, callback);
    // コマンドが存在しない
    default:
      return callback('エラー: コマンドが見つかりませんでした。');
  }
};
