import { ruleTools } from "@utils/rules.js"
let rules = [
  {
    parentName: "基本属性",
    name: "名称",
    ruleType: "1",
    path: "baseTask.taskName",
  },
  {
    parentName: "基本属性", //上级名称
    name: "名称", //属性名称
    ruleType: "2", //校验类型
    path: "baseTask.taskName", //属性路径
  },
  {
    parentName: "基本属性",
    name: "标题",
    ruleType: "1",
    path: "baseTask.jobDesc",
  },
  {
    parentName: "基本属性",
    name: "类型",
    ruleType: "1",
    path: "baseTask.taskType",
  },
]
/**
 * @description 步骤json校验方法
 * @param {Object} json 待校验的步骤json
 * @returns 校验结果
 */
const checkRules = (json = {}) => {
  let baseCheck = ruleTools(json, rules)
  if (baseCheck.result) {
    baseCheck = checkRulesEtl(json)
  }
  return baseCheck
}
function checkRulesEtl(json) {
  let result = {
    result: true,
    message: "校验通过",
  }
  console.log(json, "json")
  if (json.ETLJob.jobGroup === "") {
    result.result = false
    result.message = "请选择执行器"
  } else if (json.ETLJob.etlId === "") {
    result.result = false
    result.message = "请选择ETL"
  }
  return result
}
export default checkRules
