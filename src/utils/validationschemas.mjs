import { escape } from "mysql2";

export const createuserValidationSchema = {
    firstname: {
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Firstname must be a string",
        },
        isLength: {
            options: { min: 3, max: 32 },
            errorMessage: "firstname must be between 3 and 32 characters",
        },
        notEmpty: {
            errorMessage: "Firstname cannot be empty",
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    lastname: {
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Lastname must be a string",
        },
        isLength: {
            options: { min: 3, max: 32 },
            errorMessage: "Lastname must be between 3 and 32 characters",
        },
        notEmpty: {
            errorMessage: "Lastname cannot be empty",
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    housenumber: {
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "House number must be a string",
        },
        isLength: {
            options: { min: 3, max: 10 },
            errorMessage: "House number must be between 3 and 10 characters",
        },
        notEmpty: {
            errorMessage: "House number cannot be empty",
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    streetname: {
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Street number must be a string",
        },
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: "Street number must be between 3 and 10 characters",
        },
        notEmpty: {
            errorMessage: "Street number cannot be empty",
        },
        matches: {
            options: /^[A-Za-z0-9 .'-]+$/,
            errorMessage: "Street name contains invalid charachters"
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    postalcode: {
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Postal code must be a string",
        },
        isLength: {
            options: { min: 4, max: 10 },
            errorMessage: "Postal code must be between 4 and 10 characters",
        },
        notEmpty: {
            errorMessage: "Postal code cannot be empty",
        },
        matches: {
            options: /^[A-Za-z0-9 -]+$/,
            errorMessage: "Postal code contains invalid characters"
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    country: {
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Country must be a string",
        },
        isLength: {
            options: { min: 4, max: 30 },
            errorMessage: "Country must be between 4 and 30 characters",
        },
        notEmpty: {
            errorMessage: "country cannot be empty",
        },
        matches: {
            options: /^[A-Za-z .'-]+$/,
            errorMessage: "Country contains invalid characters",
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    phone: {
        optional: true,
        customSanitizer: {
            options: (value) => {
                // Verwijder spaties en andere niet-numerieke tekens zoals +, -, etc.
                return value.replace(/\D/g, ''); // Verwijdert alles behalve cijfers
            },
        },
        isMobilePhone: {
            options: ['nl-NL', 'de-DE'], // controleerd of telefoon nummer voldoet aan nl of de format
            errorMessage: "Invalid phone number format. Please enter a valid Dutch or German phone number.",
        },
        isLength: {
            options: { min: 10, max: 15 },
            errorMessage: "Phone number should be between 10 and 15 digits",
        },
    },
    email: {
        // Controleer of het e-mailadres een geldig formaat heeft
        isEmail: {
            errorMessage: "Invalid email format",
        },
        notEmpty: {
            errorMessage: "Email cannot be empty",
        },
        normalizeEmail: true, // Normaliseer het e-mailadres (bijv. zet alles om naar kleine letters)
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens
    },
};




export const updateUserValidationSchema = {
    firstname: {
        optional: true,
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Firstname must be a string",
        },
        isLength: {
            options: { min: 3, max: 32 },
            errorMessage: "firstname must be between 3 and 32 characters",
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen

    },
    lastname: {
        optional: true,
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Lastname must be a string",
        },
        isLength: {
            options: { min: 3, max: 32 },
            errorMessage: "Lastname must be between 3 and 32 characters",
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    housenumber: {
        optional: true,
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "House number must be a string",
        },
        isLength: {
            options: { min: 3, max: 10 },
            errorMessage: "House number must be between 3 and 10 characters",
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    streetname: {
        optional: true,
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Street number must be a string",
        },
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: "Street number must be between 3 and 10 characters",
        },
        matches: {
            options: /^[A-Za-z0-9 .'-]+$/,
            errorMessage: "Street name contains invalid charachters"
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    postalcode: {
        optional: true,
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Postal code must be a string",
        },
        isLength: {
            options: { min: 4, max: 10 },
            errorMessage: "Postal code must be between 4 and 10 characters",
        },
        matches: {
            options: /^[A-Za-z0-9 -]+$/,
            errorMessage: "Postal code contains invalid characters"
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    country: {
        optional: true,
        // Controleer of de naam een string is en de lengte binnen het bereik ligt
        isString: {
            errorMessage: "Country must be a string",
        },
        isLength: {
            options: { min: 3, max: 20 },
            errorMessage: "Country must be between 3 and 20 characters",
        },
        matches: {
            options: /^[A-Za-z .'-]+$/,
            errorMessage: "Country contains invalid characters",
        },
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens om XSS-aanvallen te voorkomen
    },
    phone: {
        optional: true,
        customSanitizer: {
            options: (value) => {
                // Verwijder spaties en andere niet-numerieke tekens zoals +, -, etc.
                return value.replace(/\D/g, ''); // Verwijdert alles behalve cijfers
            },
        },
        isMobilePhone: {
            options: ['nl-NL', 'de-DE'], // controleerd of telefoon nummer voldoet aan nl of de format
            errorMessage: "Invalid phone number format. Please enter a valid Dutch or German phone number.",
        },
        isLength: {
            options: { min: 10, max: 15 },
            errorMessage: "Phone number should be between 10 and 15 digits",
        },
    },
    email: {
        optional: true,
        // Controleer of het e-mailadres een geldig formaat heeft
        isEmail: {
            errorMessage: "Invalid email format",
        },
        normalizeEmail: true, // Normaliseer het e-mailadres (bijv. zet alles om naar kleine letters)
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens
    },
};




export const filterValidationSchema = {
    filter: {
        optional: true,
        notEmpty: {
            errorMessage: "Filter cannot be empty",
        },
    },
    value: {
        optional: true,
        notEmpty: {
            errorMessage: "Value cannot be empty",
        },
    },
};




export const IDvalidatie = {
    id: {
        optional: false,
        isInt: {
            errorMessage: "ID moet een nummer zijn"
        },
        trim: true,
        escape: true,
        toInt: true,
    },
};




export const BookingValidation = {
    Email: {
        optional: false,
        isEmail: {
            errorMessage: "Invalid email format",
        },
        notEmpty: {
            errorMessage: "Email cannot be empty",
        },
        normalizeEmail: true,
        trim: true,
        escape: true,
    },
    NumberOfGuests: {
        optional: false,
        isInt: {
            errorMessage: "Number of Guests must be an integer",
        },
        notEmpty: {
            errorMessage: "Number of Guests cannot be empty",
        },
        custom: {
            options: (value) => value >= 1 && value <= 8, // Controleer of het aantal gasten tussen 1 en 8 ligt
            errorMessage: "Number of Guests must be between 1 and 8",
        },
    },
    NumberOfKeycards: {
        optional: false,
        isLength: {
            options: { min: 1, max: 8 },
            errorMessage: "Number of keycards cannot exceed 8",
        },
        isInt: {
            errorMessage: "Number of Keycards must be an integer",
        },
        notEmpty: {
            errorMessage: "Number of Keycards cannot be empty",
        },
        custom: {
            options: (value) => value >= 1 && value <= 8, // Controleer of het aantal gasten tussen 1 en 8 ligt
            errorMessage: "Number of keycards must be between 1 and 8",
        },
    },
    MomentStart: {
        optional: false,
        isString: {
            errorMessage: "Moment Start must be a valid MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)",
        },
        matches: {
            options: [/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/],
            errorMessage: "Moment Start must be in MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)",
        },
        notEmpty: {
            errorMessage: "Moment Start cannot be empty",
        },
        custom: {
            options: (value) => {
                const momentStart = new Date(value);
                return momentStart > new Date(); // Controleren of Moment Start in de toekomst is
            },
            errorMessage: "Moment Start must be in the future",
        },
    },
    MomentEnd: {
        optional: false,
        isString: {
            errorMessage: "Moment End must be a valid MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)",
        },
        matches: {
            options: [/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/],
            errorMessage: "Moment End must be in MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)",
        },
        notEmpty: {
            errorMessage: "Moment End cannot be empty",
        },
        custom: {
            options: (value, { req }) => {
                const momentStart = req.body.MomentStart ? new Date(req.body.MomentStart) : null;  // Controleren of MomentStart bestaat
                const momentEnd = new Date(value);
                return momentStart && momentEnd > momentStart; // Controleer of Moment End na Moment Start ligt
            },
            errorMessage: "Moment End must be after Moment Start",
        },
    },
    PlaceNumber: {
        optional: false,
        isInt: {
            errorMessage: "Placenumber must be an integer",
        },
        isLength: {
            options: { max: 2 },
            errorMessage: "Place Number cannot exceed 2 characters",
        },
        custom: {
            options: (value) => value >= 1 && value <= 50, // Controleer of het aantal gasten tussen 1 en 8 ligt
            errorMessage: "Placenumber must be between 1 and 50",
        },
        trim: true,
        escape: true,
    },
    CheckedIn: {
        optional: true,
        custom: {
            options: (value) => {
                // Controleer of de waarde van CheckedIn 'true' of 'false' is (als string of boolean)
                return value === 'true' || value === true || value === 'false' || value === false;
            },
            errorMessage: "Checked In must be a boolean (true/false)",
        },
    },
    Note: {
        optional: true,
        isLength: {
            options: { max: 1000 },
            errorMessage: "Note cannot exceed 1000 characters",
        },
        trim: true,
        escape: true,
    },
};


export const emailvalidator = {
    Email: {
        // Controleer of het e-mailadres een geldig formaat heeft
        isEmail: {
            errorMessage: "Invalid email format",
        },
        notEmpty: {
            errorMessage: "Email cannot be empty",
        },
        normalizeEmail: true, // Normaliseer het e-mailadres (bijv. zet alles om naar kleine letters)
        trim: true, // Verwijder voor- en achterwaartse spaties
        escape: true, // Escape gevaarlijke tekens
    },
};

export const categoryValidationSchema = {
    CategoryID: {
        optional: true, // Dit veld is alleen nodig bij updates
        isInt: {
            errorMessage: "CategoryID moet een geldig nummer zijn",
        },
        trim: true,
        escape: true,
        toInt: true,
    },
    Name: {
        optional: false, // Verplicht veld
        isString: {
            errorMessage: "Naam moet een string zijn",
        },
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: "Naam moet tussen 1 en 100 tekens lang zijn",
        },
        trim: true,
        escape: true,
    },
};


export const productValidationSchema = {
    ProductID: {
        optional: true, // Dit veld is alleen nodig bij updates
        isInt: {
            errorMessage: "ProductID moet een geldig nummer zijn",
        },
        trim: true,
        escape: true,
        toInt: true,
    },
    CategoryID: {
        optional: false, // Verplicht veld
        isInt: {
            errorMessage: "CategoryID moet een geldig nummer zijn",
        },
        trim: true,
        escape: true,
        toInt: true,
    },
    Name: {
        optional: false, // Verplicht veld
        isString: {
            errorMessage: "Naam moet een string zijn",
        },
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: "Naam moet tussen 1 en 100 tekens lang zijn",
        },
        trim: true,
        escape: true,
    },
    AssetsURL: {
        optional: false, // Verplicht veld
        isURL: {
            errorMessage: "AssetsURL moet een geldige URL zijn",
        },
        isLength: {
            options: { max: 100 },
            errorMessage: "AssetsURL mag maximaal 100 tekens bevatten",
        },
        trim: true,
    },
    Price: {
        optional: false, // Verplicht veld
        isInt: {
            options: { min: 0 },
            errorMessage: "Prijs moet een positief geheel getal zijn",
        },
        trim: true,
        toInt: true,
    },
    Size: {
        optional: false, // Verplicht veld
        isString: {
            errorMessage: "Grootte moet een string zijn",
        },
        isLength: {
            options: { max: 10 },
            errorMessage: "Grootte mag maximaal 10 tekens bevatten",
        },
        trim: true,
        escape: true,
    },
    AmountInStock: {
        optional: false, // Verplicht veld
        isInt: {
            options: { min: 0 },
            errorMessage: "Voorraad moet een positief geheel getal zijn",
        },
        trim: true,
        toInt: true,
    },
};
