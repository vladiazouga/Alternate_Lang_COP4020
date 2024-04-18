const fs = require('fs');
const parse = require('csv-parser');
const { count } = require('console');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const path = "cells.csv";

/**
 * Validates the input by checking if it's non-null, non-empty, and not a hyphen.
 * @param {string} input - The input string to validate.
 * @return {string|null} - Returns the trimmed input if valid, or null otherwise.
 */

function validateInput(input) {
    if (!input || input.trim() === '' || input.trim() === '-') {
        return null;
    }
    return input;
}


class Cell {
    constructor(oem, model, launch_announced, launch_status, body_dimensions, body_weight, body_sim, display_type, display_size, display_resolution, features_sensors, platform_os) {
        this.oem = validateInput(oem);
        this.model = validateInput(model);
        this.launch_announced = this.parseYear(launch_announced);
        this.launch_status = this.parseLaunchStatus(launch_status);
        this.body_dimensions = validateInput(body_dimensions);
        this.body_weight = this.parseWeight(body_weight);
        this.body_sim = validateInput(body_sim) || null;
        this.display_type = validateInput(display_type);
        this.display_size = this.parseDisplaySize(display_size);
        this.display_resolution = validateInput(display_resolution);
        this.features_sensors = this.parseFeaturesSensors(features_sensors);
        this.platform_os = this.parsePlatformOS(platform_os);
    }

    parseYear(yearStr) {
        if (!yearStr || yearStr === '' || yearStr === '-') {
            console.log("Input is invalid or not a string.");  // Debug: Log when input is invalid
            return null;
        }
        yearStr = yearStr.toString();
        yearStr = yearStr.trim()
        const regex = /(\d{4})/;  // Adjusted regex to strictly find years in the range of 1900-2099
        const match = yearStr.match(regex);

    if (match) {  // Check if match is not null
        return parseInt(match[0]);  // Use match[0] which contains the year
    } else {
        console.log("No valid year found in the input string.");  // Debug: Log when no year is found
        return null;
    }
        
    }
    


    parseLaunchStatus(statusStr) {
        if (statusStr === 'Discontinued' || statusStr === 'Cancelled') {
            return statusStr;
        }
        statusStr = statusStr.toString();
        const regex = /(\d{4})/;  // Regular expression to find a four-digit year
        const match = statusStr.match(regex);
        return match ? parseInt(match[0]) : null;  // Return the year string if found, else null
    }


    parseWeight(weightStr) {
        if (!weightStr || weightStr === '' || weightStr === '-') {
            return null
        }
        const regex = /^(\d+)/;  // Regular expression to find the leading integer
        weightStr = weightStr.toString();
        const match = weightStr.match(regex);
        return match ? parseFloat(match[1]) : null;  // Parse the number as float
    }

    parseDisplaySize(sizeStr) {
        if (!sizeStr || typeof sizeStr !== 'string' || sizeStr.trim() === '' || sizeStr.trim() === '-') {
            return null;  // Return null if the input is missing, not a string, empty, or just a "-"
        }

        // Regular expression to extract the number followed by "in" or "inch(es)" and any text after
        const regex = /(\d+(\.\d+)?)\s*in(ches)?(.*)/i;
        const match = sizeStr.match(regex);

        if (match && match[1]) {
            // If a matching group is found, parse the number and return as a float
            // with the "inches" and the rest of the string, if there's additional text
            const number = parseFloat(match[1]);
            const extraText = match[4] ? " inches" + match[4] : " inches";
            return `${number}${extraText}`;
        } else {
            // If no valid format is found, return null
            return null;
        }
    }
    parsePlatformOS(osStr) {
        if (!osStr || osStr.trim() === '' || osStr.trim() === '-') {
            return null;  // Return null for missing or empty strings
        }
        // Use a regular expression to match everything up to the first comma, or the entire string if no comma exists
        const regex = /^[^,]*/;
        const match = osStr.match(regex);
        return match ? match[0].trim() : null;  // Return the trimmed match or null if no match found
    }


    parseFeaturesSensors(featuresStr) {
        featuresStr = featuresStr.toString();

        if (featuresStr === '' || !featuresStr || featuresStr === '-') {
            return null; // Return null for invalid or missing inputs.
        }
        // Split the string by commas, trim each element, and filter out purely numeric entries.
        const features = featuresStr.split(',').map(feature => feature.trim());
        const validFeatures = features.filter(feature => isNaN(feature) || feature === 'V1'); // `isNaN` checks if the string is non-numeric or is 'V1'.
        return validFeatures.length > 0 ? validFeatures : null; // Return null if no valid features are left.
    }
    


    // Getters
    get oem() { return this._oem; }
    get model() { return this._model; }
    get launch_announced() { return this._launch_announced; }
    get launch_status() { return this._launch_status; }
    get body_dimensions() { return this._body_dimensions; }
    get body_weight() { return this._body_weight; }
    get body_sim() { return this._body_sim; }
    get display_type() { return this._display_type; }
    get display_size() { return this._display_size; }
    get display_resolution() { return this._display_resolution; }
    get features_sensors() { return this._features_sensors; }
    get platform_os() { return this._platform_os; }

    // Setters
    set oem(value) { this._oem = value; }
    set model(value) { this._model = value; }
    set launch_announced(value) { this._launch_announced = this.parseYear(value); }
    set launch_status(value) { this._launch_status = this.parseLaunchStatus(value); }
    set body_dimensions(value) { this._body_dimensions = value; }
    set body_weight(value) { this._body_weight = this.parseWeight(value); }
    set body_sim(value) { this._body_sim = value !== 'No' ? value : null; }
    set display_type(value) { this._display_type = value; }
    set display_size(value) { this._display_size = this.parseDisplaySize(value); }
    set display_resolution(value) { this._display_resolution = value; }
    set features_sensors(value) { this._features_sensors = this.parseFeaturesSensors(value); }
    set platform_os(value) { this._platform_os = this.parsePlatformOS(value); }

}

/**
 * Main menu to handle user actions in the console interface.
 */

function mainMenu() {

    rl.question('Choose an action (add, delete, list, exit): ', (action) => {
        switch(action.trim().toLowerCase()) {
            case 'add':
                addCell(cells);
                break;
            case 'delete':
                deleteCell(cells);
                break;
            case 'list':
                listUniqueValues(cells);
                mainMenu(cells);  // Return to the main menu after listing
                break;
            case 'exit':
                rl.close();
                break;
            default:
                console.log('Invalid option');
                mainMenu(cells);  // Recall the menu until a valid option or 'exit' is chosen
        }
    });
}

/**
 * Calculates which OEM has the highest average body weight of their cell phones.
 * @param {Map} cellsMap - A Map of cell instances.
 * @return {string} - The OEM with the highest average body weight.
 */

function findOEMWithHighestAverageWeight(cellsMap) {
    const weightSumByOEM = new Map();
    const countByOEM = new Map();

    // Accumulate weights and count the number of models per OEM
    cellsMap.forEach(cell => {
        if (cell.body_weight !== null) {
            const weight = parseFloat(cell.body_weight);
            if (cell.oem === "HP") {
                
            }
            if (weightSumByOEM.has(cell.oem)) {
                weightSumByOEM.set(cell.oem, weightSumByOEM.get(cell.oem) + weight);
            }
            if (!weightSumByOEM.has(cell.oem)) {
                weightSumByOEM.set(cell.oem, weight);
            }
            if (countByOEM.has(cell.oem)) {
                countByOEM.set(cell.oem, countByOEM.get(cell.oem) + 1);
            }
            if (!countByOEM.has(cell.oem)) {
                countByOEM.set(cell.oem, 1);
            }
        } else {
            
        }
    });

    

    let maxAverage = -Infinity; // Initialize maxAverage
    let oemWithMaxAverage = null;

    // Calculate the average weight per OEM
    weightSumByOEM.forEach((sum, oem) => {
        const average = sum / countByOEM.get(oem);
        //console.log(`OEM: ${oem}, Sum: ${sum}, Count: ${countByOEM.get(oem)}, Average: ${average}`);
        if (average > maxAverage) {
            maxAverage = average;
            oemWithMaxAverage = oem;
        }
    });
    
    console.log(`\n Question 1) \tOEM with the highest average body weight: ${oemWithMaxAverage} with max average weight: ${maxAverage} (grams)`);
    return oemWithMaxAverage; // Returns the OEM with the highest average weight
}

/**
 * Counts how many phones have only one feature sensor.
 * @param {Map} cells - A Map of cell instances.
 * @return {number} - The count of phones with only one feature sensor.
 */
function countPhonesWithNoMoreThanOneSensor(cells) {
    let count = 0;
    cells.forEach(cell => {
        const features = cell.features_sensors; // Assuming features_sensors is an array of features
        if (features && features.length === 1) { // This checks for the presence of more than one feature
            count++;
        }
    });
    console.log(`\n Question 3) \tTotal number of phones without more than one sensor: ${count}`);
}

/**
 * Counts how many phones were announced and launched in different years.
 * @param {Map} cells - A Map of cell instances.
 * @return {number} - The count of phones with different announce and launch years.
 */
function countDifferentAnnounceLaunchYears(cells) {
    let count = 0;
    cells.forEach(cell => {
        if (cell.launch_announced && cell.launch_status && cell.launch_announced !== cell.launch_status) {
            count++;
        }
    });
    console.log(`\n Question 2) \tTotal number of phones announced and launched in different years: ${count}`);
    return count;
}

/**
 * Finds the year with the most phone launches after 1999.
 * @param {Map} cells - A Map of cell instances.
 * @return {number} - The year with the most launches.
 */
function findYearWithMostPhonesLaunched(cells) {
    const launchYearCounts = new Map();

    cells.forEach(cell => {
        const launchYear = cell.launch_status; // Assuming this property holds the launch year
        if (launchYear && launchYear > 1999) {
            launchYearCounts.set(launchYear, (launchYearCounts.get(launchYear) || 0) + 1);
        }
    });

    let maxYear = null;
    let maxCount = 0;
    for (let [year, count] of launchYearCounts) {
        if (count > maxCount) {
            maxCount = count;
            maxYear = year;
        }
    }

    console.log(`\n Question 4) \tYear with most phones launched (post-1999): ${maxYear} with ${maxCount} launches`);
    return maxYear;
}

/**
 * Prompts the user to enter details for a new cell and adds it to the cells map.
 * @param {Map} cells - A Map to store cell instances.
 */
function addCell(cells) {

    console.log("\n\nEnter details for a new cell:");
    rl.question('OEM: ', (oem) => {
        rl.question('Model: ', (model) => {
            rl.question('Launch Announced (year): ', (launch_announced) => {
                rl.question('Launch Status: ', (launch_status) => {
                    rl.question('Body Dimensions: ', (body_dimensions) => {
                        rl.question('Body Weight: ', (body_weight) => {
                            rl.question('Body SIM: ', (body_sim) => {
                                rl.question('Display Type: ', (display_type) => {
                                    rl.question('Display Size: ', (display_size) => {
                                        rl.question('Display Resolution: ', (display_resolution) => {
                                            rl.question('Features Sensors: ', (features_sensors) => {
                                                rl.question('Platform OS: ', (platform_os) => {
                                                    const cell = new Cell(oem, model, launch_announced, launch_status, body_dimensions, body_weight, body_sim, display_type, display_size, display_resolution, features_sensors, platform_os);
                                                    cells.set(cells.size + 1, cell); // Using size + 1 as the key for simplicity
                                                    console.log("New cell added:", cell);
                                                    mainMenu(cells);
                                                    
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

/**
 * Prompts the user for an index and deletes the corresponding cell from the map if found.
 * @param {Map} cells - A Map containing cell instances.
 */
function deleteCell(cells) {


    rl.question('\n\nEnter the index of the cell to delete: ', (index) => {
        const cellIndex = parseInt(index);
        if (cells.has(cellIndex)) {
            cells.delete(cellIndex);
            console.log(`Cell at index ${cellIndex} has been deleted.`);
        } else {
            console.log('No cell found at that index.');
        }
        mainMenu(cells);  // Return to main menu after action
    });
}

/**
 * Lists all unique values for each attribute of the cells stored in the map.
 * @param {Map} cells - A Map containing cell instances.
 */
function listUniqueValues(cells) {
    const uniqueValues = {
        oem: new Set(),
        model: new Set(),
        launch_announced: new Set(),
        launch_status: new Set(),
        body_dimensions: new Set(),
        body_weight: new Set(),
        body_sim: new Set(),
        display_type: new Set(),
        display_size: new Set(),
        display_resolution: new Set(),
        features_sensors: new Set(),
        platform_os: new Set()
    };

    cells.forEach(cell => {
        Object.keys(uniqueValues).forEach(key => {
            if (cell[key] !== undefined) {
                uniqueValues[key].add(cell[key]);
            }
        });
    });

    for (let key in uniqueValues) {
        console.log(`${key}: ${[...uniqueValues[key]].join(', ')}`);
    }
}










// Create a parser object
const parser = parse({
    columns: true,   // Enable column names based on the first row
    delimiter: ',',  // Specify the delimiter if it's not a comma
    trim: true       // Trim leading and trailing spaces from cells
});

const cells = new Map();
var ctr = 1;
// Create a read stream from the file
fs.createReadStream(path)
    .pipe(parser)   // Pipe the read stream to the CSV parser
    .on('data', (row) => {
        console.log(row)
        // Create an instance of Cell for each row
        const cell = new Cell(
            row.oem,
            row.model,
            row.launch_announced,
            row.launch_status,
            row.body_dimensions,
            row.body_weight,
            row.body_sim,
            row.display_type,
            row.display_size,
            row.display_resolution,
            row.features_sensors,
            row.platform_os
        );


        cells.set(ctr++, cell);
        console.log(`Processed cell #${ctr-1}:`, cell);

    })
    .on('end', () => {

        console.log('CSV file has been successfully processed. \n');
        findOEMWithHighestAverageWeight(cells);
        countDifferentAnnounceLaunchYears(cells);
        countPhonesWithNoMoreThanOneSensor(cells);
        findYearWithMostPhonesLaunched(cells);
        mainMenu(cells);
        addCell(cells);
        deleteCell(cells);



    })
    .on('error', (err) => {
        console.error('Error reading the CSV file:', err);
    });
