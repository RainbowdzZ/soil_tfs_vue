import request from '@/utils/request'
// 新增检测记录
export function addCheckup(data) {
  return request({
    url: '/tfs/checkup',
    method: 'post',
    data: data
  })
}
