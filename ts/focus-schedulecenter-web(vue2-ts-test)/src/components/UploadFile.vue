<template>
  <!-- 导入弹窗 -->
  <div class="multi-import">
    <fu-dialog
      title="导入"
      :visible="importDialogVisible"
      width="422px"
      height="144px"
      append-to-body
      @close="close"
      :close-on-click-modal="false"
    >
      <span>请上传附件</span>
      <div style="margin: 5px 0; color: red" v-show="accept !== ''">
        仅支持上传{{ accept }}文件
      </div>
      <fu-upload
        :accept="accept"
        class="multi-import"
        action="fakeAction"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :http-request="handleUpload"
      >
        <fu-button size="medium" type="primary">选择</fu-button>
      </fu-upload>
    </fu-dialog>
  </div>
</template>

<script>
import { ajax } from "@/utils/upload"
import { Get } from "@/utils/get.js"
import { postJSON } from "@/utils/post"
import { Button, Dialog, Upload, Message } from "fusion-ui"
export default {
  components: {
    FuButton: Button,
    FuDialog: Dialog,
    FuUpload: Upload,
  },
  props: {
    importDialogVisible: Boolean,
    //文件夹id
    folderId: { type: String, default: "" },
    //为了刷新对应的表格用的
    updateDomRef: { type: String, default: "" },

    accept: {
      type: String,
      default: ".doc,.docx",
    },
  },
  data() {
    return {}
  },
  methods: {
    // 批量导入请求
    handleUpload(param) {
      let url = "/api/schedulecenter/v1/fileManage/upload.do"
      const file = param.file
      let uploadForm = new FormData()
      uploadForm.append("FileData", file)
      uploadForm.append("client", "formUpload")
      uploadForm.append("name", file.name)
      uploadForm.append("size", file.size)
      ajax(url, uploadForm)
        .then((res) => {
          let result = JSON.parse(res)

          let params = {
            data: [
              {
                name: "params",
                vtype: "json",
                data: {
                  folderId: this.folderId,
                  fileId: result.fileId,
                },
              },
            ],
          }
          postJSON("/api/schedulecenter/v1/jobinfo/importSchedule.do", {
            postData: JSON.stringify(params),
          })
            .then(() => {
              Message({
                type: "success",
                message: "导入成功！",
              })

              this.$emit("closeUpload")
            })
            .catch((e) => {
              //console.log(e);
              Message.error("请求失败！")
            })
        })
        .catch((e) => {
          //console.log(e);
          Message.error("请求失败！")
        })
    },
    beforeUpload(file) {
      // console.log("file-->", file, this.getFileType(file.name));
      let accept = this.getFileType(file.name),
        acceptList = []
      // let acceptList = ["doc", "docx"];

      this.accept.split(",").forEach((item) => {
        acceptList.push(item.substr(1, item.length - 1))
      })
      if (this.accept === "") {
        return
      }
      if (acceptList.indexOf(accept) == -1) {
        Message.warning("文件格式错误,请重新选择上传文件")
        return false
      }
    },
    //获取文件后缀名
    getFileType(name) {
      let startIndex = name.lastIndexOf(".")

      if (startIndex !== -1) {
        return name.slice(startIndex + 1).toLowerCase()
      } else {
        return ""
      }
    },
    // 点击关闭dialog，更新标志位状态
    close() {
      this.$emit("closeUpload")
    },
  },
}
</script>

<style lang="less" scoped>
.multi-import {
  user-select: none;
  text-align: right;
}
</style>
