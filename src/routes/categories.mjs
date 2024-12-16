import { Router } from "express";
import { checkSchema, matchedData, validationResult } from "express-validator";
import pool from "../postgress/db.mjs";
import { categoryValidationSchema, productValidationSchema, IDvalidatie } from "../utils/validationschemas.mjs";
import { resultValidator } from "../utils/middelwares.mjs";

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Maak een nieuwe categorie aan
 *     description: |
 *       Dit endpoint maakt een nieuwe categorie aan in de database. Het valideert de ingevoerde gegevens, zoals de naam van de categorie, en controleert of de categorie nog niet bestaat.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 *             properties:
 *               Name:
 *                 type: string
 *                 description: De naam van de categorie (max. 100 tekens)
 *                 example: 'Zuivel'
 *     responses:
 *       201:
 *         description: Categorie succesvol aangemaakt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 CategoryID:
 *                   type: integer
 *                   description: De unieke ID van de aangemaakte categorie
 *                   example: 20
 *                 Name:
 *                   type: string
 *                   description: De naam van de categorie
 *                   example: 'Zuivel'
 *       400:
 *         description: Fout in de validatie of categorie bestaat al
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: 'category already exsists'
 *       500:
 *         description: Serverfout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: 'Internal server error'
 */

router.post('/api/categories', checkSchema(categoryValidationSchema), resultValidator, async (request, response) => {
    const data = matchedData(request); 

    try {
        const [existingCategory] = await pool.query(`SELECT * FROM product_categories WHERE Name = ?`, [data.Name]); 
        if (existingCategory.length > 0) {
            return response.status(400).send({ msg: "Category already exists" });
        }

        const [NewCategory] = await pool.query(
            `INSERT INTO product_categories (Name) VALUES (?)`, 
            [data.Name,]
        );

        const newcategory = {
            id: NewCategory.insertId,
            Name: data.Name,
        };

        return response.status(201).send(newcategory);
    } catch (error) {
          return response.status(500).send({ msg: "Server error" });
    }
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Ophalen van alle categorieën
 *     description: |
 *       Dit endpoint haalt een lijst op van alle bestaande productcategorieën uit de database.
 *       Als er geen categorieën worden gevonden, wordt een 404 foutmelding geretourneerd.
 *     responses:
 *       200:
 *         description: Een lijst van alle productcategorieën
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   CategoryID:
 *                     type: integer
 *                     description: De unieke ID van de categorie
 *                     example: 1
 *                   Name:
 *                     type: string
 *                     description: De naam van de categorie
 *                     example: 'Fruits'
 *       404:
 *         description: Geen categorieën gevonden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: 'No categories found'
 *       500:
 *         description: Serverfout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: 'Internal server error'
 */

router.get('/api/categories', async (request, response) => {
    try {
        const [ophalencategoryProducten] = await pool.query(`SELECT * FROM product_categories`);
        if (ophalencategoryProducten.length === 0) {
            return response.status(404).send({ msg: "No categories found" });
        }
        return response.status(200).json(ophalencategoryProducten);
    } catch (error) {
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - categories
 *     description: Ophalen van alle producten aan de hand van category ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het categorie ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: A list of products in the category
 *       404:
 *         description: No products found for the given category ID
 *       400:
 *         description: Invalid category ID
 *       500:
 *         description: Server error
 */
router.get('/api/categories/:id', checkSchema(IDvalidatie), resultValidator, async (request, response) => {
    const data = matchedData(request); 
    const categoryID = data.id;
    
    try {
        const [existingCategory] = await pool.query('SELECT * FROM products WHERE CategoryID = ?', [categoryID]);
        
        if (existingCategory.length > 0) {
            return response.status(200).json(existingCategory);
        } else {
            return response.status(404).send({ msg: 'No products found for given categoryID' });
        }
    } catch (error) {
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags:
 *       - categories
 *     description: verwijderen van categorie aan de hand van ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het categorie ID om te verwijderen
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Category successfully deleted
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/api/categories/:id', checkSchema(IDvalidatie), resultValidator, async (request, response) => {
    const data = matchedData(request);
    const categoryID = data.id;

    try {
        const [checkenCategory] = await pool.query(`SELECT * FROM product_categories WHERE CategoryID = ?`, [categoryID]);
        if (checkenCategory.length === 0) {
            return response.status(404).send({ msg: "No category found with given ID" });
        } else {
            await pool.query(`DELETE FROM product_categories WHERE CategoryID = ?`, [categoryID]);
            return response.status(200).send({ msg: "Category successfully deleted" });
        }
    } catch (error) {
        return response.status(500).send({ msg: "Server error" });
    }
});

export default router;
