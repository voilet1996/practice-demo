<template>
  <div class="executor-management">
    <fu-button type="primary" size="medium" @click="addExecutor"
      >新增执行器</fu-button
    >
    <div class="table">
      <fu-table ref="executeTable" border :fu-request="tableReq">
        <fu-table-column
          prop="order"
          label="排序"
          width="55"
          align="center"
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
          </template>
        </fu-table-column>
        <fu-table-column label="操作" width="350" align="center">
          <template slot-scope="scope">
            <span
              style="margin-right: 10px; color: #409eff; cursor: pointer"
              @click="editData(scope.row)"
              >编辑</span
            >
            <span
              style="margin-right: 10px; color: #409eff; cursor: pointers"
              @click="deleteData(scope.row)"
              >删除</span
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
    <fu-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="44%">
      <fu-form
        ref="dialogForm"
        :fu-data="dialogForm"
        :rules="rules"
        v-if="dialogVisible"
      >
        <fu-form-item label="AppName" label-width="110px" prop="appName">
          <fu-input v-model="dialogForm.appName"></fu-input>
        </fu-form-item>
        <fu-form-item label="名称" label-width="110px" prop="title">
          <fu-input v-model="dialogForm.title"></fu-input>
        </fu-form-item>
        <fu-form-item label="排序" label-width="110px" prop="order">
          <fu-input v-model="dialogForm.order"></fu-input>
        </fu-form-item>
        <fu-form-item label="注册方式" label-width="110px" prop="addressType">
          <fu-radio v-model="dialogForm.addressType" label="0"
            >自行注册</fu-radio
          >
          <fu-radio v-model="dialogForm.addressType" label="1"
            >手动录入</fu-radio
          >
        </fu-form-item>

        <fu-form-item label="机器地址" label-width="110px" prop="addressList">
          <fu-input
            v-model="dialogForm.addressList"
            placeholder="请输入执行器地址列表，多地址用逗号分隔"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
          ></fu-input>
        </fu-form-item>
      </fu-form>
      <span slot="footer" class="dialog-footer">
        <fu-button type="primary" @click="confirmBtn">确 定</fu-button>
        <fu-button @click="dialogVisible = false">取 消</fu-button>
      </span>
    </fu-dialog>
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
  Radio,
  Message,
} from "fusion-ui";
import {
  addExecutor,
  updateExecutor,
  deleteExecutor,
} from "@/utils/service.js";
export default {
  name: "ExecutorManagement",
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
    FuRadio: Radio,
  },
  data() {
    return {
      dialogForm: {
        appName: "",
        title: "",
        order: "",
        addressType: "0",
        addressList: "",
      },
      //当前编辑行id
      rowId: "",
      typeOptions: [
        { text: "自动注册", value: "0" },
        { text: "手动录入", value: "1" },
      ],
      rules: {
        appName: [
          { required: true, message: "请输入AppName", trigger: "blur" },
        ],
        title: [{ required: true, message: "请输入名称", trigger: "blur" }],
        order: [{ required: true, message: "请输入排序", trigger: "blur" }],
        addressType: [
          { required: true, message: "请选择注册方式", trigger: "change" },
        ],
        // addressList: [
        //   { required: true, message: "请输入机器地址", trigger: "blur" },
        // ],
      },
      dialogVisible: false,
      dialogTitle: "新增执行器",
      tableColumns: [
        // { label: "order", prop: "排序", width: "30" },
        { label: "id", prop: "id", width: "100" },
        { label: "AppName", prop: "appName", width: "200" },
        { label: "名称", prop: "title", width: "200" },
        {
          label: "注册方式",
          prop: "addressType",
          width: "200",
          isChangeCode: "true",
          codeArr: [
            { text: "自动注册", value: "0" },
            { text: "手动录入", value: "1" },
          ],
        },
        { label: "Online机器地址", prop: "addressList", width: "200" },
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
    };
  },
  computed: {
    tableReq() {
      return {
        url: "/api/schedulecenter/v1/jobgroup/pagelist.do",
        params: [
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
    updateTable() {
      this.$refs.executeTable.queryData();
      this.$refs.page.queryData();
    },
    confirmBtn() {
      this.$refs.dialogForm.$refs.el.validate(async (valid) => {
        if (valid) {
          if (this.dialogTitle === "新增执行器") {
            //新增
            let res;
            try {
              res = await addExecutor(this.dialogForm);
            } catch (e) {
              Message.error("新增失败！");
            }
            if (res) {
              Message.success("新增成功！");
              this.dialogVisible = false;
              this.updateTable();
            }
          } else {
            //编辑
            let res;
            try {
              res = await updateExecutor(this.rowId, this.dialogForm);
            } catch (e) {
              Message.error("编辑失败！");
            }
            if (res) {
              Message.success("编辑成功！");
              this.dialogVisible = false;
              this.updateTable();
            }
          }
        }
      });
    },
    editData(row) {
      this.dialogTitle = "编辑执行器";
      this.rowId = row.id;
      this.dialogForm.appName = row.appName;
      this.dialogForm.title = row.title;
      this.dialogForm.order = row.order;
      this.dialogForm.addressType = row.addressType;
      this.dialogForm.addressList = row.addressList;
      this.dialogVisible = true;
    },
    async deleteData(row) {
      this.$confirm("此操作将永久删除该任务, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            let res = await deleteExecutor(row.id);
            if (res) {
              Message.success("删除成功！");
              this.updateTable();
            }
          } catch (e) {
            console.log(e);
            Message.error("删除失败！");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    addExecutor() {
      this.dialogTitle = "新增执行器";
      this.dialogForm = {
        appName: "",
        title: "",
        order: "",
        addressType: "0",
        addressList: "",
      };
      this.dialogVisible = true;
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
        let filArr = arr.filter((item) => item.value === data.trim());
        res = filArr.length === 1 ? filArr[0].text : data;
        return res;
      }
    },
  },
};
</script>
<style lang="less" scoped>
.executor-management {
  width: 100%;
  height: 100%;
  padding: 10px 20px 0 20px;
  box-sizing: border-box;
  .table {
    width: 100%;
    margin-top: 10px;
    height: calc(100% - 180px);
    min-width: 1500px;
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
  /deep/.el-dialog {
    .el-form {
      margin-left: 100px;
      .el-input {
        width: 400px;
      }
      .el-textarea {
        width: 400px;
      }
    }
  }
}
</style>
