<script setup lang="ts">
import { last } from 'lodash-es'
import { computed, reactive, ref } from 'vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { DeleteOutlined, LoadingOutlined, FileOutlined } from '@ant-design/icons-vue'

export interface UploadFile {
  uid: string
  size: number
  name: string
  status: UploadStaus
  raw: File
  resp?: any
  url?: string
}

type UploadStaus = 'ready' | 'loading' | 'success' | 'error'
type FileListType = 'picture' | 'text'
type CheckUpload = (file: File) => boolean | Promise<File>

interface IProps {
  action: string
  beforeUpload?: CheckUpload
  drag?: boolean
  autoUpload?: boolean
  listType?: FileListType
  showUploadList?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  drag: false,
  autoUpload: true,
  listType: 'text',
  showUploadList: true,
})

export interface UploadSuccessRes {
  resp: any
  file: UploadFile
  list: UploadFile[]
}

export interface UploadErrorRes {
  error: Error
  file: UploadFile
  list: UploadFile[]
}

interface IEmits {
  (e: 'success', value: UploadSuccessRes): void
  (e: 'error', value: UploadErrorRes): void
  (e: 'change'): void
}

const emits = defineEmits<IEmits>()

const fileInput = ref<null | HTMLInputElement>(null)
const filesList = ref<UploadFile[]>([])
const isDragOver = ref(false)

const isUploading = computed(() => {
  return filesList.value.some((file) => file.status === 'loading')
})

const lastFileData = computed(() => {
  const lastFile = last(filesList.value)
  if (lastFile) {
    return {
      loaded: lastFile.status === 'success',
      data: lastFile.resp,
    }
  }
  return false
})

const removeFile = (id: string) => {
  filesList.value = filesList.value.filter((file) => file.uid !== id)
}

const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const uploadFiles = () => {
  filesList.value
    .filter((file) => file.status === 'ready')
    .forEach((readyFile) => postFile(readyFile))
}

let events: { [key: string]: (e: any) => void } = {
  click: triggerUpload,
}

const postFile = (readyFile: UploadFile) => {
  const formData = new FormData()
  formData.append(readyFile.name, readyFile.raw)
  readyFile.status = 'loading'
  axios
    .post(props.action, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((resp) => {
      readyFile.status = 'success'
      readyFile.resp = resp.data
      emits('success', { resp: resp.data, file: readyFile, list: filesList.value })
    })
    .catch((e: any) => {
      readyFile.status = 'error'
      emits('error', { error: e, file: readyFile, list: filesList.value })
    })
    .finally(() => {
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    })
}

const addFileToList = (uploadedFile: File) => {
  const fileObj = reactive<UploadFile>({
    uid: uuidv4(),
    size: uploadedFile.size,
    name: uploadedFile.name,
    status: 'ready',
    raw: uploadedFile,
  })
  if (props.listType === 'picture') {
    try {
      fileObj.url = URL.createObjectURL(uploadedFile)
    } catch (err) {
      console.error('upload File error', err)
    }
    // FileReader to preview local image
    // const fileReader = new FileReader()
    // fileReader.readAsDataURL(uploadedFile)
    // fileReader.addEventListener('load', () => {
    //   fileObj.url = fileReader.result as string
    // })
  }
  filesList.value.push(fileObj)
  if (props.autoUpload) {
    postFile(fileObj)
  }
}

const beforeUploadCheck = (files: null | FileList) => {
  if (files) {
    const uploadedFile = files[0]
    if (props.beforeUpload) {
      const result = props.beforeUpload(uploadedFile)
      if (result && result instanceof Promise) {
        result
          .then((processedFile) => {
            if (processedFile instanceof File) {
              addFileToList(processedFile)
            } else {
              throw new Error('beforeUpload Promise should return File object')
            }
          })
          .catch((e) => {
            console.error(e)
          })
      } else if (result === true) {
        addFileToList(uploadedFile)
      }
    } else {
      addFileToList(uploadedFile)
    }
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  beforeUploadCheck(target.files)
}

const handleDrag = (e: DragEvent, over: boolean) => {
  e.preventDefault()
  isDragOver.value = over
}
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  if (e.dataTransfer) {
    beforeUploadCheck(e.dataTransfer.files)
  }
}
if (props.drag) {
  events = {
    ...events,
    dragover: (e: DragEvent) => {
      handleDrag(e, true)
    },
    dragleave: (e: DragEvent) => {
      handleDrag(e, false)
    },
    drop: handleDrop,
  }
}

defineExpose({
  uploadFiles,
})
</script>

<template>
  <div class="file-upload">
    <div class="upload-area" v-on="events">
      <slot v-if="isUploading" name="loading">
        <button disabled>正在上传</button>
      </slot>
      <slot
        name="uploaded"
        v-else-if="lastFileData && lastFileData.loaded"
        :uploadedData="lastFileData.data"
      >
        <button>点击上传</button>
      </slot>
      <slot v-else name="default">
        <button>点击上传</button>
      </slot>
    </div>
    <input ref="fileInput" type="file" :style="{ display: 'none' }" @change="handleFileChange" />
    <ul :class="`upload-list upload-list-${listType}`" v-if="showUploadList">
      <li :class="`uploaded-file upload-${file.status}`" v-for="file in filesList" :key="file.uid">
        <img
          v-if="file.url && listType === 'picture'"
          class="upload-list-thumbnail"
          :src="file.url"
          :alt="file.name"
        />
        <span v-if="file.status === 'loading'" class="file-icon"><LoadingOutlined /></span>
        <span v-else class="file-icon"><FileOutlined /></span>
        <span class="filename">{{ file.name }}</span>
        <span class="delete-icon" @click="removeFile(file.uid)"><DeleteOutlined /></span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.upload-list {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
.upload-list li {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  font-size: 14px;
  line-height: 1.8;
  margin-top: 5px;
  box-sizing: border-box;
  border-radius: 4px;
  min-width: 200px;
  position: relative;
  &:first-child {
    margin-top: 10px;
  }
  .upload-list-thumbnail {
    vertical-align: middle;
    display: inline-block;
    width: 70px;
    height: 70px;
    position: relative;
    z-index: 1;
    background-color: #fff;
    object-fit: cover;
  }
  .file-icon {
    svg {
      margin-right: 5px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  .filename {
    margin-left: 5px;
    margin-right: 40px;
  }
  &.upload-error {
    color: #f5222d;
    svg {
      color: #f5222d;
    }
  }
  .file-status {
    display: block;
    position: absolute;
    right: 5px;
    top: 0;
    line-height: inherit;
  }
  .delete-icon {
    display: none;
    position: absolute;
    right: 7px;
    top: 0;
    line-height: inherit;
    cursor: pointer;
  }
  &:hover {
    background-color: #efefef;
    .file-status {
      display: none;
    }
    .delete-icon {
      display: block;
    }
  }
}
</style>
