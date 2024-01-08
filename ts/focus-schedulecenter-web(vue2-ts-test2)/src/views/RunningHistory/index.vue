<template>
  <div class="running-history">
    <div class="header">
      <fu-radio-group
        v-model="radioGroup"
        size="medium"
        style="display: inline-block; margin-right: 10px"
      >
        <fu-radio-button label="schedulingTime">调度时间</fu-radio-button>
        <fu-radio-button label="executeTime">执行时间</fu-radio-button>
      </fu-radio-group>
      <fu-date-picker
        v-model="form.timeRange"
        style="width: 240px"
        size="medium"
        type="datetimerange"
        value-format="yyyy-MM-dd HH:mm:ss"
        range-separator="-"
        start-placeholder="起始日期"
        end-placeholder="截止日期"
      ></fu-date-picker>
      <!-- <div class="data-circle">
        <div class="circle1"><div class="inner-circle1"></div></div>
        <div class="block" v-for="item in displayBlocks" :key="item.color">
          <div class="number">{{ item.data }}</div>
          <div class="text">
            <div class="circle2" :style="{ background: item.color }">
              <div class="inner-circle2"></div>
            </div>
            {{ item.text }}
          </div>
        </div>
      </div> -->
    </div>
    <div class="bottom-wrapper">
      <div class="query-header">
        <span>运行历史</span>
        <div class="query">
          <fu-form :inline="true" size="mini">
            <fu-form-item label="任务名称" label-width="130px">
              <fu-input
                clearable
                v-model="form.scheduleName"
                placeholder="任务名称"
              ></fu-input>
            </fu-form-item>

            <fu-form-item label="编号" label-width="80px">
              <fu-input
                clearable
                placeholder="编号"
                v-model="form.scheduleId"
              ></fu-input>
            </fu-form-item>
            <fu-form-item label="状态" label-width="70px">
              <fu-select clearable v-model="form.logStatus" size="mini">
                <fu-option
                  v-for="item in resultOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.text"
                ></fu-option>
              </fu-select>
            </fu-form-item>
            <fu-form-item>
              <fu-button
                icon="el-icon-search"
                type="success"
                @click="tableSearch"
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
          >
            <template slot-scope="scope">
              <span v-if="item.isChangeCode && item.isChangeCode === 'true'">{{
                tableChangeCode(scope.row[item.prop], item.codeArr)
              }}</span>
              <span v-else>{{ scope.row[item.prop] }}</span>
            </template></fu-table-column
          >
          <fu-table-column label="操作" width="200">
            <template slot-scope="scope">
              <span
                style="margin-right: 10px; color: #409eff; cursor: pointer"
                @click="toReadOnlyFlow(scope.row)"
                v-if="scope.row.handleCode != 0"
                >查看详情</span
              >
              <span
                v-if="scope.row.triggerCode == 200 && scope.row.handleCode == 0"
                style="margin-right: 10px; color: #409eff; cursor: pointer"
                @click="forceStop(scope.row)"
                >强制终止</span
              >
            </template>
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
  RadioGroup,
  RadioButton,
  Message,
} from "fusion-ui";
import { forceStopJob } from "@/utils/service.js";
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
    FuRadioGroup: RadioGroup,
    FuRadioButton: RadioButton,
  },
  data() {
    return {
      displayBlocks: [
        { data: "58", text: "执行记录", color: "purple" },
        { data: "10", text: "运行中", color: "blue" },
        { data: "30", text: "成功", color: "green" },
        { data: "11", text: "失败", color: "red" },
      ],
      radioGroup: "schedulingTime",
      resultOptions: [
        { text: "成功", value: "1" },
        { text: "失败", value: "2" },
        { text: "运行中", value: "3" },
      ],
      tableColumns: [
        { label: "调度时间", prop: "triggerTime", width: "100" },

        { label: "任务名称", prop: "scheduleName", width: "100" },
        { label: "编号", prop: "scheduleId", width: "180" },
        { label: "描述", prop: "scheduleDesc", width: "100" },
        // { label: "状态", prop: "logStatus", width: "80" },

        {
          label: "执行模式",
          prop: "scheduleModel",
          width: "100",
          isChangeCode: "true",
          codeArr: [
            { text: "定时执行", value: "1" },
            { text: "直接执行", value: "2" },
          ],
        },
        { label: "执行开始时间", prop: "handleTime", width: "100" },
        { label: "执行结束时间", prop: "endTime", width: "100" },
        {
          label: "执行状态",
          prop: "triggerCode",
          width: "100",
          isChangeCode: "true",
          codeArr: [
            { text: "成功", value: 200 },
            { text: "失败", value: 500 },
            { text: "", value: 0 },
          ],
        },

        // { label: "耗时（秒）", prop: "spend", width: "80" },
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
          { time: "" },
        ],
        totalrows: 0,
      },
      form: {
        scheduleName: "",
        scheduleId: "",
        logStatus: "",
        triggerTime: "",
        handleTime: "",
        timeRange: [],
      },
      queryForm: {
        scheduleName: "",
        scheduleId: "",
        logStatus: "",
        triggerTime: "",
        handleTime: "",
        timeRange: [],
      },
    };
  },
  watch: {
    "form.timeRange": {
      handler(newV, oldV) {
        this.changeQueryCondition();
      },
    },
    radioGroup: {
      handler(val) {
        console.log("radioGroup", val);
        if (this.form.timeRange.length === 0) {
          return;
        }
        this.changeQueryCondition();
      },
    },
  },
  computed: {
    tableReq() {
      return {
        url: "/api/schedulecenter/v1/joblog/queryLogList.do",
        params: [
          {
            name: "formpanel",
            vtype: "formpanel",
            data: {
              scheduleName: this.queryForm.scheduleName,
              scheduleId: this.queryForm.scheduleId,
              triggerTime: this.queryForm.triggerTime,
              handleTime: this.queryForm.handleTime,
              triggerCode: "",
              handleCode: "",
              logStatus: this.queryForm.logStatus,
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
    changeQueryCondition() {
      if (this.radioGroup === "schedulingTime") {
        this.form.handleTime = "";
        this.form.triggerTime = this.form.timeRange
          ? this.form.timeRange.join(" - ")
          : "";
      } else if (this.radioGroup === "executeTime") {
        this.form.triggerTime = "";
        this.form.handleTime = this.form.timeRange
          ? this.form.timeRange.join(" - ")
          : "";
      }
      this.tableSearch();
    },
    tableSearch() {
      this.queryForm = JSON.parse(JSON.stringify(this.form));
    },
    toReadOnlyFlow(row) {
      window.location.href = `/schedulecenter/#/jobFlow?scheduleId=${row.scheduleId}&mode=view&logId=${row.logId}`;
    },
    async forceStop(row) {
      try {
        let res = await forceStopJob(row.id);
        if (res) {
          Message.success("强制终止成功！");
          this.updateTable();
        }
      } catch (e) {
        Message.error("强制终止失败！");
        console.log(e);
      }
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
    // 表格转码
    tableChangeCode(data, arr) {
      if (data) {
        let res = "";
        let filArr = arr.filter((item) => item.value === data);
        res = filArr.length === 1 ? filArr[0].text : data;
        return res;
      }
    },
  },
};
</script>
<style lang="less" scoped>
.running-history {
  width: 100%;
  height: 100%;
  .header {
    width: 100%;
    // height: 150px;
    height: 70px;
    padding-top: 10px;
    padding-left: 20px;
    position: relative;
    box-sizing: border-box;
    .data-circle {
      width: 750px;
      height: 110px;
      position: absolute;
      left: 550px;
      top: 50px;
      display: flex;
      .circle1 {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background: rgb(149, 66, 225);
        display: flex;
        align-items: center;
        justify-content: center;

        .inner-circle1 {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: white;
        }
      }
      .block {
        margin-left: 80px;
        // width: 110px;
        height: 100px;
        text-align: center;
        .number {
          font-weight: bold;
          margin: 20px 0;
        }
        .text {
          margin-left: 5px;
          display: flex;
          .circle2 {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            // background: rgb(149, 66, 225);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            .inner-circle2 {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: white;
            }
          }
        }
        // display: inline-block;
      }
    }
  }
  .bottom-wrapper {
    // width: 100%;
    box-sizing: border-box;
    min-width: 1200px;

    height: calc(100% - 160px);
    margin: 10px 20px 0 20px;
    border: 1px solid #c4cbcf;
    .query-header {
      height: 40px;
      position: relative;
      padding: 10px;
      .query {
        position: absolute;
        right: 0;
        top: 10px;
      }
    }
    .table {
      //表格实现滚动条
      height: calc(100% - 60px);
      div:first-child {
        height: 93%;
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
}
</style>
