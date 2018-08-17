import request from '@/utils/request'

export function fetchDappList(query) {
  return request({
    url: '/dapp/getList.do',
    method: 'get',
    params: query
  })
}

export function fileUploadUrl() {
  // console.dir(request.defaults)
  return request.defaults.baseURL + '/dapp/upload.do'
  // return request.b
}

export function fetchDapp(id) {
  return request({
    url: '/dapp/detail.do',
    method: 'get',
    params: { id }
  })
}

export function createDapp(data) {
  return request({
    url: '/dapp/create.do',
    method: 'post',
    params: data
  })
}

export function updateDapp(data) {
  return request({
    url: '/dapp/update.do',
    method: 'post',
    params: data
  })
}

export function uploadFile(data) {
  return request.post('/dapp/upload.do', {
    // again the same meta data + the actual photo
    formData: {
      title: 'My cat is awesome',
      description: 'Sent on ' + new Date(),
      is_public: 1,
      files: data
    },
    json: true
  }, function(err, res, body) {
    if (err) {
      console.log(err)
    } else {
      console.log(res)
    }
    // assert.equal(typeof body, 'object')
  })
}

export function updateDappState(data) {
  return request({
    url: '/dapp/updateState.do',
    method: 'post',
    params: data
  })
}

export function registerDapp(data) {
  return request({
    url: '/dapp/register.do',
    method: 'post',
    params: data
  })
}
