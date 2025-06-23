import { mount, shallowMount, type VueWrapper } from '@vue/test-utils'
import Uploader from '@/components/Uploader.vue'
import { beforeAll, afterEach, describe, expect, it, vi, type Mocked } from 'vitest'
import axios from 'axios'
import flushPromises from 'flush-promises'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

let wrapper: VueWrapper<any>

const mockComponent = {
  template: '<div><slot></slot></div>',
}

const mockComponents = {
  DeleteOutlined: mockComponent,
  LoadingOutlined: mockComponent,
  FileOutlined: mockComponent,
}

const testFile = new File(['xyz'], 'test.png', { type: 'image/png' })

const setInputValue = (input: HTMLInputElement, file = testFile) => {
  const files = [file] as any
  Object.defineProperty(input, 'files', {
    value: files,
    writable: false,
  })
}

describe('Uploader Component', () => {
  beforeAll(() => {
    wrapper = shallowMount(Uploader, {
      props: {
        action: 'test.url',
      },
      global: {
        stubs: mockComponents,
      },
    })
  })

  it('basic layout before uploading', () => {
    expect(wrapper.find('button').exists()).toBeTruthy()
    expect(wrapper.get('button').text()).toBe('点击上传')
    expect(wrapper.get('input').isVisible()).toBeFalsy()
  })

  it('upload process should works fine', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 'success' })
    const fileInput = wrapper.get('input').element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get('input').trigger('change')
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button').text()).toBe('正在上传')
    expect(wrapper.get('button').attributes()).toHaveProperty('diabled')

    expect(wrapper.findAll('li').length).toBe(1)
    const firstItem = wrapper.get('li:first-child')
    expect(firstItem.classes()).toContain('upload-loading')

    await flushPromises()

    expect(wrapper.get('button').text()).toBe('点击上传')
    expect(firstItem.classes()).toContain('upload-success')
    expect(firstItem.get('.filename').text()).toBe(testFile.name)
  })

  it('should return error text when post is rejected', async () => {
    mockedAxios.post.mockRejectedValueOnce({ error: 'error' })
    await wrapper.get('input').trigger('change')
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button').text()).toBe('正在上传')

    await flushPromises

    expect(wrapper.get('button').text()).toBe('点击上传')
    expect(wrapper.findAll('li').length).toBe(2)
    const lastItem = wrapper.get('li:last-child')
    expect(lastItem.classes()).toContain('upload-error')

    await lastItem.get('.delete-icon').trigger('click')
    expect(wrapper.findAll('li').length).toBe(1)
  })

  it('should show the correct interface when using custom slot', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'dummy.url' } })
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'xyz.url' } })
    const wrapper = mount(Uploader, {
      props: {
        action: 'test.url',
      },
      slots: {
        default: '<button>Custom button</button>',
        loading: '<div class="loading">custom loading</div>',
        uploaded: `<template #uploaded="{ uploadedData }">
          <div class="custom-loaded">{{uploadedData.url}}</div>
        </template>`,
      },
      global: {
        stubs: mockComponents,
      },
    })
    expect(wrapper.get('button').text()).toBe('Custom button')
    const fileInput = wrapper.get('input').element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get('input').trigger('change')
    expect(wrapper.get('.loading').text()).toBe('custom loading')
    await flushPromises()
    expect(wrapper.get('.custom-loaded').text()).toBe('dummy.url')
    await wrapper.get('input').trigger('change')
    expect(wrapper.get('.loading').text()).toBe('custom loading')
    await flushPromises()
    expect(wrapper.get('.custom-loaded').text()).toBe('xyz.url')
  })

  it('before upload check', async () => {
    const callback = vi.fn()
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'dummy.url' } })
    const checkFileSize = (file: File) => {
      if (file.size > 2) {
        callback()
        return false
      }
      return true
    }
    const wrapper = shallowMount(Uploader, {
      props: {
        action: 'test.url',
        beforeUpload: checkFileSize,
      },
    })
    const fileInput = wrapper.get('input').element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get('input').trigger('change')
    expect(mockedAxios.post).not.toHaveBeenCalled()
    expect(wrapper.findAll('li').length).toBe(0)
    expect(callback).toHaveBeenCalled()
  })

  it('before upload check using Promise', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'dummy.url' } })
    const failedPromise = () => {
      return Promise.reject('wrong type')
    }
    const successPromise = (file: File) => {
      const newFile = new File([file], 'new_name.docx', { type: file.type })
      return Promise.resolve(newFile)
    }

    const successPromiseWithWrongType = () => {
      return Promise.resolve('abcd')
    }

    const wrapper = shallowMount(Uploader, {
      props: {
        action: 'test.url',
        beforeUpload: failedPromise,
      },
    })
    const fileInput = wrapper.get('input').element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get('input').trigger('change')
    await flushPromises()
    expect(mockedAxios.post).not.toHaveBeenCalled()
    expect(wrapper.findAll('li').length).toBe(0)
    // success promise with wrong file
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await wrapper.setProps({ beforeUpload: successPromiseWithWrongType })
    await wrapper.get('input').trigger('change')
    await flushPromises()
    expect(mockedAxios.post).not.toHaveBeenCalled()
    expect(wrapper.findAll('li').length).toBe(0)
    // success promise with file
    await wrapper.setProps({ beforeUpload: successPromise })
    await wrapper.get('input').trigger('change')
    await flushPromises()
    expect(mockedAxios.post).toHaveBeenCalled()
    const firstItem = wrapper.get('li:first-child')
    expect(firstItem.classes()).toContain('upload-success')
    expect(firstItem.get('.filename').text()).toBe('new_name.docx')
  })

  it('testing drag and drop function', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'dummy.url' } })
    const wrapper = shallowMount(Uploader, {
      props: {
        action: 'test.url',
        drag: true,
      },
    })
    const uploadArea = wrapper.get('.upload-area')
    await uploadArea.trigger('dragover')
    expect(uploadArea.classes()).toContain('is-dragover')
    await uploadArea.trigger('dragleave')
    expect(uploadArea.classes()).not.toContain('is-dragover')
    await uploadArea.trigger('drop', { dataTransfer: { files: [testFile] } })
    expect(mockedAxios.post).toHaveBeenCalled()
    await flushPromises()
    expect(wrapper.findAll('li').length).toBe(1)
  })
  it('testing manual upload process', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'dummy.url' } })
    const wrapper = shallowMount(Uploader, {
      props: {
        action: 'test.url',
        drag: true,
        autoUpload: false,
      },
    })
    const fileInput = wrapper.get('input').element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get('input').trigger('change')
    expect(wrapper.findAll('li').length).toBe(1)
    const firstItem = wrapper.get('li:first-child')
    expect(firstItem.classes()).toContain('upload-ready')
    wrapper.vm.uploadFiles()
    expect(mockedAxios.post).toHaveBeenCalled()
    await flushPromises()
    expect(firstItem.classes()).toContain('upload-success')
  })

  it('PictureList mode should works fine', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: 'dummy.url' } })
    window.URL.createObjectURL = vi.fn(() => {
      return 'test.url'
    })
    const wrapper = mount(Uploader, {
      props: {
        action: 'test.url',
        listType: 'picture',
      },
    })
    expect(wrapper.get('ul').classes()).toContain('upload-list-picture')
    const fileInput = wrapper.get('input').element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get('input').trigger('change')
    await flushPromises()
    expect(wrapper.findAll('li').length).toBe(1)
    expect(wrapper.find('li:first-child img').exists()).toBeTruthy()
    const firstImg = wrapper.get('li:first-child img')
    expect(firstImg.attributes('src')).toEqual('test.url')
  })

  afterEach(() => {
    mockedAxios.post.mockReset()
  })
})
