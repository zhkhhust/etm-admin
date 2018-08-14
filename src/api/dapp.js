import request from '@/utils/request'

export function fetchDappList(query) {
  return request({
    url: '/dapp/getList.do',
    method: 'get',
    params: query
  })
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
