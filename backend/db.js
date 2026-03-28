const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, 'data', 'products.json')

function readProducts() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        return []
    }
}

function writeProducts(products) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2))
        return true
    } catch (error) {
        console.error('Error writing products:', error)
        return false
    }
}

function getProductById(id) {
    const products = readProducts()
    return products.find(p => p.id === id) || null
}

function addProduct(product) {
    const products = readProducts()
    const newProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    }
    products.push(newProduct)
    writeProducts(products)
    return newProduct
}

function updateProduct(id, updates) {
    const products = readProducts()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return null
    products[index] = { ...products[index], ...updates }
    writeProducts(products)
    return products[index]
}

function deleteProduct(id) {
    const products = readProducts()
    const filtered = products.filter(p => p.id !== id)
    if (filtered.length === products.length) return false
    writeProducts(filtered)
    return true
}

function updatePrice(id, price) {
    return updateProduct(id, { price: parseFloat(price) })
}

function updateStock(id, stock) {
    return updateProduct(id, { stock: parseInt(stock) })
}

module.exports = {
    readProducts,
    writeProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    updatePrice,
    updateStock
}
