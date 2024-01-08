<template>
  <div
    class="info-panel"
    :style="{
      '--backgroundColor': backgroundColor,
      '--fontColor': fontColor,
    }"
  >
    <fu-container v-loading="loading">
      <div class="form-item" v-for="item in infoForm" :key="item.label">
        <h4>{{ item.label }}:</h4>
        <span v-if="item.label === 'ETL运行模式'">{{
          tableChangeCode(item.value, modeOptions)
        }}</span>
        <span v-else>{{ item.value }}</span>
      </div>
    </fu-container>
  </div>
</template>

<script>
import { Table, TableColumn, Pagination, Container } from "fusion-ui"
import { postJSON } from "@/utils/post.js"
export default {
  name: "BasicInfo",
  data() {
    return {
      taskId: "",
      infoData: [],
      modeOptions: [],
      loading: false,
    }
  },

  components: {
    FuContainer: Container,
  },
  props: {
    backgroundColor: {
      type: String,
      default: "#142334",
    },
    fontColor: {
      type: String,
      default: "black",
    },

    etlManager: {
      type: Object,
      require: true,
    },
  },
  created() {
    // console.log("3333333333eeee", this.etlManager)
    this.taskId = this.etlManager.getEtlId()
    this.infoData = this.etlManager.getBasicInfo()
    // this.queryBasicInfo(this.taskId)
    // postJSON("/api/core/v1/dictionary/queryData.do?dicId=etlRunMode", {
    //   postData: JSON.stringify({}),
    // }).then((res) => {
    //   this.modeOptions = res.data[0].data
    // })
  },
  computed: {
    infoForm() {
      return [
        { label: "工作流名称", value: this.infoData.scheduleName },
        {
          label: "工作流描述",
          value: this.infoData.scheduleDesc,
        },
        { label: "工作流编号", value: this.infoData.triggerCode },

        { label: "创建人", value: this.infoData.createPerson },
        { label: "创建时间", value: this.infoData.createTime },
        { label: "最后成功运行时间", value: this.infoData.triggerLastTime },
      ]
    },
  },
  mounted() {},
  methods: {
    // 表格转码
    //data可以是多个逗号隔开的数据
    tableChangeCode(data, arr) {
      if (data) {
        let array = data.split(",")
        let res = []
        array.forEach((every) => {
          let filArr = arr.filter((item) => item.value === every.trim())
          res.push(filArr.length === 1 ? filArr[0].text : every)
        })
        return res.join(",")
      }
    },
    // queryBasicInfo(id) {
    //   this.loading = true
    //   postJSON("/api/schedulecenter/v1/etl/queryScheduleInfo.do", {
    //     postData: JSON.stringify({
    //       data: [
    //         {
    //           vtype: "attr",
    //           data: id,
    //           name: "scheduleId",
    //         },
    //       ],
    //     }),
    //   }).then((res) => {
    //     this.infoData = res.data[0].data
    //     this.loading = false
    //   })
    // },
  },
}
</script>

<style lang="less" scoped>
.info-panel {
  width: 100%;
  height: 100%;
  margin: 0;
  // padding: 0;
  background-color: #ffffff;
  color: var(--fontColor);
  overflow: auto;
  font-size: 16px;
  line-height: 24px;
  padding: 20px 30px;
  box-sizing: border-box;
  /deep/.el-container {
    display: block;
    width: 40%;
  }
  .form-item {
    height: 40px;
    h4 {
      display: inline-block;
      width: 28%;
    }
  }
}
</style>
