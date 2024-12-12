import { Router } from "express";
import { query, checkSchema, validationResult, body, matchedData } from "express-validator";
import { filterValidationSchema, createuserValidationSchema, IDvalidatie, updateUserValidationSchema, BookingValidation, emailvalidator } from "../utils/validationschemas.mjs"
import { userCreationLimiter} from "../utils/middelwares.mjs";
import pool from "../postgress/db.mjs";
import { mapBookingData } from "../utils/response.mjs";




// maakt een routes aan
const router = Router();




router.post('/api/bookings/', checkSchema(BookingValidation), async (request, response) => {
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

        // haalt het userid op aan de hand van gegeven email adress.
        const [ophalenUserID] = await pool.query(`SELECT UserID FROM users WHERE email = ?`, [data.Email]);
        
        // kijkt of er een user is gevonden met het gegeven mail adress.
        if (ophalenUserID.length === 0){
            return response.status(404).send({msg: "No user found with given email"})
        };
        
        
        // 
        const [resultPlek] = await pool.query(`
            SELECT PlaceNumber, MomentStart, MomentEnd
            FROM Bookings
            WHERE PlaceNumber = ?
              AND (
                (MomentStart BETWEEN ? AND ?)  -- Controleer of de startdatum overlapt met een bestaande boeking
                OR
                (MomentEnd BETWEEN ? AND ?)    -- Controleer of de einddatum overlapt met een bestaande boeking
                OR
                (? BETWEEN MomentStart AND MomentEnd)  -- Controleer of de gekozen periode valt binnen een bestaande boeking
              )
        `, [data.PlaceNumber, data.MomentStart, data.MomentEnd, data.MomentStart, data.MomentEnd, data.MomentStart]);
        
        // Als er overlappen zijn in de boekingen, geef gedetailleerde foutmeldingen terug
        if (resultPlek.length > 0) {
            const errorMessages = [];
        
            // Controleer of de startdatum overlap heeft met bestaande boekingen
            if (resultPlek.some(booking => new Date(booking.MomentStart) <= new Date(data.MomentEnd) && new Date(booking.MomentEnd) >= new Date(data.MomentStart))) {
                errorMessages.push("The selected start date overlaps with an existing booking.");
            }
        
            // Controleer of de einddatum overlap heeft met bestaande boekingen
            if (resultPlek.some(booking => new Date(booking.MomentStart) < new Date(data.MomentEnd) && new Date(booking.MomentEnd) > new Date(data.MomentStart))) {
                errorMessages.push("The selected end date overlaps with an existing booking.");
            }
        
            // Als er fouten zijn, geef ze terug
            return response.status(400).send({ msg: "The selected place is already booked for the chosen dates", errors: errorMessages })};
       

        // userid varibalen waar het opgehaalde id in wordt opgeslagen.
        const userid = ophalenUserID[0].UserID;

        const [result] = await pool.query(
            `INSERT INTO bookings (UserID, NumberOfGuests, NumberOfKeycards, MomentStart, MomentEnd, PlaceNumber, CheckedIn) VALUES (?, ?, ?, ?, ?, ?, ?)`, // SQL query om een gebruiker toe te voegen
            [userid, data.NumberOfGuests, data.NumberOfKeycards, data.MomentStart, data.MomentEnd, data.PlaceNumber, data.CheckedIn,] // De waarden die in de query moeten worden ingevuld
        );
        
        // Stap 3: Maak een object aan met de nieuwe gebruiker inclusief hun gegenereerde id
        const newBooking = {
            BookingID: result.insertId,
            UserID: userid, //variabelen voeg ik toe als data in database. 
            NumberOfGuests: data.NumberOfGuests,
            NumberOfKeycards: data.NumberOfKeycards,
            MomentStart: data.MomentStart,
            MomentEnd: data.MomentEnd,
            PlaceNumber: data.PlaceNumber,
            CheckedIn: data.CheckedIn,
        };

        return response.status(201).send(newBooking);

        
    } catch (error) {

        // Als er een andere fout is, stuur dan een generieke serverfout
        return response.status(500).send({ msg: "Server error" });
    }
});




router.get('/api/bookings',checkSchema(emailvalidator), async (request, response) => {
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
        // haalt het userid op aan de hand van gegeven email adress.
        const [ophalenUserID] = await pool.query(`SELECT UserID FROM users WHERE email = ?`, [data.Email]);
        
        // kijkt of er een user is gevonden met het gegeven mail adress.
        if (ophalenUserID.length === 0){
            return response.status(404).send({msg: "No user found with given email"})
        };

        // userid varibalen waar het opgehaalde id in wordt opgeslagen.
        const userid = ophalenUserID[0].UserID;


        const [ophalenBookings] = await pool.query(`SELECT * FROM bookings WHERE UserID = ?`, [userid]);
        if (ophalenBookings.length !== 0 ){
            // Transformeer de resultaten met mapBookingData
            const mappedBookings = ophalenBookings.map(mapBookingData);
            return response.status(200).send(mappedBookings)
        }
        else{
            return response.status(404).send({msg: "No bookings foud with given email"})
        }

    } catch (error) {
        // Als er een andere fout is, stuur dan een generieke serverfout
        return response.status(500).send({ msg: "Server error" });
    }

});




router.delete('/api/bookings/:id', checkSchema(IDvalidatie), async (request, response) => {
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
    const BookingID = data.id;
    console.log(BookingID);
try {
    const [checkenBooking] = await pool.query(`SELECT * FROM bookings WHERE BookingID = ?`, [BookingID]);
    if (checkenBooking.length === 0){
        return response.status(404).send({msg: "No booking found with given booking id"});
    }
    else{
        await pool.query(`DELETE FROM bookings WHERE BookingID = ?`, [BookingID]);
        return response.status(200).send({msg: "Booking is canncelled"});
    }

} catch (error) {
        // Als er een andere fout is, stuur dan een generieke serverfout
        return response.status(500).send({ msg: "Server error" });
}
});




// exporteren van de routes
export default router;