import jsonp from 'jsonp'

let shareConf={
  originUrl:window.location.href.split('#')[0],
  tokenUrl: 'https://m.tuandai.com',
  shareUrl:'https://m.tuandai.com',
  title:'团贷网',
  content:'团贷网活动',
  icon:'https://m.tuandai.com/imgs/sharelogo.png',
  isHideShare:false,
  isHideOptionMenu:false,
  debug:false,
  callback:null
}

let reqApi=(()=>{
  return `${shareConf.tokenUrl}/ajaxCross/WXTokenAjax.ashx?url=${encodeURIComponent(shareConf.originUrl)}&r=${Math.random()}`
})()

let reqApiCallback=res=>{
  let mainShareList=[
    'onMenuShareAppMessage',
    'onMenuShareTimeline',
    'onMenuShareQQ',
    'onMenuShareQZone',
  ]
  let mainMenuList=[
    'menuItem:share:appMessage',
    'menuItem:share:timeline', 
    'menuItem:share:qq',
    'menuItem:share:QZone',
    'menuItem:copyUrl'
  ]
  wx.config({
    debug:shareConf.debug,
    appId:res.appid,
    timestamp: res.timeStamp,
    nonceStr: res.nonceStr,
    signature: res.signature,
    jsApiList:mainShareList.concat(
      'showMenuItems',
      'hideMenuItems',
      'showOptionMenu',
      'hideOptionMenu'
    )
  })
  wx.ready(()=>{
    if(shareConf.isHideOptionMenu){
      // 隐藏右上角菜单
      wx.hideOptionMenu()
      return
    }
    if(shareConf.isHideShare){
      // 隐藏分享按钮
      wx.hideMenuItems({
        menuList:mainMenuList
      })
      return
    }
    wx.showMenuItems({
      menuList:mainMenuList
    })
    mainShareList.forEach(item=>{
      wx[item]({
        title:shareConf.title,
        desc:shareConf.content,
        link:shareConf.shareUrl,
        imgUrl:shareConf.icon,
        success(){
          shareConf.callback&&shareConf.callback('onComplete')
        },
        cancel(){
          shareConf.callback&&shareConf.callback('onCancel')
        }
      })
    })
  })
  wx.error(err=>{
    console.log(err)
  })
}

let wxShare=(conf={})=>{
  for(let i in conf){
    shareConf[i]=conf[i]
  }
  jsonp(reqApi,null,(err,res)=>{
    if(err){
      console.log(err)
      return
    }
    reqApiCallback(res)
  })
}

export default wxShare



