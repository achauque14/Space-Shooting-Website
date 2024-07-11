const express = require('express')
const router = express.Router()
const Product = require('../models/products')

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//All products Route
router.get('/', async (req,res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const products = await Product.find(searchOptions)
        res.render('products/index', { 
            products: products,
            searchOptions: req.query})
    }catch{
        res.redirect('/')
    }
})
 
//Create product route
router.post('/', async (req,res) =>{
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    })
    saveImage(product, req.body.image)
    try{
        const newProduct = await product.save()
        res.redirect(`products`)
    } catch{
        renderNewPage(res, product, true)
        }
    })

//New product route
router.get('/new', async (req,res) => {
    renderNewPage(res, new Product())
})

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('products/show', {
            product: product
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

async function renderNewPage(res,product, hasError = false){
    try{
        const products = await Product.find({})
        const params={
            product: product
        }
        if (hasError) params.errorMessage = 'Error Creating product'
        res.render('products/new', params)
    }catch{
        res.redirect('/')
    }
} 

function saveImage(product, imageEncoded){
    if(imageEncoded == null) return;
    const image = JSON.parse(imageEncoded)
    if(image != null && imageMimeTypes.includes(image.type)){
        product.image = new Buffer. from(image.data, 'base64')
        product.imageType= image.type
    }  
}

module.exports = router 