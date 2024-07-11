const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter a name"]
    },
    description: {
        type: String
    },
    image:{
        type: Buffer,
        required: true
    },
    imageType:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    }
});

productSchema.virtual('productImagePath').get(function(){
    if(this.image != null && this.imageType != null){
        return `data:${this.imageType}; charset=utf-8;base64,${this.image.toString('base64')}`
    }
})

module.exports = mongoose.model('Product', productSchema)