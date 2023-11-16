import request from '@/utils/request'

// 查询农场管理列表
export function listFarm(query) {
  return request({
    url: '/wx/farm/list',
    method: 'get',
    params: query
  })
}

// 查询农场管理详细
export function getFarm(id) {
  return request({
    url: '/wx/farm/' + id,
    method: 'get'
  })
}

// 新增农场管理
export function addFarm(data) {
  return request({
    url: '/wx/farm',
    method: 'post',
    data: data
  })
}

// 修改农场管理
export function updateFarm(data) {
  return request({
    url: '/wx/farm',
    method: 'put',
    data: data
  })
}

// 删除农场管理
export function delFarm(id) {
  return request({
    url: '/wx/farm/' + id,
    method: 'delete'
  })
}
