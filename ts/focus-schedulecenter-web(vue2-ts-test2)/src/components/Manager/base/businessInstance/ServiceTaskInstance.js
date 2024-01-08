/**
 * @classdesc 对应后台 Task 类对象的前台 Task类
 *
 * @class
 * @author
 */
import BaseInstance from "./BaseInstance"
export default class ServiceTaskInstance extends BaseInstance {
  /**
   * @description 构造函数
   * @param {String} taskId
   * @param {String} taskType 对应 bpmn 中 businessType
   * @param {String} etlId 对应 EtlManager 中 etlId
   * @param {Object} config 对应 属性面板中 config
   */
  constructor(taskId, taskType, etlId, config) {
    super()
    this.bpmnType = "bpmn:ServiceTask"
    this.taskId = taskId
    this.taskType = taskType
    this.etlId = etlId
    if (config) {
      this.updateConfig(config, true)
    }
    // 广播事件
    this.emit("init")
  }
  /**
   * @description 用于属性面板 更新 配置信息使用
   * @param {Object<config>} config
   * @param {Boolean|?} isInit [false] 是否是初始化设置的，是的话不触发update事件
   */
  updateConfig(config, isInit = false) {
    this.config = config
    if (!config.baseTask) {
      console.error(`[Task]<updateConfig> config 缺少必要参数 'baseTask'`)
      // 广播事件
      this.emit("config.error")
      return
    }
    const { taskName, jobDesc, taskDesc } = config.baseTask
    this.taskName = taskName
    this.jobDesc = jobDesc
    this.taskDesc = taskDesc
    // 强制修复config中的id （粘贴时候碰到的问题）
    this.config.baseTask.taskId = this.taskId
    if (!isInit) {
      // 广播事件
      this.emit("update")
      this.emit("config.update")
    } else {
      // 广播事件
      this.emit("config.init")
    }
  }
  /**
   * @description 用于 Bpmm 更新 任务name使用
   * @param {Object<config>} config
   */
  updateLabel(jobDesc) {
    this.jobDesc = jobDesc
    // 广播事件
    this.emit("update")
    this.emit("label.update")
  }
  /**
   * @description 用于属性面板 获得 配置信息使用
   * @returns {Object<config>}
   */
  getConfig() {
    return this.config
  }
  /**
   * @description 用于保存时 获得 后台所需的数据格式
   * @returns {Object<config>}
   */
  getValue() {
    const {
      bpmnType,
      taskId,
      taskType,
      etlId,
      taskName,
      jobDesc,
      taskDesc,
      config,
    } = this
    return {
      bpmnType,
      taskId,
      taskType,
      etlId,
      taskName,
      jobDesc,
      taskDesc,
      config,
    }
  }
}
