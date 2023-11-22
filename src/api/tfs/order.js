import request from '@/utils/request'

// 查询订单管理列表
export function listOrder(query) {
  return request({
    url: '/tfs/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单管理详细
export function getOrder(id) {
  return request({
    url: '/tfs/order/' + id,
    method: 'get'
  })
}
//修改订单状态
export function updateOrderStatus(orderId, status) {
  return request({
    url: '/tfs/order/updateStatus',
    method: 'put',
    params: {
      orderId: orderId,
      status: status
    }
  })
}

// 新增订单管理
export function addOrder(data) {
  return request({
    url: '/tfs/order',
    method: 'post',
    data: data
  })
}

// 修改订单管理
export function updateOrder(data) {
  return request({
    url: '/tfs/order',
    method: 'put',
    data: data
  })
}

// 删除订单管理
export function delOrder(id) {
  return request({
    url: '/tfs/order/' + id,
    method: 'delete'
  })
}

export function send() {
  return request({
    url: '/wx/sendCheckupMessage',
    method: 'post'
  })
}
