import { response, Router } from "express";
import { checkSchema, matchedData, validationResult } from "express-validator";
import pool from "../postgress/db.mjs";
import { productValidationSchema, IDvalidatie, filterValidationSchema } from "../utils/validationschemas.mjs";
import { resultValidator } from "../utils/middelwares.mjs";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - products
 *     description: Voeg een nieuw product toe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 *               - CategoryID
 *               - AssetsURL
 *               - Price
 *               - Size
 *               - AmountInStock
 *             properties:
 *               Name:
 *                 type: string
 *                 example: 'Product A'
 *               CategoryID:
 *                 type: integer
 *               AssetsURL:
 *                 type: string
 *                 format: uri
 *               Price:
 *                 type: integer
 *               Size:
 *                 type: string
 *               AmountInStock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product succesvol toegevoegd
 *       400:
 *         description: Fout in de validatie of product bestaat al
 *       404:
 *         description: Ongeldige CategoryID
 *       500:
 *         description: Serverfout
 */

router.post('/api/products', checkSchema(productValidationSchema), resultValidator, async (request, response) => {
    const data = matchedData(request); 

    try {
        const [existingproduct] = await pool.query(`SELECT * FROM products WHERE Name = ?`, [data.Name]); 

        if (existingproduct.length > 0) {
            return response.status(400).send({ msg: "product already exists" });
        }

        const [existingcategoryid] = await pool.query(`SELECT * FROM product_categories WHERE CategoryID = ?`, [data.CategoryID]); 

        if (existingcategoryid.length === 0) {
            return response.status(404).send({ msg: "invalid category ID" });
        }

        const [NewProduct] = await pool.query(
            `INSERT INTO products (CategoryID, AssetsURL, Price, Size, AmountInStock, Name) VALUES (?, ?, ?, ?, ?, ?)`,
            [data.CategoryID, data.AssetsURL, data.Price, data.Size, data.AmountInStock, data.Name]
        );

        const Newproduct = {
            ProductID: NewProduct.insertId,
            CategoryID: data.CategoryID,
            AssetsURL: data.AssetsURL,
            Price: data.Price,
            Size: data.Size,
            AmountInStock: data.AmountInStock,
            Name: data.Name
        };

        return response.status(201).send(Newproduct);
        
    } catch (error) {
        console.error(error);
        return response.status(500).send({ msg: "Server error" });
    }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - products
 *     description: Haal alle producten op.
 *     responses:
 *       200:
 *         description: Een lijst van alle producten.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     description: Naam van het product
 *                     example: 'Product A'
 *                   CategoryID:
 *                     type: integer
 *                     description: ID van de productcategorie
 *                     example: 1
 *                   AssetsURL:
 *                     type: string
 *                     description: URL van de productafbeelding of andere middelen
 *                     example: 'http://example.com/product.jpg'
 *                   Price:
 *                     type: integer
 *                     description: Prijs van het product in de lokale valuta
 *                     example: 1999
 *                   Size:
 *                     type: string
 *                     description: Grootte van het product
 *                     example: 'M'
 *                   AmountInStock:
 *                     type: integer
 *                     description: Aantal beschikbare producten op voorraad
 *                     example: 100
 *       404:
 *         description: Geen producten gevonden.
 *       500:
 *         description: Serverfout
 */

router.get('/api/products', async (request, response) => {
    try {
        const [ophalenProducten] = await pool.query(`SELECT * FROM products`)
        if (ophalenProducten.length === 0){
            return response.status(404).send({msg: "No products found"})
        }
        return response.status(200).json(ophalenProducten);
    } catch (error) {
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - products
 *     description: Haal een product op op basis van ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Het ID van het product.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Het opgevraagde product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Name:
 *                   type: string
 *                   description: Naam van het product
 *                   example: 'Product A'
 *                 CategoryID:
 *                   type: integer
 *                   description: ID van de productcategorie
 *                   example: 1
 *                 AssetsURL:
 *                   type: string
 *                   description: URL van de productafbeelding of andere middelen
 *                   example: 'http://example.com/product.jpg'
 *                 Price:
 *                   type: number
 *                   format: float
 *                   description: Prijs van het product in de lokale valuta
 *                   example: 19.99
 *                 Size:
 *                   type: string
 *                   description: Grootte van het product
 *                   example: 'M'
 *                 AmountInStock:
 *                   type: integer
 *                   description: Aantal beschikbare producten op voorraad
 *                   example: 100
 *       404:
 *         description: Product niet gevonden.
 *       400:
 *         description: Ongeldige ID.
 *       500:
 *         description: Serverfout
 */

router.get('/api/products/:id', checkSchema(IDvalidatie), resultValidator, async (request, response) => {
    const data = matchedData(request); 
    const productID = data.id;
    
    try {
        const [existingProduct] = await pool.query('SELECT * FROM products WHERE ProductID = ?', [productID]);
        
        if (existingProduct.length > 0) {
            return response.status(200).json(existingProduct);
        } else {
            return response.status(404).send({ msg: 'product not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags:
 *       - products
 *     description: Verwijder een product op basis van ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Het ID van het product dat verwijderd moet worden.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Product succesvol verwijderd.
 *       404:
 *         description: Product niet gevonden.
 *       500:
 *         description: Serverfout.
 */

router.delete('/api/products/:id', checkSchema(IDvalidatie), resultValidator, async (request, response) => {
    const data = matchedData(request);
    const productID = data.id;
    try {
        const [checkenProduct] = await pool.query(`SELECT * FROM products WHERE ProductID = ?`, [productID]);
        if (checkenProduct.length === 0){
            return response.status(404).send({msg: "No Product found with given Product id"});
        } else {
            await pool.query(`DELETE FROM products WHERE ProductID = ?`, [productID]);
            return response.status(200).send({msg: "Product is deleted"});
        }
    } catch (error) {
        return response.status(500).send({ msg: "Server error" });
    }
});

export default router;
