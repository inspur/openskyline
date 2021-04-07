class Popover { //潘启宝写于2020/01/19 周日 17:49:15.59
  constructor() {
    this.container = document.createElement('div');
    this.content = document.createElement('div');
    this.arrowContainer = document.createElement('div');
    this.arrow1 = document.createElement('div');
    this.arrow2 = document.createElement('div');
    this.title = document.createElement('div');
    this.input = document.createElement('input');
    this.inputTip = document.createElement('div');
    this.buttons = document.createElement('div');
    this.cancel = document.createElement('button');
    this.save = document.createElement('button');

    this.container.appendChild(this.arrowContainer);
    this.arrowContainer.appendChild(this.arrow1);
    this.arrowContainer.appendChild(this.arrow2);
    this.container.appendChild(this.content);
    this.content.appendChild(this.title);
    this.content.appendChild(this.input);
    this.content.appendChild(this.inputTip);
    this.content.appendChild(this.buttons);
    this.buttons.appendChild(this.cancel);
    this.buttons.appendChild(this.save);

    this.width = 280;
    this.arrowWidth = 10;
    this.container.style.cssText = `width:${this.width}px;border-radius:5px;position:absolute;z-index: 19870227;`;
    this.arrowContainer.style.cssText = `position:relative;width:${this.width}px;height:${this.arrowWidth}px;z-index:1;`;
    let arrowCssText = `position:absolute;height:0;width:0;border-width:${this.arrowWidth}px;border-style:solid;border-color:transparent;left:${this.width/2-this.arrowWidth}px;`;
    this.arrow1.style.cssText = arrowCssText;
    this.arrow2.style.cssText = arrowCssText;
    this.content.style.cssText = `position:relative;background-color: #fff;text-align:center;width:${this.width}px;border-radius:4px;border:1px solid rgba(220,223,230,1);box-shadow:rgba(0, 0, 0, 0.1) 2px 2px 15px 5px;`;
    this.title.textContent = Vue.t("monitor.EDIT_RESOURCE_TAG");
    this.title.style.cssText = `text-align:center;font-size:14px;font-weight:400;color:#303133;line-height:14px;margin:20px 0 0;`;
    this.input.className = `el-input__inner`;
    this.input.style.cssText = `width:${this.width-60}px;height:36px;margin:20px auto 0;color:#303133;`;
    this.inputTip.style.cssText = `width:${this.width-60}px;margin:auto;text-align:left;color: #dd4b39;`;
    this.inputTip.textContent = `tip`;
    this.inputTip.style.visibility = 'hidden';
    let buttonCssText = `padding:0;width: 65px;height:28px;margin-bottom:20px;`;
    let buttonClassName = `el-button el-button--primary el-button--small`;
    this.cancel.textContent = Vue.t("base.cancel");
    this.cancel.className = buttonClassName;
    this.cancel.style.cssText = `${buttonCssText}background-color:#fff;border-color:#aaa;margin-right:10px;color:#5a5e66;`;
    this.save.textContent = Vue.t("base.save");
    this.save.style.cssText = buttonCssText;
    this.save.className = buttonClassName;

    this.cancel.addEventListener('click', this.clickHandler.bind(this, 'cancel'));
    this.save.addEventListener('click', this.clickHandler.bind(this, 'save'));
    this.input.addEventListener('input', this.inputHandler.bind(this));

    this.inputValueError = false;
  }

  init(v) {
    this.callback = v.callback;
    this.parent = v.parent || document.body;
    this.reference = v.reference;
  };

  show(v = {}) {
    this.data = v.data;
    this.target = v.target;
    this.parent.appendChild(this.container);
    this.input.value = v.value || ``;
    this.inputHandler();
    this.layout(v);
  };

  layout(v) {
    let r1 = this.target && this.target.getBoundingClientRect() || {};
    let r2 = this.parent.getBoundingClientRect() || {};
    let r3 = this.container.getBoundingClientRect() || {};

    let r4 = this.reference.getBoundingClientRect();

    let top = r1.bottom - r2.top + 3 + this.parent.scrollTop;
    let left = r1.left - r2.left - r3.width / 2 + 2;
    let r3h = r3.height;
    let reverse = top + r3h > r4.bottom - r2.top;
    if (reverse) {
      top = top - r3h - r1.height - 6;
      this.container.insertBefore(this.content, this.arrowContainer);
    } else {
      this.container.insertBefore(this.arrowContainer, this.content);
    }
    this.arrowContainer.style.top = reverse ? `unset` : 0;
    this.arrowContainer.style.bottom = reverse ? 0 : `unset`;

    this.arrow1.style.borderTopWidth = reverse ? `${this.arrowWidth}px` : 0;
    this.arrow1.style.borderBottomWidth = reverse ? 0 : `${this.arrowWidth}px`;
    this.arrow1.style.borderBottomColor = reverse ? `transparent` : `rgb(220, 223, 230)`;
    this.arrow1.style.borderTopColor = reverse ? `rgb(220, 223, 230)` : `transparent`;
    this.arrow1.style.top = reverse ? `unset` : 0;
    this.arrow1.style.bottom = reverse ? 0 : `unset`;

    this.arrow2.style.borderTopWidth = reverse ? `${this.arrowWidth}px` : 0;
    this.arrow2.style.borderBottomWidth = reverse ? 0 : `${this.arrowWidth}px`;
    this.arrow2.style.borderBottomColor = reverse ? `transparent` : `#fff`;
    this.arrow2.style.borderTopColor = reverse ? `#fff` : `transparent`;
    this.arrow2.style.top = reverse ? `unset` : `3px`;
    this.arrow2.style.bottom = reverse ? `3px` : `unset`;

    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;
  }

  hide(v = {}) {
    this.inputValueError = false;
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.callback({
      from: v.from,
      value: this.input.value,
      ValueError: this.inputValueError,
      ...this.data
    });
  }

  clickHandler(v) {
    if (v === 'save' && this.inputValueError) {
      return;
    }
    this.hide({
      from: v
    });
  }

  inputHandler(v) {
    this.inputValueError = false;
    let value = this.input.value;
    this.inputTip.textContent = 'tip';
    if (value.length > 40) {
      this.inputTip.textContent = Vue.t('validation.maxSize').replace('%s', '40');
      this.inputValueError = true;
    }
    let r = /^[-_0-9a-zA-Z\u4e00-\u9fa5]+$/;
    if (value && !r.test(value)) {
      this.inputTip.textContent = Vue.t('validation.onlyLetter_NumberChinese');
      this.inputValueError = true;
    }

    if (this.inputValueError) {
      this.input.style.borderColor = '#dd4b39';
      this.inputTip.style.visibility = 'visible';
      this.layout(v);
    } else {
      this.input.style.removeProperty('border-color');
      this.inputTip.style.visibility = 'hidden';
    }
  }
}

let popover = new Popover();
export {
  popover
}
