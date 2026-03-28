const express = require('express')
const router = express.Router()
const db = require('../db')
const authMiddleware = require('../middleware/auth')

// GET all products — public
router.get('/', (req, res) => {
    const products = db.readProducts()
    res.json(products)
})

// GET single product — public
router.get('/:id', (req, res) => {
    const product = db.getProductById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
})

// POST add product — admin only
router.post('/', authMiddleware, (req, res) => {
    const { name, category, price, originalPrice, stock, description, image } = req.body

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Name, price, category required' })
    }

    const product = db.addProduct({
        name,
        category,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice) || parseFloat(price),
        stock: parseInt(stock) || 0,
        description: description || '',
        image: image || '/images/default.jpg',
        rating: 4.0
    })

    res.status(201).json(product)
})

// PUT update product — admin only
router.put('/:id', authMiddleware, (req, res) => {
    const product = db.updateProduct(req.params.id, req.body)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
})

// PATCH update price only — admin only
router.patch('/:id/price', authMiddleware, (req, res) => {
    const { price } = req.body
    if (!price) return res.status(400).json({ error: 'Price required' })
    const product = db.updatePrice(req.params.id, price)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
})

// PATCH update stock only — admin only
router.patch('/:id/stock', authMiddleware, (req, res) => {
    const { stock } = req.body
    if (stock === undefined) return res.status(400).json({ error: 'Stock required' })
    const product = db.updateStock(req.params.id, stock)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
})

// DELETE product — admin only
router.delete('/:id', authMiddleware, (req, res) => {
    const deleted = db.deleteProduct(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true, message: 'Product deleted' })
})

module.exports = router
