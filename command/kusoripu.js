/**
 * kusoripu command
 */

module.exports = (args, client, originalTweet, callback) => {
  if(args[2].charAt(0) === '@') {
    args[2] = args[2].substr(1);
  }
  client.get('friendships/show', { source_id: originalTweet.user.id_str, target_screen_name: args[2] }, (err, result) => {
    if(err) {
      return callback('F/F情報の取得に失敗しました。時間をおいて再度お試しください。');
    } else {
      if(!result.relationship.target.following || !result.relationship.target.followed_by) {
        return callback('クソリプの送信には対象のユーザーと相互フォローである必要があります。');
      } else {
        client.post('statuses/update', { status: `@${args[2]} ﾇﾍﾞﾁﾞｮﾝﾇｿﾞｼﾞｮﾝﾍﾞﾙﾐｯﾃｨｽﾓｹﾞﾛﾝﾎﾞｮwwwwwww└(՞ةڼ◔)」ｲﾋｰwwwｲﾋﾋﾋﾋﾋﾋwwwwwww└(՞ةڼ◔)」 https://twitter.com/${originalTweet.user.screen_name}/status/${originalTweet.id_str}` }, (err) => {
          if(err) {
            return callback('クソリプの送信に失敗しました。時間をおいて再度お試しください。');
          } else {
            return callback('クソリプが送信されました。');
          }
        });
      }
    }
  });
};
