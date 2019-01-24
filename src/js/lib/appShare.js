let appShare=(()=>{
  let domCover=null
  let ua=navigator.userAgent.toLowerCase()
  let platform={
    wx:(()=>{
      return ua.match(/MicroMessenger/i)=='micromessenger'
    })(),
    app:(()=>{
      if(!window.Jsbridge){
        throw new Error('没有引入 JSBridge.js')
      }
      return Jsbridge.isApp()
    })(),
    android:(()=>{
      return /android|adr/gi.test(ua)
    })(),
    ios:(()=>{
      return /iphone|ipod|ipad/gi.test(ua)&&!/android|adr/gi.test(ua)
    })(),
    pc:(()=>{
      return !/iphone|ipod|ipad/gi.test(ua)&&!/android|adr/gi.test(ua)
    })()
  }
  let shareList=[
    {key:1,val:'微信'},
    {key:5,val:'朋友圈'},
    {key:4,val:'QQ'},
    {key:6,val:'QQ空间'},
    {key:3,val:'微博'},
    // {key:2,val:'短信'},
    // {key:9,val:'一键分享'},
    // {key:7,val:'二维码'},
    {key:8,val:'复制链接'},
  ]
  let computedShareList=[]
  let computedState={}
  let set=({icon,title,content,shareUrl,shortUrl,cover,callback})=>{
    computedShareList=shareList.map((item)=>{
      let shareContent=(()=>{
        if(item.key===3||item.key===5){
          return title
        }
        return content
      })()
      let zShareUrl=(()=>{
        if(item.key===2||item.key===9){
          return shortUrl||shareUrl
        }
        return shareUrl
      })()
      return {
        ShareToolType:item.key,
        ShareToolName:item.val,
        IconUrl:icon,
        Title:title,
        ShareContent:shareContent,
        ShareUrl:zShareUrl,
        IsEnabled:true
      }
    })
    computedState={icon,title,content,shareUrl,shortUrl,cover,callback}
  }
  let fromApp=()=>{
    let {callback}=computedState
    Jsbridge.toAppWebViewShare({
      shareTypeList:computedShareList
    },status=>{
      /*
      @param status {String}
      'onCancel':分享失败
      'onComplete':分享成功
      'onCancel':分享取消
      */
      let formatData=(()=>{
        if(platform.android){
          return JSON.parse(status).ShareResult
        }
        if(platform.ios){
          return status
        }
        return status
      })()
      callback&&callback(formatData)
    })
  }
  let fromWX=()=>{
    if(domCover) return
    let formatCSS=(()=>{
      if(computedState.cover.style==null){
        return ''
      }
      let result=''
      try {
        for(let i in computedState.cover.style){
          result+=`${i}:${computedState.cover.style[i]};`
        }
      } catch (err) {
        console.log(err)
        throw new Error('样式属性请用驼峰式')
      }
      return result
    })()
    let domCoverImg=document.createElement('img')
    domCoverImg.src=computedState.cover.src
    domCoverImg.style.cssText=`
      margin: 0 auto;
      position: relative;
      display: block;
      ${formatCSS}
    `
    domCover=document.createElement('section')
    domCover.style.cssText=`
      position: fixed;
      z-index: 100;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,.85);
      -webkit-transform:translateZ(1px);
      transform:translateZ(1px);
    `
    domCover.addEventListener('click',onDomCoverClk)
    domCover.appendChild(domCoverImg)
    document.body.appendChild(domCover)
  }
  let onDomCoverClk=function(){
    domCover.removeEventListener('click',onDomCoverClk)
    document.body.removeChild(domCover)
    domCover=null
    computedState.cover.callback&&computedState.cover.callback()
  }
  return {
    set,
    show(){
      if(platform.app){
        fromApp()
        return
      }
      if(platform.wx){
        fromWX()
        return
      }
      alert('打开app或微信即可分享')
    },
    hide(){
      onDomCoverClk()
    },
  }
})()

export default appShare