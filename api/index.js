const express = require('express')
const axios = require('axios');
const app = express()
const products = require('../data.js')
app.use(express.json())

app.listen(3000, () => {
    console.log('server is listening on port 5000')
})

async function getMetadata() {
    let link = "https://kedvic.com/traits.json"
    let metadata = await axios.get(link);
    return metadata.data;
  }

app.get('/api/products', async (req, res) => {
   // let data = await getMetadata();
    //res.json(data)
    res.json(products)
})

app.get('/api/products', (req, res) => {
    const partial_products = products.map(product => {
        return { id: product.id, name: product.name }
    })
    res.json(partial_products)
})

app.get('/api/products/:productID', (req, res) => {
    const id = Number(req.params.productID)
    const product = products.find(product => product.id === id)

        if (!product) {
        return res.status(404).send('Product not found')
    }
    res.json(product)
})

app.get('/api/query', (req, res) => {
    const name = req.query.name.toLowerCase()
    const products_result = products.filter(product => product.name.toLowerCase().includes(name))

    if (products_result.length < 1) {
        return res.status(200).send('No products matched your search')
    }
    res.json(products_result)
})

app.get('/api/query', (req, res) => {
    const name = req.query.name.toLowerCase()
    const products_result = products.filter(product => product.name.toLowerCase().includes(name))

    if (products_result.length < 1) {
        return res.status(200).send('No products matched your search')
    }
    res.json(products_result)
})

app.post('/api/products', (req, res) => {
    const newProduct = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price
    }
    products.push(newProduct)
    res.status(201).json(newProduct)
})

app.put('/api/products/:productID', (req, res) => {
    const id = Number(req.params.productID)
    const index = products.findIndex(product => product.id === id)
    if (index === -1) {
        return res.status(404).send('Product not found')
    }
    const updatedProduct = {
        id: products[index].id,
        name: req.body.name,
        price: req.body.price
    }
    products[index] = updatedProduct
    res.status(200).json('Product updated')
})

app.delete('/api/products/:productID', (req, res) => {
    const id = Number(req.params.productID)
    const index = products.findIndex(product => product.id === id)
        if (index === -1) {
        return res.status(404).send('Product not found')
    }
    products.splice(index,1)
    res.status(200).json('Product deleted')
})

// Export the Express API
module.exports = app;