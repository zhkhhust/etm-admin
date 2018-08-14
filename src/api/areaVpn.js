import request from '@/utils/request'

export function fetchAreaVpnList(query) {
  return request({
    url: '/areaVpn/list.do',
    method: 'get',
    params: query
  })
}

export function fetchAreaVpn(id) {
  return request({
    url: '/areaVpn/detail.do',
    method: 'get',
    params: { id }
  })
}

export function createAreaVpn(data) {
  return request({
    url: '/areaVpn/create.do',
    method: 'post',
    data
  })
}

export function updateAreaVpn(data) {
  return request({
    url: '/areaVpn/update.do',
    method: 'post',
    data
  })
}

export function updateAreaVpnState(data) {
  return request({
    url: '/areaVpn/updateState.do',
    method: 'post',
    data
  })
}

