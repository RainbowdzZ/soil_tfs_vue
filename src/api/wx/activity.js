import request from '@/utils/request'

// 查询活动管理列表
export function listActivity(query) {
  return request({
    url: '/wx/activity/list',
    method: 'get',
    params: query
  })
}

// 查询活动管理详细
export function getActivity(id) {
  return request({
    url: '/wx/activity/' + id,
    method: 'get'
  })
}

// 新增活动管理
export function addActivity(data) {
  return request({
    url: '/wx/activity',
    method: 'post',
    data: data
  })
}

// 修改活动管理
export function updateActivity(data) {
  return request({
    url: '/wx/activity',
    method: 'put',
    data: data
  })
}

// 删除活动管理
export function delActivity(id) {
  return request({
    url: '/wx/activity/' + id,
    method: 'delete'
  })
}

export function pubActivity(id) {
  return request({
    url: '/wx/activity/publish/' + id,
    method: 'post'
  })
}
export function stopPubActivity(id) {
  return request({
    url: '/wx/activity/stopPublish/' + id,
    method: 'post'
  })
}
