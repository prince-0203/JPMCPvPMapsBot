const generator = (args) => {
  const server = args[0],
        rotation =  args[1],
        backgroundImagePath = args[2];

  const draw = SVG('drawing');

  // 背景
  const backgroundImage = draw.image(backgroundImagePath);

  // タイトル
  draw
    .text('JPMCPvP ' + server + ' Server')
    .attr({
      x: 15,
      y: -5,
      fill: '#FF8E8E'
    })
    .font({
      'size': 40
    });

  // テキスト
  draw
    .text((add) => {
      rotation.forEach((val, i) => {
        const tspan = add.tspan((i + 1) + '. ' + val).newLine();
        if(i >= 8) {
          tspan.dx(i >= 9 ? 250 : 0);
        }
        if(i % 9 === 0) {
          tspan.attr('y', 50);
        }
      });
    })
    .attr({
      x: 50,
      y: 50,
      fill: '#D4F0FF'
    })
    .font({
      'size': 25
    });
  /*rotationText.attr('y', 20 - rotationText.bbox().y);
  var textBBox = rotationText.bbox();
  draw.size(textBBox.width, textBBox.height);*/

  backgroundImage.loaded((loader) => {
    draw.size(loader.width, loader.height);
    window.callPhantom({ width: draw.width(), height: draw.height() });
  });
};
