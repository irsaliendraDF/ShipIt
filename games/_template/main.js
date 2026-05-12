// shipit.fun experiment template.
// Replace this with your experiment logic. The canvas is already mounted.
// If you want gesture / pose detection, copy the helpers from
// packages/gesture-core or load MediaPipe directly via CDN.

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let t = 0;

function frame() {
  t += 1;
  ctx.fillStyle = '#faf7f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ff6fb5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 6) {
    const y = canvas.height / 2 + Math.sin((x + t) * 0.02) * 60;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  ctx.font = '12px "DM Sans", system-ui, sans-serif';
  ctx.fillText('// hello, shipit.fun', 24, 32);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
