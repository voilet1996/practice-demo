<!--
1.高级查询组件需要传search方法 会将form表单作为第一个参数传出

2.需要传名为columns的数组，也就是要展示的form所有表单

例：queryColumns: [
        {
          label: "项目年度",          //表单名称
          placeholder: "请选择年度",    
          type: "select",            // 必传
          isMultiple:true,             //select框是否多选，已数组形式传值，默认单选
          isSearchShow: true,          //是否显示在上面作为主查询条件
          labelWidth:'110px',        //名称宽度值,默认68px
          modelDataKey: "projectYear",  //双向绑定数据
          fuData:[],                 //不需要请求时传入options的数据，优先级最高
          request: {           //只有select和checkbox-button组件请求数据时需要传
            url: "/api/core/v1/dictionary/queryData.do?dicId=pStatus",
            params: [],
          },
          onEventName:  随便起名 // 2022.9.2 拓展查询组件查询条件为select时的联动问题     
          setKey: 要设置的下拉框数据key                   
        },
        {
          label: "项目名称",
          placeholder: "请输入项目名称",
          modelDataKey: "projectName",
          type: "input",
          isSearchShow: true,
        },
        //如果多选，会将value值以逗号分隔拼接返回
        {
          label: "组织部门",
          labelWidth: "80px",
          placeholder: "请选择组织部门",
          type: "select-tree", //下拉树
          isMultiple: false, //是否多选，默认多选
          isSearchShow: false,
          modelDataKey: "organizationDepartment",
          request: {
            url: "/api/oa/userManage/orgInfoList.do",
            params: [],
          },
        },
        {
          label: "日期",
          labelWidth: "80px",
          type: "date-picker", //日期组件
          isSearchShow: false,
          modelDataStartKey: "startTime",//开始日期对应key值
          modelDataEndKey: "endTime",//结束日期对应key值
        },
        {
          label: "项目年度",          //表单名称
          placeholder: "请选择年度",    
          type: "checkbox-button",            // 多选框组件，
          isSearchShow: true,          //是否显示在上面作为主查询条件
          labelWidth:'110px',        //名称宽度值,默认68px
          modelDataKey: "projectYear",  //双向绑定数据
          fuData:[],                 //不需要请求时传入options的数据，优先级最高
          request: {           //只有select和checkbox-button组件请求数据时需要传
            url: "/api/core/v1/dictionary/queryData.do?dicId=pStatus",
            params: [],
          },                        
        },
        //插槽内容需要设置宽度，
        {
          label: "日期",
          labelWidth: "80px",
          placeholder: "请选择日期",
          type: "slot", //自定义插槽
          slotName:'date',
          isSearchShow: false,
          modelDataKey: "date",
        },
        ]

3.hideAdvancedQuery 参数，是否显示高级查询，默认为不隐藏 false，可以传入true,即可隐藏高级查询
4.showTopResetButton 参数，是否显示上面的重置按钮，默认为隐藏 false，可以传入true,即可显示上面的重置按钮
5.传入form表单
6.是否在刚开始默认查询的参数  beginningSearch 在回显的时候让组件自动查询
7.样式问题：这个组件外层需要包一个div，设置div的高度和宽度，决定组件宽高和位置等信息，组件自适应
-->

<template>
  <div class="advanced-query">
    <div class="wrapper">
      <div class="header">
        <fu-form
          :model="form"
          :inline="true"
          :style="{
            visibility: popoverVisible ? 'hidden' : 'visible',
            width: !hideAdvancedQuery
              ? showTopResetButton
                ? 'calc(100% - 255px)'
                : 'calc(100% - 185px)'
              : showTopResetButton
              ? 'calc(100% - 155px)'
              : 'calc(100% - 85px)',
          }"
        >
          <fu-form-item
            v-for="(item, index) in filterColumn"
            :key="item.modelDataKey"
            :label="item.label"
            :label-width="item.labelWidth || '68px'"
          >
            <fu-select
              v-if="item.type && item.type === 'select'"
              size="small"
              v-model="form[item.modelDataKey]"
              :placeholder="item.placeholder || ''"
              clearable
              filterable
              collapse-tags
              :multiple="item.isMultiple ? item.isMultiple : false"
              @change="
                (value) =>
                  selectChange(
                    value,
                    item.onEventName,
                    item.modelDataKey,
                    item.setkey
                  )
              "
            >
              <!-- v-for="every in item.selectOptions"
                :key="
                  every[item.value ? item.value : 'value'] +
                    every[item.text ? item.text : 'text']
                "
                :label="every[item.text ? item.text : 'text']"
                :value="every[item.value ? item.value : 'value']" -->
              <fu-option
                v-for="every in item.selectOptions"
                :key="every[item.value ? item.value : 'value']"
                :value="every[item.value ? item.value : 'value']"
                :label="every[item.text ? item.text : 'text']"
              ></fu-option>
            </fu-select>

            <!-- 下拉树 -->
            <fu-select
              :popper-append-to-body="false"
              class="select-tree"
              :placeholder="item.placeholder || ''"
              v-else-if="item.type && item.type === 'select-tree'"
              size="small"
              v-model="form[item.modelDataKey]"
              clearable
              @clear="clearSelect(item)"
            >
              <fu-input
                :value="modelInputLists[`${item.modelDataKey}filterText`]"
                @input="
                  modelInputLists[`${item.modelDataKey}filterText`] = $event
                "
                size="mini"
                clearable
              ></fu-input>
              <fu-option
                :value="form[item.modelDataKey]"
                :label="item.selectTreeLabel"
              >
                <fu-tree
                  size="small"
                  :fu-data="item.selectOptions"
                  :ref="`${item.modelDataKey}SelectTree`"
                  node-key="id"
                  :props="{ label: 'text' }"
                  :show-checkbox="true"
                  :check-strictly="true"
                  :default-expand-all="true"
                  :filter-node-method="filterNode"
                  @check-change="
                    (data, checked) => handleCheckChange(data, checked, item)
                  "
                >
                </fu-tree>
              </fu-option>
            </fu-select>
            <fu-input
              v-else-if="item.type && item.type === 'input'"
              size="small"
              v-model="form[item.modelDataKey]"
              :placeholder="item.placeholder || ''"
              clearable
            ></fu-input>
            <!-- 日期选择器 -->
            <fu-date-picker
              v-else-if="item.type && item.type === 'date-picker'"
              v-model="item.dateValue"
              @change="(val) => changeTime(val, item)"
              value-format="yyyy-MM-dd"
              size="small"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            >
            </fu-date-picker>
            <!-- 多选框组件 -->
            <fu-checkbox-group
              v-if="item.type && item.type === 'checkbox-button'"
              size="small"
              v-model="form[item.modelDataKey]"
              :placeholder="item.placeholder || ''"
            >
              <fu-checkbox-button
                v-for="every in item.selectOptions"
                :key="every.value"
                :label="every.value"
                :disabled="every.disabled ? every.disabled : false"
                >{{ every.text }}</fu-checkbox-button
              >
            </fu-checkbox-group>
            <!-- 支持以具名slot插槽的形式自定义展示 -->
            <slot
              v-else-if="item.type && item.type === 'slot'"
              :name="item.slotName"
            ></slot>
          </fu-form-item>
        </fu-form>
        <div
          class="search-btn"
          :style="{
            width: !hideAdvancedQuery
              ? showTopResetButton
                ? '282px'
                : '196px'
              : showTopResetButton
              ? '166px'
              : '80px',
          }"
        >
          <fu-button
            type="success"
            size="small"
            @click="search"
            :style="{
              visibility:
                popoverVisible || filterColumn.length === 0
                  ? 'hidden'
                  : 'visible',
            }"
            >查询</fu-button
          >
          <fu-button v-if="showTopResetButton" size="small" @click="resetForm"
            >重置</fu-button
          >
          <fu-button
            type="primary"
            size="small"
            style="width: 100px"
            v-if="!hideAdvancedQuery"
            @click="advancedQuery"
            >{{ !popoverVisible ? "高级查询" : "收起" }}</fu-button
          >
        </div>
      </div>
      <fu-popover
        class="popover"
        trigger="click"
        placement="left"
        v-model="popoverVisible"
        :visible-arrow="false"
        width="429"
      >
        <div class="text">高级搜索</div>
        <div class="form">
          <fu-form :model="form">
            <fu-form-item
              v-for="(item, index) in columnsData"
              :key="item.modelDataKey"
              :label="item.label"
              label-width="110px"
            >
              <fu-select
                v-if="item.type && item.type === 'select'"
                size="small"
                v-model="form[item.modelDataKey]"
                :placeholder="item.placeholder || ''"
                clearable
                filterable
                collapse-tags
                :multiple="item.isMultiple ? item.isMultiple : false"
              >
                <fu-option
                  v-for="every in item.selectOptions"
                  :key="every.value"
                  :value="every.value"
                  :label="every.text"
                ></fu-option>
              </fu-select>
              <fu-input
                v-else-if="item.type && item.type === 'input'"
                size="small"
                v-model="form[item.modelDataKey]"
                :placeholder="item.placeholder || ''"
              ></fu-input>
              <!-- 下拉树 -->
              <fu-select
                ref="selectTree"
                :popper-append-to-body="false"
                class="select-tree"
                :placeholder="item.placeholder || ''"
                v-else-if="item.type && item.type === 'select-tree'"
                size="small"
                v-model="form[item.modelDataKey]"
                clearable
                @clear="clearSelect(item)"
              >
                <fu-input
                  :value="modelInputLists[`${item.modelDataKey}filterText`]"
                  @input="
                    modelInputLists[`${item.modelDataKey}filterText`] = $event
                  "
                  size="mini"
                  clearable
                ></fu-input>
                <fu-option
                  :value="form[item.modelDataKey]"
                  :label="item.selectTreeLabel"
                >
                  <fu-tree
                    size="small"
                    :fu-data="item.selectOptions"
                    :ref="`${item.modelDataKey}SelectTree`"
                    node-key="id"
                    :props="{ label: 'text' }"
                    :show-checkbox="true"
                    :check-strictly="true"
                    :default-expand-all="true"
                    :filter-node-method="filterNode"
                    @check-change="
                      (data, checked) => handleCheckChange(data, checked, item)
                    "
                  >
                  </fu-tree>
                </fu-option>
              </fu-select>
              <!-- 日期选择器 -->
              <fu-date-picker
                v-else-if="item.type && item.type === 'date-picker'"
                v-model="item.dateValue"
                @change="(val) => changeTime(val, item)"
                value-format="yyyy-MM-dd"
                size="small"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              >
              </fu-date-picker>
              <!-- 多选框组件 -->
              <el-checkbox-group
                v-if="item.type && item.type === 'checkbox-button'"
                size="small"
                v-model="form[item.modelDataKey]"
                :placeholder="item.placeholder || ''"
              >
                <el-checkbox-button
                  v-for="every in item.selectOptions"
                  :key="every.value"
                  :label="every.value"
                  :disabled="every.disabled ? every.disabled : false"
                  >{{ every.text }}</el-checkbox-button
                >
              </el-checkbox-group>
              <!-- 支持以具名slot插槽的形式自定义展示 -->
              <slot
                v-else-if="item.type && item.type === 'slot'"
                :name="item.slotName"
              ></slot>
            </fu-form-item>
          </fu-form>
          <div class="btn">
            <fu-button size="small" type="success" @click="search"
              >查询</fu-button
            >
            <fu-button size="small" @click="resetForm">重置</fu-button>
          </div>
        </div>
      </fu-popover>
    </div>
  </div>
</template>
<script>
import {
  Select,
  Option,
  Button,
  Form,
  FormItem,
  Input,
  Tree,
  Popover,
  DatePicker,
  CheckboxGroup,
  CheckboxButton,
} from "fusion-ui";
import { postJSON } from "@/utils/post.js";
export default {
  components: {
    FuSelect: Select,
    FuOption: Option,
    FuButton: Button,
    FuForm: Form,
    FuFormItem: FormItem,
    FuInput: Input,
    FuPopover: Popover,
    FuTree: Tree,
    FuDatePicker: DatePicker,
    FuCheckboxGroup: CheckboxGroup,
    FuCheckboxButton: CheckboxButton,
  },
  props: {
    columns: {
      type: Array,
      default: () => {
        return [];
      },
    },
    hideAdvancedQuery: {
      type: Boolean,
      default: false,
    },
    showTopResetButton: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      default: () => {
        return {};
      },
    },
    beginningSearch: {
      type: Boolean,
      default: false,
    },
  },
  created() {},
  watch: {
    //树的搜索功能
    newModelInputLists: {
      handler(newVal, oldVal) {
        for (let i in newVal) {
          if (newVal[i] !== oldVal[i]) {
            let data = i.replace("filterText", "");

            this.$refs[`${data}SelectTree`][0].$refs.el.filter(newVal[i]);
          }
        }
      },
      deep: true,
    },
    //传参改变  进行赋值
    columns: {
      handler() {
        this.handleColumnsChange();
        //form赋值后再查询
        if (Object.keys(this.form).length > 0 && this.beginningSearch) {
          this.search();
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    newModelInputLists() {
      return JSON.parse(JSON.stringify(this.modelInputLists));
    },
    //上面主查询条件数组
    filterColumn() {
      return this.columnsData.filter((item) => {
        return item.isSearchShow === true;
      });
    },
  },
  data() {
    return {
      //下拉树搜索功能input的绑定值集合
      modelInputLists: {},
      popoverVisible: false,
      columnsData: [],
    };
  },
  methods: {
    /**
     * @description   日期组件值改变时的回调，改变form表单的相应绑定值
     */
    changeTime(value, item) {
      if (value) {
        this.form[item.modelDataStartKey] = value[0];
        this.form[item.modelDataEndKey] = value[1];
      } else {
        //清空时
        this.form[item.modelDataStartKey] = "";
        this.form[item.modelDataEndKey] = "";
      }
    },
    /**
     * @desscription 传参columns改变   所要做的逻辑
     */
    handleColumnsChange() {
      //批量请求下拉框数据
      let columnsData = JSON.parse(JSON.stringify(this.columns));
      this.columnsData = columnsData;
      if (this.columnsData.length !== 0) {
        this.columnsData.forEach((item, index) => {
          //形成页面的form表单(现在要从外面传入form对象)

          //defaultValue优先级最高
          //日期选择组件和多选框组件没有默认值的情况下，默认为数组
          //其余情况默认为“”
          // if (item.defaultValue !== undefined && item.modelDataKey) {
          //   this.$set(this.form, item.modelDataKey, item.defaultValue)
          // } else if (item.type === "date-picker") {
          //   this.$set(item, "dateValue", []) //item中加一个数据用于v-model的数值
          //   this.$set(this.form, item.modelDataStartKey, "")
          //   this.$set(this.form, item.modelDataEndKey, "")
          // } else if (item.type === "checkbox-button") {
          //   this.$set(this.form, item.modelDataKey, [])
          // } else if (item.modelDataKey) {
          //   this.$set(this.form, item.modelDataKey, "")

          //   // this.form[item.modelDataKey] = "";
          // } else {
          //   //console.log(`${item.label}表单没填写双向绑定变量！`);
          // }
          if (item.modelData) {
            if (item.defaultValue) {
              this.$set(this.form, item.modelData, item.defaultValue);
            } else {
              this.$set(this.form, item.modelData, "");
            }

            // this.form[item.modelData] = "";
          }
          if (item.fuData) {
            this.$set(item, "selectOptions", item.fuData);
          } else if (
            item.type &&
            (item.type === "select" ||
              item.type === "select-tree" ||
              item.type === "checkbox-button")
          ) {
            this.queryData(item, index);
          }
        });
        //console.log("form", this.form);
        //console.log("modelInputLists", this.modelInputLists);
      }
      console.log(this.form, "form");
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.text.indexOf(value) !== -1;
    },

    /**
     * @description   下拉树类型转换树形结构
     */
    transformTozTreeFormat(sNodes) {
      //将普通的数组转换为父子结构
      let i, l;
      let r = [];
      let tmpMap = {};
      for (i = 0, l = sNodes.length; i < l; i++) {
        tmpMap[sNodes[i].id] = sNodes[i];
      }
      for (i = 0, l = sNodes.length; i < l; i++) {
        let p = tmpMap[sNodes[i].pId];
        if (p && sNodes[i].id != sNodes[i].pId) {
          let children = this.nodeChildren(p);
          if (!children) {
            children = this.nodeChildren(p, []);
          }
          children.push(sNodes[i]);
        } else {
          r.push(sNodes[i]);
        }
      }
      return r;
    },
    nodeChildren(node, newChildren) {
      if (typeof newChildren !== "undefined") {
        node.children = newChildren;
      }
      return node.children;
    },
    advancedQuery() {
      //收起高级查询时清空其他未显示的查询条件
      if (this.popoverVisible) {
        this.columns.forEach((item) => {
          if (!item.isSearchShow) {
            if (
              Object.prototype.toString.call(this.form[item.modelDataKey]) ===
              "[object Array]"
            ) {
              this.form[item.modelDataKey] = [];
            } else {
              this.form[item.modelDataKey] = "";
            }
          }
        });
      }
      this.popoverVisible = !this.popoverVisible;
    },
    queryData(item) {
      if (item.request && item.request.url) {
        postJSON(item.request.url, {
          postData: JSON.stringify({ data: item.request.params }),
        })
          .then((res) => {
            //下拉树接口处理返回数据，变成树形结构数据
            if (item.type === "select-tree") {
              this.$set(
                item,
                "selectOptions",
                this.transformTozTreeFormat(res.data[0].data)
              );
              //初始化下拉树搜索input绑定值
              this.$set(
                this.modelInputLists,
                `${item.modelDataKey}filterText`,
                ""
              );
              //回显默认值
              this.$nextTick(() => {
                this.$refs[
                  `${item.modelDataKey}SelectTree`
                ][0].$refs.el.setCheckedKeys([item.defaultValue]);
              });
            } else {
              this.$set(item, "selectOptions", res.data[0].data);
            }
          })
          .catch((e) => {
            //console.log(`${item.fuId}${item.type}请求失败！：`, e);
          });
      }
    },
    search() {
      this.$emit("search", this.form);
    },
    resetForm() {
      for (let i in this.form) {
        //数组应该置成空数组
        if (Object.prototype.toString.call(this.form[i]) === "[object Array]") {
          this.form[i] = [];
        } else {
          this.form[i] = "";
        }
      }

      this.columnsData.forEach((item) => {
        //清空日期组件的值
        if (item.type === "date-picker" && item.dateValue) {
          // item.dataValue = [];
          this.$set(item, "dateValue", []);
        }
        //清空下拉树的选中
        if (item.type === "select-tree") {
          this.$set(item, "selectTreeLabel", "");
          this.$refs[
            `${item.modelDataKey}SelectTree`
          ][0].$refs.el.setCheckedNodes([]);
        }
      });
    },
    handleCheckChange(data, checked, item) {
      //单选时，因为这个方法在重新点击其他复选框时会触发两次，所以只能通过获取ckeys的方式清空
      let ckeys = this.$refs[
        `${item.modelDataKey}SelectTree`
      ][0].$refs.el.getCheckedNodes();
      //console.log("data", ckeys);
      let texts = [],
        values = [];
      ckeys.forEach((item) => {
        texts.push(item.text);
        values.push(item.value);
      });
      this.form[item.modelDataKey] = values.join(",");
      this.$set(item, "selectTreeLabel", texts.join(","));
      // this.selectTreeLabel = texts.join(",");
      if (!item.isMultiple) {
        //单选的逻辑
        if (checked == true) {
          //选择其他选项  控制单选
          this.$refs[
            `${item.modelDataKey}SelectTree`
          ][0].$refs.el.setCheckedNodes([data]);
          // this.form[item.modelDataKey] = data["value"];
          // this.$set(item, "selectTreeLabel", texts.join(","));
        }
      }
    },
    /**清空下拉树内的值 */
    clearSelect(item) {
      //清空树的选中节点
      this.form[item.modelDataKey] = "";
      this.$set(item, "selectTreeLabel", "");
      this.$refs[`${item.modelDataKey}SelectTree`][0].$refs.el.setCheckedNodes(
        []
      );
    },
    // 2022.9.2
    selectChange(value, onEventName, modelData, setkey) {
      if (onEventName) {
        this.$emit("selectChangeValue", value, modelData, setkey);
        // columnsData  selectOptions
      }
    },
  },
};
</script>
<style lang="less" scoped>
.advanced-query {
  width: 100%;
  height: 100%;
  line-height: 100%;
  .text {
    font-weight: bold;
  }

  .wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    .header {
      display: flex;
      width: 100%;
      height: 100%;

      /deep/.el-form {
        display: flex;
        height: 100%;
        overflow: auto;
        overflow-y: hidden;
        justify-content: flex-end;

        // width: calc(100% - 185px);
        .el-form-item {
          display: flex;
          margin: 0 10px 0 0;
        }
        .el-input {
          width: 180px;
        }
        //日期组件样式
        .el-date-editor--daterange.el-input__inner {
          width: 270px;
        }
        //多选框组件
        .el-checkbox-group {
          display: flex;
        }
      }
      .search-btn {
        // width: 196px;
        margin-left: 5px;
        margin-top: 5px;
      }
    }
    /deep/.el-popover {
      position: absolute;
      right: 0;
      top: 60px;
    }
  }
  .form {
    padding: 20px;
    /deep/.el-form {
      // margin-left: 23px;
      .el-form-item {
        .el-input {
          width: 250px;
        }
      }
      //日期组件样式
      .el-date-editor--daterange.el-input__inner {
        width: 250px;
      }
      //多选框组件
      .el-checkbox-group {
        display: flex;
        overflow: auto;
        width: 250px;
      }
    }

    .btn {
      margin-left: auto;
      margin-right: auto;
      width: 167px;
      margin-top: 37px;
    }
  }
}
.select-tree {
  //改变下拉树的样式
  /deep/.el-select-dropdown {
    width: 255px;
    .el-select-dropdown__item {
      max-height: 281px;
      padding: 0;
      overflow-y: auto;
      // overflow: hidden;
      // overflow-y: auto;
      height: 100%;
      width: 250px;
    }
    .el-scrollbar {
      overflow-y: auto;
      overflow-x: hidden;
      width: 293px;
      .el-scrollbar__wrap {
        overflow: hidden;
      }
      .el-select-dropdown__list {
        margin: 0 0 0 3px;
        .el-input {
          width: 77%;
          height: 28px;
        }
      }
    }

    .el-scrollbar__bar.is-vertical {
      display: none;
    }
    .el-select-dropdown__wrap {
      max-height: 314px;
      margin-bottom: 0 !important; //覆盖行内样式
    }
  }
}

//下拉树样式
// .upper-selectTree .el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
//   max-height: 100%;
//   padding: 0;
//   overflow: hidden;
//   // overflow-y: auto;
//   height: 100%;
//   width: 250px;
// }
</style>
