if (process.env.NODE_ENV !== 'production'){
    const dotenv=require('dotenv')
    dotenv.config()
    dotenv.parse}
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressLayouts= require('express-ejs-layouts')
const methodOverride = require('method-override')
const indexRouter = require('./routes/index')
const productsRouter = require('./routes/products')
const cartRouter = require('./routes/cart')
const ordersRouter = require('./routes/orders')

const app = express()


mongoose.connect(process.env.DATABASE_URL)
const db=mongoose.connection
db.on('error', error => console.log('perdeu'))
db.once('open', () => console.log('connected to Mongoose'))

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(methodOverride('_method'))

app.use('/', indexRouter)
app.use('/products', productsRouter)
app.use('/cart', cartRouter)
app.use('/orders', ordersRouter)
app.use(methodOverride('_method'));


app.listen(process.env.PORT || 3000)

