// js/index.js
var logList = document.getElementById('logList');
var db;
var browser = true;

    var painDescriptions = {
        pulsatile: "Une douleur qui semble battre avec le rythme du cœur.",
        brulante: "Une sensation de brûlure ou de chaleur intense.",
        lancinante: "Une douleur aiguë et perçante, souvent répétitive.",
        piquante: "Une douleur semblable à des piqûres d'épingle.",
        sourde: "Une douleur constante et de faible intensité.",
        oppressante: "Une sensation de pression ou de constriction.",
        irradiante: "Une douleur qui se propage d'une zone vers une autre.",
        diffuse: "Une douleur généralisée sans localisation précise.",
        spasmodique: "Des douleurs soudaines et involontaires, souvent en spasmes.",
        electrique: "Une douleur semblable à un choc électrique.",
        articulaire: "Douleur ressentie dans les articulations.",
        musculaire: "Douleur ressentie dans les muscles.",
        neuropathique: "Douleur due à une lésion nerveuse.",
        osseuse: "Douleur ressentie dans les os.",
        abdominale: "Douleur ressentie dans l'abdomen.",
        thoracique: "Douleur ressentie dans la poitrine.",
        cervicale: "Douleur ressentie dans la région du cou.",
        faciale: "Douleur ressentie au niveau du visage.",
        oculaire: "Douleur ressentie dans les yeux.",
        cutanee: "Douleur ressentie sur la peau.",
        aigue: "Douleur intense et soudaine.",
        chronique: "Douleur persistante sur une longue période."
    };

    var painTypesByLocation = {
        head: ["pulsatile", "brulante", "lancinante", "piquante", "sourde"],
        neck: ["sourde", "oppressante", "irradiante"],
        back: ["diffuse", "spasmodique", "musculaire"],
        shoulders: ["articulaire", "musculaire"],
        arms: ["musculaire", "osseuse", "neuropathique"],
        legs: ["musculaire", "osseuse", "neuropathique"],
        feet: ["osseuse", "neuropathique"],
        other: ["chronique", "aigue"]
    };
    

function updatePainIntensity(value) {
    const painIntensityDisplay = document.getElementById('painIntensityDisplay');
    const sliderFill = document.querySelector('.slider-fill');
    const percentage = (value - 1) / 9 * 100; // 9 = max - min

    painIntensityDisplay.textContent = value;
    sliderFill.style.width = `${percentage}%`;
}


/**
 * Fonction d'initialisation de la base de données
 */
function initDatabase() {
    if (browser) {
        db = window.openDatabase('fibrotracker', "0.1", "Fibro Traccker DB", 200000) ;
    } else {
        db = window.sqlitePlugin.openDatabase({ name: 'fibrotracker.db', location: 'default' }) ;
    }
    
    console.log(db);
    db.transaction(tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS PainLog (id INTEGER PRIMARY KEY AUTOINCREMENT, location TEXT, painType TEXT, intensity INTEGER, description TEXT, timestamp DATETIME)', [], (tx, res) => {
            console.log(tx) ;
            console.log(res) ;
            console.log("Table created or already exists") ;
        }, (tx, error) => {
            console.log("Error creating table: " + error.message) ;
        }) ;
    }) ;
}

    function updatePainTypes() {
        const location = document.getElementById('location').value;
        const painTypeSelect = document.getElementById('painType');
        painTypeSelect.innerHTML = '';

        if (painTypesByLocation[location]) {
            painTypesByLocation[location].forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = painDescriptions[type]; // Premiers mots de la description comme étiquette
                painTypeSelect.appendChild(option);
            });
        }
        updatePainDescription();
    }

    function updatePainDescription() {
        const painType = document.getElementById('painType').value;
        const painDescriptionDiv = document.getElementById('painDescription');

        painDescriptionDiv.textContent = painDescriptions[painType] || '';
    }

    function savePainLog(location, painType, intensity, description) {
        const timestamp = new Date().toISOString();

        db.transaction(tx => {
            tx.executeSql('INSERT INTO PainLog (location, painType, intensity, description, timestamp) VALUES (?, ?, ?, ?, ?)', [location, painType, intensity, description, timestamp], (tx, res) => {
                console.log(tx);
                console.log(res);
                console.log("Pain log saved");
                addPainLogToUI(location, painType, intensity, description, timestamp);
            }, (tx, error) => {
                console.log("Error saving pain log: " + error.message);
            });
        });
    }

    function addPainLogToUI(location, painType, intensity, description, timestamp) {
        const logEntry = document.createElement('li');
        logEntry.textContent = `Localisation: ${location}, Type: ${painType}, Intensité: ${intensity}, Description: ${description}, Date: ${timestamp}`;

        logList.appendChild(logEntry);
    }

    function loadPainLogs() {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM PainLog', [], (tx, res) => {
                for (let i = 0; i < res.rows.length; i++) {
                    const item = res.rows.item(i);
                    addPainLogToUI(item.location, item.painType, item.intensity, item.description, item.timestamp);
                }
            }, (tx, error) => {
                console.log("Error loading pain logs: " + error.message);
            });
        });
    }

    function exportToCSV() {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM PainLog', [], (tx, res) => {
                let csvContent = "data:text/csv;charset=utf-8,";
                csvContent += "Localisation,Type,Intensité,Description,Date\n";

                for (let i = 0; i < res.rows.length; i++) {
                    const item = res.rows.item(i);
                    const row = `${item.location},${item.painType},${item.intensity},${item.description},${item.timestamp}\n`;
                    csvContent += row;
                }

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "pain_log.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, (tx, error) => {
                console.log("Error exporting to CSV: " + error.message);
            });
        });
    }

document.addEventListener('DOMContentLoaded', (event_general) => {
    // Détecte le type d'engin
    if (document.URL.match(/^https?:/i)) {
        console.log("Running in a browser...");
    } else {
        console.log("Running in an app...");
        browser = false;
        document.addEventListener("deviceready", resolve, false);
    }
    
    
    // Initialisation de la base de données et chargement des logs
    initDatabase();
    loadPainLogs();
    // Initialisation de la liste des types de douleurs
    updatePainTypes();
    
    const painForm = document.getElementById('painForm');
    console.log(event_general);
    painForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const location = document.getElementById('location').value;
        const painType = document.getElementById('painType').value;
        const intensity = document.getElementById('intensity').value;
        const description = document.getElementById('description').value;

        savePainLog(location, painType, intensity, description);
        painForm.reset();
        updatePainTypes(); // Pour réinitialiser la liste des types de douleurs
    });

    document.getElementById('exportButton').addEventListener('click', exportToCSV);
});