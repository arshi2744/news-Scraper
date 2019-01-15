var mongoose = require("mongoose");

var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({

  headline: String,

  summary: String,

  url: String,

  comment: [
      {
      type: Schema.Types.ObjectId,
      ref: "Comment"
      }
  ]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Note model
module.exports = Article;