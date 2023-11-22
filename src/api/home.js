import request from '@/utils/request'

//获取首页数据接口
export function getData(params){
    return request({
        url:'/home',
        method:'get',
        params
    })
}