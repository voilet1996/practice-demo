<template>
  <fu-tabs v-model="activeName">
    <fu-tab-pane label="基本属性" name="bascAttr">
      <base-config
        :config="taskData.baseTask"
        v-if="activeName === 'bascAttr'"
      ></base-config>
    </fu-tab-pane>
    <fu-tab-pane label="Http任务设置" name="HttpJob">
      <div class="mappingsetContainer" v-if="activeName === 'HttpJob'">
        <fu-form :rules="rules" :fu-data="taskData.HttpJob">
          <fu-form-item label="服务地址" label-width="110px" prop="serviceUrl">
            <fu-input v-model="taskData.HttpJob.serviceUrl"></fu-input>
          </fu-form-item>
        </fu-form>
      </div>
    </fu-tab-pane>
  </fu-tabs>
</template>

<script>
//基类
import Base from "../../base"
//默认的配置文件
import CONFIG from "./config.json"
//fusion-ui组件
import { Tabs, TabPane, Form, FormItem, Select, Option, Input } from "fusion-ui"
//组件
import BaseConfig from "@com/BaseConfig" //基本属性
export default {
  name: "HttpJob",
  components: {
    BaseConfig,
    FuTabs: Tabs,
    FuTabPane: TabPane,
    FuForm: Form,
    FuFormItem: FormItem,
    FuSelect: Select,
    FuOption: Option,
    FuInput: Input,
  },
  mixins: [Base],
  props: {},
  data() {
    return {
      //步骤配置数据
      CONFIG: CONFIG,
      //当前选中tab签
      activeName: "bascAttr",
      requestArray: [], //存放输入设置接口的请求，避免面板切换时多次请求，数据返回时机不一致导致的数据错误问题(通常是输入设置的接口)
      currRequestId: "", //当前 输入设置接口 请求的id(通常是输入设置的接口)
      rules: {
        serviceUrl: [
          { required: true, message: "请输入服务地址", trigger: "blur" },
        ],
      },
      options: {},
    }
  },
  computed: {},
  watch: {
    /**
     * @description 监听tab切换的变化
     */
    //TODO tab页签发生变化时处理各页签的逻辑，基本属性目前不需要处理
    activeName: {
      handler() {
        // if (this.activeName === "HttpJob") {
        //   this.initMappingData()
        // }
      },
    },
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //TODO清空步骤内部缓存数据、请求终止、默认选中第一个tab签等
    initTaskData() {
      //默认选中第一个tab签
      this.activeName = "bascAttr"

      //TODO 清空缓存数据

      //TODO 终止相关请求，大多数情况不需要修改，如果不需要修改把todo去掉即可
      this.requestArray.forEach((item) => {
        if (this.currRequestId !== item.id) {
          item.request.abort()
        }
      })
      this.requestArray.splice(0, this.requestArray.length)
    },
  },
}
</script>

<style lang="less" scoped>
.el-tabs {
  background-color: #fafafa;
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .el-tabs__content {
    flex: 1;
    margin: 0px 10px;
    .el-tab-pane {
      height: 100%;
    }
    .el-input {
      width: 300px;
    }
    .el-textarea {
      width: 300px;
    }
  }
}
</style>
