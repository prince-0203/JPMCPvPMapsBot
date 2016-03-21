/**
 * OpenShiftServer Module
 *  OpenShiftにデプロイした際にポート8080でサーバが開いていないと動作しないので。
 */

const http = require('http');

module.exports = () => {
  const ipAddress = process.env.OPENSHIFT_NODEJS_IP || process.env.OPENSHIFT_INTERNAL_IP,
        port = process.env.OPENSHIFT_NODEJS_PORT || process.env.OPENSHIFT_INTERNAL_PORT || 8080;

  if (!ipAddress) {
    console.warn('No OPENSHIFT_*_IP var, using 127.0.0.1');
    ipAddress = "127.0.0.1";
  }

  http.createServer((req, res) => res.end()).listen(port, ipAddress);
};
