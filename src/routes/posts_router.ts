import {Request, Response, Router} from "express";
import {inputBlogsAndPostsValidation} from "../MiddleWares/validation-middleware"
import {
    postBlogIDValidation, postBlogIDValidator,
    postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation
} from "../MiddleWares/input-post-validation"
import {basicAuth} from "../MiddleWares/autorization";
import {postsService} from "../service/post-service";
import {commentsQueryService, postQueryService} from "../service/query-service";
import {PostType} from "../models/posts-types";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {paginationType, QueryInputBlogAndPostType, QueryInputCommentsType} from "../models/query_input_models";
import {CommentsViewType} from "../models/comments-types";
import {CommentInputValidation} from "../MiddleWares/input-comment-pagination";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
export const postsRouter=Router({});


postsRouter.get('/', async (req:Request<{},{},{},QueryInputBlogAndPostType>,res:Response)=>{
    try{
        const { pageNumber=1, pageSize=10, sortBy, sortDirection} = req.query;

        const posts: Array<PostType> = await postQueryService.findPostsByQuerySort( sortBy?.toString(),
            sortDirection?.toString(),+pageNumber?.toString(),+pageSize?.toString())
        const paginator:paginationType = await postQueryService.paginationPage(+pageNumber,+pageSize)
        res.status(200).send({
            "pagesCount": paginator.pagesCount,
            "page": +pageNumber,
            "pageSize": +pageSize,
            "totalCount": paginator.totalCount,
            "items": posts
        })
    }
    catch (e){
        res.sendStatus(404)
    }
})
postsRouter.get('/:id',async (req,res)=>{
    let foundPostById = await postsService.findPostById(req.params.id)
    if(foundPostById){
        res.status(200).send(foundPostById)
    }
    else{
        res.sendStatus(404)
    }
})
postsRouter.post('/',basicAuth,postTitleValidation,postShortDescriptionValidation,postContentValidation,
    postBlogIDValidation,postBlogIDValidator, inputBlogsAndPostsValidation,async (req, res)=>{
        let newPost = await  postsService.createNewPost(req.body.title, req.body.shortDescription,
            req.body.content, req.body.blogId)

        if(newPost) {
            res.status(201).send(newPost);
        }
        else{
            res.sendStatus(400);
        }
    })
postsRouter.post('/:id/comments',CommentInputValidation,authMiddleWare,async (req, res)=>{

        const newComment:CommentsViewType|null = await  commentsRepository.createComment(req.body.content,req.user!._id,req.params.id)
        if(newComment) {
            res.status(201).send(newComment);
        }
        else{
            res.sendStatus(404);
        }
    })
postsRouter.get('/:id/comments',async (req:Request<{},{},{},QueryInputCommentsType>,res:Response)=>{
    try{
        const { pageNumber=1, pageSize=10, sortBy, sortDirection} = req.query;
        const comments:Array<CommentsViewType> = await  commentsQueryService.getCommentsForPost( sortBy?.toString(),
            sortDirection?.toString(),pageNumber?.toString(),+pageSize?.toString())

        const paginator:paginationType = await commentsQueryService.paginationPage(+pageNumber,+pageSize)
        res.status(201).send({
            "pagesCount": paginator.pagesCount,
            "page": +pageNumber,
            "pageSize": +pageSize,
            "totalCount": paginator.totalCount,
            "items": comments
        })
    }
    catch (e){
        res.sendStatus(404)
    }
})
postsRouter.put('/:id',basicAuth,postShortDescriptionValidation,postTitleValidation,postContentValidation,
    postBlogIDValidation, postBlogIDValidator, inputBlogsAndPostsValidation,async (req, res)=> {
        let findPostById = await postsService.updatePost(req.params.id, req.body.title, req.body.shortDescription,
            req.body.content, req.body.blogId)
        if (findPostById) {
            res.sendStatus(204)
        }
        else{
            res.sendStatus(404)
        }
    })
postsRouter.delete('/:id',basicAuth, async (req,res)=>{
    let foundPostById = await postsService.deletePost(req.params.id)
    if(foundPostById){
        res.sendStatus(204)
    }
    else{
        res.sendStatus(404)
    }
})
