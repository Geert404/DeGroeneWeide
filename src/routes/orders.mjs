import { Router } from "express";
import { query, checkSchema, validationResult, body, matchedData } from "express-validator";
import { filterValidationSchema, createuserValidationSchema, IDvalidatie, updateUserValidationSchema } from "../utils/validationschemas.mjs"
import { userCreationLimiter} from "../utils/middelwares.mjs";
import pool from "../postgress/db.mjs";
import cors from 'cors';
import { corsOptions } from "../utils/middelwares.mjs";



// maakt een routes aan
const router = Router();

router.post('/api/orders :email')

// exporteren van de routes
export default router;