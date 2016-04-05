# JPMCPvP Maps Bot
[![Dependency Status](https://gemnasium.com/prince-0203/JPMCPvPMapsBot.svg)](https://gemnasium.com/prince-0203/JPMCPvPMapsBot)
[![Code Climate](https://codeclimate.com/github/prince-0203/JPMCPvPMapsBot/badges/gpa.svg)](https://codeclimate.com/github/prince-0203/JPMCPvPMapsBot)
[![Issue Count](https://codeclimate.com/github/prince-0203/JPMCPvPMapsBot/badges/issue_count.svg)](https://codeclimate.com/github/prince-0203/JPMCPvPMapsBot)

[JPMCPvP Maps Bot(@JPMCPvPMapsBot)さん | Twitter](https://twitter.com/JPMCPvPMapsBot)  
Botの使い方は[こちら](https://prince-0203.github.io/JPMCPvPMapsBot/)

## Run
### 1. [Twitter Application Management](https://apps.twitter.com/)でアプリケーションを作成し、環境変数に以下の値を設定します。

| 変数名                      | 値                                                                             |
|-----------------------------|--------------------------------------------------------------------------------|
| TWITTER_CONSUMER_KEY        | Twitter API Consumer Key (API Key)                                             |
| TWITTER_CONSUMER_SECRET     | Twitter API Consumer Secret (API Secret)                                       |
| TWITTER_ACCESS_TOKEN_KEY    | Twitter API Access Token                                                       |
| TWITTER_ACCESS_TOKEN_SECRET | Twitter API Access Token Secret                                                |
| BOT_ID                      | BotのUser ID                                                                   |
| BOT_SCREEN_NAME             | BotのScreen Name                                                               |
| ADMIN_ID                    | Botの管理者のUser ID                                                           |
| ADMIN_SCREEN_NAME           | Botの管理者のScreen Name                                                       |
| MINECRAFTJP_CLIENT_ID       | [JPMCPvP REST API](https://pvp-docs.minecraft.jp/ja/latest/rest) Client ID     |
| MINECRAFTJP_CLIENT_SECRET   | [JPMCPvP REST API](https://pvp-docs.minecraft.jp/ja/latest/rest) Client Secret |
| DOCOMO_API_KEY              | [docomo Developer support API](https://dev.smt.docomo.ne.jp/) API Key          |
| OPENSHIFT_MYSQL_DB_HOST     | MySQL DB Host                                                                  |
| OPENSHIFT_MYSQL_DB_PORT     | MySQL DB Port                                                                  |
| OPENSHIFT_MYSQL_DB_USERNAME | MySQL DB User                                                                  |
| OPENSHIFT_MYSQL_DB_PASSWORD | MySQL DB Password                                                              |

### 2. 実行します。

```shell
npm install
npm start
```
