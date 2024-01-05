/**
 * @classdesc 对应后台 各种 bpmnType 类对象的前台 bpmnType 类基类
 *
 * @class
 * @author
 */
import Event from "../util/Event";
export default class BaseInstance extends Event {
  /**
   * @description 构造函数
   */
  constructor() {
    super();
  }
  /**
   * @description 用于属性面板 更新 配置信息使用
   * @param {Object<config>} config
   */
  updateConfig(config) {}
  /**
   * @description 用于属性面板 获得 配置信息使用
   * @returns {Object<config>}
   */
  getConfig() {
    return null;
  }
  /**
   * @description 用于保存时 获得 后台所需的数据格式
   * @returns {Object<config>}
   */
  getValue() {
    return null;
  }
}
