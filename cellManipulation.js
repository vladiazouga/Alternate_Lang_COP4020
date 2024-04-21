const fs = require('fs');
const parse = require('csv-parser');
const readline = require('readline');

const path = "cells.csv";

class Cell {
    constructor(oem, model, launch_announced, launch_status, body_dimensions, body_weight, body_sim, display_type, display_size, display_resolution, features_sensors, platform_os) {
        this.oem = this.validateInput(oem);
        this.model = this.validateInput(model);
        this.launch_announced = this.parseYear(launch_announced);
        this.launch_status = this.parseLaunchStatus(launch_status);
        this.body_dimensions = this.validateInput(body_dimensions);
        this.body_weight = this.parseWeight(body_weight);
        this.body_sim = this.validateInput(body_sim) || null;
        this.display_type = this.validateInput(display_type);
        this.display_size = this.parseDisplaySize(display_size);
        this.display_resolution = this.validateInput(display_resolution);
        this.features_sensors = this.parseFeaturesSensors(features_sensors);
        this.platform_os = this.parsePlatformOS(platform_os);
    }

    validateInput(input) {
        if (!input || input.trim() === '' || input.trim() === '-') {
            return null;
        }
        return input;
    }

    parseYear(yearStr) {
        if (!yearStr || yearStr === '' || yearStr === '-') {
            //console.log("Input is invalid or not a string.");  // Debug: Log when input is invalid
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
        if (!statusStr) {
            return null; // Return null early if statusStr is undefined or null
        }
        
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
        
        if (!featuresStr || featuresStr === '' || !featuresStr || featuresStr === '-') {
            return null; // Return null for invalid or missing inputs.
        }

        featuresStr = featuresStr.toString();
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

class CellManager {
    constructor() {
        this.cells = new Map();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    addCellInteractive() {
        const questions = [
            { key: 'oem', question: 'Enter OEM: ' },
            { key: 'model', question: 'Enter model: ' },
            { key: 'launch_announced', question: 'Enter launch year announced: ' },
            { key: 'launch_status', question: 'Enter launch status: ' },
            { key: 'body_dimensions', question: 'Enter body dimensions: ' },
            { key: 'body_weight', question: 'Enter body weight (in grams): ' },
            { key: 'body_sim', question: 'Enter body SIM type: ' },
            { key: 'display_type', question: 'Enter display type: ' },
            { key: 'display_size', question: 'Enter display size (in inches): ' },
            { key: 'display_resolution', question: 'Enter display resolution: ' },
            { key: 'features_sensors', question: 'Enter features and sensors: ' },
            { key: 'platform_os', question: 'Enter platform OS: ' },
        ];
    
        let cellData = {};
    
        const askQuestion = (index) => {
            if (index < questions.length) {
                this.rl.question(questions[index].question, (answer) => {
                    cellData[questions[index].key] = answer.trim();
                    askQuestion(index + 1);
                });
            } else {
                try {
                    this.addCell(
                        cellData.oem,
                        cellData.model,
                        cellData.launch_announced,
                        cellData.launch_status,
                        cellData.body_dimensions,
                        cellData.body_weight,
                        cellData.body_sim,
                        cellData.display_type,
                        cellData.display_size,
                        cellData.display_resolution,
                        cellData.features_sensors,
                        cellData.platform_os
                    );
                } catch (error) {
                    console.error("Failed to add cell:", error);
                }
                this.mainMenu();
            }
        };
    
        askQuestion(0);
    }
    
    addCell(oem, model, launch_announced, launch_status, body_dimensions, body_weight, body_sim, display_type, display_size, display_resolution, features_sensors, platform_os) {
        console.log("Adding cell with data:", { oem, model, launch_announced, launch_status, body_dimensions, body_weight, body_sim, display_type, display_size, display_resolution, features_sensors, platform_os });  // Debugging
        const cell = new Cell(oem, model, launch_announced, launch_status, body_dimensions, body_weight, body_sim, display_type, display_size, display_resolution, features_sensors, platform_os);
        this.cells.set(this.cells.size + 1, cell);
        console.log("New cell added:", cell);
    }
    

    deleteCell() {
        this.rl.question('\nEnter the index of the cell to delete: ', index => {
            const cellIndex = parseInt(index);
            if (this.cells.has(cellIndex)) {
                this.cells.delete(cellIndex);
                console.log(`Cell at index ${cellIndex} has been deleted.`);
            } else {
                console.log('No cell found at that index.');
            }
            this.mainMenu();  // Return to main menu after action
        });
    }

    listUniqueValues() {
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

        this.cells.forEach(cell => {
            Object.keys(uniqueValues).forEach(key => {
                if (cell[key] !== undefined) {
                    uniqueValues[key].add(cell[key]);
                }
            });
        });

        for (let key in uniqueValues) {
            console.log(`${key}: ${[...uniqueValues[key]].join(', ')}`);
        }
        this.mainMenu();
    }

    mainMenu() {
        this.rl.question('\nChoose an action (add, delete, list, exit): ', action => {
            switch(action.trim().toLowerCase()) {
                case 'add':
                    // Implement the logic to handle adding a cell here or call an addCell method
                    this.addCellInteractive();  // Placeholder
                    this.mainMenu();
                    break;
                case 'delete':
                    this.deleteCell();
                    break;
                case 'list':
                    this.listUniqueValues();
                    break;
                case 'exit':
                    this.rl.close();
                    break;
                default:
                    console.log('Invalid option');
                    this.mainMenu();  // Recall the menu until a valid option or 'exit' is chosen
            }
        });
    }

    findAverageWeight() {
        const weightSumByOEM = new Map();
        const countByOEM = new Map();

        this.cells.forEach(cell => {
            if (cell.body_weight !== null) {
                const weight = parseFloat(cell.body_weight);
                if (weightSumByOEM.has(cell.oem)) {
                    weightSumByOEM.set(cell.oem, weightSumByOEM.get(cell.oem) + weight);
                } else {
                    weightSumByOEM.set(cell.oem, weight);
                }

                if (countByOEM.has(cell.oem)) {
                    countByOEM.set(cell.oem, countByOEM.get(cell.oem) + 1);
                } else {
                    countByOEM.set(cell.oem, 1);
                }
            }
        });

        let maxAverage = -Infinity;
        let oemWithMaxAverage = null;

        weightSumByOEM.forEach((sum, oem) => {
            const average = sum / countByOEM.get(oem);
            if (average > maxAverage) {
                maxAverage = average;
                oemWithMaxAverage = oem;
            }
        });

        console.log(`OEM with the highest average body weight: ${oemWithMaxAverage} with max average weight: ${maxAverage} (grams)`);
        return oemWithMaxAverage;
    }

    countPhonesSensor() {
        let count = 0;
        this.cells.forEach(cell => {
            const features = cell.features_sensors;
            if (features && features.length === 1) {
                count++;
            }
        });
        console.log(`Total number of phones without more than one sensor: ${count}`);
        return count;
    }

    countDiffYears() {
        let count = 0;
        this.cells.forEach(cell => {
            if (cell.launch_announced && cell.launch_status && cell.launch_announced !== cell.launch_status) {
                count++;
            }
        });
        console.log(`Total number of phones announced and launched in different years: ${count}`);
        return count;
    }

    findYearLaunched() {
        const launchYearCounts = new Map();
        this.cells.forEach(cell => {
            const launchYear = cell.launch_status;
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

        console.log(`Year with most phones launched (post-1999): ${maxYear} with ${maxCount} launches`);
        return maxYear;
    }
}


// Create a parser object
const parser = parse({
    columns: true,   // Enable column names based on the first row
    delimiter: ',',  // Specify the delimiter if it's not a comma
    trim: true       // Trim leading and trailing spaces from cells
});

// Initialize the CellManager
const cellManager = new CellManager();

// Create a read stream from the file
fs.createReadStream(path)
    .pipe(parser)   // Pipe the read stream to the CSV parser
    .on('data', (row) => {
        console.log(row);
        // Add each cell to the CellManager
        cellManager.addCell(
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
    })
    .on('end', () => {
        console.log('CSV file has been successfully processed. \n');

        // Perform operations using methods from CellManager
        cellManager.findAverageWeight();
        cellManager.countDiffYears();
        cellManager.countPhonesSensor();
        cellManager.findYearLaunched();
        cellManager.mainMenu();
    })
    .on('error', (err) => {
        console.error('Error reading the CSV file:', err);
    });
