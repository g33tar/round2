var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/garage')
var cars = db.get('cars')

/* GET home page. */
router.get('/', function(req, res, next) {
  cars.find({}, function(err, docs){
    res.render('index', { cars: docs, title: 'My Garage' });
  })
});

router.get('/cars/new', function(req, res, next){
  res.render('new', {title:'New Page'})
})

router.post('/', function(req, res, next){
  var error = []
  if(!req.body.url){
    error.push('Car images cannot be blank. Please provide a url.')
  }
  if(!req.body.make){
    error.push('Please list a make for my car.')
  }
  if(!req.body.model){
    error.push('Please tell me what model my car is.')
  }
  if(!req.body.year){
    error.push('Please tell me what year my car was made in.')
  }
  if(error.length){
    res.render('new', {error: error})
  } else {
    req.body.comments = []
    cars.insert(
      req.body
    )
    res.redirect('/')
  }
})

router.get('/cars/:id/comments/:commentId', function(req, res, next){
  var a = req.url.split('/')
  var b = a.length -1
  cars.findOne({_id: req.params.id}, function(err, doc){
    var idFilter = doc.comments.filter(function(comment){
      return comment.commentId == a[b]
    })
    res.render('commentShow', {comments: idFilter[0], postId: doc._id})
  })
})

router.get('/cars/:id', function(req, res, next){
  cars.findOne({_id: req.params.id}, function(err, doc){
    res.render('show', {cars: doc})
  })
})

router.post('/cars/:id/comments', function(req,res,next){
  cars.findOne({_id: req.params.id}, function(err,doc){
    doc.comments.push(req.body);
    cars.update({_id: req.params.id}, doc, function(err,doc){
      res.redirect('/cars/' + req.params.id)
    })
  })
})

router.get('/cars/:id/edit', function(req, res, next){
  cars.findOne({_id: req.params.id}, function(err, doc){
    if(err) throw error
    res.render('edit', doc)
  })
})

router.post('/cars/:id/update', function(req, res, next){
  cars.findOne({_id: req.params.id}, function(err, doc){
    doc.url = req.body.url
    doc.make = req.body.make
    doc.model = req.body.model
    doc.year = req.body.year
    cars.update({_id: req.params.id}, doc, function(err, doc){
      if(err) throw err
    })
    res.redirect('/cars/' + req.params.id)
    })
  })

  router.post('/cars/:id/comments/delete', function(req,res,next){
    cars.findOne({_id: req.params.id}, function(err,doc){
      var index = doc.comments.indexOf(req.body.comment)
      doc.comments.splice(index,1);
      cars.update({_id: req.params.id}, doc, function(err, doc) {
        res.redirect('/cars/' + req.params.id)
      })
    })
  })


router.post('/cars/:id/delete', function(req, res, next){
  cars.remove({_id: req.params.id}, function(err, doc){
    if(err) throw err
    res.redirect('/')
  })
})

module.exports = router;
