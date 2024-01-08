<template>
  <fu-tabs v-model="activeName" class="etl-job">
    <fu-tab-pane label="基本属性" name="bascAttr">
      <base-config
        :config="taskData.baseTask"
        v-if="activeName === 'bascAttr'"
      ></base-config>
    </fu-tab-pane>
    <fu-tab-pane label="ETL任务设置" name="EtlJob">
      <div class="mappingsetContainer" v-if="activeName === 'EtlJob'">
        <fu-form :rules="rules" :fu-data="taskData.ETLJob" class="etlJob-form">
          <fu-form-item
            label="请选择执行器"
            label-width="110px"
            prop="jobGroup"
          >
            <fu-select v-model="taskData.ETLJob.jobGroup" placeholder="请选择">
              <fu-option
                v-for="item in options"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              >
              </fu-option>
            </fu-select>
          </fu-form-item>
          <fu-form-item label="请选择ETL" label-width="110px" prop="etlId">
            <fu-select
              v-model="taskData.ETLJob.etlId"
              placeholder="请选择"
              filterable
            >
              <fu-option
                v-for="item in optionsETL"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              >
              </fu-option>
            </fu-select>
          </fu-form-item>
          <fu-form-item
            label="运行资源参数"
            label-width="110px"
            prop="etlParam"
          >
            <fu-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              v-model="taskData.ETLJob.etlParam"
            ></fu-input>
          </fu-form-item>
        </fu-form>
      </div>
    </fu-tab-pane>
  </fu-tabs>
</template>

<script>
import { postJSON } from "@/utils/post.js";
//基类
import Base from "../../base";
//默认的配置文件
import CONFIG from "./config.json";
//fusion-ui组件
import {
  Tabs,
  TabPane,
  Form,
  FormItem,
  Select,
  Option,
  Input,
} from "fusion-ui";
//组件
import BaseConfig from "@com/BaseConfig"; //基本属性
export default {
  name: "ETLJob",
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
        jobGroup: [
          { required: true, message: "请选择执行器", trigger: "blur" },
        ],
        etlId: [{ required: true, message: "请选择ETL", trigger: "blur" }],
      },
      options: [],
      optionsETL: [],
    };
  },
  computed: {},
  watch: {
    /**
     * @description 监听tab切换的变化
     */
    //TODO tab页签发生变化时处理各页签的逻辑，基本属性目前不需要处理
    activeName: {
      handler() {
        if (this.activeName === "EtlJob") {
          this.getOptions();
        }
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
      this.activeName = "bascAttr";

      //TODO 清空缓存数据

      //TODO 终止相关请求，大多数情况不需要修改，如果不需要修改把todo去掉即可
      this.requestArray.forEach((item) => {
        if (this.currRequestId !== item.id) {
          item.request.abort();
        }
      });
      this.requestArray.splice(0, this.requestArray.length);
    },
    getOptions() {
      //执行器接口
      postJSON("/api/schedulecenter/v1/jobgroup/queryAllGroup.do").then(
        (res) => {
          this.$set(this, "options", res.data[0].data);
        }
      );
      //etl接口
      postJSON("/api/schedulecenter/v1/schedule/queryEtlList.do").then(
        (res) => {
          this.$set(this, "optionsETL", res.data[0].data);
        }
      );
    },
  },
};
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
    .etlJob-form {
      .el-input {
        width: 215px;
      }
      .el-textarea {
        width: 300px;
      }
    }
  }
}
</style>
