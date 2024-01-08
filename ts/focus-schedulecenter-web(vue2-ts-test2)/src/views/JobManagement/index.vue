<template>
  <div class="job-management">
    <div class="query-header">
      <fu-button type="primary" size="medium" @click="createJob"
        >新建任务</fu-button
      >
      <fu-button type="primary" size="medium" @click="importFile"
        >导入</fu-button
      >
      <div class="query">
        <fu-form :inline="true" :fu-data="form" size="medium">
          <fu-form-item label="名称" label-width="40px">
            <fu-input
              clearable
              v-model="form.jobName"
              placeholder="名称"
            ></fu-input>
          </fu-form-item>

          <fu-form-item label="编号" label-width="80px">
            <fu-input
              clearable
              v-model="form.scheduleId"
              placeholder="编号"
            ></fu-input>
          </fu-form-item>
          <fu-form-item label="描述" label-width="80px">
            <fu-input
              clearable
              v-model="form.jobDesc"
              placeholder="描述"
            ></fu-input>
          </fu-form-item>
          <fu-form-item label="最后修改时间" label-width="100px">
            <fu-date-picker
              clearable
              v-model="form.timeRange"
              type="datetimerange"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="-"
              start-placeholder="起始日期"
              end-placeholder="截止日期"
            ></fu-date-picker>
          </fu-form-item>
          <fu-form-item>
            <fu-button icon="el-icon-search" type="success" @click="tableSearch"
              >查询</fu-button
            >
          </fu-form-item>
        </fu-form>
      </div>
    </div>
    <div class="main">
      <div class="left-tree">
        <component-tree
          treeId="leftTree"
          ref="leftTree"
          :tree-req="treeReq"
          :isDragable="true"
          :allow-drag="allowDrag"
          @allow-drop="allowDrop"
          :defaultProps="defaultProps"
          nodeImage="folderIcon-mr"
          :rightClickList="rightClickList"
          @node-click="handleNodeClick"
          @createFolder="createFolder"
          @deleteFolder="deleteFolder"
          @editFolder="editFolder"
          :saveDragReq="saveDragReq"
        ></component-tree>
      </div>
      <div class="right-table">
        <fu-table border :fu-request="tableReq" ref="jobTable">
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
          <fu-table-column label="操作" width="300">
            <template slot-scope="scope">
              <div class="top-btns">
                <fu-button
                  size="mini"
                  type="primary"
                  @click="editJob(scope.row)"
                  >编辑</fu-button
                >
                <fu-button
                  size="mini"
                  type="primary"
                  @click="designJob(scope.row)"
                  >设计</fu-button
                >
                <fu-button
                  size="mini"
                  type="primary"
                  @click="copyJob(scope.row)"
                  >拷贝</fu-button
                >
                <fu-button
                  size="mini"
                  type="primary"
                  @click="exportJob(scope.row)"
                  >导出</fu-button
                >
              </div>
              <div class="bottom-btns">
                <fu-button
                  size="mini"
                  type="primary"
                  @click="executeJob(scope.row)"
                  >执行</fu-button
                >
                <fu-button
                  size="mini"
                  :type="scope.row.triggerStatus === 0 ? 'success' : 'warning'"
                  @click="startOrStopJob(scope.row)"
                  >{{
                    scope.row.triggerStatus === 0 ? "启动" : "停止"
                  }}</fu-button
                >
                <fu-button size="mini" type="warning" @click="logJob(scope.row)"
                  >日志</fu-button
                >
                <fu-button
                  size="mini"
                  type="danger"
                  @click="deleteJob(scope.row)"
                  >删除</fu-button
                >
              </div>
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
    <fu-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      class="create-dialog"
      width="50%"
    >
      <!-- <div class="cron-box">
        <cron v-if="showCronBox" v-model="dialogForm.jobCron"></cron>
      </div> -->
      <fu-form
        ref="jobForm"
        :inline="true"
        v-if="dialogVisible"
        :fu-data="dialogForm"
        :rules="rules"
      >
        <fu-form-item
          label="调度任务名称"
          label-width="110px"
          prop="scheduleName"
        >
          <fu-input clearable v-model="dialogForm.scheduleName"></fu-input>
        </fu-form-item>
        <fu-form-item label="cron表达式" label-width="110px" prop="jobCron">
          <fu-input v-model="dialogForm.jobCron" :title="dialogForm.jobCron">
          </fu-input>
          <!-- <el-popover v-model="cronPopover">
            <cron
              @change="changeCron"
              @close="cronPopover = false"
              i18n="cn"
            ></cron>
            <el-input
              slot="reference"
              @click="cronPopover = true"
              v-model="dialogForm.jobCron"
              placeholder="请输入定时策略"
            ></el-input>
          </el-popover> -->
        </fu-form-item>
        <fu-form-item label="调度任务描述" label-width="110px" prop="jobDesc">
          <fu-input clearable v-model="dialogForm.jobDesc"></fu-input>
        </fu-form-item>

        <fu-form-item
          label="重试次数"
          label-width="110px"
          prop="executorFailRetryCount"
          class="retry-count-form"
        >
          <!-- <template slot="label">
            <fu-checkbox></fu-checkbox>启用重试机制<br />重试次数
          </template> -->
          <div class="checkbox">
            <fu-checkbox
              v-model="dialogForm.isRetry"
              true-label="1"
              false-label="0"
              @change="isRetryChange"
            ></fu-checkbox
            >启用重试机制
          </div>
          <fu-input
            clearable
            v-model="dialogForm.executorFailRetryCount"
            :disabled="dialogForm.isRetry === '0'"
          ></fu-input>
        </fu-form-item>
        <fu-form-item
          label="调度截止时间"
          label-width="110px"
          prop="scheduleDeadline"
        >
          <fu-date-picker
            v-model="dialogForm.scheduleDeadline"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
          ></fu-date-picker>
        </fu-form-item>
        <fu-form-item label="重试间隔" label-width="110px" prop="retryInterval">
          <fu-input
            clearable
            v-model="dialogForm.retryInterval"
            :disabled="dialogForm.isRetry === '0'"
          ></fu-input>
        </fu-form-item>
        <fu-form-item
          label="阻塞处理策略"
          label-width="110px"
          prop="executorBlockStrategy"
        >
          <fu-select
            clearable
            filterable
            v-model="dialogForm.executorBlockStrategy"
          >
            <fu-option
              v-for="item in blockStrategyOptions"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            ></fu-option>
          </fu-select>
        </fu-form-item>
        <fu-form-item
          label="任务超时时间"
          label-width="110px"
          prop="executorTimeout"
        >
          <fu-input
            clearable
            v-model="dialogForm.executorTimeout"
            placeholder="单位秒，超时则终止任务"
          ></fu-input>
        </fu-form-item>
        <fu-form-item
          label="路由策略"
          label-width="110px"
          prop="executorRouteStrategy"
        >
          <fu-select
            clearable
            filterable
            v-model="dialogForm.executorRouteStrategy"
          >
            <fu-option
              v-for="item in routeStrategyOptions"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            ></fu-option>
          </fu-select>
        </fu-form-item>
        <fu-form-item label="分类名录" label-width="110px">
          <!-- 下拉树 -->
          <fu-select
            class="select-tree"
            :popper-append-to-body="false"
            size="medium"
            placeholder="请选择"
            v-model="dialogForm.folderId"
            :title="selectTreeLabel"
          >
            <fu-option :value="dialogForm.folderId" :label="selectTreeLabel">
              <fu-tree
                size="medium"
                :fu-request="treeReq"
                fu-id="selectTree"
                ref="selectTree"
                node-key="id"
                :props="{ label: 'folderName' }"
                :show-checkbox="true"
                :check-strictly="true"
                :default-expand-all="true"
                @check-change="handleCheckChange"
              >
              </fu-tree>
            </fu-option>
          </fu-select>
        </fu-form-item>
      </fu-form>
      <span slot="footer" class="dialog-footer">
        <fu-button type="primary" @click="createOrUpdateJob">确 定</fu-button>
        <fu-button @click="dialogVisible = false">取 消</fu-button>
      </span>
    </fu-dialog>
    <!-- 日志弹框 -->
    <fu-dialog
      class="log-dialog"
      :visible.sync="logDialogVisible"
      title="调度日志"
      width="70%"
      top="5vh"
    >
      <template v-if="logDialogVisible">
        <div class="query">
          <fu-form :inline="true" size="mini">
            <fu-form-item label="调度时间" label-width="70px">
              <fu-date-picker
                v-model="logForm.triggerTime"
                clearable
                type="datetimerange"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="-"
                start-placeholder="起始日期"
                end-placeholder="截止日期"
              ></fu-date-picker>
            </fu-form-item>
            <fu-form-item label="调度结果" label-width="70px">
              <fu-select
                v-model="logForm.triggerCode"
                clearable
                filterable
                size="mini"
              >
                <fu-option
                  v-for="item in resultOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.text"
                ></fu-option>
              </fu-select>
            </fu-form-item>

            <fu-form-item label="执行时间" label-width="70px">
              <fu-date-picker
                v-model="logForm.handleTime"
                clearable
                type="datetimerange"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="-"
                start-placeholder="起始日期"
                end-placeholder="截止日期"
              ></fu-date-picker>
            </fu-form-item>
            <fu-form-item label="执行结果" label-width="70px">
              <fu-select
                v-model="logForm.handleCode"
                clearable
                filterable
                size="mini"
              >
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
                @click="logTableSearch"
                >查询</fu-button
              >
            </fu-form-item>
          </fu-form>
        </div>
        <fu-table border :fu-request="logTableReq" max-height="500px">
          <fu-table-column
            type="index"
            label="序号"
            width="55"
            center
            :index="funLogIndex"
          ></fu-table-column>
          <fu-table-column
            v-for="item in dialogTableColumns"
            :key="item.prop"
            :label="item.label"
            :prop="item.prop"
          >
            <template slot-scope="scope">
              <span v-if="item.isChangeCode && item.isChangeCode === 'true'">{{
                tableChangeCode(scope.row[item.prop], item.codeArr)
              }}</span>
              <span v-else>{{ scope.row[item.prop] }}</span>
            </template>
          </fu-table-column>
          <fu-table-column label="操作" width="120">
            <template slot-scope="scope">
              <span
                style="color: #409eff; cursor: pointer"
                @click="toReadOnlyFlow(scope.row)"
                >查看详情</span
              >
            </template>
          </fu-table-column>
        </fu-table>
        <fu-pagination
          :fu-request="logTableReq"
          ref="page"
          @size-change="handleLogSizeChange"
          @current-change="handleLogCurrentChange"
          :current-page="dialogTableData.page"
          :page-sizes="[5, 10, 20, 50]"
          :page-size="dialogTableData.pagerows"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dialogTableData.totalrows"
        >
        </fu-pagination>
        <span slot="footer" class="dialog-footer">
          <fu-button @click="logDialogVisible = false">关 闭</fu-button>
        </span>
      </template>
    </fu-dialog>
    <fu-dialog
      class="folder-dialog"
      :visible.sync="folderDialogVisible"
      :title="folderDialogTitle"
      width="30%"
      top="5vh"
    >
      <fu-form v-if="folderDialogVisible">
        <fu-form-item label="文件夹名称" label-width="90px">
          <fu-input size="medium" v-model="editingFolderName"></fu-input>
        </fu-form-item>
      </fu-form>

      <span slot="footer" class="dialog-footer">
        <fu-button type="primary" @click="addOrEditFolder">确 定</fu-button>
        <fu-button @click="folderDialogVisible = false">取 消</fu-button>
      </span>
    </fu-dialog>
    <upload-file
      :folderId="selectedFolderId"
      @closeUpload="closeUpload"
      :importDialogVisible="importDialogVisible"
      accept=".zip"
    ></upload-file>
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
  Message,
  MessageBox,
  Tree,
} from "fusion-ui";
import { postJSON } from "@/utils/post.js";
import ComponentTree from "../../components/ComponentTree";
// import { cron } from "vue-cron";
import {
  addTreeNode,
  updateTreeNode,
  deleteTreeNode,
  addJob,
  updateJob,
  deleteJob,
  startJob,
  stopJob,
  copyJob,
  executeJob,
  exportTable,
} from "@/utils/service.js";

import UploadFile from "../../components/UploadFile.vue";
export default {
  name: "JobManagement",
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
    ComponentTree,
    FuPagination: Pagination,
    FuDialog: Dialog,
    FuCheckbox: Checkbox,
    FuTree: Tree,
    UploadFile,
  },
  data() {
    return {
      //当前选中的folderIds
      selectedFolderId: "0",
      //重命名选中文件夹id
      editingFolderId: "",
      //新建选中的pId
      editingFolderPId: "",
      folderDialogVisible: false,
      folderDialogTitle: "新建",
      //重命名/新建选中文件夹name
      editingFolderName: "",
      dialogVisible: false,
      dialogTitle: "新建调度任务",
      logDialogVisible: false,
      defaultProps: {
        children: "children",
        name: "folderName",
        id: "id",
      },
      form: {
        jobName: "",
        jobDesc: "",
        scheduleId: "",
        timeRange: [],
      },
      queryForm: {
        jobName: "",
        jobDesc: "",
        scheduleId: "",
        timeRange: [],
      },
      logForm: {
        triggerTime: [],
        handleTime: [],
        triggerCode: "",
        handleCode: "",
      },
      logQueryForm: {
        triggerTime: [],
        handleTime: [],
        triggerCode: "",
        handleCode: "",
      },
      dialogForm: {
        scheduleName: "",
        jobCron: "",
        jobDesc: "",
        executorBlockStrategy: "",
        executorRouteStrategy: "",
        retryInterval: "",
        folderId: "",
        executorTimeout: "",
        executorFailRetryCount: "",
        scheduleDeadline: "",
        isRetry: "0",
      },
      rightClickList: [
        { name: "新建", callBack: "createFolder" },
        { name: "重命名", callBack: "editFolder" },
        { name: "删除", callBack: "deleteFolder" },
      ],
      resultOptions: [
        { text: "成功", value: "200" },
        { text: "失败", value: "500" },
      ],
      checked: false,
      rules: {
        scheduleName: [
          { required: true, message: "请输入调度任务名称", trigger: "blur" },
        ],
        scheduleDeadline: [
          { required: true, message: "请选择调度截止时间", trigger: "change" },
        ],
        executorBlockStrategy: [
          { required: true, message: "请选择阻塞处理策略", trigger: "change" },
        ],
        executorRouteStrategy: [
          { required: true, message: "请选择路由策略", trigger: "change" },
        ],
        folderId: [
          { required: true, message: "请选择分类目录", trigger: "change" },
        ],
      },
      selectTreeRequest: {
        url: "/api/schedulecenter/v1/folder/queryTree.do",
        params: [],
      },
      treeReq: {
        url: "/api/schedulecenter/v1/folder/queryTree.do",
        params: [],
      },
      saveDragReq: {
        url: "/api/schedulecenter/v1/folder/dragSaveFolderTree.do",
      },
      tableColumns: [
        { label: "任务名称", prop: "scheduleName", width: "100" },
        { label: "编号", prop: "scheduleId", width: "180" },
        { label: "描述", prop: "jobDesc", width: "100" },
        { label: "最后修改时间", prop: "updateTime", width: "80" },
        { label: "创建人", prop: "creatorName", width: "70" },
        { label: "子任务数", prop: "childTaskCount", width: "50" },
        { label: "Cron", prop: "jobCron", width: "180" },
      ],
      tableData: {
        page: 1,
        pagerows: 10,
        rows: [],
        totalrows: 0,
      },
      dialogTableColumns: [
        // { label: "工作流编号", prop: "jobId", width: "100" },
        { label: "调度时间", prop: "triggerTime", width: "100" },
        {
          label: "调度结果",
          prop: "triggerCode",
          width: "100",
          isChangeCode: "true",
          codeArr: [
            { text: "成功", value: 200 },
            { text: "失败", value: 500 },
            { text: "", value: 0 },
          ],
        },
        { label: "执行时间", prop: "handleTime", width: "100" },
        {
          label: "执行结果",
          prop: "handleCode",
          width: "100",
          isChangeCode: "true",
          codeArr: [
            { text: "成功", value: 200 },
            { text: "失败", value: 500 },
            { text: "", value: 0 },
          ],
        },
      ],
      dialogTableData: {
        page: 1,
        pagerows: 10,
        rows: [],
        totalrows: 0,
      },
      blockStrategyOptions: [],
      routeStrategyOptions: [],
      selectTreeLabel: "",
      currentScheduleName: "",
      currentJobId: "",
      importDialogVisible: false,
      //cron表达式框
      cronPopover: false,
      cron: "",
    };
  },
  created() {
    postJSON(
      "/api/core/v1/dictionary/queryData.do?dicId=SCHEDULE_BLOCK_STRATEGY",
      {
        postData: JSON.stringify({}),
      }
    ).then((res) => {
      this.blockStrategyOptions = res.data[0].data;
    });
    postJSON(
      "/api/core/v1/dictionary/queryData.do?dicId=SCHEDULE_ROUTE_STRATEGY",
      {
        postData: JSON.stringify({}),
      }
    ).then((res) => {
      this.routeStrategyOptions = res.data[0].data;
    });
  },
  computed: {
    fuTreeData() {
      return this.$store.state.reqData["selectTree"] || [];
    },

    tableReq() {
      return {
        url: "/api/schedulecenter/v1/jobinfo/pageList.do",
        params: [
          {
            name: "params",
            vtype: "json",
            data: {
              jobName: this.queryForm.jobName,
              jobDesc: this.queryForm.jobDesc,
              scheduleId: this.queryForm.scheduleId,
              updateStartTime: this.queryForm.timeRange[0],
              updateEndTime: this.queryForm.timeRange[1],
              folderId: this.selectedFolderId,
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
    logTableReq() {
      return {
        url: "/api/schedulecenter/v1/joblog/queryLogList.do",
        params: [
          {
            name: "formpanel",
            vtype: "formpanel",
            data: {
              scheduleName: this.currentScheduleName,
              scheduleId: this.currentJobId,
              triggerTime: this.logQueryForm.triggerTime.join(" - "),
              handleTime: this.logQueryForm.handleTime.join(" - "),
              triggerCode: this.logQueryForm.triggerCode,
              handleCode: this.logQueryForm.handleCode,
            },
          },
          {
            vtype: "pagination",
            name: "pagerows",
            data: this.dialogTableData.pagerows,
          },
          { vtype: "pagination", name: "totalrows", data: 0 },
          {
            vtype: "pagination",
            name: "page",
            data: this.dialogTableData.page,
          },
        ],
      };
    },
  },
  methods: {
    updateTable() {
      this.$refs.jobTable.queryData();
      this.$refs.page.queryData();
    },
    createOrUpdateJob() {
      this.$refs.jobForm.$refs.el.validate(async (valid) => {
        if (valid) {
          if (this.dialogTitle === "新建调度任务") {
            try {
              let res = await addJob(this.dialogForm);
              if (res) {
                Message.success("新建任务成功！");
                this.dialogVisible = false;
                this.updateTable();
              }
            } catch (e) {
              Message.error("新建任务失败！");
              console.log(e);
            }
          } else {
            try {
              let res = await updateJob(this.dialogForm);
              if (res) {
                Message.success("更新任务成功！");
                this.dialogVisible = false;
                this.updateTable();
              }
            } catch (e) {
              Message.error("更新任务失败！");
              console.log(e);
            }
          }
        }
      });
    },
    isRetryChange(val) {
      if (val === "0") {
        this.dialogForm.executorFailRetryCount = "";
        this.dialogForm.retryInterval = "";
      }
    },
    async addOrEditFolder() {
      if (this.folderDialogTitle === "新建") {
        try {
          let res = await addTreeNode(
            this.editingFolderName,
            this.editingFolderId
          );
          if (res) {
            this.$message({
              type: "success",
              message: "新建成功!",
            });
            this.updateTree();
            this.folderDialogVisible = false;
          }
        } catch (e) {
          Message.error("新建失败！");
        }
      } else {
        //重命名
        try {
          let res = await updateTreeNode(
            this.editingFolderId,
            this.editingFolderName
          );
          if (res) {
            this.$message({
              type: "success",
              message: "更改成功!",
            });
            this.updateTree();
            this.folderDialogVisible = false;
          }
        } catch (e) {
          Message.error("更改失败！");
        }
      }
    },
    tableSearch() {
      this.queryForm = JSON.parse(JSON.stringify(this.form));
    },
    logTableSearch() {
      this.logQueryForm = JSON.parse(JSON.stringify(this.logForm));
    },
    updateTree() {
      this.$refs.leftTree.queryData();
    },
    handleNodeClick(data, node) {
      // console.log("handleNodeClick", data, node)
      this.selectedFolderId = data.id;
    },
    createFolder(node) {
      // console.log("createFolder", node)
      this.folderDialogTitle = "新建";
      this.editingFolderId = node.id;
      this.editingFolderName = "";

      this.folderDialogVisible = true;
    },
    editFolder(node) {
      this.folderDialogTitle = "编辑";
      this.editingFolderName = node.folderName;
      this.editingFolderId = node.id;
      this.folderDialogVisible = true;
    },
    deleteFolder(node) {
      this.$confirm("此操作将永久删除该文件夹, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            let res = await deleteTreeNode(node.id);
            if (res) {
              this.$message({
                type: "success",
                message: "删除成功!",
              });
              this.folderDialogVisible = false;
              this.updateTree();
            }
          } catch (e) {
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
    createJob() {
      this.dialogTitle = "新建调度任务";
      this.dialogForm = {
        scheduleName: "",
        jobCron: "",
        jobDesc: "",
        executorBlockStrategy: "",
        executorRouteStrategy: "",
        retryInterval: "",
        folderId: "",
        executorTimeout: "",
        executorFailRetryCount: "",
        scheduleDeadline: "",
        isRetry: "0",
      };
      this.dialogForm.folderId = this.selectedFolderId;
      this.transformFolderTree();
      this.dialogVisible = true;
    },
    /**
     * @description 树拖拽（起始位置）禁止条件判断
     * 根节点不允许拖拽
     */
    allowDrag(node) {
      return node.data.pId !== "0";
    },
    /**
     * @description 树拖拽（目的位置）禁止条件判断
     * 不能拖拽到根节点同级
     */
    allowDrop(data, fn) {
      // console.log("drop", data, data.dropNode.data.pId)
      if (
        (data.dropType === "next" || data.dropType === "prev") &&
        data.dropNode.data.pId === "0"
      ) {
        //不允许拖拽到根节点
        fn(false);
      }
    },
    editJob(row) {
      this.dialogForm = row;
      this.transformFolderTree();
      this.dialogTitle = "编辑调度任务";
      this.dialogVisible = true;
    },
    /**
     * @description 回显分类树
     */
    transformFolderTree() {
      let paths = this.findPath(
        this.dialogForm.folderId,
        this.$refs.leftTree.fuTreeData
      );
      this.selectTreeLabel = paths.join(">");
      this.$nextTick(() => {
        this.$refs.selectTree.$refs.el.setCheckedKeys([
          this.dialogForm.folderId,
        ]);
      });
    },
    logJob(row) {
      this.currentScheduleName = row.scheduleName;
      this.currentJobId = row.scheduleId;
      //初始化日志查询表单
      this.logForm = {
        triggerTime: [],
        handleTime: [],
        triggerCode: "",
        handleCode: "",
      };
      this.logQueryForm = {
        triggerTime: [],
        handleTime: [],
        triggerCode: "",
        handleCode: "",
      };
      this.logDialogVisible = true;
    },
    copyJob(data) {
      MessageBox.confirm("此操作将拷贝该任务, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            let res = await copyJob(data.scheduleId);
            if (res) {
              Message.success("拷贝成功！");
              this.updateTable();
            }
          } catch (e) {
            console.log(e);
            Message.error("拷贝失败！");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消拷贝",
          });
        });
    },
    async exportJob(row) {
      exportTable(row.scheduleId);
    },
    designJob(row) {
      window.location.href = `/schedulecenter/#/jobFlow?scheduleId=${row.scheduleId}`;
    },
    toReadOnlyFlow(row) {
      window.location.href = `/schedulecenter/#/jobFlow?scheduleId=${row.scheduleId}&mode=view`;
    },
    async executeJob(row) {
      try {
        let res = await executeJob(row.scheduleId);
        if (res) {
          Message.success("执行任务成功！");
          // this.updateTable()
        }
      } catch (e) {
        Message.error("执行任务失败！");
        console.log(e);
      }
    },
    async startOrStopJob(row) {
      if (row.triggerStatus === 0) {
        //启动
        try {
          let res = await startJob(row.scheduleId);
          if (res) {
            Message.success("启动任务成功！");
            this.updateTable();
          }
        } catch (e) {
          Message.error("启动任务失败！");
          console.log(e);
        }
      } else {
        try {
          let res = await stopJob(row.scheduleId);
          if (res) {
            Message.success("停止任务成功！");
            this.updateTable();
          }
        } catch (e) {
          Message.error("停止任务失败！");
          console.log(e);
        }
      }
    },
    deleteJob(row) {
      this.$confirm("此操作将永久删除该任务, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            let res = await deleteJob(row.scheduleId);
            if (res) {
              Message.success("删除任务成功！");
              this.updateTable();
            }
          } catch (e) {
            console.log(e);
            Message.error("删除任务失败！");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    /**
     * @description  因为treeData不完全是颗树  再res中加上根节点
     * */
    findPath(targetId, treeData) {
      let res;
      for (let i = 0; i < treeData.length; i++) {
        res = this.findNode(targetId, treeData[i]);
        if (res != undefined) {
          res.path.unshift(treeData[i].folderName);
          return res.path;
        }
      }
      if (res == undefined) {
        console.log("没有找到根节点到该节点的路径");
      }
    },
    /**
     * @description 深度遍历树 递归查询 targerId到树根节点的路径 存在res.path里
     *
     */
    findNode(targetId, tree) {
      // debugger;
      if (tree.id == targetId) {
        return {
          path: [],
        };
      }
      let res;
      if (tree.children) {
        for (let j = 0; j < tree.children.length; j++) {
          res = this.findNode(targetId, tree.children[j]);
          if (res != undefined) {
            res.path.unshift(tree.children[j].folderName);
            return res;
          }
        }
      }
    },
    handleCheckChange(data, checked) {
      //单选时，因为这个方法在重新点击其他复选框时会触发两次，所以只能通过获取ckeys的方式清空
      let ckeys = this.$refs.selectTree.$refs.el.getCheckedNodes();
      console.log("data", ckeys, checked);
      let texts = [],
        values = [];
      ckeys.forEach((item) => {
        texts.push(item.folderName);
        values.push(item.id);
      });
      let paths = this.findPath(values[0], this.fuTreeData);
      // console.log("path", paths)
      this.selectTreeLabel = paths.join(">");
      this.dialogForm.folderId = values[0];
      // this.opinionForm.focalDepartment = values.join(",")
      // this.selectTreeLabel = texts.join(",")

      //单选的逻辑
      if (checked == true) {
        //选择其他选项  控制单选
        this.$refs.selectTree.$refs.el.setCheckedNodes([data]);
        // this.opinionForm.focalDepartment = data["value"]
        // this.selectTreeLabel = data["text"]
      } else {
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
    //表格分页切换
    handleLogCurrentChange(val) {
      this.dialogTableData.page = val;
    },
    //每页多少条
    handleLogSizeChange(val) {
      this.dialogTableData.pagerows = val;
    },
    funLogIndex(index) {
      return (
        (this.dialogTableData.page - 1) * this.dialogTableData.pagerows +
        index +
        1
      );
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
    importFile() {
      this.importDialogVisible = true;
    },
    closeUpload() {
      this.importDialogVisible = false;
      this.updateTable();
    },
    changeCron(val) {
      this.dialogForm.jobCron = val;
    },
  },
};
</script>
<style lang="less" scoped>
.job-management {
  width: 100%;
  height: 100%;
  .query-header {
    position: relative;
    height: 40px;
    padding: 10px;
    min-width: 1700px;
    .query {
      position: absolute;
      right: 20px;
      top: 10px;
    }
  }
  .main {
    width: 100%;
    height: calc(100% - 60px);
    border-top: 1px solid #c4cbcf;
    box-sizing: border-box;
    min-width: 1700px;
    .left-tree {
      position: absolute;
      width: 240px;
      height: calc(100% - 80px);
      margin-top: 10px;
      padding-left: 10px;
      padding-right: 10px;
      border-right: 1px solid #c4cbcf;
    }
    .right-table {
      width: calc(100% - 280px);
      margin-top: 10px;
      padding-left: 10px;
      height: calc(100% - 60px);
      margin-left: 260px;
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

      .top-btns {
        margin-bottom: 5px;
        /deep/.el-button {
          // width: 38px;
          // height: 23px;
          margin-left: 5px;
        }
      }
      .bottom-btns {
        /deep/.el-button {
          // width: 38px;
          // height: 23px;
          margin-left: 5px;
        }
      }
    }
  }

  .create-dialog/deep/.el-dialog {
    .retry-count-form {
      position: relative;
      .checkbox {
        position: absolute;
        top: -35px;
        left: -108px;
      }
    }
    .el-form-item {
      width: 48%;
      height: 50px;
      .el-input {
        width: 220px;
      }
    }
    .el-range-editor {
      width: 220px;
    }
    //表达式框的样式
    .cron-box {
      line-height: 40px;
      width: 577px;
      position: absolute;
      z-index: 1;
      top: 132px;
      right: -128px;
      .el-checkbox {
        margin-right: 0;
      }
    }

    //有筛选的下拉树样式，需要加上class='select-tree',:popper-append-to-body="false"
    .select-tree {
      //改变下拉树的样式
      .el-select-dropdown {
        .el-select-dropdown__item {
          max-height: 281px;
          padding: 0;
          overflow-y: auto;
          // overflow: hidden;
          // overflow-y: auto;
          height: 100%;
          width: 290px;
        }
        .el-scrollbar {
          overflow-y: auto;
          overflow-x: hidden;
          width: 293px;
          .el-scrollbar__wrap {
            overflow: hidden;
          }
          .el-select-dropdown__list {
            margin: 0 0 0 3px;
            .el-input {
              width: 93%;
              height: 28px;
            }
          }
        }

        .el-scrollbar__bar.is-vertical {
          display: none;
        }
        .el-select-dropdown__wrap {
          max-height: 314px;
          margin-bottom: 0 !important; //覆盖行内样式
        }
      }
    }
  }
  .log-dialog/deep/.el-dialog {
    .el-range-editor {
      width: 220px;
    }
    .el-form {
      .el-input {
        width: 220px;
      }
    }
  }
}
</style>
