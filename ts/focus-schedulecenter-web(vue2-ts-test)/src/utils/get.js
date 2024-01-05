export const get = (url) => {
  // 返回一个 promise 对象.
  return new Promise(function (resolve, reject) {
    // 创建一个 XML 对象
    var req = new XMLHttpRequest();
    req.open("GET", url);

    //req.responseType = "blob";
    req.onload = function () {
      if (req.status == 200) {
        // 请求 200的时候处理 response
        resolve(JSON.parse(req.response));
      } else {
        // 处理请求错误信息
        reject();
      }
    };

    // 处理网络错误信息
    req.onerror = function () {
      reject(Error("Network Error"));
    };

    // 发送请求
    req.send();
  });
};
