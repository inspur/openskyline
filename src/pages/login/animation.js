//登录页动画---潘启宝写于2020年3月19日 9:39:14
class LoginAnimation {
  constructor(v) {
    const a = ['ms', 'moz', 'webkit', 'o'];
    for (let i = 0; i < a.length && !window.requestAnimationFrame; ++i) {
      window.requestAnimationFrame = `${window[a[i]]}RequestAnimationFrame`;
      window.cancelAnimationFrame = `${window[a[i]]}CancelAnimationFrame` || `${window[a[i]]}CancelRequesAnimationFrame`;
    }
  }

  fullAngle = 2 * Math.PI;//圆的一周360度
  angle = 0;//变量，每次屏幕刷屏时变化的度数量
  // radius = 0;//椭圆上四根倾斜的线的半径

  requestAnimationFrameID = 0;
  init(v) {
    this.destroy();
    let vm = v.vm;
    this.maxHeight = v.maxHeight || 0.7;
    this.coreCenterOffsetHeight = v.coreCenterOffsetHeight || 1;

    this.animationContent = vm.$refs.animationContent;//动画容器
    this.ring = vm.$refs.ring;//圆环图片
    this.core = vm.$refs.core;//工厂图片
    this.cloud = vm.$refs.cloud;//上下浮动的云图片
    this.balls1 = [vm.$refs.ball0, vm.$refs.ball1, vm.$refs.ball2, vm.$refs.ball3];//四个小球
    // this.balls2 = [vm.$refs.ball4, vm.$refs.ball5, vm.$refs.ball6, vm.$refs.ball7];
    this.ballsPoint = Array.from(this.balls1, v => { return { x: 0, y: 0 }; });//小球的坐标集合，为了求得小球沿着曲线运动时，为了计算小圆永远头朝线的方向
    this.offsetAngle = this.fullAngle / this.balls1.length;//每个小球一开始错开的角度

    this.requestAnimationFrameID = requestAnimationFrame(this.animation.bind(this));//在浏览器下次刷新前执行函数，进行样式变化
    return this;
  }
  animation() {
    this.angle -= 0.1 / this.fullAngle;//每次逆时针旋转1/3600度，如果帧频率为60/s的话，那么每秒应该是旋转60/3600，即60度/秒
    const rcw = this.ring.offsetWidth;//圆环宽度
    const rch = this.ring.offsetHeight;//圆环高度
    const rol = this.ring.offsetLeft;//圆环左上角坐标x
    const rot = this.ring.offsetTop;//圆环左上角坐标y
    const WS = rcw / 12.53225806451613;//圆环横轴间距
    const HS = rch / 12.576271186440678;//圆环纵轴间距
    const offsetParentWidth = this.animationContent.offsetWidth;//动画容器宽度
    const offsetParentHeight = this.animationContent.offsetHeight;//动画容器高度

    if (offsetParentWidth > offsetParentHeight) {
      let h = offsetParentHeight * this.maxHeight;
      this.core.style.width = `auto`;
      this.core.style.height = `${h}px`;
    } else {
      let w = offsetParentWidth * 0.7;
      this.core.style.width = `${w}px`;
      this.core.style.height = `auto`;
    }
    this.ring.style.width = `${this.core.offsetWidth}px`;
    this.ring.style.height = `auto`;

    let rt = Math.ceil((offsetParentHeight - this.ring.offsetHeight) / 2) * this.coreCenterOffsetHeight;//圆环左上角y坐标
    this.ring.style.top = `${rt}px`;
    this.ring.style.left = `${parseInt(offsetParentWidth / 2 - rcw / 2)}px`;

    let ct = Math.ceil(rt - this.core.offsetHeight * 0.234);
    this.core.style.top = `${ct}px`;
    this.core.style.left = `${parseInt(offsetParentWidth / 2 - this.core.offsetWidth / 2)}px`;
    let cll = Math.ceil(this.core.offsetLeft + (this.core.offsetWidth - this.cloud.offsetWidth) / 2 + this.cloud.offsetWidth * 0.2);
    this.cloud.style.left = `${parseInt(cll)}px`;
    this.cloud.style.width = `${this.core.offsetWidth * 0.14567890}px`;

    let cos = Math.cos(this.angle);
    let sin = Math.sin(this.angle);
    let cloudYoffset = 100 * (this.cloud.offsetHeight / 270);
    let clt = Math.ceil((offsetParentHeight - this.cloud.offsetHeight) / 2) - this.core.offsetHeight * 0.4 + sin * cloudYoffset;
    this.cloud.style.top = `${clt}px`;

    let rx = rol + rcw / 2;//椭圆圆心x坐标
    let ry = rot + rch / 2;//椭圆圆心y坐标

    this.balls1.forEach((v, i) => {
      let rw = rcw / 2 - WS * i;//椭圆x半径
      let rh = rch / 2 - HS * i;//椭圆y半径

      let bpi = this.ballsPoint[i];

      let a = this.angle + this.offsetAngle * i;//错开起始角度
      let x = Math.cos(a) * rw + rx - v.offsetWidth / 2;//求得新x坐标
      let y = Math.sin(a) * rh + ry - v.offsetHeight / 2;//求得新y坐标
      let r = Math.atan2(y - bpi.y, x - bpi.x);//求得小圆相对于圆心的角度
      v.style.transform = `rotate(${r / this.fullAngle * 360}deg) scaleX(2)`;
      v.style.left = `${x}px`;
      v.style.top = `${y}px`;
      bpi.x = x;
      bpi.y = y;
    });

    // let a = 30;
    // let x = Math.cos(a / 360 * this.fullAngle) * rcw / 2;
    // let y = Math.sin(a / 360 * this.fullAngle) * rch / 2;
    // let l = Math.pow(rcw * rcw + y * y, 1 / 2);

    // this.radius > l ? this.radius = 0 : this.radius += 0.7;
    // this.balls2.forEach((v, i) => {
    //   x = Math.cos(a / 360 * this.fullAngle) * this.radius + rx - v.offsetWidth / 2;
    //   y = Math.sin(a / 360 * this.fullAngle) * this.radius + ry - v.offsetHeight / 2;
    //   v.style.left = `${x}px`;
    //   v.style.top = `${y}px`;
    //   a += (i % 2 === 0 ? 120 : 60);
    // });

    this.requestAnimationFrameID = requestAnimationFrame(this.animation.bind(this));
  }

  destroy(v) {
    cancelAnimationFrame(this.requestAnimationFrameID);
  }
}

const loginAnimation = new LoginAnimation();
export {
  loginAnimation,
  LoginAnimation
};
