<!-- 潘启宝 2020年07月29日 16:45:05 中国济南 -->
<template>
  <div class="detection" v-loading="loading">
    <icos-page-header :title="$t('operationAnalysis.NO_THRESHOLD_ANOMALY_DETECTION')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-form
      inline
      ref="form"
      v-loading="form.loading"
      :rules="rules"
      :model="form"
      class="module-background-color module-padding isolation-belt header"
    >
      <div v-if="!isTrainView" style="display:inline-block;">
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
      </div>

      <el-form-item :label="$t('base.time')" prop="time" key="form-item4">
        <el-date-picker
          v-model="form.time"
          type="datetime"
          :picker-options="form.pickerOptions"
          :clearable="false"
          popper-class="test"
          @change="dateChange"
          :disabled="trainloading"
        />
        <el-tooltip placement="top" style="margin-left:15px;">
            <div slot="content" v-if="isCN">时间框选择的时间为最终时间，检测区间为3小时</div>
            <div
              slot="content"
              v-else
            >the time selected in the time box is the final time, and the detection interval is 3 hours.</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>

      <el-form-item class="custom-graph-query" key="form-item5">
        <el-button
          type="primary"
          size="medium"
          @click="query()"
          :disabled="form.queryButtonDisabled||trainloading"
        >{{ $t('monitor.CUSTOM_GRAPH_QUERY') }}</el-button>
      </el-form-item>
    </el-form>

    <el-carousel
      arrow="never"
      height="770px"
      :initial-index="0"
      trigger="click"
      :autoplay="false"
      indicator-position="none"
      ref="carousel"
      style="z-index: 0;"
    > 
      <el-carousel-item class="module-background-color module-padding detect" ref="detect">
        <div style="min-height:32px;">
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
        </div>
        <IEcharts
          ref="chart"
          :option="option"
          :loading="chartLoading"
          :loadingOpts="loadingOpts"
          :resizable="true"
          class="charts"
          style="height: 550px;"
        />
        <div style="text-align: right">
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
        </div>
        <div style="font-weight: bolder;">{{$t('base.prompt')}}：</div>
        <p>红点：检测出的异常点,当xgboost模型得分超过90时，红点为xgboost模型检测结果；若不超过90分，红点为多种无监督模型集成检测结果。</p>
        <p>查询：对历史性能数据进行查询，查询结果可用来无阈值检测。</p>
        <p>训练：转入训练页面，采用历史数据对xgboost模型进行训练。</p>
        <p>检测：对查询出的数据采用多种模型进行异常点检测。</p>
        <p>导出：对检测结果以excel文件形式导出。</p>
      </el-carousel-item>

      <el-carousel-item class="module-background-color module-padding train" ref="train">
        <div style="min-height:32px;">
          <span>{{$t('operationAnalysis.XGBOOST_MODEL_SCORE')}}：{{trainScore}}</span>
        </div>
        <div class="train-state-title">{{$t('operationAnalysis.PLEASE_MARK_THE_FIGURE_BELOW')}}</div>
        <IEcharts
          ref="chart2"
          :option="option2"
          :loading="chart2Loading"
          :loadingOpts="loadingOpts"
          :resizable="true"
          class="charts"
          style="height: 550px;"
          @click="echart"
          @dblclick="echart"
          @mouseover="echart"
          @mouseout="echart"
          @mousedown="echart"
          @mouseup="echart"
          @globalout="echart"
          @legendselectchanged="echart"
          @legendselected="echart"
          @legendunselected="echart"
          @datazoom="echart"
          @datarangeselected="echart"
          @timelinechanged="echart"
          @timelineplaychanged="echart"
          @restore="echart"
          @dataviewchanged="echart"
          @magictypechanged="echart"
          @geoselectchanged="echart"
          @geoselected="echart"
          @geounselected="echart"
          @pieselectchanged="echart"
          @pieselected="echart"
          @pieunselected="echart"
          @mapselectchanged="echart"
          @mapselected="echart"
          @mapunselected="echart"
          @axisareaselected="echart"
          @brush="echart"
          @brushselected="echart"
        />
        <div style="text-align: right;">
          <div style="float:left;color:#666;text-align: left">
            <div style="font-weight: bolder;">{{$t('base.prompt')}}：</div>
            <p>紫点：初始为多种无监督模型集成检测结果，为异常点标注提供参考；可通过鼠标标注或取消标注。</p>
            <p>查询：对历史性能数据进行查询，查询结果标注后可作为训练样本。</p>
            <p>增量训练：在已有模型基础上，用页面标注数据进行增量训练。</p>
            <p>重新训练：删除已有模型，用历史标注数据和页面标注数据进行全量训练。</p>
            <p>删除历史：删除已有模型和历史标注数据。</p>
            <p>返回：返回异常点检测页面。</p>
          </div>

          <el-button
            type="primary"
            size="medium"
            @click="trainStart({type:'start'})"
            :disabled="trainloading||chart2Loading"
            :loading="trainloading&&trainStartType==='start'"
          >{{$t('operationAnalysis.INCREMENTAL_TRAINING')}}</el-button>
          <el-button
            type="primary"
            size="medium"
            @click="trainReStart()"
            :disabled="trainloading||chart2Loading"
            :loading="trainloading&&trainStartType==='restart'"
          >{{$t('operationAnalysis.RETRAINING')}}</el-button>
          <el-button
            type="primary"
            size="medium"
            @click="_delete()"
            :disabled="fileExist===0||trainloading||chart2Loading"
          >{{$t('operationAnalysis.DELETE_HISTORY')}}</el-button>
          <el-button
            type="primary"
            size="medium"
            @click="changeView({direction:'right'})"
            :disabled="trainloading||chart2Loading"
          >{{$t('base.back')}}</el-button>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script src='./index.js'>
</script>

 <style scoped src='./index.css'>
</style>



