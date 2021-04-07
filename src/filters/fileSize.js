export default function fileSize(sizeInBytes) {
  sizeInBytes = parseFloat(sizeInBytes);
  if (isNaN(sizeInBytes)) {
    return sizeInBytes;
  }
  if (sizeInBytes === null || sizeInBytes === undefined) {
    sizeInBytes = 0;
  }
  if (sizeInBytes < 0) {
    return sizeInBytes;
  }
  let units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = sizeInBytes;
  let n = 0;
  while (size >= 1024) {
    size = size / 1024;
    n++;
  }
  return `${size.toFixed(2)} ${units[n]}`;
};
