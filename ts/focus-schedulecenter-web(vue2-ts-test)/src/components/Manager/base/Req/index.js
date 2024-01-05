import { postJSON } from "@/utils/post.js"

// 保存任务流
const SAVE_ETL_TASK_URL = "/api/schedulecenter/v1/schedule/saveEtl.do"
// 加载etl任务
const LOAD_ETL_TASK_URL = "/api/schedulecenter/v1/schedule/queryEtl.do"
// 运行elt任务
const EXECUTE_ETL_TASK_URL = "/api/schedulecenter/v1/jobinfo/trigger.do"
//查询任务流信息
const QUERY_ETL_TASK_URL =
  "/api/schedulecenter/v1/schedule/queryScheduleInfo.do"
//查询etl运行日志
const QUERY_ETL_LOG_URL = "/api/schedulecenter/v1/joblog/queryPolling.do"
//更新一个etl信息
const UPDATE_ETL_TASK_URL = "/api/datafactory/v1/schedule/updateOne.do"
//终止运行etl任务
const END_ETL_TASK_URL = "/api/datafactory/v1/etlexecution/shutdown.do"
//请求job日志
const QUERY_JOB_LOG_URL = "/api/schedulecenter/v1/joblog/queryTaskLog.do"

/**
 * @description 保存etl任务
 * @param {String} etlId
 * @param {String} bpmnXml
 * @param {Object<JSON>} tasks
 * @returns {Promise}
 */
export const saveEtlTask = (scheduleId, bpmnXml, tasks = []) => {
  return postJSON(SAVE_ETL_TASK_URL, {
    postData: JSON.stringify({
      data: [
        { vtype: "attr", name: "id", data: scheduleId },
        { vtype: "attr", name: "bpmnXml", data: bpmnXml },
        { vtype: "json", name: "tasks", data: JSON.stringify(tasks) },
      ],
    }),
  })
}

/**
 * @description 加载etl任务
 * @param {String} etlId
 * @returns {Promise}
 */
export const loadEtlTask = (scheduleId) => {
  return postJSON(LOAD_ETL_TASK_URL, {
    postData: JSON.stringify({
      data: [{ vtype: "attr", name: "scheduleId", data: scheduleId }],
    }),
  })
}

/**
 * @description 执行etl任务
 * @param {String} etlId
 * @param {String} action validate|校验 run|运行 debug|调试
 * @param {Number} calculateNumber
 * @param {JSON} params
 * @returns {Promise}
 */
export const executeEtlTask = (
  etlId,
  action = "run",
  calculateNumber = 10,
  params
) => {
  return postJSON(EXECUTE_ETL_TASK_URL, {
    postData: JSON.stringify({
      data: [
        { vtype: "attr", name: "etlId", data: etlId },
        // { vtype: "attr", name: "action", data: action },
        // { vtype: "attr", name: "calculateNumber", data: calculateNumber },
        // { vtype: "json", name: "params", data: JSON.stringify(params) },
      ],
    }),
  })
}
/**
 * @description 根据etlId查询etl基本信息
 * @param {String} etlId
 * @returns {Promise}
 */
export const queryEtlTaskById = (etlId) => {
  return postJSON(QUERY_ETL_TASK_URL, {
    postData: JSON.stringify({
      data: [{ vtype: "attr", name: "scheduleId", data: etlId }],
    }),
  })
}

/**
 * @description 根据etlId查询etl运行日志
 * @param {String} etlId
 * @returns {Promise}
 */
export const queryLogById = (etlId) => {
  return postJSON(QUERY_ETL_LOG_URL, {
    postData: JSON.stringify({
      data: [
        { vtype: "attr", name: "logId", data: etlId },
        { vtype: "attr", name: "fromLineNum", data: "1" },
      ],
    }),
  })
}

/**
 * @description 更新一个etl基本信息
 */
export const updateEtlTask = (etlData) => {
  return postJSON(UPDATE_ETL_TASK_URL, {
    postData: JSON.stringify({
      data: [{ vtype: "formpanel", name: "etlForm", data: etlData }],
    }),
  })
}

/**
 * @description 终止运行etl任务
 */
export const endEtlTask = (etlId) => {
  return postJSON(END_ETL_TASK_URL, {
    postData: JSON.stringify({
      data: [{ vtype: "attr", name: "etlId", data: etlId }],
    }),
  })
}

/**
 * @description job日志查询
 */
export const queryJobLog = (executionId, taskId) => {
  return postJSON(QUERY_JOB_LOG_URL, {
    postData: JSON.stringify({
      data: [
        { vtype: "attr", name: "logId", data: executionId },
        { vtype: "attr", name: "taskId", data: taskId },
      ],
    }),
  })
}

/**
 * @description 代码表查询
 */
export const reqcodeList = (list = "", type = "metadata") => {
  let url = ""
  if (type === "metadata") {
    url = `/meta/api/core/v1/dictionary/queryDdiData.do?dicId=${list}`
  } else {
    url = `/api/core/v1/dictionary/queryData.do?dicId=${list}`
  }
  return postJSON(url, {
    postData: JSON.stringify({
      data: [],
    }),
  })
}
