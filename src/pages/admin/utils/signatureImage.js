const MAX_SIDE = 900;
const WHITE_THRESHOLD = 225;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('לא ניתן לקרוא את התמונה'));
    };
    image.src = url;
  });

/**
 * Turns a scanned / photographed signature into a transparent, cropped PNG
 * data URL: near-white pixels become transparent so form lines show through.
 */
export async function imageFileToSignaturePng(file) {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);

  const pixels = ctx.getImageData(0, 0, width, height);
  const { data } = pixels;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let i = 0; i < data.length; i += 4) {
    const isBackground =
      data[i + 3] < 20 ||
      (data[i] > WHITE_THRESHOLD && data[i + 1] > WHITE_THRESHOLD && data[i + 2] > WHITE_THRESHOLD);
    if (isBackground) {
      data[i + 3] = 0;
      continue;
    }
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (maxX < 0) throw new Error('לא נמצאה חתימה בתמונה');
  ctx.putImageData(pixels, 0, 0);

  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext('2d').drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}
