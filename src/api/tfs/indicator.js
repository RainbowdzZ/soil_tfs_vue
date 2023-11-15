import request from '@/utils/request'

// 查询检测指标管理列表
export function listIndicator(query) {
  return request({
    url: '/tfs/indicator/list',
    method: 'get',
    params: query
  })
}
// 查询检测指标管理列表
export function listIndicator1(query) {
  return request({
    url: '/tfs/indicator/list/status',
    method: 'get',
    params: query
  })
}

// 查询检测指标管理详细
export function getIndicator(id) {
  return request({
    url: '/tfs/indicator/' + id,
    method: 'get'
  })
}

// 新增检测指标管理
export function addIndicator(data) {
  return request({
    url: '/tfs/indicator',
    method: 'post',
    data: data
  })
}

// 修改检测指标管理
export function updateIndicator(data) {
  return request({
    url: '/tfs/indicator',
    method: 'put',
    data: data
  })
}

// 删除检测指标管理
export function delIndicator(id) {
  return request({
    url: '/tfs/indicator/' + id,
    method: 'delete'
  })
}
