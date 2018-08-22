import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/member/login.do',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function register(data) {
  return request({
    url: '/member/register.do',
    method: 'post',
    params: data
  })
}

export function getInfo(token) {
  return request({
    url: '/member/info.do',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/member/logout.do',
    method: 'post'
  })
}
