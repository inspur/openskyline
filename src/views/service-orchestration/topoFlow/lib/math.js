export default {
  //生成UUID
  genUUID() {
      let s = [];
      let hexDigits = '0123456789abcdef';
      for (let i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = '4';
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);

      s[8] = s[13] = s[18] = s[23] = '-';

      let uuid = s.join('');
      return uuid;
  },

  // 获取节点间的位置信息
  getPoint(j, d) {
    let c = d;
    let e = {
        x: j.x + j.width / 2,
        y: j.y + j.height / 2
      };
    let l = (e.y - c.y) / (e.x - c.x);
    l = isNaN(l) ? 0 : l;
    let k = j.height / j.width;
    let h = c.y < e.y ? -1 : 1;
    let f = c.x < e.x ? -1 : 1;
    let g;
    let i;
    if (Math.abs(l) > k && h === -1) {
      g = e.y - j.height / 2;
      i = e.x + h * j.height / 2 / l;
    } else {
      if (Math.abs(l) > k && h === 1) {
        g = e.y + j.height / 2;
        i = e.x + h * j.height / 2 / l;
      } else {
        if (Math.abs(l) < k && f === -1) {
          g = e.y + f * j.width / 2 * l;
          i = e.x - j.width / 2;
        } else {
          if (Math.abs(l) < k && f === 1) {
            g = e.y + j.width / 2 * l;
            i = e.x + j.width / 2;
          }
        }
      }
    }
    let position = {
      x: i,
      y: g
    };
    return position;
  },

  // 计算两个节点之间线条的坐标信息
  calculateLinkPoint(sourceNode, targetNode, config) {
    let offset = 10;
    if (!sourceNode || !targetNode) {
      return [];
    }
    let startNodeInfo = {
      x: sourceNode.x - offset / 2,
      y: sourceNode.y - offset / 2,
      width: sourceNode.width + offset,
      height: sourceNode.height + offset
    };

    let endNodeInfo = {
      x: targetNode.x - offset / 2,
      y: targetNode.y - offset / 2,
      width: targetNode.width + offset,
      height: targetNode.height + offset
    };

    let startPoint = this.getPoint(startNodeInfo, {
      x: endNodeInfo.x + endNodeInfo.width / 2,
      y: endNodeInfo.y + endNodeInfo.height / 2
    });
    let endPoint = this.getPoint(endNodeInfo, startPoint);
    return [startPoint.x, startPoint.y, endPoint.x, endPoint.y];
  }
}
