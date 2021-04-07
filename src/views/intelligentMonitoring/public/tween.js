//缓动函数---潘启宝写于2020年3月2日 9:30:30
class Tween {
  constructor(v) {
    const a = ['ms', 'moz', 'webkit', 'o'];
    for (let i = 0; i < a.length && !window.requestAnimationFrame; ++i) {
      window.requestAnimationFrame = `${window[a[i]]}RequestAnimationFrame`;
      window.cancelAnimationFrame = `${window[a[i]]}CancelAnimationFrame` || `${window[a[i]]}CancelRequesAnimationFrame`;
    }
  }
  static ease = {
    back: {
      out(v) {
        const s = 1.70158;
        return --v * v * ((s + 1) * v + s) + 1;
      }
    },
    bounce: {
      out(k) {
        if (k < (1 / 2.75)) {
          return 7.5625 * k * k;
        } else if (k < (2 / 2.75)) {
          return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        } else if (k < (2.5 / 2.75)) {
          return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        } else {
          return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
        }
      }
    },
    quintic: {
      out(k) { // 五次方的缓动（t^5）
        return --k * k * k * k * k + 1;
      }
    }
  }
  ease = Tween.ease;
  to(start = 0, end = 1, duration = 1000, easing = this.ease.back.out, update, complete) {
    cancelAnimationFrame(i);
    const s = parseFloat(start);
    const e = parseFloat(end);
    const t = performance.now();
    const o = e - s;
    let i = 0;
    const f = (v = performance.now()) => {
      i = requestAnimationFrame(f);

      const d = Math.min(duration, v - t);
      update && update(s + o * easing(d / duration));
      if (d === duration) {
        complete && complete();
        cancelAnimationFrame(i);
      }
    };
    i = requestAnimationFrame(f);
    return this;
  }
}

const tween = new Tween();
export {
  tween,
  Tween
};
