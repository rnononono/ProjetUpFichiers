const mongoose = require('mongoose');


let imageSchema = mongoose.Schema({ 
    content: { type: String, required: true },
    created_at: {type: String}
});


module.exports = mongoose.model('Image', imageSchema);