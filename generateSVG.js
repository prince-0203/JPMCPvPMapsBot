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
      fs = require("fs");

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
  .catch((err) => {
    phInstance.exit();
    throw err;
  });

module.exports = (generatorPath, args, callback) => {
  new Promise((resolve, reject) => {
    fs.readFile(generatorPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
    .then((generator) => {
      return sitepage.evaluateJavaScript(`function() { ${generator}; generator(${JSON.stringify(args)}); }`);
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
    .then(() => {
      return sitepage.renderBase64('PNG');
    })
    .then((png) => {
      sitepage.evaluate(function() {
        document.getElementById('drawing').textContent = null;
      });
      callback(png);
    })
    .catch((err) => {
      phInstance.exit();
      throw err;
    });
};
