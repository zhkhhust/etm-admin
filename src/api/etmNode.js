import request from '@/utils/request'

export function fetchNodeList(query) {
  return request({
    url: '/node/getList.do',
    method: 'get',
    params: query
  })
}

export function fetchNode(id) {
  return request({
    url: '/node/detail.do',
    method: 'get',
    params: { id }
  })
}

export function createNode(data) {
  return request({
    url: '/node/create.do',
    method: 'post',
    params: data
  })
}

export function updateNode(data) {
  return request({
    url: '/node/update.do',
    method: 'post',
    params: data
  })
}

export function updateNodeState(data) {
  return request({
    url: '/node/updateState.do',
    method: 'post',
    params: data
  })
}
