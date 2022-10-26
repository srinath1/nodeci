const mongoose=require('mongoose')
const Redis = require("ioredis");
//  const keys=require('../config/keys')
const redis = new Redis();

const{cleareHash}=require('../services/cache')
const exec=mongoose.Query.prototype.exec
mongoose.Query.prototype.cache=function(options={}){
    
    
    this.useCache=true;
    this.hashKey=JSON.stringify(options.key || "")
    return this
}
mongoose.Query.prototype.exec=async function(){  
   if(!this.useCache){
    return exec.apply(this,arguments)
   }
    
    const key=JSON.stringify(Object.assign({},this.getQuery(),{
        collection:this.mongooseCollection.name
    }))
    let cacheValue=""
    await redis.hget(this.hashKey,key).then((result) => {
        console.log('This.hashkey=>',this.hashKey)
        cacheValue=result               
              })
            if(cacheValue){    
                console.log('CC=>',cacheValue)
           
              const doc=JSON.parse(cacheValue)
            return  Array.isArray(doc)?doc.map(d=>new this.model(d)):new this.model(doc)
            }         
         
    
        const result=await exec.apply(this,arguments)
    redis.hset(this.hashKey,key,JSON.stringify(result),'EX',10)
    return result

    
}

module.exports={
    cleareHash(hashKey){
        redis.del(JSON.stringify(hashKey))

    }
}