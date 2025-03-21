// till now we were sending direct response as - something wen wrong throgh but now 
// we will be creating custom error class where we can send our error with status codes and msgs 
class ExpressError extends Error{
    constructor(statusCode,message){
        super();
        this.statusCode = statusCode;
        this.message = message;

    }
}
module.exports= ExpressError;