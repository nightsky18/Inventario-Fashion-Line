import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import mongoose from 'mongoose';
import open from 'open'; // Nota: open ahora se importa
import { Product } from './models/Product.js'; 

import path from 'path'; // Importa path si no lo tienes
import { fileURLToPath } from 'url';

// Configuración para manejar rutas absolutas en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

// Configurar conexión a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);
    }
};
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configurar multer
const upload = multer({
    dest: 'images/', 
});


// Servir la carpeta 'images' como estática
app.use('/images', express.static(path.join(__dirname, 'images')));

// Servir la carpeta frontend como estática
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta principal para servir el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Rutas CRUD
app.post('/productos', upload.single('foto'), async (req, res) => {
    const { nombre, categoria, talla, precio, cantidad } = req.body;
    const foto = req.file ? `/images/${req.file.filename}` : null; // Cambiado de '/uploads/' a '/images/'
    const bajoStock = cantidad < 5;
    const product = new Product({ nombre, categoria, talla, precio, cantidad, foto, bajoStock });
    await product.save();
    res.status(201).send(product);
});


app.get('/productos', async (req, res) => {
    const { nombre, categoria } = req.query;
    const filters = {};
    if (nombre) filters.nombre = new RegExp(nombre, 'i');
    if (categoria) filters.categoria = categoria;
    const products = await Product.find(filters);
    res.send(products);
});

app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    if (updates.cantidad < 5) updates.bajoStock = true;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    res.send(product);
});

app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(204).send();
});

//para subir imagen
app.post('/productos', upload.single('foto'), async (req, res) => {
    try {
        const { name, category, size, price, quantity } = req.body;
        const foto = req.file ? `/uploads/${req.file.filename}` : null; // Ruta de la imagen

        const newProduct = new Product({
            name,
            category,
            size,
            price,
            quantity,
            foto
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el producto' });
    }
});
// Iniciar servidor
const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    await open(`http://localhost:${PORT}`);
});