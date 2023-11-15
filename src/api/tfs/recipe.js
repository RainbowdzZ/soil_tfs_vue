import request from '@/utils/request'

// 查询专家配方列表
// export function listRecipe(query) {
//   return request({
//     url: '/tfs/recipe/list',
//     method: 'get',
//     params: query
//   })
// }
//引入订单的
// 查询待配方的订单管理列表
export function listRecipe(query) {
  return request({
    url: '/tfs/recipe/list',
    method: 'get',
    params: query
  })
}

// 查询专家配方详细
export function getRecipe(id) {
  return request({
    url: '/tfs/recipe/' + id,
    method: 'get'
  })
}

// 新增专家配方
export function addRecipe(data) {
  return request({
    url: '/tfs/recipe',
    method: 'post',
    data: data
  })
}

// 修改专家配方
export function updateRecipe(data) {
  return request({
    url: '/tfs/recipe',
    method: 'put',
    data: data
  })
}
// 修改订单状态
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


// 删除专家配方
export function delRecipe(id) {
  return request({
    url: '/tfs/recipe/' + id,
    method: 'delete'
  })
}

export function expertLook(id) {
  return request({
    url: '/tfs/recipe/order/'+id,
    method: 'get',

  })
}
