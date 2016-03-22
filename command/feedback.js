/**
 * feedback command
 */

module.exports = (args, client, originalTweet, callback) => {
  client.post('statuses/update', { status: `@prince__0203 Feedback: https://twitter.com/${originalTweet.user.screen_name}/status/${originalTweet.id_str}` }, (err) => {
    if(err) {
      return callback('ツイートの送信に失敗しました。時間をおいて再度お試しください。');
    } else {
      return callback('管理者にツイートが送信されました。');
    }
  });
};
