<template>
  <fu-tabs v-model="activeName">
    <fu-tab-pane label="基本属性" name="bascAttr">
      <base-config
        :config="taskData.baseTask"
        v-if="activeName === 'bascAttr'"
      ></base-config>
    </fu-tab-pane>
    <fu-tab-pane label="邮件任务设置" name="EmailJob">
      <div class="mappingsetContainer" v-if="activeName === 'EmailJob'">
        <fu-form :rules="rules" :fu-data="taskData.EmailJob">
          <fu-form-item label="收件人" label-width="110px" prop="addressee">
            <fu-input v-model="taskData.EmailJob.addressee"></fu-input>
          </fu-form-item>
          <fu-form-item label="主题" label-width="110px" prop="subject">
            <fu-input v-model="taskData.EmailJob.subject"></fu-input>
          </fu-form-item>
          <fu-form-item label="正文" label-width="110px" prop="content">
            <fu-input
              type="textarea"
              v-model="taskData.EmailJob.content"
            ></fu-input>
          </fu-form-item>
          <fu-form-item label="" label-width="40px">
            <fu-checkbox v-model="taskData.EmailJob.isSendLog"
              >是否启用</fu-checkbox
            >
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
import { Tabs, TabPane, Form, FormItem, Input, Checkbox } from "fusion-ui"
//组件
import BaseConfig from "@com/BaseConfig" //基本属性
export default {
  name: "EmailJob",
  components: {
    BaseConfig,
    FuTabs: Tabs,
    FuTabPane: TabPane,
    FuForm: Form,
    FuFormItem: FormItem,
    FuInput: Input,
    FuCheckbox: Checkbox,
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
        addressee: [
          { required: true, message: "请输入收件人", trigger: "blur" },
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
        // if (this.activeName === "EmailJob") {
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
      width: 220px;
    }
    .el-textarea {
      width: 300px;
    }
  }
}
</style>
