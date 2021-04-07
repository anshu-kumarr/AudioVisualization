import { hslToRgb } from './utils.js'
const WIDTH = 1500;
const HEIGHT = 1500;

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = WIDTH;
canvas.height = HEIGHT;

let analyzer;
let bufferLength;
async function getAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new AudioContext();
  analyzer = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyzer)

  analyzer.fftSize = 2 ** 8;
  bufferLength = analyzer.frequencyBinCount;
  const timeData = new Uint8Array(analyzer.frequencyBinCount);
  const frequencyData = new Uint8Array(analyzer.frequencyBinCount)
  drawTimeData(timeData)
  drawFrequency(frequencyData)

}

function drawTimeData(timeData) {
  analyzer.getByteTimeDomainData(timeData)
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#ffc600";
  ctx.beginPath();
  const sliceWidth = WIDTH / bufferLength;
  let x = 0;
  timeData.forEach((data, i) => {
    const v = data / 128;
    const y = (v * HEIGHT) / 2;
    if (i == 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    x += sliceWidth;
  })
  ctx.stroke();
  requestAnimationFrame(() => drawTimeData(timeData))
}

function drawFrequency(frequencyData) {
  analyzer.getByteFrequencyData(frequencyData);
  const barWidth = (WIDTH / bufferLength) * 2.5;
  let x = 0;
  frequencyData.forEach((amount) => {
    const percent = amount / 255;
    const [h, s, l] = [360 / (percent * 360) - 0.5, 0.8, 0.5];
    const barHeight = HEIGHT * percent * 0.5;
    const [r, g, b] = hslToRgb(h, s, l);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
    x += barWidth + 2;
  });

  requestAnimationFrame(() => drawFrequency(frequencyData));
}

getAudio()