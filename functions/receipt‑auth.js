// receipt-auth.js
const { ExifTool } = require('exiftool-vendored');
const fs = require('fs').promises;
const jpeg = require('jpeg-js');
const { Jimp } = require('jimp');

const exiftool = new ExifTool();

// 1) Metadata check
async function metadataCheck(filePath) {
  try {
    const meta = await exiftool.read(filePath);
    const suspicious = ['Photoshop', 'GIMP', 'libpng', 'sharp'];
    const toolInfo = ((meta.Software || meta.Creator) ?? '').toString();
    return suspicious.some(tag => toolInfo.includes(tag));
  } catch (e) {
    console.warn('Exif read failed:', e);
    return false;
  }
}

// 2) Error-Level Analysis (ELA)
async function computeELAScore(filePath) {
  const img = await Jimp.read(filePath);
  const compressed = img.clone().quality(60);
  const bufOrig = await img.getBufferAsync(Jimp.MIME_JPEG);
  const bufComp = await compressed.getBufferAsync(Jimp.MIME_JPEG);
  const orig = await Jimp.read(bufOrig);
  const comp = await Jimp.read(bufComp);

  let diffSum = 0, pxCount = 0;
  orig.scan(0, 0, orig.bitmap.width, orig.bitmap.height, (_x, _y, idx) => {
    diffSum +=
      Math.abs(orig.bitmap.data[idx]     - comp.bitmap.data[idx]) +
      Math.abs(orig.bitmap.data[idx + 1] - comp.bitmap.data[idx + 1]) +
      Math.abs(orig.bitmap.data[idx + 2] - comp.bitmap.data[idx + 2]);
    pxCount++;
  });
  return diffSum / (pxCount * 3 * 255);
}

// 3) Noise analysis
async function analyzeNoisePattern(filePath) {
  const img = await Jimp.read(filePath);
  let sum = 0, sumSq = 0, n = 0;
  img.grayscale().scan(0, 0, img.bitmap.width, img.bitmap.height, (_x, _y, idx) => {
    const v = img.bitmap.data[idx]; sum += v; sumSq += v*v; n++;
  });
  const mean = sum / n;
  const variance = (sumSq / n) - (mean * mean);
  return Math.sqrt(variance) / 255;
}

// 4) OCR-template mismatch
async function templateOCRMismatch(filePath, templateKeywords = ['TOTAL', 'AMOUNT', 'ITEM']) {
  // Use the CJS export of tesseract.js
  const Tesseract = require('tesseract.js');
  const worker = Tesseract.createWorker({ logger: () => {} });
  // initialize the worker pipeline
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  const up = text.toUpperCase();
  return !templateKeywords.some(k => up.includes(k));
}
// 5) Quantization-tables check
async function detectQuantTables(filePath) {
  const buf = await fs.readFile(filePath);
  const decoded = jpeg.decode(buf, true);
  return Object.keys(decoded.quantizationTables || {}).length > 2;
}

// 6) Combined scoring
async function isLikelyAIFake(filePath) {
  const [md, ela, noise, ocrBad, quantBad] = await Promise.all([
    metadataCheck(filePath),
    computeELAScore(filePath),
    analyzeNoisePattern(filePath),
    templateOCRMismatch(filePath),
    detectQuantTables(filePath)
  ]);

  const weights = { md: 0.05, ela: 0.30, noise: 0.20, ocrBad: 0.25, quantBad: 0.20 };
  const score =
    (md      ? weights.md       : 0) +
    (ela     * weights.ela) +
    (noise   * weights.noise) +
    (ocrBad  ? weights.ocrBad   : 0) +
    (quantBad? weights.quantBad : 0);

  return { score, isFake: score > 0.5, breakdown: { md, ela, noise, ocrBad, quantBad } };
}

// cleanup
process.on('exit', () => exiftool.end());

module.exports = {
  metadataCheck,
  computeELAScore,
  analyzeNoisePattern,
  templateOCRMismatch,
  detectQuantTables,
  isLikelyAIFake
};