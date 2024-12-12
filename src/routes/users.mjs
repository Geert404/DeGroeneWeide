import { Router } from "express";
import { query, checkSchema, validationResult, body, matchedData } from "express-validator";
import { filterValidationSchema, createuserValidationSchema, IDvalidatie, updateUserValidationSchema } from "../utils/validationschemas.mjs"
import { userCreationLimiter} from "../utils/middelwares.mjs";
import pool from "../postgress/db.mjs";




// maakt een routes aan
const router = Router();




// GET request voor het ophalen van alle gebruikers of met een filter.
router.get('/api/users', checkSchema(filterValidationSchema), async (request, response) => {
    
    // Validatie van de request body aan de hand van het gedefinieerde schema
    const result = validationResult(request);// result bevat de resultaten van de validatie.
    if (!result.isEmpty()) {// Als de validatieresultaten niet leeg zijn oftewel er zijn fouten in de validatie van de invoer dan 400 error
        const formattedErrors = result.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return response.status(400).send({ errors: formattedErrors});// errors result.array is de lijst met fouten uit de result wordt weergegeven in een array
    }

    const { query: { filter, value } } = request; // Haalt 'filter' en 'value' op uit de query parameters van de request

    try {

    const allowedFilters = ['email', 'phone', 'lastname', 'firstname', 'country', 'postalcode', 'housenumber']; // Lijst van toegestane filters (veldnamen), die veilig gebruikt kunnen worden in de query
    if (filter && !allowedFilters.includes(filter)) { // Controleer of het filter geldig is
        return response.status(400).send({ error: 'Invalid filter' }); // Stuur een foutmelding als het filter niet in de lijst van toegestane filters zit
    };

    let users;
    if (filter && value) { // Als zowel een filter als een waarde is opgegeven in de query
        const sql = `SELECT * FROM users WHERE ?? LIKE ?`; // SQL-query die zoekt naar gebruikers waar het filter overeenkomt met de waarde
        const params = [filter, `%${value}%`]; // De parameters voor de query (filternaam en waarde, waarbij waarde wordt omgeven door % voor een LIKE-zoekopdracht)
        [users] = await pool.query(sql, params); // Voer de query uit en sla het resultaat op in 'users'
    } else {
        [users] = await pool.query('SELECT * FROM users'); // Als geen filter is opgegeven, haal dan alle gebruikers op uit de database
    };

    return response.json(users); // Retourneer de lijst van gebruikers als JSON

} catch (err) {
    console.error('Database error:', err); // Log de fout als er iets misgaat met de database
    return response.status(500).send('Server error'); // Stuur een serverfoutmelding terug als er een probleem is met de databasequery
};

});




// POST request voor het aanmaken van een nieuwe gebruiker
router.post('/api/users', userCreationLimiter, checkSchema(createuserValidationSchema), async (request, response) => {
    
    // Validatie van de request body aan de hand van het gedefinieerde schema
    const result = validationResult(request); // result bevat de resultaten van de validatie. 
    if (!result.isEmpty()) { // Als de validatieresultaten niet leeg zijn oftewel er zijn fouten in de validatie van de invoer dan 400 error
        const formattedErrors = result.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return response.status(400).send({ errors: formattedErrors}); // errors result.array is de lijst met fouten uit de result wordt weergegeven in een array
    }

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
router.get('/api/users/:id', checkSchema(IDvalidatie), async (request, response) => {

    // Validatie van de request body aan de hand van het gedefinieerde schema
    const result = validationResult(request);
    if (!result.isEmpty()) {
        // Formatteren van fouten voor consistente en nette foutmeldingen
        const formattedErrors = result.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return response.status(400).json({ errors: formattedErrors});
    }

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
router.put ('/api/users/:id', checkSchema(createuserValidationSchema),  checkSchema(IDvalidatie), async (request, response) => {

        // Validatie van de request body aan de hand van het gedefinieerde schema
    const result = validationResult(request); // result bevat de resultaten van de validatie. 
    if (!result.isEmpty()) { // Als de validatieresultaten niet leeg zijn oftewel er zijn fouten in de validatie van de invoer dan 400 error
        const formattedErrors = result.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return response.status(400).send({ errors: formattedErrors}); // errors result.array is de lijst met fouten uit de result wordt weergegeven in een array
    }

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
router.patch ('/api/users/:id', checkSchema(updateUserValidationSchema),  checkSchema(IDvalidatie), async (request, response) => {

    // Validatie van de request body aan de hand van het gedefinieerde schema
    const result = validationResult(request); // result bevat de resultaten van de validatie. 
    if (!result.isEmpty()) { // Als de validatieresultaten niet leeg zijn oftewel er zijn fouten in de validatie van de invoer dan 400 error
        const formattedErrors = result.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return response.status(400).send({ errors: formattedErrors}); // errors result.array is de lijst met fouten uit de result wordt weergegeven in een array
    }

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
router.delete ('/api/users/:id', checkSchema(IDvalidatie), async (request, response) => {

    // Validatie van de request body aan de hand van het gedefinieerde schema
    const result = validationResult(request);
    if (!result.isEmpty()) {
        const formattedErrors = result.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return response.status(400).json({ errors: formattedErrors });
    }

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

