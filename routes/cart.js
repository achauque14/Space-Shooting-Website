require('dotenv').config();

const express = require('express');
const router = express.Router();
const Product = require('../models/products');
const paypal = require('@paypal/checkout-server-sdk');

const Environment = process.env.NODE_ENV === 'production' 
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET));
let cartItems = []; 

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: cartItems.map(item => item.productId) } });
        const cart = cartItems.map(item => {
            const product = products.find(p => p._id.toString() === item.productId);
            return {
                ...product.toObject(),
                quantity: item.quantity
            };
        });
        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

        res.render('cart/cart', { cart, total });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/pay', (req, res) => {
    res.render('cart/pay', {
        paypalClientId: process.env.PAYPAL_CLIENT_ID,
    });
});

router.post('/create-order', async (req, res) => {
    try {
        const productIds = req.body.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        const total = req.body.items.reduce((sum, item) => {
            const product = products.find(p => p._id.toString() === item.productId);
            return sum + product.price * item.quantity;
        }, 0);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'EUR',
                        value: total.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: 'EUR',
                                value: total.toFixed(2)
                            }
                        }
                    },
                    items: req.body.items.map(item => {
                        const product = products.find(p => p._id.toString() === item.productId);
                        return {
                            name: product.name,
                            unit_amount: {
                                currency_code: 'EUR',
                                value: product.price.toFixed(2)
                            },
                            quantity: item.quantity
                        };
                    })
                }
            ]
        });

        const order = await paypalClient.execute(request);
        console.log(order);
        res.json({ id: order.result.id });
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
});

router.post('/:id/add', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        const index = cartItems.findIndex(item => item.productId === req.params.id);
        if (index !== -1) {
            cartItems[index].quantity++;
        } else {
            cartItems.push({ productId: product._id.toString(), quantity: 1 });
        }
        
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/:id/remove', (req, res) => {
    cartItems = cartItems.filter(item => item.productId !== req.params.id);
    res.redirect('/cart');
});

router.post('/:id/increase', (req, res) => {
    const index = cartItems.findIndex(item => item.productId === req.params.id);
    if (index !== -1) {
        cartItems[index].quantity++;
    }
    res.redirect('/cart');
});

router.post('/:id/decrease', (req, res) => {
    const index = cartItems.findIndex(item => item.productId === req.params.id);
    if (index !== -1) {
        if (cartItems[index].quantity > 1) {
            cartItems[index].quantity--;
        } else {
            cartItems = cartItems.filter(item => item.productId !== req.params.id);
        }
    }
    res.redirect('/cart');
});

module.exports = router;
