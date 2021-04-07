/**
 * 文件大小格式化
 *
 * @param value 文件大小
 * @param unit 单位
 * @returns {String} 文件大小格式化字符串
 */
export default function formatFileSize(value, unit, i=2) {
  var str = "";
  switch (unit) {
    case "Byte":
      break;
    case "KB":
      value = value * 1024;
      break;
    case "MB":
      value = value * 1024 * 1024;
      break;
    case "GB":
      value = value * 1024 * 1024 * 1024;
      break;
    case "TB":
      value = value * 1024 * 1024 * 1024 * 1024;
      break;
  }
  if (value > 0 && value < 1024) {
    return value + " Byte";
  } else if (value >= 1024 && value < 1024 * 1024) {
    return Number(value / 1024).toFixed(i) + " KB";
  } else if (value >= 1024 * 1024 && value < 1024 * 1024 * 1024) {
    return Number(value / (1024 * 1024)).toFixed(i) + " MB";
  } else if (value >= 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024) {
    return Number(value / (1024 * 1024 * 1024)).toFixed(i) + " GB";
  } else if (value >= 1024 * 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024 * 1024) {
    return Number(value / (1024 * 1024 * 1024 * 1024)).toFixed(i) + " TB";
  } else if (value >= 1024 * 1024 * 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024 * 1024 * 1024) {
    return Number(value / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(i) + " PB";
  } else {
    return value + " Byte";
  }
}
