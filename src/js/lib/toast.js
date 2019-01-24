;(()=>{
  let Toast=function(){
    return new Toast.prototype.init()
  }
  Toast.prototype={
    constructor:Toast,
    init:function(){
      this.timer=null
      this.isExisted=false
      this.DOMNode=document.createElement('p')
      this.DOMNode.style.cssText=`
        padding: 0.5rem;
        width: 9.75rem;
        position: fixed;
        z-index: 99;
        top: 50%;
        left: 50%;
        line-height: 1.25;
        border-radius: .25rem;
        background: rgba(0, 0, 0, .7);
        text-align: center;
        color: #fff;
        opacity: 0;
        font-size: .525rem;
        -webkit-transform: translate3d(-50%,-50%,1px);
        transform: translate3d(-50%,-50%,1px);
        -webkit-transition: .25s;
        transition: .25s;
      `
    },
    show(msg='',dur=2500,callback){
      this.DOMNode.innerHTML=msg
      if(!this.isExisted){
        document.body.appendChild(this.DOMNode)
        setTimeout(()=>{
          this.DOMNode.style.opacity=1
        },0)
      }
      clearTimeout(this.timer)
      this.timer=setTimeout(()=>{
        this.hide(callback)
      },dur)
      this.isExisted=true
    },
    hide(callback){
      if(!this.isExisted) return
      callback&&callback()
      clearTimeout(this.timer)
      this.DOMNode.style.opacity=0
      document.body.removeChild(this.DOMNode)
      this.isExisted=false
    }
  }
  Toast.prototype.init.prototype=Toast.prototype
  window.toast=Toast()
})();