import request from '@/utils/request'

export function fetchMemberList(query) {
  return request({
    url: '/member/getList.do',
    method: 'get',
    params: query
  })
}

export function fetchMember(id) {
  return request({
    url: '/member/detail.do',
    method: 'get',
    params: { id }
  })
}

export function createMember(data) {
  return request({
    url: '/member/create.do',
    method: 'post',
    params: data
  })
}

export function updateMember(data) {
  return request({
    url: '/member/update.do',
    method: 'post',
    params: data
  })
}

export function updateMemberState(data) {
  return request({
    url: '/member/updateState.do',
    method: 'post',
    params: data
  })
}
