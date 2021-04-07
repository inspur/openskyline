// 潘启宝写于2020年4月16日 11:24:15，地点---中国济南

<style src="./index.css"></style>
<template >
  <div v-if="opener" class="digital-visualization-screen">
    <div class="header">
      <div class="logo">
        <img :src="logo" />
      </div>
      <div class="title">{{ title }}</div>
      <div class="exit" v-on:click="close">
        <img src="../../assets/img/digitalVisualizationScreen/visual-close.png" />
        <span>{{$t('base.SIGN_OUT_BIG_SCREEN')}}</span>
      </div>
    </div>

    <div class="body">
      <div class="flex0">
        <div
          class="background-color"
          :style="`height: calc(100% / ${Math.ceil(flex0DataComputed.length/2)} - 0.5rem);`"
          v-for="(v,i) in flex0DataComputed"
          :key="v.title"
        >
          <div class="stripe">
            <div></div>
            <div></div>
          </div>
          <div class="name">
            <span class="icon" :class="'icon'+i"></span>
            <span class="title">{{v.title}}</span>
          </div>
          <div class="value">{{v.value}}</div>
        </div>
      </div>

      <!-- CPU -->
      <div class="flex1 background-color">
        <div class="top title">{{flex1Data.title}}</div>
        <div class="bottom content">
          <div class="left">
            <dashboard
              class="dashboard"
              :option="{percent:+flex1Data.percent2,content:{text:flex1Data.name2}, progressBar: {innerShow:0}}"
            />
          </div>
          <div class="right">
            <span>
              <span class="name">{{flex1Data.name0}}</span>
              <span class>{{flex1Data.value0}}</span>
            </span>
            <span class="percent-bar">
              <span class="out">
                <span
                  class="in"
                  :class="{full:flex1Data.percent0==1}"
                  :style="`width:${flex1Data.percent0*100}%`"
                ></span>
              </span>
            </span>
            <span>
              <span class="name">{{flex1Data.name1}}</span>
              <span class>{{flex1Data.value1}}</span>
            </span>
            <span class="percent-bar">
              <span class="out">
                <span
                  class="in"
                  :class="{full:flex1Data.percent1==1}"
                  :style="`width:${flex1Data.percent1*100}%`"
                ></span>
              </span>
            </span>
          </div>
        </div>

        <vertex />
      </div>

      <!-- 内存 -->
      <div class="flex2 background-color">
        <div class="top title">{{flex2Data.title}}</div>
        <div class="bottom content">
          <div class="left">
            <dashboard
              class="dashboard"
              :option="{percent:+flex2Data.percent2,content:{text:flex2Data.name2}, progressBar: {innerShow:0}}"
            />
          </div>
          <div class="right">
            <span>
              <span class="name">{{flex2Data.name0}}</span>
              <span class>{{flex2Data.value0 | fileSize}}</span>
            </span>
            <span class="percent-bar">
              <span class="out">
                <span
                  class="in"
                  :class="{full:flex2Data.percent0==1}"
                  :style="`width:${flex2Data.percent0*100}%`"
                ></span>
              </span>
            </span>
            <span>
              <span class="name">{{flex2Data.name1}}</span>
              <span class>{{flex2Data.value1 | fileSize}}</span>
            </span>
            <span class="percent-bar">
              <span class="out">
                <span
                  class="in"
                  :class="{full:flex2Data.percent1==1}"
                  :style="`width:${flex2Data.percent1*100}%`"
                ></span>
              </span>
            </span>
          </div>
        </div>

        <vertex />
      </div>

      <div class="flex3">
        <div class="time">
          {{flex3Data.title}}
          <span class="value">{{flex3Data.date.value}}</span>
          {{flex3Data.date.key}}
          <span class="value">{{flex3Data.hour.value}}</span>
          {{flex3Data.hour.key}}
          <span class="value">{{flex3Data.minutes.value}}</span>
          {{flex3Data.minutes.key}}
          <span class="value">{{flex3Data.seconds.value}}</span>
          {{flex3Data.seconds.key}}
        </div>
        <div class="animation" ref="animationContent">
          <img
            ref="ring"
            class="ring"
            src="../../assets/img/digitalVisualizationScreen/visual-ring.png"
          />
          <div ref="ball0" class="ball0"></div>
          <div ref="ball1" class="ball1"></div>
          <div ref="ball2" class="ball2"></div>
          <div ref="ball3" class="ball3"></div>
          <img ref="core" class="core" src="../../assets/img/login/main.png" />
          <img ref="cloud" class="cloud" src="../../assets/img/login/cloud.png" />
        </div>
      </div>

      <div class="flex4">
        <div class="left background-color">
          <div class="top title">{{flex4Data['cpu']['title']}}</div>
          <div class="bottom">
            <dashboard
              class="dashboard"
              :option="{percent:flex4Data['cpu']['percent'],content:{text:''}, progressBar: {backgroundInnerColor:'#50d494'}}"
            />
          </div>
          <vertex />
        </div>
        <div class="middle background-color">
          <div class="top title">{{flex4Data['mem']['title']}}</div>
          <div class="bottom">
            <dashboard
              class="dashboard"
              :option="{percent:flex4Data['mem']['percent'],content:{text:''}, progressBar: {backgroundInnerColor:'#50d494'}}"
            />
          </div>
          <vertex />
        </div>
        <div class="right background-color">
          <div class="top title">{{flex4Data['storage']['title']}}</div>
          <div class="bottom">
            <div class="left">
              <dashboard
                class="dashboard"
                :option="{percent:flex4Data['storage']['percent'],content:{text:''}, progressBar: {backgroundInnerColor:'#50d494'}}"
              />
            </div>
            <div class="right">
              <div class="name">{{flex4Data['storage']['name0']}}</div>
              <div class="value">{{flex4Data['storage']['value0'] | fileSize }}</div>
              <div class="name">{{flex4Data['storage']['name1']}}</div>
              <div class="value">{{flex4Data['storage']['value1'] | fileSize}}</div>
            </div>
          </div>
          <vertex />
        </div>
      </div>

      <div class="flex5 background-color">
        <list :option="flex5Data" />
        <vertex />
      </div>

      <div class="flex6 background-color">
        <list :option="flex6Data" />
        <vertex />
      </div>

      <div class="flex7 background-color">
        <list :option="flex7Data" />
        <vertex />
      </div>

      <div class="flex8 background-color">
        <list :option="flex8Data" />
        <vertex />
      </div>
    </div>
  </div>
  <div v-else class="prohibit">禁止单独打开此页面，请在主站大屏按钮里弹出此网页！</div>
</template>
<script src ="./index.js"></script>

