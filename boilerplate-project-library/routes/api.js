

'use strict';
let mongodb = require('mongodb')
let mongoose = require('mongoose')





module.exports = function (app) {

 let uri = 'mongodb+srv://abdel:' + process.env.PW + '@cluster0.yi6md.mongodb.net/personnallibrary'
  
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  let bookSchema = new mongoose.Schema({
    title: {type: String, required: true},
    comments:[String]
  })

  let Book = mongoose.model('Book', bookSchema)

    app.route('/api/books')
      .get(function (req, res){
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        let arrayOfBooks = []
        Book.find(
          {},
          (error, results) => {
            if(!error && results){
              results.forEach((result) => {
                let book = result.toJSON()
                book['commentcount'] = book.comments.length
                arrayOfBooks.push(book)
              })
              return res.json(arrayOfBooks)
            }
          }
        )
      })
    
    .post(function (req, res){
      let title = req.body.title;
      if(!title){
        return res.json('missing required field title')
      }
      let newBook = new Book({
          title: title,
          comments: []
        })
        newBook.save((error, savedBook) => {
          if(!error && savedBook){
            return res.json(savedBook)
          }
        })
      //response will contain new book object including atleast _id and title
    })
   
      .delete(function(req, res){
      //if successful response will be 'complete delete successful'
			Book.remove(
				{},
				(error, jsonStatus) => {
					if(!error && jsonStatus){
						return res.json('complete delete successful')
					}
				}
			)
    });



     app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
			Book.findById(
				bookid,
				(error, result) => {
					if(!error && result){
						return res.json(result)
					}else if(!result){
						return res.json('no book exists')
					}
				}
			)
    })

     .post((req, res) => {
      let bookId = req.params.id;
      let comment = req.body.comment;
      if (!comment) return res.json("missing required field comment");

      Book.findByIdAndUpdate(
        bookId,
        { $push: { comments: comment }, $inc: { commentcount: 1 } },
        { new: true }, 
        (error, updatedBook) => {
          if (error) return res.json("no book exists");

          if (!updatedBook) return res.json("no book exists");
          else return res.json(updatedBook);
        }
      );
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
			Book.findByIdAndRemove(
				bookid,
				(error, deletedBook) => {
					if(!error && deletedBook){
						return res.json('delete successful')
					}else if(!deletedBook){
						return res.json('no book exists')
					}
				}
			)
    });
  
};
