import appShare from './appShare.js'
import wxShare from './wxShare.js'

let defaultShare={
  title:'标题',
  content:'内容',
  icon:'图标',
  shareUrl:window.location.href,
  cover:{
    src:'微信分享遮罩层',
    style:{
      width:'12rem',
      top:'1rem',
      left:'1rem'
    }
  }
}


export default {
  set(conf={}){
    for(let i in conf){
      defaultShare[i]=conf[i]
    }
    appShare.set(defaultShare)
    wxShare(defaultShare)
  },
  show(){
    appShare.show()
  }
}