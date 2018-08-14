import request from '@/utils/request'

export function fetchVpnServerList(query) {
  return request({
    url: '/vpnServer/list.do',
    method: 'get',
    params: query
  })
}

export function fetchVpnServer(id) {
  return request({
    url: '/vpnServer/detail.do',
    method: 'get',
    params: { id }
  })
}

export function createVpnServer(data) {
  return request({
    url: '/vpnServer/create.do',
    method: 'post',
    data
  })
}

export function updateVpnServer(data) {
  return request({
    url: '/vpnServer/update.do',
    method: 'post',
    data
  })
}

export function updateVpnServerState(data) {
  return request({
    url: '/vpnServer/updateState.do',
    method: 'post',
    data
  })
}
