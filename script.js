const container = document.createElement('canvas');
document.body.appendChild(container);
var regl = createREGL(container);

var patternTexture = new Image();
patternTexture.crossOrigin = 'anonymous';
patternTexture.onload = function () {
  initShader(container, patternTexture);
}
patternTexture.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/168886/tex-magicCircle-01.png';

function initShader(canvas, image) {
  keepFullSize(canvas);
  
  const frameTexture = regl.texture({
    copy: true,
    min: 'linear',
    mag: 'linear'
  });
  const feedbackTexture = regl.texture({
    copy: true,
    min: 'linear',
    mag: 'linear'
  });

  const drawFrame = regl({
    vert: document.getElementById('vertexShader').textContent,
    frag: document.getElementById('fragmentShader').textContent,
    attributes: { position: [-2, 0, 0, -2, 2, 2] },
    count: 3,
    uniforms: {
      resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight
      ],
      time: regl.context('time'),
      txImage: regl.texture(image)
    },
    depth: {enable: false}
  });

  const drawFeedback = regl({
    vert: document.getElementById('vertexShader').textContent,
    frag: document.getElementById('feedbackFragShader').textContent,
    attributes: { position: [-2, 0, 0, -2, 2, 2] },
    count: 3,
    uniforms: {
      time: regl.context('time'),
      txFeedback: feedbackTexture,
      txFrame: frameTexture
    },
    depth: {enable: false},
  });

  const drawHighlight = regl({
    vert: document.getElementById('vertexShader').textContent,
    frag: document.getElementById('highlightFragShader').textContent,
    attributes: { position: [-2, 0, 0, -2, 2, 2] },
    count: 3,
    uniforms: {
      txFeedback: feedbackTexture,
      txFrame: frameTexture
    }
  });

  regl.frame(() => {
    drawFrame();
    frameTexture({
      copy: true,
      min: 'linear',
      mag: 'linear'
    });
    drawFeedback();
    feedbackTexture({
      copy: true,
      min: 'linear',
      mag: 'linear'
    });
    drawHighlight();
  })
}

// Utils
const setFullSize = el => {
  el.setAttribute('width', window.innerWidth);
  el.setAttribute('height', window.innerHeight);
};
const keepFullSize = el => {
  window.addEventListener( 'resize', setFullSize.bind(null, el), false);
  setFullSize(el);
};