const fs=require('fs')
const path=require('path')

let config={}
let entryPath='./src/entry'
let entryBasePath=path.resolve(entryPath,'base')
let viewsPath='./src'
let isFile=path=>{
  return fs.statSync(path).isFile()
}
let isDir=path=>{
  return fs.statSync(path).isDirectory()
}

let setEntry=()=>{
  let result={
    // base:[]
  }
  fs.readdirSync(entryPath).forEach((item,i)=>{
    let itemPath=path.resolve(entryPath,item)
    if(!isFile(itemPath)) return
    let pathParse=path.parse(itemPath)
    if(pathParse.ext!=='.js') return
    if(pathParse.name==='base'){
      throw new Error('入口文件包含: base.js ( 与公用入口命名 base 冲突 )')
    }
    result[pathParse.name]=itemPath
  })
  // if(!fs.existsSync(entryBasePath)) return
  // fs.readdirSync(entryBasePath).forEach((item,i)=>{
  //   let itemPath=path.resolve(entryBasePath,item)
  //   if(!isFile(itemPath)) return 
  //   result.base.push(itemPath)
  // })
  return result
}

config.entry=setEntry()

let setPages=()=>{
  let result=[]
  fs.readdirSync(viewsPath).forEach((item,i)=>{
    let itemPath=path.resolve(viewsPath,item)
    if(!isFile(itemPath)) return
    let pathParse=path.parse(itemPath)
    if(pathParse.ext!=='.html') return
    let pageConf={
      tmpl:item,
      scripts:['base']
    }
    if(config.entry[pathParse.name]){
      pageConf.scripts.push(pathParse.name)
    }
    result.push(pageConf)
  })
  return result
}

config.pages=setPages()

module.exports=config



