<template>
  <div class="base-config">
    <fu-form size="mini" :rules="rules" :fu-data="config">
      <div style="display: flex">
        <fu-form-item label="名称" label-width="80px" prop="taskName">
          <fu-input v-model="config.taskName"></fu-input>
        </fu-form-item>
        <fu-form-item label="执行器" label-width="80px" prop="jobGroup">
          <fu-select v-model="config.jobGroup" placeholder="请选择">
            <fu-option
              v-for="item in options"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </fu-option>
          </fu-select>
        </fu-form-item>
      </div>
      <fu-form-item label="标题" label-width="80px" prop="jobDesc">
        <fu-input v-model="config.jobDesc"></fu-input>
      </fu-form-item>
      <fu-form-item label="类型" label-width="80px" prop="taskType">
        <fu-input v-model="config.taskType" disabled></fu-input>
      </fu-form-item>
      <fu-form-item label="简介" label-width="80px">
        <fu-input type="textarea" v-model="config.taskDesc"></fu-input>
      </fu-form-item>
      <fu-form-item label="" label-width="40px">
        <fu-checkbox v-model="config.isEnable">是否启用</fu-checkbox>
      </fu-form-item>
    </fu-form>
  </div>
</template>

<script>
import { Form, FormItem, Input, Select, Option, Checkbox } from "fusion-ui"
import { postJSON } from "@/utils/post.js"
export default {
  name: "Test",
  components: {
    FuForm: Form,
    FuFormItem: FormItem,
    FuInput: Input,
    FuCheckbox: Checkbox,
    FuSelect: Select,
    FuOption: Option,
  },
  // extends: null,
  // minxins: [],
  props: ["config"],
  data() {
    const validatorTaskName = (rule, value, callback) => {
      let reg = new RegExp(`${this.config.taskType}\\d+$`)
      if (!reg.test(value)) {
        callback(
          new Error(
            "必须是【组件类型的英文名称+数字】的形式，如tableSourceTask1"
          )
        )
      } else {
        callback()
      }
    }
    return {
      options: [],
      rules: {
        taskName: [
          { required: true, message: "名称不能为空", trigger: "change" },
          { validator: validatorTaskName, trigger: "change" },
        ],
        jobGroup: [
          { required: true, message: "执行器不能为空", trigger: "change" },
        ],
        jobDesc: [
          { required: true, message: "标题不能为空", trigger: "change" },
        ],
        taskType: [
          { required: true, message: "类型不能为空", trigger: "change" },
        ],
      },
    }
  },
  computed: {},
  watch: {},
  beforeCreate() {},
  created() {
    this.getOptions()
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getOptions() {
      postJSON("/api/schedulecenter/v1/jobgroup/queryAllGroup.do").then(
        (res) => {
          this.$set(this, "options", res.data[0].data)
        }
      )
    },
  },
}
</script>
<style lang="less" scoped>
.base-config {
  /deep/.el-form {
    .el-input {
      width: 220px;
    }
    .el-textarea {
      width: 300px;
    }
  }
}
</style>
