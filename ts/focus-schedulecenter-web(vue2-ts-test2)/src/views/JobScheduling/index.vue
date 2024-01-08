<template>
  <div class="job-scheduling">
    <div class="header">
      <fu-button
        :class="{ checked: checkBtn === 'HOURS' }"
        size="medium"
        plain
        @click="switchBtn('HOURS')"
        >一小时</fu-button
      >
      <fu-button
        :class="{ checked: checkBtn === 'TODAY' }"
        size="medium"
        plain
        @click="switchBtn('TODAY')"
        >今日</fu-button
      >
      <fu-button
        :class="{ checked: checkBtn === 'THREE_DAY' }"
        size="medium"
        plain
        @click="switchBtn('THREE_DAY')"
        >三日</fu-button
      >
      <div class="query">
        <fu-form :inline="true" size="medium">
          <fu-form-item label="名称" label-width="70px">
            <fu-input clearable v-model="form.jobName"></fu-input>
          </fu-form-item>
          <fu-form-item label="编号" label-width="70px">
            <fu-input clearable v-model="form.id"></fu-input>
          </fu-form-item>
          <fu-form-item label="调度时间" label-width="70px">
            <fu-date-picker
              clearable
              v-model="form.timeRange"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="-"
              start-placeholder="起始日期"
              end-placeholder="截止日期"
            ></fu-date-picker>
          </fu-form-item>

          <fu-form-item label="创建人" label-width="70px">
            <fu-input clearable v-model="form.createPerson"></fu-input>
          </fu-form-item>
          <fu-form-item>
            <fu-button icon="el-icon-search" type="success" @click="tableSearch"
              >查询</fu-button
            >
          </fu-form-item>
        </fu-form>
      </div>
    </div>
    <div class="table">
      <fu-table border :fu-request="tableReq">
        <fu-table-column
          type="index"
          label="序号"
          width="55"
          align="center"
          :index="funIndex"
        ></fu-table-column>
        <fu-table-column
          v-for="item in tableColumns"
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
          :min-width="item.width"
          show-overflow-tooltip
        ></fu-table-column>
        <fu-table-column label="操作" width="120" align="center">
          <span>-</span>
        </fu-table-column>
      </fu-table>
      <fu-pagination
        :fu-request="tableReq"
        ref="page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="tableData.page"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="tableData.pagerows"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.totalrows"
      >
      </fu-pagination>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import {
  DatePicker,
  Form,
  FormItem,
  Input,
  Table,
  TableColumn,
  Button,
  Select,
  Option,
  Pagination,
  Dialog,
  Checkbox,
} from "fusion-ui";
export default {
  name: "Home",
  components: {
    FuDatePicker: DatePicker,
    FuForm: Form,
    FuFormItem: FormItem,
    FuInput: Input,
    FuTable: Table,
    FuTableColumn: TableColumn,
    FuButton: Button,
    FuSelect: Select,
    FuOption: Option,
    FuPagination: Pagination,
    FuDialog: Dialog,
    FuCheckbox: Checkbox,
  },
  data() {
    return {
      checkBtn: "HOURS",
      tableColumns: [
        { label: "调度时间", prop: "triggerTime", width: "100" },

        { label: "任务名称", prop: "scheduleName", width: "100" },
        { label: "编号", prop: "id", width: "180" },
        { label: "描述", prop: "scheduleDesc", width: "100" },
        { label: "上次成功运行时间", prop: "triggerLastTime", width: "80" },
        { label: "Cron", prop: "jobCron", width: "180" },
        { label: "子任务数", prop: "childTaskCount", width: "50" },
        { label: "创建人", prop: "creatorName", width: "70" },
      ],
      tableData: {
        page: 1,
        pagerows: 10,
        rows: [
          {
            time: "",
            name: "",
            order: "",
            desc: "dd",
            cron: "",
            running: "",
            num: "1",
            creator: "lll",
            state: "33",
          },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
          { time: "" },
        ],
        totalrows: 0,
      },
      form: {
        jobName: "",
        id: "",
        createPerson: "",
        timeRange: [],
      },
      queryForm: {
        jobName: "",
        id: "",
        timeRange: [],
        createPerson: "",
      },
    };
  },
  computed: {
    tableReq() {
      return {
        url: "/api/schedulecenter/v1/schedule-task/pageList.do",
        params: [
          {
            name: "params",
            vtype: "json",
            data: {
              jobName: this.queryForm.jobName,
              id: this.queryForm.id,
              startTime: this.queryForm.timeRange[0] || "",
              endTime: this.queryForm.timeRange[1] || "",
              createPerson: this.queryForm.createPerson,
              flag: this.checkBtn, // 1小时-HOURS；今天-TODAY；三天-THREE_DAY
            },
          },
          {
            vtype: "pagination",
            name: "pagerows",
            data: this.tableData.pagerows,
          },
          { vtype: "pagination", name: "totalrows", data: 0 },
          { vtype: "pagination", name: "page", data: this.tableData.page },
        ],
      };
    },
  },
  methods: {
    tableSearch() {
      this.checkBtn = "";
      this.queryForm = JSON.parse(JSON.stringify(this.form));
    },
    switchBtn(btn) {
      this.form = {
        jobName: "",
        id: "",
        createPerson: "",
        timeRange: [],
      };
      this.queryForm = JSON.parse(JSON.stringify(this.form));
      this.checkBtn = btn;
    },
    //表格分页切换
    handleCurrentChange(val) {
      this.tableData.page = val;
    },
    //每页多少条
    handleSizeChange(val) {
      this.tableData.pagerows = val;
    },
    funIndex(index) {
      return (this.tableData.page - 1) * this.tableData.pagerows + index + 1;
    },
  },
};
</script>
<style lang="less" scoped>
.job-scheduling {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  .header {
    width: 100%;

    height: 60px;
    min-width: 1700px;
    position: relative;
    padding-top: 10px;
    .checked {
      background: rgb(64, 158, 255);
      color: white;
    }
    .query {
      position: absolute;
      right: 20px;
      top: 10px;
    }
  }
  .table {
    width: 100%;

    height: calc(100% - 120px);
    min-width: 1700px;
    //表格实现滚动条
    div:first-child {
      height: 100%;
      /deep/.el-table {
        height: 100%;
        .el-table__body-wrapper {
          height: calc(100% - 48px);
          overflow-y: auto;
        }
      }
    }
  }
}
</style>
