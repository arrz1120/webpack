import Promise from 'promise-polyfill';

export default function(dom,render=true){
  let els=`${dom},${dom} [data-bg]`;
  dom=[].slice.call(document.querySelectorAll(els));
  dom=dom.filter((item,i)=>{
    return item.getAttribute('data-bg')!=null;
  })
  let count=0;
  let len=dom.length;
  return new Promise((resolve,reject)=>{
    dom.forEach((item,i)=>{
      let img=new Image();
      let url=item.getAttribute('data-bg');
      img.src=url;
      img.onload=()=>{
        count++;
        if(render){
          item.style.backgroundImage=`url(${url})`;
        }
        if(count===len){
          resolve(dom)
        }
      };
      img.onerror=()=>{
        console.log(`加载 ${url} 失败`);
        reject();
      }
    })
  })
}