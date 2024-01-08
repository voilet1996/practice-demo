<template>
  <div class="ByETLQueryTask">
    <BasicPage
      class="page"
      topLeftArea
      needDefaultQueryCom
      :reqUrl="'/api/schedulecenter/v1/schedule/queryScheduleByEtl.do'"
      :queryColumns="queryColumns"
      :tableColumns="tableColumns"
      :changeCodeObj="changeCodeObj"
      :tableReqParams="tableReqParams"
      :isNeedOperation="false"
    >
    </BasicPage>
  </div>
</template>

<script>
import { postJSON } from "@/utils/post";
import BasicPage from "./component/BasicPage.vue";
export default {
  components: {
    BasicPage,
  },
  data() {
    return {
      dialogVisible: false,
      dialogVisible2: false,
      showContent: "",
      showContent2: "",
      queryColumns: [
        {
          label: "ETL名称",
          labelWidth: "70px",
          placeholder: "请输入ETL名称",
          type: "input",
          modelDataKey: "etlLabel",
          isSearchShow: true,
        },
        {
          label: "ETL编号",
          labelWidth: "100px",
          placeholder: "请输入ETL编号",
          type: "input",
          modelDataKey: "etlId",
          isSearchShow: true,
        },
      ],
      tableReqParams: [
        { vtype: "attr", name: "etlLabel", data: "" },
        { vtype: "attr", name: "etlId", data: "" },
      ],
      tableColumns: [
        {
          prop: "folderName",
          label: "分类名称",
          width: "100",
          align: "center",
          headerAlign: "center",
        },
        {
          prop: "scheduleId",
          label: "调度ID",
          width: "100",
          align: "center",
          headerAlign: "center",
        },
        {
          prop: "scheduleName",
          label: "调度名称",
          width: "100",
          align: "center",
          headerAlign: "center",
        },
        {
          prop: "taskId",
          label: "任务ID",
          width: "100",
          align: "center",
          headerAlign: "center",
        },
        {
          prop: "taskName",
          label: "任务名称",
          width: "100",
          align: "center",
          headerAlign: "center",
        },
      ],
      changeCodeObj: {},
    };
  },
  created() {},
  methods: {},
};
</script>
<style lang="less" scoped>
.ByETLQueryTask {
  width: 100%;
  height: 100%;
}
</style>
