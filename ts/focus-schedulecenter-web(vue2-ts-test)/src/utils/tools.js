/**
 * @description 合并json中保存的数据和请求回来的数据
 *
 * jsonData,保存的json数据
 * newData, 请求回来新的表格数据
 * writableProps 用户填写的表格的列名，这些列需要以jsonData里的为准
 * keysMapping jsonData和newData数据key值的对应关系 newKey:jsonKey
 * identifyKey 映射对照的key值，默认是columnEnName
 * isAddNewData 是否需要将newData中不同的字段拼上返回
 * 中途不能改变上面两个数据
 *
 * 返回最终的数据
 */
export const mergeConflictedData = (
  jsonData,
  newData,
  writableProps,
  keysMapping,
  identifyKey = "columnEnName",
  isAddNewData = true
) => {
  //startUsing是否启用这个字段也是以jsonData中数据为准
  writableProps.push("startUsing")
  let resultData = []
  let newCopyData = JSON.parse(JSON.stringify(newData))

  //替换keysMapping里所有的不同的key值
  transformMappingKeys(newCopyData, keysMapping)
  // console.log("newCopyData", newCopyData);
  for (let i = 0; i < jsonData.length; i++) {
    //newData中对应数据的位置
    let newIndex = -1
    newCopyData.forEach((item, index) => {
      if (item[identifyKey] === jsonData[i][identifyKey]) {
        newIndex = index
      }
    })
    if (newIndex === -1) {
      //没找到对应数据
      let rowData = JSON.parse(JSON.stringify(jsonData[i]))
      resultData.push(rowData)
      //本行数据报错
      rowData.isError = true
    } else {
      //找到对应数据,删除在newCopyData找到的数据，并push到新数组里
      let rowData = newCopyData.splice(newIndex, 1)
      rowData = rowData.length > 0 ? rowData[0] : {}

      //替换本条数据用户手填的值
      writableProps.forEach((item) => {
        if (jsonData[i][item] !== undefined) {
          //rowData(也就是newData)yh里如果必填的值不为空 就用rowData的值
          //在json里key值为‘’，并且rowData里key值不为‘’，用新数据的值，其余情况用jsonData
          //FIXME:上面的逻辑不知用于何处？以及逻辑会影响一般的数据冲突处理
          //表输出的逻辑
          if (!(jsonData[i][item] === "" && rowData[item] !== "")) {
            rowData[item] = jsonData[i][item]
          }
        }
      })
      resultData.push(rowData)
    }
  }

  //1.jsonData数据里都有wriwtableProps里的值
  //2.接口返回的newData里面可能没有页面展示的所有key值
  //剩余数据没有wriwtableProps里的key值 就赋为空值

  newCopyData.forEach((item) => {
    // //替换keysMapping里所有的不同的key值
    // Object.keys(keysMapping).forEach((every) => {
    //   let jsonKey = keysMapping[every];
    //   if (item[jsonKey] === undefined) {
    //     item[jsonKey] = item[every];
    //     delete item[every]; //删除接口返回的key
    //   }
    // });
    writableProps.forEach((every) => {
      if (item[every] === undefined) {
        item[every] = ""
      }
    })
  })
  //这个时候newCopyData应该只剩下jsonData中没有的数据，直接concat到resultData里就行
  if (isAddNewData) {
    resultData = resultData.concat([...newCopyData])
  }
  return resultData
}

/**
 * @description 依据keysMapping映射关系,修改表格数据data 的映射key值，删除旧key值
 * 这个方法会直接改变传进来的data数据
 */
export const transformMappingKeys = function (data, keysMapping) {
  Object.keys(keysMapping).forEach((item) => {
    let jsonKey = keysMapping[item]
    for (let i = 0; i < data.length; i++) {
      let rowData = data[i]
      if (rowData[jsonKey] === undefined) {
        rowData[jsonKey] = rowData[item]
        delete rowData[item] //删除接口返回的key
      }
    }
  })
}
/**
 * @description 生成随机数
 * @param {Number} e 长度
 */
export const randomString = function (e) {
  e = e || 32
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = ""
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
  return n
}

/**
 * @description 表格数据拷贝（如果中间部分单元格不允许拷贝，是不支持的呦，那你自己去写吧）
 * @param {@Array} tableData 表格数据
 * @param {@String} pasteContent 待拷贝的内容
 * @param {@Number} rowIndex 起始行index
 * @param {@Array} columns 待拷贝的字段信息（大多数情况是表头的prop），注意顺序是有用的，决定了pasteContent中的数据最终拷贝后的顺序
 */
export const tablePaste = function (
  tableData,
  pasteContent,
  rowIndex,
  columns
) {
  let contentRowIndex = 0
  let pasteArray = resolvePasteContent(pasteContent)
  for (
    //遍历表体数据
    let currRowIndex = rowIndex;
    currRowIndex < tableData.length && contentRowIndex < pasteArray.length;
    currRowIndex++
  ) {
    let rowData = tableData[currRowIndex]
    for (
      //遍历待拷贝的内容
      let contentColumnIndex = 0;
      contentColumnIndex < pasteArray[contentRowIndex].length && //不能超过待拷贝内容的边界
      contentColumnIndex < columns.length; //不能超过表格允许拷贝的区域
      contentColumnIndex++
    ) {
      let columnName = columns[contentColumnIndex]
      let cellValue = pasteArray[contentRowIndex][contentColumnIndex]

      this.$set(rowData, columnName, cellValue)
    }
    contentRowIndex++
  }
}
/**
 * @description 解析拷贝字符串，解析成二维数组
 * @param {@String} pasteStr
 */
export const resolvePasteContent = function (pasteStr) {
  let pasteArray = pasteStr.split("\n")
  if (pasteArray.length > 0 && pasteArray[pasteArray.length - 1] === "") {
    pasteArray.pop()
  }

  pasteArray = pasteArray.map((item) =>
    item.split("\t").map((ele) => {
      return ele.replace(/[\r]/g, "")
    })
  )

  return pasteArray
}
