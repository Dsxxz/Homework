import {NextFunction, Request, Response} from "express";
const {validationResult} = require('express-validator');


export const myValidationResult = validationResult.withDefaults({
    formatter: (error:any) => {
        return { message: error.msg, field: error.param };
    }
})
export const inputBlogsAndPostsValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResult(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else next();
})
export const inputUsersValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResult(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else next();
})