import request from '@/utils/request'

// 查询小程序轮播图列表
export function listLunbotu(query) {
  return request({
    url: '/wx/lunbotu/list',
    method: 'get',
    params: query
  })
}

// 查询小程序轮播图详细
export function getLunbotu(id) {
  return request({
    url: '/wx/lunbotu/' + id,
    method: 'get'
  })
}

// 新增小程序轮播图
export function addLunbotu(data) {
  return request({
    url: '/wx/lunbotu',
    method: 'post',
    data: data
  })
}

// 修改小程序轮播图
export function updateLunbotu(data) {
  return request({
    url: '/wx/lunbotu',
    method: 'put',
    data: data
  })
}

// 删除小程序轮播图
export function delLunbotu(id) {
  return request({
    url: '/wx/lunbotu/' + id,
    method: 'delete'
  })
}

export function pubLunbotu(id) {
  return request({
    url: '/wx/lunbotu/publish/' + id,
    method: 'post'
  })
}
