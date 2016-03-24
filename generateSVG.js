/**
 * generateSVG Module
 *  generateSVG(evalFunction, arg, callback)
 *   evalFunction: SVGを操作する関数。SVG.jsが使用可能。SVGデータをreturnで返すこと。PhantomJSのサンドボックス内で実行されるが、Babelを使用してES6の文法を使えるようにしてある。
 *   arg: evalFunctionに渡す引数。複数ある場合は配列を渡せばよい。
 *   callback: PNG画像が生成されたときに呼ばれる関数。下記の引数をとる。
 *    funciton(png)
 *     png: PNG画像が入ったBuffer。画像の生成に失敗した場合はnullが渡される。
 */

const phantom = require('phantom'),
      babel = require("babel-core");  // PhantomJSでES6が動かないので、毎回ES5に変換する。多少パフォーマンスは落ちるけど気にしない。

module.exports = (evalFunction, args, callback) => {
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
      .then(() => {
        /*
          実際には以下のようなコードが実行される。Babelを使用してES6のコードが使えるようにした結果こうなってしまった…全てはPhantomJSでES6が使えないのが悪い。
          function() {
            var __args = ["arg1", 5, true];  // argsをJSONに変換したもの。JSONなのでそのまま動く。

            (function(args) {
              //
              // evalFunctionをBabelを使用してES5に変換したもの
              //
            })(__args);
          }
        */
        const transformed = babel.transform(`(${evalFunction})(__args);`, {
          presets: ['es2015'],
          comments: false,
          sourceMaps: false,
          ast: false,
          compact: false,
          babelrc: false
        }).code;
        return sitepage.evaluateJavaScript(`function() { var __args = ${JSON.stringify(args)}; ${transformed} }`);
      })
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
