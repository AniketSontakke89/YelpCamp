module.exports = func =>{
    return (req,res,next)=>{
        func(req,res,next).catch(next); //in express the function inside catch method will be passed the error value even if we don't define it
    }
}