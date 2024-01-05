import { postJSON } from "./post.js";
import { Message, MessageBox } from "fusion-ui";

//-------首页页面接口--------//
/**
 * @description 新增执行器
 */
export const getDashboardInfo = function () {
  return postJSON("/api/schedulecenter/v1/index/getDashboardInfo.do", {
    postData: JSON.stringify({}),
  });
};
/**
 * @description 新增执行器
 */
export const getChartInfo = function (type, startDate = "", endDate = "") {
  return postJSON("/api/schedulecenter/v1/index/chartInfo.do", {
    postData: JSON.stringify({
      data: [
        {
          name: "params",
          vtype: "json",
          data: {
            type: type,
            startDate: startDate,
            endDate: endDate,
          },
        },
      ],
    }),
  });
};

//-------任务管理页面接口--------//
/**
 * @description 新增任务分类接口
 */
export const addTreeNode = function (name, pId) {
  return postJSON("/api/schedulecenter/v1/folder/add.do", {
    postData: JSON.stringify({
      data: [
        {
          name: "params",
          vtype: "json",
          data: {
            folderName: name,
            pId: pId,
          },
        },
      ],
    }),
  });
};
/**
 * @description 删除任务分类接口
 */
export const deleteTreeNode = function (id) {
  return postJSON("/api/schedulecenter/v1/folder/remove.do", {
    postData: JSON.stringify({
      data: [
        {
          name: "params",
          vtype: "json",
          data: { id: id },
        },
      ],
    }),
  });
};
/**
 * @description 编辑任务分类接口
 */
export const updateTreeNode = function (id, name) {
  return postJSON("/api/schedulecenter/v1/folder/update.do", {
    postData: JSON.stringify({
      data: [
        {
          name: "params",
          vtype: "json",
          data: {
            folderId: id,
            folderName: name,
          },
        },
      ],
    }),
  });
};

/**
 * @description 新增任务接口（表格数据）
 */
export const addJob = function (form) {
  return postJSON("/api/schedulecenter/v1/jobinfo/add.do", {
    postData: JSON.stringify({
      data: [
        {
          name: "params",
          vtype: "json",
          data: form,
        },
      ],
    }),
  });
};
/**
 * @description 更新任务接口（表格数据）
 */
export const updateJob = function (form) {
  return postJSON("/api/schedulecenter/v1/jobinfo/update.do", {
    postData: JSON.stringify({
      data: [
        {
          name: "params",
          vtype: "json",
          data: form,
        },
      ],
    }),
  });
};
/**
 * @description 删除任务接口（表格数据）
 */
export const deleteJob = function (id) {
  return postJSON("/api/schedulecenter/v1/jobinfo/remove.do", {
    postData: JSON.stringify({
      data: [
        {
          name: "params",
          vtype: "json",
          data: { scheduleId: id },
        },
      ],
    }),
  });
};

/**
 * @description 拷贝任务接口（表格数据）
 */
export const copyJob = function (id) {
  return postJSON("/api/schedulecenter/v1/jobinfo/copy.do", {
    postData: JSON.stringify({
      data: [
        {
          vtype: "attr",
          name: "scheduleId",
          data: id,
        },
      ],
    }),
  });
};

/**
 * @description 启动接口（表格数据）
 */
export const startJob = function (id) {
  return postJSON("/api/schedulecenter/v1/jobinfo/start.do", {
    postData: JSON.stringify({
      data: [{ name: "params", vtype: "json", data: { scheduleId: id } }],
    }),
  });
};
/**
 * @description 停止接口（表格数据）
 */
export const stopJob = function (id) {
  return postJSON("/api/schedulecenter/v1/jobinfo/stop.do", {
    postData: JSON.stringify({
      data: [{ name: "params", vtype: "json", data: { scheduleId: id } }],
    }),
  });
};

/**
 * @description 执行任务
 */
export const executeJob = function (id) {
  return postJSON("/api/schedulecenter/v1/jobinfo/trigger.do", {
    postData: JSON.stringify({
      data: [{ data: id, name: "etlId", vtype: "attr" }],
    }),
  });
};
/**
 *  @description 表格导出
 * @param {@} selections
 * @param {*} operation
 * @param {*} form 查询表单
 * @returns
 */
export const exportTable = (id) => {
  MessageBox.alert("确定要导出吗?", {
    confirmButtonText: "确定",
    callback: (action) => {
      if (action === "confirm") {
        postJSON("/api/schedulecenter/v1/jobinfo/exportSchedule.do", {
          postData: JSON.stringify({
            data: [{ name: "params", vtype: "json", data: { scheduleId: id } }],
          }),
        })
          .then((res) => {
            if (res) {
              window.open(
                `/api/schedulecenter/v1/fileManage/downloadFile.do?fileId=${res.data[0].data}`
              );
              Message.success("导出成功！");
            }
          })
          .catch((e) => {
            //console.log(e);
            Message.error("导出失败！");
          });
      } else {
        Message.info("取消导出！");
      }
    },
  });
};
//-------运行历史页面接口--------//
export const forceStopJob = function (id) {
  return postJSON("/api/schedulecenter/v1/joblog/logKill.do", {
    postData: JSON.stringify({
      data: [{ vtype: "attr", name: "id", data: id.toString() }],
    }),
  });
};

//-------执行器管理页面接口--------//

/**
 * @description 新增执行器
 */
export const addExecutor = function (form) {
  return postJSON("/api/schedulecenter/v1/jobgroup/save.do", {
    postData: JSON.stringify({
      data: [
        {
          vtype: "formpanel",
          name: "xxlJobGroup",
          data: form,
        },
      ],
    }),
  });
};
/**
 * @description 更新执行器
 */
export const updateExecutor = function (id, form) {
  return postJSON("/api/schedulecenter/v1/jobgroup/update.do", {
    postData: JSON.stringify({
      data: [
        {
          vtype: "formpanel",
          name: "xxlJobGroup",
          data: Object.assign({ id: id }, form),
        },
      ],
    }),
  });
};
/**
 * @description 删除执行器
 */
export const deleteExecutor = function (id) {
  return postJSON("/api/schedulecenter/v1/jobgroup/remove.do", {
    postData: JSON.stringify({
      data: [{ vtype: "attr", name: "id", data: id }],
    }),
  });
};
