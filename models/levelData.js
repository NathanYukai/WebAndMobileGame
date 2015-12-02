var mongoose = require('mongoose');


var Schema = mongoose.Schema;
var levelData = new Schema({
        id: {type: Number,index: { unique: true } },
        creator: String,
        data: Object
      }, {
        collection: 'levelData'
      }
);

var levelData = mongoose.model('levelData', levelData);

exports.levelData = levelData;
