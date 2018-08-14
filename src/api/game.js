import request from '@/utils/request'

export function fetchGameList(query) {
  return request({
    url: '/game/list.do',
    method: 'get',
    params: query
  })
}

export function fetchGame(id) {
  return request({
    url: '/game/detail.do',
    method: 'get',
    params: { id }
  })
}

export function createGame(data) {
  return request({
    url: '/game/create.do',
    method: 'post',
    data
  })
}

export function updateGame(data) {
  return request({
    url: '/game/update.do',
    method: 'post',
    data
  })
}

export function updateGameState(data) {
  return request({
    url: '/game/updateState.do',
    method: 'post',
    data
  })
}
