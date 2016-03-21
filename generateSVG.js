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
  phantom.create().then((ph) => {
    ph.createPage().then((page) => {
      page.open('data:text/html,<html><body><div id="drawing"></div></body></html>').then(() => {
        page.injectJs('./svg.js').then(() => {
          page.evaluate(evalFunction, arg).then((data) => {
            page.open('data:image/svg+xml,' + data[0]).then(() => {
              page.property('viewportSize', data[1]).then(() => {
                page.renderBase64('PNG').then((pngBase64) => {
                  ph.exit();
                  callback(new Buffer(pngBase64, 'base64'));
                });
              });
            });
          });
        });
      });
    });
  });
};
