const express = require('express')
const axios = require('axios');
const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")
const { ethers , utils } = require("ethers");
const contractABI = require("./DigitalDash.json");
const contractAddress = "0x71d77eff00FF766f923d2C095C89e6C34aa7D17B"
const rpc =  "https://rinkeby.infura.io/v3/da220ac7e5a945a69f15174a66aeea4a"
const cors = require('cors');

const ethersProvider = new ethers.providers.JsonRpcProvider(rpc)
let nft;

const app = express()
const products = require('../data.js')
app.use(express.json())

app.use(cors());


let rootHash;
app.listen(3000, () => {
    console.log('server is listening on port 5000')
})

async function getMetadata(link) {
    let metadata = await axios.get(link);
    return metadata.data;
  }

app.post('/api/mintmerkleproof', async (req, res) => {
    let link = "https://kedvic.com/array.txt"
    let addresses = await getMetadata(link);
     // Hash addresses to get the leaves
    let leaves = addresses.map(addr => keccak256(addr))
    // Create tree
    let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
    // Get root
    rootHash = merkleTree.getRoot().toString('hex')
    console.log("Root hash: ", rootHash)
    //Get proof
    let address = req.body.address
    let hashedAddress = keccak256(address)
    let proof = merkleTree.getHexProof(hashedAddress)
    console.log("Proof : ", proof)
    res.json(proof)
})


app.get('/api/:id', async (req, res) => {
    nft = new ethers.Contract(
        contractAddress,
        contractABI.abi,
        ethersProvider
      )
    let link = "https://kedvic.com/new.json"
    console.log("getting data")
    let data = await getMetadata(link);
    // for (let i = 0; i < 5; i++){
    //     console.log(data[i])
    // }
    const currentSupply = await nft.currentTotal()
    console.log(currentSupply)    
    const query = req.params.id
    const id = parseInt(query)
    if(id > 0 && id <= currentSupply){
        res.json(data[id])
    }else{
        res.status(404).send("The Miller you requested is out of range")
    }
})

app.post('/api/stakemerkleproof', async (req, res) => {
    let link = "https://kedvic.com/merkle.json"
    let NFTids = await getMetadata(link);
     // Hash addresses to get the leaves
    let leaves = NFTids.map(id => keccak256(id))
    // Create tree
    let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
    // Get root
    rootHash = merkleTree.getRoot().toString('hex')
    console.log("Root hash: ", rootHash)
    //Get proof
    let data = req.body.data
    console.log(data)
    let hashedData = keccak256(data)
    let proof = merkleTree.getHexProof(hashedData)
    console.log("Proof : ", proof)
    res.json(proof)
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