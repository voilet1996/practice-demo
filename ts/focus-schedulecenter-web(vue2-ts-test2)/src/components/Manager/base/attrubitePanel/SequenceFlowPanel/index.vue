<template>
  <div class="sequence-flow-panel">
    <p>请设置连线条件</p>
    <fu-form size="mini">
      <fu-form-item label="条件表达式" label-width="100px">
        <fu-input type="textarea" v-model="expression"></fu-input>
      </fu-form-item>
    </fu-form>
  </div>
</template>

<script>
import { Form, FormItem, Input } from "fusion-ui"
export default {
  name: "SequenceFlowPanel",
  components: {
    FuForm: Form,
    FuFormItem: FormItem,
    FuInput: Input,
  },
  props: ["etlManager", "bpmnId"],
  data() {
    return {
      name: "",
      bpmnType: "",
      expression: "",
      bpmnManager: null,
      bpmnElement: null,
    }
  },
  created() {
    //获取表达式
    let allElement = this.etlManager.editor.elementRegistry.getAll()
    let sequence = allElement.filter((item) => item.id === this.bpmnId)
    if (sequence.length > 0) {
      if (sequence[0].businessObject.conditionExpression) {
        //线上有表达式,回显
        this.expression = sequence[0].businessObject.conditionExpression.body
      }
    }
  },
  mounted() {},
  watch: {
    bpmnId: {
      immediate: true,
      handler() {
        this.updateAttributePanel()
      },
    },
    name(val, oldVal) {
      if (val !== oldVal) {
        this.bpmnManager.modeling.updateProperties(this.bpmnElement, {
          name: val,
        })
      }
    },
    expression(val, oldVal) {
      if (val !== oldVal) {
        let { bpmnManager, bpmnElement } = this
        let FormalExpression = bpmnManager.moddle.create(
          "bpmn:FormalExpression",
          { body: val }
        )
        bpmnManager.modeling.updateProperties(bpmnElement, {
          conditionExpression: FormalExpression,
          name: val,
        })
      }
    },
  },
  methods: {
    updateAttributePanel() {
      let { etlManager, bpmnId } = this
      let bpmnManager = etlManager.getBpmnManager()
      this.bpmnManager = bpmnManager

      let bpmnElement = bpmnManager.elementRegistry.get(bpmnId)
      this.bpmnElement = bpmnElement

      this.name = bpmnElement.businessObject.get("name")
      this.bpmnType = bpmnElement.type
      console.log(bpmnElement)
    },
  },
}
</script>

<style lang="less" scoped>
.sequence-flow-panel {
  width: 100%;
  height: 100%;
  padding: 15px;
  background: #fafafa;
  p {
    font-weight: bold;
  }
  /deep/.el-form {
    .el-textarea {
      width: 400px;
    }
  }
}
</style>
