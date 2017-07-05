const mongoose = require('mongoose');
const Schema = mongoose.Schema;

delete mongoose.models.Album;
delete mongoose.modelSchemas.Album;

// create a schema
const AlbumSchema = new Schema({
  name: { type: String, maxlength: 255 },
  price: Number
},
  {
    timestamps: true
  });
//create a model from schema
module.exports = mongoose.model('Album', AlbumSchema);
