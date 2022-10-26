const{cleareHash}=require('../services/cache')
module.exports=async(req,res,next)=>{
    console.log('1')
    await next()
    cleareHash(req.user.id)
}