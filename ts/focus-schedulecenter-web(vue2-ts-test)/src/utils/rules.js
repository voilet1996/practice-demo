let ruleTypeJson = {
  1: "不能为空",
  2: "必须是【组件类型的英文名称+数字】的形式，如tableSourceTask1",
}
let checkSuccess = {
  result: true,
  message: "校验通过",
}
let checkError = {
  result: false,
  message: "",
}
/**
 * @description 待校验的公共方法
 * @param {*} json 待校验的步骤json
 * @param {*} rules 步骤规则
 */
export const ruleTools = (json, rules) => {
  let result = JSON.parse(JSON.stringify(checkError))
  for (let item of rules) {
    //为空校验
    if (item.ruleType === "1") {
      try {
        if (eval("json." + item.path) === "") {
          result.message = `${item.parentName}-${item.name} ${
            ruleTypeJson[item.ruleType]
          }`
          return result
        }
      } catch (error) {
        result.message = error
        return result
      }
    } else if (item.ruleType === "2") {
      //基本属性-名称 格式的校验
      try {
        let value = eval("json." + item.path)
        let reg = new RegExp(`${json.baseTask.taskType}\\d+$`)
        if (!reg.test(value)) {
          result.message = `${item.parentName}-${item.name} ${
            ruleTypeJson[item.ruleType]
          }`
          return result
        }
      } catch (error) {
        result.message = error
        return result
      }
    }
  }
  return checkSuccess
}
