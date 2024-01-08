export const ajax = (url, data) => {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.open("POST", url, true)
    // xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");//上传文件
    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(xhr.responseText)
      } else {
        reject(xhr.responseText)
      }
    }
    xhr.open("POST", url, !0)
    xhr.send(data)
  })
}
