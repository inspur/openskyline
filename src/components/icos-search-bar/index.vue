<template>
  <div v-if="basicFormData.conditions.length > 0">
    <div style="display: flex; flex-direction: row; align-items: center;">
      <el-form inline :style="{ width: width+'px' }" style="display: flex; flex-direction: row; background-color: #fff; border: solid 1px #aaaaaa; border-radius: 2px;">
        <el-form-item class="margin-0">
          <el-select
            id="basic-condition-select"
            v-if="basicFormData.conditions.length > 1"
            v-model="basicFormData.key"
            v-change-width="changeWidthConf"
            @change="handleBasicKeyChanged"
            :disabled="advancedFormVisible"
          >
            <el-option
              v-for="(condition, index) in basicFormData.conditions"
              :key="index"
              :value="condition.key"
              :label="condition.label"
            />
          </el-select>
          <span style="padding: 3px 10px; line-height: 30px; color: #333333;" v-if="basicFormData.conditions.length === 1">
            {{ basicFormData.conditions[0].label }}
          </span>
        </el-form-item>
        <el-form-item id="middle-form-item" class="margin-0">
          <el-input
            style="width: 100%; border: none;"
            v-if="currentBasicCondition && currentBasicCondition.type === 'input'"
            v-model="basicFormData.keyword"
            :disabled="advancedFormVisible"
            :placeholder="$t('calcStorLang.NG_FILTER_KEYWORD_PLACEHOLDER')"
            @keyup.enter.native="handleBasicSearch();"
          />
          <el-autocomplete
            style="width: 100%; border: none;"
            v-if="currentBasicCondition && (currentBasicCondition.type === 'select' || currentBasicCondition.type === 'cascader')"
            v-model="basicFormData.keyword"
            size="medium"
            :disabled="advancedFormVisible"
            :placeholder="$t('calcStorLang.NG_FILTER_KEYWORD_PLACEHOLDER')"
            :props="{label: 'label', value: 'value'}"
            :fetch-suggestions="handleFetchSuggestions"
            @select="handleSuggestionSelect"
          />
          <el-date-picker
            style="width: 100%; border: none;"
            :ref="'input-'+currentBasicCondition.key"
            v-if="currentBasicCondition && currentBasicCondition.type === 'date-picker'"
            v-model="basicFormData.keyword"
            :disabled="advancedFormVisible"
            :placeholder="$t('opt.selectTimeRange')"
            :type="currentBasicCondition.pickerType"
            :picker-options="currentBasicCondition.pickerOptions"
          />
        </el-form-item>
        <el-form-item class="margin-0">
          <el-button
            id="submit-button"
            icon="search"
            size="small"
            :disabled="advancedFormVisible"
            @click="handleBasicSearch()" />
        </el-form-item>
      </el-form>
      <div v-if="!advancedDisabled" style="margin-left: 5px;">
        <el-button
          type="text"
          v-if="!advancedFormVisible"
          @click="advancedFormVisible = true"
        >
          {{ $t('calcStorLang.NG_FILTER_ADVANCED_QUERY') }}
        </el-button>
        <el-button
          type="text"
          v-if="advancedFormVisible"
          @click="advancedFormVisible = false"
        >
          {{ $t('calcStorLang.NG_FILTER_BASIC_QUERY') }}
        </el-button>
      </div>
      <slot />
    </div>
    <div>
      <el-tag
        v-if="validatedBasicCondition.key !== ''"
        style="margin-right: 5px;"
        :style="{ 'max-width': width+'px' }"
        type="primary"
        :closable="true"
        @close="clearValidatedBasicCondition()">
        <div style="float: left; overflow: hidden; text-overflow: ellipsis;" :style="{ 'max-width': width-50+'px' }">
          {{ validatedBasicCondition.keyLabel }}: {{ validatedBasicCondition.valueLabel }}
        </div>
      </el-tag>
    </div>
    <div v-if="!advancedDisabled" v-show="advancedFormVisible">
      <div class="divider clearfix"></div>
      <el-form
        :label-width="labelWidth"
        label-position="right"
        style="margin-top: 15px;">
        <el-row>
          <el-col :span="7" v-for="(condition, index) in advancedFormData.conditions" :key="index">
            <el-form-item :label="condition.label">
              <el-input
                v-if="condition.type === 'input'"
                v-model="condition.value"
                style="width: 100%;"
                :placeholder="condition.placeholder"
                @change="(val) => handleValueChanged(condition.key, val)"
                @keyup.enter.native="handleAdvancedSearch();"
              />
              <el-select
                v-if="condition.type === 'select'"
                v-model="condition.value"
                filterable
                clearable
                style="width: 100%;"
                @change="(val) => handleValueChanged(condition.key, val)"
              >
                <el-option v-for="(option, index) in condition.options" :key="index" :label="option.label" :value="option.value" />
              </el-select>
              <el-cascader
                v-if="condition.type === 'cascader'"
                v-model="condition.value"
                filterable
                clearable
                style="width: 100%"
                :options="condition.options"
                @change="(val) => handleValueChanged(condition.key, val)"
              />
              <el-date-picker
                v-if="condition.type === 'date-picker'"
                v-model="condition.value"
                clearable
                style="width: 100%"
                :picker-options="condition.pickerOptions"
                :type="condition.pickerType"
                @change="(val) => handleValueChanged(condition.key, val)"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7">
            <el-form-item>
              <el-button type="primary" size="small" icon="search" @click="handleAdvancedSearch">{{ $t('calcStorLang.NG_FILTER_QUERY') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ICOSSearchBar',
  componentName: 'icos-search-bar',
  props: {
    conditions: {
      type: Object,
      default: () => {
        return {};
      }
    },
    advancedDisabled: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 700
    }
  },
  data() {
    return {
      changeWidthConf: {
        target: ".el-input input",
        max: "500",
        min: "10"
      },
      basicFormData: {
        conditions: [],
        key: '',
        keyword: ''
      },
      advancedFormData: {
        conditions: []
      },
      validatedBasicCondition: {
        key: '', // 实际的键
        keyLabel: '', // 显示的键
        valueLabel: '', // 显示的值
        value: '' // 实际的值
      },
      advancedFormVisible: false
    };
  },
  methods: {
    // 级联选择器选项扁平化，使得select组件可以使用
    cascaderOptionsFlatten(options, ancestors = []) {
      let flattenOptions = [];
      options.forEach(option => {
        if ('children' in option) {
          flattenOptions = flattenOptions.concat(this.cascaderOptionsFlatten(option.children, ancestors.concat([option])));
        } else {
          let label = ancestors.map(ancestor => {
            return ancestor.label
          }).join(' / ') + ' / ' + option.label;
          flattenOptions.push({
            value: ancestors.map(item => item.value).concat([option.value]),
            label: label
          });
        }
      });
      return flattenOptions;
    },
    findInCascaderOptions(value, options, ancestors = []) {
      let result = [];
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if ('children' in option) {
          result = this.findInCascaderOptions(value, option.children, ancestors.concat([option.value]));
        } else {
          if (option.value === value) {
            result = ancestors.concat([option.value]);
          }
        }
        if (result.length > 0) {
          break;
        }
      }
      return result;
    },
    handleFetchSuggestions(queryString, callback) {
      const $this = this;
      const condition = $this.basicFormData.conditions.find(item => item.key === $this.basicFormData.key);
      if (!condition) {
        throw new Error(`ICOS Search Bar: no such key ${$this.basicFormData.key}.`);
      } else {
        if (condition.type === 'input') {
          callback([]);
        } else if (condition.type === 'select') {
          if (!condition.options) {
            throw new Error(`ICOS Search Bar: select condition needs options.`);
          } else {
            const options = condition.options;
            callback(options.filter(item => item.label.toLowerCase().indexOf(queryString.toLowerCase()) > -1));
          }
        } else if (condition.type === 'cascader') {
          if (!condition.options) {
            throw new Error(`ICOS Search Bar: cascader condition needs options.`);
          } else {
            const options = $this.cascaderOptionsFlatten(condition.options);
            callback(options.filter(item => item.label.toLowerCase().indexOf(queryString.toLowerCase()) > -1));
          }
        } else {
          throw new Error(`ICOS Search Bar: unknown condition type ${condition.type}.`);
        }
      }
    },
    handleSuggestionSelect(item) {
      const $this = this;
      const condition = $this.conditions[$this.basicFormData.key];
      $this.validatedBasicCondition.key = $this.basicFormData.key;
      $this.validatedBasicCondition.keyLabel = condition.label;
      $this.validatedBasicCondition.valueLabel = item.label;
      $this.validatedBasicCondition.value = item.value
      $this.$emit('search', {
        [$this.basicFormData.key]: item.value
      });
      $this.basicFormData.keyword = '';
    },
    handleBasicSearch() {
      const $this = this;
      const condition = $this.conditions[$this.basicFormData.key];
      if (condition.type === 'input') {
        $this.basicFormData.keyword = $this.basicFormData.keyword.trim();
        if ($this.basicFormData.keyword !== '') {
          if ('validator' in condition) {
            try {
              condition.validator($this.basicFormData.keyword);
              $this.validatedBasicCondition.key = $this.basicFormData.key;
              $this.validatedBasicCondition.keyLabel = condition.label;
              $this.validatedBasicCondition.valueLabel = $this.basicFormData.keyword;
              $this.validatedBasicCondition.value = $this.basicFormData.keyword;
              $this.$emit('search', {
                [$this.validatedBasicCondition.key]: $this.basicFormData.keyword
              });
              $this.basicFormData.keyword = '';
            } catch (e) {
              $this.$message.error(`${condition.label}: ${e.message}`);
            }
          }
        } else {
          if ($this.validatedBasicCondition.value !== '') {
            $this.$emit('search', {
              [$this.validatedBasicCondition.key]: $this.validatedBasicCondition.value
            });
          } else {
            $this.$emit('search', {});
          }
        }
      } else if (condition.type === 'time-picker' || condition.type === 'date-picker') {
        if (($this.basicFormData.keyword instanceof Array && ($this.basicFormData.keyword.length === 0 || $this.basicFormData.keyword.includes(null))) || $this.basicFormData.keyword === '' || $this.basicFormData.keyword === null || $this.basicFormData.keyword === undefined) {
          $this.$emit('search', {
            [$this.validatedBasicCondition.key]: $this.validatedBasicCondition.value
          });
        } else {
          try {
            if ($this.basicFormData.keyword.length === 2) { // 时间区间的情况，检查是否结束时间大于等于开始时间
              let startTime = $this.basicFormData.keyword[0].getTime();
              let endTime = $this.basicFormData.keyword[1].getTime();
              if (startTime > endTime) {
                throw new Error(`${condition.label}: ${$this.$t('calcStorLang.NG_FILTER_DATE_RANGE_ERR')}`);
              }
            }
            $this.validatedBasicCondition.key = $this.basicFormData.key;
            $this.validatedBasicCondition.keyLabel = condition.label;
            $this.validatedBasicCondition.valueLabel = $this.$refs['input-'+$this.currentBasicCondition.key].displayValue;
            $this.validatedBasicCondition.value = $this.basicFormData.keyword;
            $this.$emit('search', {
              [$this.validatedBasicCondition.key]: $this.basicFormData.keyword
            });
            $this.basicFormData.keyword = undefined;
          } catch (e) {
            $this.$message.error(`${condition.label}: ${e.message}`);
          }
        }
      } else {
        if ($this.validatedBasicCondition.value !== '') {
          $this.$emit('search', {
            [$this.validatedBasicCondition.key]: $this.validatedBasicCondition.value
          });
        } else {
          $this.basicFormData.keyword = '';
          $this.$emit('search', {});
        }
      }
    },
    handleBasicKeyChanged() {
      this.basicFormData.keyword = '';
    },
    handleValueChanged(key, newValue) {
      this.$emit('condition-value-changed', {
        key,
        value: newValue
      });
    },
    clearValidatedBasicCondition() {
      const $this = this;
      $this.validatedBasicCondition.key = '';
      $this.validatedBasicCondition.keyLabel = '';
      $this.validatedBasicCondition.valueLabel = '';
      $this.validatedBasicCondition.value = '';
      $this.$emit('search', {});
    },
    clearValidatedBasicConditionNotSearch() {
      const $this = this;
      $this.validatedBasicCondition.key = '';
      $this.validatedBasicCondition.keyLabel = '';
      $this.validatedBasicCondition.valueLabel = '';
      $this.validatedBasicCondition.value = '';
      $this.$emit('resetQuery', {});
    },
    handleAdvancedSearch() {
      const $this = this;
      let params = {};
      let validated = true;
      for (let i = 0; i < $this.advancedFormData.conditions.length; i++) {
        const condition = $this.advancedFormData.conditions[i];
        if (condition.type === 'input') {
          condition.value = String(condition.value).trim(); // 手动输入的，削除两边空格
        }
        let value = '';
        if (condition.type === 'input' || condition.type === 'select') {
          if (condition.value !== '' && condition.value !== undefined && condition.value !== null) {
            value = String(condition.value);
          }
        } else if (condition.type === 'cascader') {
          value = condition.value;
        } else if (condition.type === 'time-picker' || condition.type === 'date-picker') {
          if (condition.value instanceof Array && condition.value.length !== 0 && !condition.value.includes(null)) {
            value = condition.value;
          }
        }
        if (value !== '' && value !== undefined && value !== null && JSON.stringify(value) !== '[]') {
          try {
            if (condition.type === 'time-picker' || condition.type === 'date-picker') {
              if (value instanceof Array && value.length === 2) { // 时间区间的情况，检查是否结束时间大于等于开始时间
                let startTime = value[0].getTime();
                let endTime = value[1].getTime();
                if (startTime > endTime) {
                  throw new Error(`${condition.label}: ${$this.$t('calcStorLang.NG_FILTER_DATE_RANGE_ERR')}`);
                }
              }
            }
            if ('validator' in condition) {
              condition.validator(value);
              params[condition.key] = value;
            } else {
              params[condition.key] = value;
            }
          } catch (e) {
            $this.$message.error(`${condition.label}: ${e.message}`);
            validated = false;
            break;
          }
        }
      }
      if (validated) {
        $this.$emit('search', params);
      }
    }
  },
  watch: {
    conditions: { // 监听条件prop的变化，因为有些值是异步赋值的
      immediate: true,
      deep: true,
      handler(newConditions) {
        const $this = this;
        let newBasicConditions = [];
        let newAdvancedConditions = [];
        Object.keys(newConditions).forEach((key, index) => {
          let newCondition = newConditions[key];
          let condition = {
            key: key,
            label: '',
            type: 'input',
            options: [],
            placeholder: $this.$t('calcStorLang.NG_FILTER_KEYWORD_PLACEHOLDER'),
            visible: true,
            value: newCondition.type === 'cascader' ? [] : ''
          };
          Object.assign(condition, newCondition);

          // 已有高级查询值的情况，赋值
          let existingCondition = $this.advancedFormData.conditions.find(item => item.key === condition.key);
          if (existingCondition) {
            if (JSON.stringify(existingCondition.options) === JSON.stringify(condition.options)) {
              condition.value = existingCondition.value;
            }
          }
          if (condition.visible === true) {
            if ($this.basicFormData.key === '') {
              $this.basicFormData.key = key;
            }
            newBasicConditions.push(condition);
            newAdvancedConditions.push(condition);
          }
        });
        $this.basicFormData.conditions = newBasicConditions;
        $this.advancedFormData.conditions = newAdvancedConditions;
      }
    },
    advancedFormVisible(newValue, oldValue) {
      const $this = this;
      if (newValue === true) {
        if ($this.validatedBasicCondition.key !== '') {
          const condition = $this.advancedFormData.conditions.find(item => item.key === $this.validatedBasicCondition.key);
          if (condition) {
            condition.value = $this.validatedBasicCondition.value;
          }
          $this.basicFormData.keyword = '';
          $this.validatedBasicCondition.key = '';
          $this.validatedBasicCondition.keyLabel = '';
          $this.validatedBasicCondition.valueLabel = '';
          $this.validatedBasicCondition.value = '';
        }
      }
      if (newValue === false) {
        $this.clearValidatedBasicCondition();
        $this.advancedFormData.conditions.forEach(condition => {
          if (condition.type === 'input' || condition.type === 'select') {
            condition.value = '';
          } else if (condition.type === 'cascader') {
            condition.value = [];
          }
        });
      }
    }
  },
  computed: {
    labelWidth() {
      const $this = this;
      let labelWidth = 0;
      let labels = Object.keys($this.conditions).forEach(key => {
        const label = $this.conditions[key].label;
        let span = document.body.appendChild(document.createElement('span'));
        span.style.fontSize = '14px';
        span.innerText = label;
        let width = span.offsetWidth;
        if (span.remove) {
          span.remove();
        } else {
          span.removeNode(true);
        }
        labelWidth = width > labelWidth ? width : labelWidth;
      });
      return (labelWidth + 12) + 'px';
    },
    currentBasicCondition() {
      const $this = this;
      let key = $this.basicFormData.key;
      let condition = $this.basicFormData.conditions.find(item => item.key === key);
      if (condition) {
        return condition;
      } else {
        return {
          type: ''
        }
      }
    }
  }
}
</script>

<style scoped>
#basic-condition-select >>> input {
  border: none;
}

.margin-0 {
  margin: 0;
}

#middle-form-item {
  flex: 1;
}

#middle-form-item >>> .el-form-item__content {
  width: 100%;
}

#middle-form-item >>> input {
  border: 0;
}

#submit-button {
  border: 0;
  height: 30px;
}

#submit-button:hover, #submit-button:active, #submit-button:focus {
  background-color: #fff;
}

#submit-button.is-disabled {
  background-color: #eef1f6;
}
</style>
