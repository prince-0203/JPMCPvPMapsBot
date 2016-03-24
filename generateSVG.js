/**
 * generateSVG Module
 *  generateSVG(evalFunction, arg, callback)
 *   evalFunction: SVGを操作する関数。SVG.jsが使用可能。SVGデータをreturnで返すこと。PhantomJSのサンドボックス内で実行され、ES2015の文法は使えない。アロー関数を渡すのも×
 *   arg: evalFunctionに渡す引数。複数ある場合は配列を渡せばよい。
 *   callback: PNG画像が生成されたときに呼ばれる関数。下記の引数をとる。
 *    funciton(png)
 *     png: PNG画像が入ったBuffer。画像の生成に失敗した場合はnullが渡される。
 */

const phantom = require('phantom');

module.exports = (evalFunction, arg, callback) => {
  var sitepage = null;
  var phInstance = null;
  phantom.create()
      .then((instance) => {
        phInstance = instance;
        return phInstance.createPage();
      })
      .then((page) => {
        sitepage = page;
        return sitepage.open('data:text/html,<html><body style="background-color: white; margin: 0"><div id="drawing"></div></body></html>');
      })
      .then(() => sitepage.injectJs('./svg.js'))
      .then(() => sitepage.property('onCallback', function(size) {
        SIZE = size;
      }))
      .then(() => sitepage.evaluate(evalFunction, arg))
      .then(() => {
        return new Promise((resolve, reject) => {
          (function checkForData() {
            phInstance.windowProperty('SIZE')
              .then(function(size) {
                if(size !== undefined) {
                  resolve(size);
                } else {
                  setTimeout(checkForData, 100);
                }
              })
              .catch((err) => {
                reject(err);
              });
          })();
        });
      })
      .then((size) => {
        return sitepage.property('viewportSize', size);
      })
      .then(() => sitepage.renderBase64('PNG'))
      .then((pngBase64) => {
        phInstance.exit();
        callback(new Buffer(pngBase64, 'base64'));
      })
      .catch((err) => {
        console.error(err);
        phInstance.exit();
      });
};
