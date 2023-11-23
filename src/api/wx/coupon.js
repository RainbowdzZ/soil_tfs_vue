import request from '@/utils/request'

// 查询优惠券列表
export function listCoupon(query) {
  return request({
    url: '/wx/coupon/list',
    method: 'get',
    params: query
  })
}

// 查询可发放的优惠券列表
export function issuesListCoupon() {
  return request({
    url: '/wx/coupon/issuesList',
    method: 'get',
  })
}

// 查询优惠券详细
export function getCoupon(id) {
  return request({
    url: '/wx/coupon/' + id,
    method: 'get'
  })
}

// 新增优惠券
export function addCoupon(data) {
  return request({
    url: '/wx/coupon',
    method: 'post',
    data: data
  })
}

// 修改优惠券
export function updateCoupon(data) {
  return request({
    url: '/wx/coupon',
    method: 'put',
    data: data
  })
}

// 删除优惠券
export function delCoupon(id) {
  return request({
    url: '/wx/coupon/' + id,
    method: 'delete'
  })
}
//发放优惠券
export function sendCoupon(id) {
  return request({
    url: '/wx/coupon/'+ id+'/issue',
    method: 'put',
  })

}
//暂停发放优惠劵
export function stopCoupon(id) {
  return request({
    url: '/wx/coupon/'+ id+'/stop',
    method: 'put',
  })

}

