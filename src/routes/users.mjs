import { Router } from "express";
import { query, checkSchema, validationResult, body, matchedData } from "express-validator";
import { filterValidationSchema, createuserValidationSchema, IDvalidatie, updateUserValidationSchema } from "../utils/validationschemas.mjs"
import { resultValidator, userCreationLimiter} from "../utils/middelwares.mjs";
import pool from "../postgress/db.mjs";




// maakt een routes aan
const router = Router();




// GET request voor het ophalen van alle gebruikers of met een filter.
router.get('/api/users', checkSchema(filterValidationSchema), resultValidator, async (request, response) => {
    const { query: { filter, value } } = request; // Haalt 'filter' en 'value' op uit de query parameters van de request

    try {
        const allowedFilters = ['email', 'phone', 'lastname', 'firstname', 'country', 'postalcode', 'housenumber']; // Lijst van toegestane filters

        // Controleer of het filter geldig is
        if (filter && !allowedFilters.includes(filter)) {
            return response.status(400).send({ error: 'Invalid filter' });
        }

        let users;

        if (filter && value) {
            // SQL-query met filter en waarde
            const sql = `SELECT * FROM users WHERE ?? LIKE ?`;
            const params = [filter, `%${value}%`];
            [users] = await pool.query(sql, params); // Voer de query uit
        }

        // Als geen resultaten gevonden worden, haal alle gebruikers op
        if (!users || users.length === 0) {
            [users] = await pool.query('SELECT * FROM users');
        }

        // Retourneer de gebruikers
        return response.json(users);

    } catch (err) {
        console.error('Database error:', err.message);
        return response.status(500).send('Server error'); // Stuur een serverfoutmelding terug
    }
});





// POST request voor het aanmaken van een nieuwe gebruiker
router.post('/api/users', userCreationLimiter, checkSchema(createuserValidationSchema), resultValidator, async (request, response) => {
    // gevalideerde data wordt opgeslagen in data variabelen
    const data = matchedData(request); 

    try {
        // Stap 1: Controleer of de e-mail van de nieuwe gebruiker al bestaat in de database
        // existingUser bevat de eerste gevonden gebruiker die voldoet aan data.email of undefined als er geen match is.
        const [existingUser] = await pool.query(`SELECT * FROM users WHERE email = ?`, [data.email]); 

        // Als de e-mail al bestaat, stuur dan een foutmelding terug
        if (existingUser.length > 0) {
            return response.status(400).send({ msg: "Email already exists" });
        }

        // Stap 2: Voeg de nieuwe gebruiker toe aan de database
        const [result] = await pool.query(
            `INSERT INTO users (email, phone, firstname, lastname, housenumber, streetname, postalcode, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, // SQL query om een gebruiker toe te voegen
            [data.email, data.phone, data.firstname, data.lastname, data.housenumber, data.streetname, data.postalcode, data.country,] // De waarden die in de query moeten worden ingevuld
        );

        // Stap 3: Maak een object aan met de nieuwe gebruiker inclusief hun gegenereerde id
        const newUser = {
            id: result.insertId,  // Verkrijg het ID van de net ingevoegde gebruiker
            email: data.email,
            phone: data.phone,
            firstname: data.firstname,
            lastname: data.lastname,
            housenumber: data.housenumber,
            streetname: data.streetname,
            postalcode: data.postalcode,
            country: data.country,
        };

        // Stap 4: Stuur de nieuwe gebruiker als antwoord terug naar de client
        return response.status(201).send(newUser); // HTTP status 201 betekent 'Created'

    } catch (err) {

        // Als er een andere fout is, stuur dan een generieke serverfout
        return response.status(500).send({ msg: "Server error" });
    }
});




// Ophalen van users aan de hand van id
router.get('/api/users/:id', checkSchema(IDvalidatie), resultValidator, async (request, response) => {
    // Gevalideerde data wordt opgeslagen in data variabelen
    const data = matchedData(request); 
    const UserID = data.id;

    try {
        // SQL-query uitvoeren om gebruiker te zoeken
        const [existingUser] = await pool.query('SELECT * FROM users WHERE userid = ?', [UserID]);

        if (existingUser.length > 0) {
            return response.status(200).json(existingUser);
        } else {
            return response.status(404).send({ msg: 'User not found' });
        }
    } catch (error) {
        // Verbeterde foutafhandeling: Log de fout en geef een interne serverfout terug
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
});





// put request 
router.put ('/api/users/:id', checkSchema(createuserValidationSchema),  checkSchema(IDvalidatie), resultValidator, async (request, response) => {
    // gevalideerde data wordt opgeslagen in data variabelen
    const data = matchedData(request); 
    const UserID = request.params.id;

    try {
        const [updatedUser] = await pool.query(
            `UPDATE users
             SET email = ?, phone = ?, firstname = ?, lastname = ?, housenumber = ?, streetname = ?, postalcode = ?, country = ? WHERE userid = ?`, // SQL query om een gebruiker toe te voegen
            [data.email, data.phone, data.firstname, data.lastname, data.housenumber, data.streetname, data.postalcode, data.country, UserID] // De waarden die in de query moeten worden ingevuld
        );
        
        if (updatedUser.affectedRows === 0) {
            return response.status(404).send({ msg: 'User not found' });  // Als er geen rijen zijn bijgewerkt stuur 404 status
        }
        return response.status(200).send({ msg: 'User updated successfully' }); //false run 200 status

    } catch (error) {
        // Verbeterde foutafhandeling: Log de fout en geef een interne serverfout terug
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }

});



// patch request voor het aanpassen van een of meerdere gegevens in een bestand.
router.patch ('/api/users/:id', checkSchema(updateUserValidationSchema),  checkSchema(IDvalidatie), resultValidator, async (request, response) => {
    // gevalideerde data wordt opgeslagen in data variabelen
    const data = matchedData(request); 
    const UserID = request.params.id;

    try {
        const [existingUser] = await pool.query('SELECT * FROM users WHERE userid = ?', [UserID]);

        if (existingUser.length === 0) {
            return response.status(404).send({msg: "User not found"}); 
        }

        // toevoegen van dynamische velden.
        const teUpdatenVelden =[];
        const teUpdatenWaarden = [];

        // controleren van alle velden en waarden.
        if(data.email){
            teUpdatenVelden.push(`email = ?`);
            teUpdatenWaarden.push(data.email);
        }
        if(data.phone){
            teUpdatenVelden.push(`phone = ?`);
            teUpdatenWaarden.push(data.phone);
        }
        if(data.firstname){
            teUpdatenVelden.push(`firstname = ?`);
            teUpdatenWaarden.push(data.firstname);
        }
        if(data.lastname){
            teUpdatenVelden.push(`lastname = ?`);
            teUpdatenWaarden.push(data.lastname);
        }
        if(data.housenumber){
            teUpdatenVelden.push(`housenumber = ?`);
            teUpdatenWaarden.push(data.housenumber);
        }
        if(data.postalcode){
            teUpdatenVelden.push(`postalcode = ?`);
            teUpdatenWaarden.push(data.postalcode);
        }
        if(data.streetname){
            teUpdatenVelden.push(`streetname = ?`);
            teUpdatenWaarden.push(data.streetname);
        }
        if(data.country){
            teUpdatenVelden.push(`country = ?`);
            teUpdatenWaarden.push(data.country);
        }


        //userid toevoegen aan de lijst
        teUpdatenWaarden.push(UserID);

        if (teUpdatenVelden === 0){
            return response.status(400).send({msg: "there are no fields to update"});
        } 

        // Stap 1: Controleer of de e-mail van de nieuwe gebruiker al bestaat in de database
        // existingUser bevat de eerste gevonden gebruiker die voldoet aan data.email of undefined als er geen match is.
        const [existingEmail] = await pool.query(`SELECT * FROM users WHERE email = ?`, [data.email]); 

        // Als de e-mail al bestaat, stuur dan een foutmelding terug
        if (existingEmail.length > 0) {
            return response.status(400).send({ msg: "Email already exists" });
        }

        //opstellen van de query
        const sqlQuery = `
            UPDATE users
            SET ${teUpdatenVelden.join(', ')} WHERE userid = ?
        `;

        //uitvoeren van de query
        const [updatedUser] = await pool.query(sqlQuery, teUpdatenWaarden);

        if (updatedUser.affectedRows === 0 ){
            return response.status(400).send({msg: "no given values to update"})
        }

        return response.status(200).send({msg: "user is updated"})

    } catch (error) {
         // Foutafhandeling: Log de fout en stuur een interne serverfout terug
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
})



// delete request voor het verwijderen van een user in dit geval.
router.delete ('/api/users/:id', checkSchema(IDvalidatie), resultValidator, async (request, response) => {
    const data = matchedData(request); 
    const UserID = data.id;

    try {
        const [usercheck] = await pool.query('SELECT * FROM users Where userid = ?', [UserID]);
        if (usercheck.length === 0){
            return response.status(404).send({msg: "user not found"})
        }
        else
        await pool.query('DELETE FROM users WHERE userid = ?', [UserID]);
            return response.status(204).send({msg: "user is verwijderd"});

    } catch (error) {
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
});




// exporteren van de routes
export default router;

