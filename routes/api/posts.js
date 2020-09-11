const express = require('express');
const router = new express.Router();
const { isAuth } = require('../../middleware/auth');
const Post = require('../../models/Post');
const { postValidators } = require('../../validators/posts');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const ExpressError = require('../../helpers/expressError');
const { validationResult } = require('express-validator');

//POST ROUTE api/posts
//Create a post

router.post('/', isAuth, postValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ExpressError(errors.array(), 400);
    }
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      first_name: user.first_name,
      last_name: user.last_name,
      zip_code: user.zip_code,
      avatar: user.avatar,
      user: req.user.id,
    });
    const post = await newPost.save();

    return res.json(post);
  } catch (e) {
    next(e);
  }
});

//GET ROUTE api/posts
//Get All post
router.get('/', isAuth, async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);
  } catch (e) {
    next(e);
  }
});

//GET ROUTE api/posts/:id
//Get post by id
router.get('/:id', isAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new ExpressError('Post not found', 404);
    }
    return res.json(post);
  } catch (e) {
    if (e.kind == 'ObjectId') {
      return res.status(404).json({ error: { msg: 'Post not found' } });
    }
    next(e);
  }
});

//DELETE ROUTE api/posts/:id
//Delete a post
router.delete('/:id', isAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      throw new ExpressError('Post not found', 401);
    }
    // Check user
    if (post.user.toString() !== req.user.id) {
      throw new ExpressError('User not authorized', 401);
    }

    await post.remove();

    return res.json({ msg: 'Post removed' });
  } catch (e) {
    if (e.kind == 'ObjectId') {
      return res.status(404).json({ error: { msg: 'Post not found' } });
    }
    next(e);
  }
});

//PATCH ROUTE api/posts/like/:id
//like a post

router.patch('/like/:id', isAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    //check to see if user already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      throw new ExpressError('Post already liked', 400);
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (e) {
    next(e);
  }
});

//PATCH ROUTE api/posts/unlike/:id
//unlike a post

router.patch('/unlike/:id', isAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    //check to see if user already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      throw new ExpressError('Post has not yet been liked', 400);
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    return res.json(post.likes);
  } catch (e) {
    next(e);
  }
});

//POST ROUTE api/posts/comment/:id
//Create a comment

router.post('/comment/:id', isAuth, postValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ExpressError(errors.array(), 400);
    }
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    const newComment = {
      text: req.body.text,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      user: req.user.id,
    };

    post.comments.unshift(newComment);
    await post.save();

    return res.json(post.comments);
  } catch (e) {
    next(e);
  }
});

//DELETE ROUTE api/posts/comment/:id/:comment_id
//Delete a comment

router.delete('/comment/:id/:comment_id', isAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    // pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //make sure comment exists
    if (!comment) {
      throw new ExpressError('Comment doesnt not exist', 404);
    }

    //check user

    if (comment.user.toString() !== req.user.id) {
      throw new ExpressError('User not authorized', 404);
    }
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    return res.json(post.comments);
  } catch (e) {
    next(e);
  }
});
module.exports = router;
