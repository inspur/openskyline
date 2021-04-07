<!-- 潘启宝 2020年07月29日 16:45:05 中国济南 -->
<template>
  <div class="detection" v-loading="loading">
    <icos-page-header :title="$t('operationAnalysis.TREND_PREDICT')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-form
      inline
      ref="form"
      v-loading="form.loading"
      :rules="rules"
      :model="form"
      class="module-background-color module-padding isolation-belt header"
    >
      <div style="display:inline-block;" v-if="!settingShow">
        <el-form-item
          :label="$t('monitor.CUSTOM_GRAPH_RESOURCE_TYPE')"
          prop="resourceType"
          key="form-item0"
        >
          <el-select v-model="form.resourceType" @change="resourceTypeChange">
            <el-option v-for="v in form.resourceTypes" :key="v.id" :label="v.name" :value="v.id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('monitor.CUSTOM_GRAPH_HOST')" prop="hostID" key="form-item1">
          <el-select v-model="form.hostID" @change="hostChange" filterable>
            <el-option v-for="(v, i) in form.hosts" :key="i" :label="v" :value="v" />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('monitor.CUSTOM_GRAPH_INSTANCE')"
          prop="instanceID"
          key="form-item2"
        >
          <el-select v-model="form.instanceID" @change="instanceChange" filterable>
            <el-option v-for="(v, i) in form.instances" :key="i" :label="v.name" :value="v.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('monitor.CUSTOM_GRAPH_METRICS')" prop="metricID" key="form-item3">
          <el-select v-model="form.metricID" @change="metricChange" filterable>
            <el-option v-for="(v, i) in form.metrics" :key="i" :label="v.name" :value="v.id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('operationAnalysis.MODEL')" prop="model" key="form-item4">
          <el-select v-model="form.model" @change="modelChange" filterable>
            <el-option v-for="(v, i) in form.models" :key="i" :label="i" :value="i" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="'smape'+$t('operationAnalysis.MARK')+'：'" prop="smape" key="form-item5" v-if="smape">
          <el-input v-model="smape" :disabled="true" style="width:100px;"/>
        </el-form-item>

        <el-form-item :label="$t('operationAnalysis.SEASON')+'：'" prop="seasonl" key="form-item6" v-if="seasonl">
          <el-input v-model="seasonl" :disabled="true" style="width:100px;"/>
        </el-form-item>

        <el-form-item class="custom-graph-query" key="form-item7">
          <el-button
            type="primary"
            size="medium"
            @click="query()"
            :disabled="form.queryButtonDisabled"
          >{{ $t('operationAnalysis.PREDICT') }}</el-button>
        </el-form-item>
      </div>

      <el-form-item class="custom-graph-query" key="form-item8">
        <el-button
          type="primary"
          size="medium"
          @click="seasonSetting({direction:settingShow?'right':'left'})"
        >{{ settingShow ? $t('base.back') : $t('operationAnalysis.SEASON_SETTING') }}</el-button>
      </el-form-item>
    </el-form>

    <el-carousel
      arrow="never"
      height="730px"
      :initial-index="0"
      trigger="click"
      :autoplay="false"
      indicator-position="none"
      ref="carousel"
      style="z-index: 0;"
    >
      <el-carousel-item class="module-background-color module-padding detect" ref="detect">
        <!-- <div style="min-height:32px;">
          <span>{{$t('operationAnalysis.XGBOOST_MODEL_SCORE')}}：{{detectionsScore}}</span>
          <el-tooltip placement="top" style="margin-left:15px;">
            <div slot="content" v-if="isCN">当xgboost模型得分超过90时，使用xgboost模型检测。若不超过90分，则使用无监督模型联合检测</div>
            <div
              slot="content"
              v-else
            >When the score of xgboost model exceeds 90,xgboost model is used to detect. If the score is less than 90,the unsupervised model is used for joint detection.</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          <el-button
            type="primary"
            size="medium"
            style="margin-left:30px;"
            @click="changeView({direction:'left'})"
            :disabled="!detectionsDisabled||chartLoading"
          >{{$t('operationAnalysis.TRAIN')}}</el-button>
        </div> -->
        <div style="display:flex;">
          <IEcharts
            ref="chart"
            :option="option"
            :loading="chartLoading"
            :loadingOpts="loadingOpts"
            :resizable="true"
            class="charts"
            style="height: 680px;flex:1 1 auto;"
          />

          <div style="width:300px;height:300px;flex: 0 0 300px;">
            <el-form inline onsubmit="return false;">
              <el-form-item :label="$t('operationAnalysis.PREDICT_THRESHOLD')+'(%)'">
                <el-input v-model="dashboardOption.percent" style="width: 75px;" />
              </el-form-item>
              <el-form-item>
                <el-button @click="loadRestTime()" type="primary" size="small" :loading="restTimeLoading" icon="fa-calculator" native-type="submit">{{ $t('operationAnalysis.PREDICT_CALC') }}</el-button>
              </el-form-item>
            </el-form>
            <icos-dashboard ref="dashboard" :option="dashboardOption" style="width:100%;height: 246px;"></icos-dashboard>
          </div>
        </div>
        <!-- <div style="text-align: right">
          <span v-if="detected&&abnomalDots.length<1">{{$t('operationAnalysis.NO_ERROR_DATA')}}</span>
          <el-button
            type="primary"
            size="medium"
            @click="detect()"
            :disabled="!detectionsDisabled||chartLoading"
          >{{$t('operationAnalysis.TESTING')}}</el-button>
          <el-button
            type="primary"
            size="medium"
            @click="_export()"
            :disabled="!detectionsDisabled||!detected||chartLoading"
          >{{$t('opt.export')}}</el-button>
        </div> -->
      </el-carousel-item>

      <el-carousel-item class="module-background-color module-padding train" ref="train">
        <setting/>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script src='./index.js'>
</script>

 <style scoped src='./index.css'>
</style>



