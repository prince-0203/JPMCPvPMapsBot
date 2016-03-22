/**
 * feedback command
 */

module.exports = (args, client, originalTweet, callback) => {
  client.post('statuses/update', { status: `@prince__0203 Feedback: https://twitter.com/${oroginalTweet.user.screen_name}/${originalTweet.id_str}` });
  return callback('管理者にツイートが送信されました。');
};
