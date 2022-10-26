const json = require('body-parser/lib/types/json');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const { cleancache } = require('../middlewares/cleanCache');
const cleanCache = require('../middlewares/cleanCache');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    console.log('2')
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    // const {createClient}=require('redis')
    // const client = createClient();
    // await client.connect();
    // const cachedBlogs=await client.get(req.user.id)
    // if(cachedBlogs){
    //   console.log('parse',)
    //   return res.send(JSON.parse(cachedBlogs))
    // }
    // console.log('mongodb')
    const blogs = await Blog.find({ _user: req.user.id }).cache({key:req.user.id})
    
    // client.set(req.user.id,JSON.stringify(blogs))

    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin,cleanCache, async (req, res) => {
    console.log('2')
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
   
  });
};
