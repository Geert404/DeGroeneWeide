import { Router } from "express";
import { query, checkSchema, validationResult, body, matchedData } from "express-validator";
import { filterValidationSchema, createuserValidationSchema, IDvalidatie, updateUserValidationSchema, LockerValidation, UpdateLockerValidation } from "../utils/validationschemas.mjs"
import { userCreationLimiter, resultValidator} from "../utils/middelwares.mjs";
import pool from "../postgress/db.mjs";
import cors from 'cors';
import { corsOptions } from "../utils/middelwares.mjs";




// maakt een routes aan
const router = Router();




// POST request voor het aanmaken van een nieuwe gebruiker
router.post('/api/lockers',  checkSchema(LockerValidation), resultValidator, cors(corsOptions), async (request, response) => {
    // gevalideerde data wordt opgeslagen in data variabelen
    const data = matchedData(request); 
    try {

        const [existingLocker] = await pool.query(`SELECT * FROM lockers WHERE LockerID = ?`, [data.LockerID]);         
        if (existingLocker.length > 0) {
            return response.status(400).send({ msg: "Locker already in use" });
        }

        const [NonExsistingBookingID] = await pool.query(`SELECT * FROM Bookings WHERE BookingID = ?`, [data.BookingID]); 
        if (NonExsistingBookingID.length === 0) {
            return response.status(404).send({ msg: "No Booking found with given BookingID" });
        }

        await pool.query(
            `INSERT INTO lockers (LockerID, BookingID) VALUES (?, ?)`, 
            [data.LockerID, data.BookingID,] 
        );

        const usingLocker = {
            lockerid: data.LockerID,  // Verkrijg het ID van de net ingevoegde gebruiker
            bookingid: data.BookingID,
        };

        return response.status(201).send(usingLocker); // HTTP status 201 betekent 'Created'

    } catch (err) {

        return response.status(500).send({ msg: "Server error" });
    }
});




router.get('/api/lockers', cors(corsOptions), async (request, response) => {
    try {
        const [getlockers] = await pool.query(`SELECT * FROM lockers`)
        if (getlockers.length === 0){
            return response.status(404).send({msg: "No lockers found"})
        }
        return response.status(200).json(getlockers);
    } catch (error) {
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
});




// Ophalen van users aan de hand van id
router.get('/api/lockers/:id', checkSchema(IDvalidatie), resultValidator, cors(corsOptions), async (request, response) => {
    // Gevalideerde data wordt opgeslagen in data variabelen
    const data = matchedData(request); 
    const lockerid = data.id;

    try {
        // SQL-query uitvoeren om gebruiker te zoeken
        const [existingLocker] = await pool.query('SELECT * FROM lockers WHERE LockerID = ?', [lockerid]);

        if (existingLocker.length > 0) {
            return response.status(200).json(existingLocker);
        } else {
            return response.status(404).send({ msg: 'No locker found with given Locker ID' });
        }
    } catch (error) {
        // Verbeterde foutafhandeling: Log de fout en geef een interne serverfout terug
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
});



// put request 
router.put ('/api/lockers/:id', checkSchema(UpdateLockerValidation),  checkSchema(IDvalidatie), resultValidator, cors(corsOptions), async (request, response) => {
    // gevalideerde data wordt opgeslagen in data variabelen
    const data = matchedData(request); 
    const lockerid= request.params.id;

    const [invalidid] = await pool.query(`SELECT * FROM lockers WHERE LockerID = ?`, [lockerid]);
    if(invalidid.length === 0) {
        return response.status(404).send({msg: "No locker found with given ID"})
    } 

    
    const [NonExsistingBookingID] = await pool.query(`SELECT * FROM Bookings WHERE BookingID = ?`, [data.BookingID]); 
    if (NonExsistingBookingID.length === 0) {
        return response.status(404).send({ msg: "No Booking found with given BookingID" });
    }
    
    try {
        const [updatedlocker] = await pool.query(
            `UPDATE lockers
            SET BookingID = ?, MomentDelivered = ? WHERE LockerID = ? `, // SQL query om een gebruiker toe te voegen
            [data.BookingID, data.MomentDelivered, lockerid] // De waarden die in de query moeten worden ingevuld
        );
        
        if (updatedlocker.affectedRows === 0) {
            return response.status(404).send({ msg: 'Locker not updated' });  // Als er geen rijen zijn bijgewerkt stuur 404 status
        }
        return response.status(200).send({ msg: 'Locker updated successfully' }); //false run 200 status
        
    } catch (error) {
        // Verbeterde foutafhandeling: Log de fout en geef een interne serverfout terug
        console.error('Database error:', error);
        return response.status(500).send({ msg: 'Internal server error' });
    }
    
});

export default router;
// if(lockerid !== data.LockerID){
//     const [existingLocker] = await pool.query(`SELECT * FROM lockers WHERE LockerID = ?`, [data]);         
//     if (existingLocker.length > 0) {
//         return response.status(400).send({ msg: "Locker already in use" });
//     }
// }