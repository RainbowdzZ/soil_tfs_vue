import request from '@/utils/request'

// 查询优惠券历史列表
export function listUsercoupon(query) {
  return request({
    url: '/wx/usercoupon/list',
    method: 'get',
    params: query
  })
}

// 查询优惠券历史详细
export function getUsercoupon(id) {
  return request({
    url: '/wx/usercoupon/' + id,
    method: 'get'
  })
}

// 新增优惠券历史
export function addUsercoupon(data) {
  return request({
    url: '/wx/usercoupon',
    method: 'post',
    data: data
  })
}

// 修改优惠券历史
export function updateUsercoupon(data) {
  return request({
    url: '/wx/usercoupon',
    method: 'put',
    data: data
  })
}

// 删除优惠券历史
export function delUsercoupon(id) {
  return request({
    url: '/wx/usercoupon/' + id,
    method: 'delete'
  })
}
