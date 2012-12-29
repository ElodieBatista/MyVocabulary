(function () {
    "use strict";


    WinJS.Namespace.define("DataAccess", {

        // Path to the Database
        dbPath: Windows.Storage.ApplicationData.current.localFolder.path + '\\db.sqlite',



        /* Launch the Database */
        launchDB: function (callback) {
            // Open Database
            SQLite3JS.openAsync(DataAccess.dbPath)
                // Create Table Language
                .then(function (db) {
                    console.log('Create table Language');
                    return db.runAsync('CREATE TABLE IF NOT EXISTS Language1 (nameLanguage TEXT, idLanguage INTEGER PRIMARY KEY AUTOINCREMENT)');
                }, function (error) {
                    console.log('Error Creating table Language: ' + error.message);
                })

                // Create Table Type
                .then(function (db) {
                    console.log('Create table Type');
                    return db.runAsync('CREATE TABLE IF NOT EXISTS Type1 (nameType TEXT, abreviationType TEXT, idType INTEGER PRIMARY KEY AUTOINCREMENT)');
                }, function (error) {
                    console.log('Error Creating table Type: ' + error.message);
                })

                // Create Table Word
                .then(function (db) {
                    console.log('Create table Word');
                    return db.runAsync('CREATE TABLE IF NOT EXISTS Word1 (designation TEXT, LanguageId INTEGER, translation TEXT, TypeId INTEGER, description TEXT, modificationdate INTEGER, known BOOL, idWord INTEGER PRIMARY KEY AUTOINCREMENT, FOREIGN KEY(LanguageId) REFERENCES Language(idLanguage), FOREIGN KEY(TypeId) REFERENCES Type(idType))');
                }, function (error) {
                    console.log('Error Creating table: ' + error.message);
                })

                // Select all Rows from Language Table to see if it's empty or not
                .then(function (db) {
                    console.log('Select all rows from table Language to see if it is empty or not');
                    return db.eachAsync('SELECT COUNT(*) AS count FROM Language1', function (row) {
                        // If the Language table is empty, insert some Languages
                        if (row.count == 0) {
                            console.log('Insert some rows in Language Table...');
                            db.runAsync('INSERT INTO Language1 (nameLanguage) VALUES (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?)',
                                ["French", "English", "Spanish", "Arabic", "Bulgarian", "Catalan", "Chinese", "Danish", "Dutch",
                                "Estonian", "Finnish", "German", "Greek", "Haitian", "Hebrew", "Hungarian", "Indonesian", "Italian",
                                "Japanese", "Korean", "Latvian", "Lithuanian", "Norwegian", "Polish", "Portuguese", "Romanian", "Russian",
                                "Slovak", "Slovenian", "Swedish", "Thai", "Turkish", "Ukrainian", "Vietnamese"]);
                        }
                    });
                }, function (error) {
                    console.log('Error Selecting all rows: ' + error.message);
                })

                // Select all Rows from Language Table
                .then(function (db) {
                    // Prevent for adding languages again when navigate
                    if (DataWords.languages.length == 0) {
                        console.log('Select all rows from table Language');
                        return db.eachAsync('SELECT idLanguage, nameLanguage FROM Language1 ORDER BY nameLanguage', function (row) {
                            console.log(row.idLanguage + " " + row.nameLanguage);

                            // For each row in the Language Table, creation of a Language object
                            DataWords.languages.push(new DataWords.Language({
                                idLanguage: row.idLanguage,
                                nameLanguage: row.nameLanguage
                            }));
                        });
                    } else {
                        return db;
                    }
                }, function (error) {
                    console.log('Error Selecting all rows: ' + error.message);
                })

                // Select all Rows from Type Table to see if it's empty or not
                .then(function (db) {
                    console.log('Select all rows from table Type to see if it is empty or not...');
                    return db.eachAsync('SELECT COUNT(*) AS count FROM Type1', function (row) {
                        // If the Type table is empty, insert some Types
                        if (row.count == 0) {
                            console.log('Insert some rows in Type1 Table...');
                            db.runAsync('INSERT INTO Type1 (nameType, abreviationType) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)',
                                ["Noun", "N", "Adjective", "Adj", "Verb", "Vb", "Idiom", "Idi", "Adverb", "Adv", "Preposition", "Prep"]);
                        }
                    });
                }, function (error) {
                    console.log('Error Selecting all rows: ' + error.message);
                })

                // Select all Rows from Type Table
                .then(function (db) {
                    // Prevent for adding types again when navigate
                    if (DataWords.types.length == 0) {
                        console.log('Select all rows from table Type');
                        return db.eachAsync('SELECT idType, nameType, abreviationType FROM Type1 ORDER BY nameType', function (row) {
                            console.log(row.idType + " " + row.nameType + " " + row.abreviationType);

                            // For each row in the Type Table, creation of a Type object
                            DataWords.types.push(new DataWords.Type({
                                idType: row.idType,
                                nameType: row.nameType,
                                abreviationType: row.abreviationType
                            }));
                        });
                    } else {
                        return db;
                    }
                }, function (error) {
                    console.log('Error Selecting all rows: ' + error.message);
                })

                // Select all Rows from Word Table
                .then(function (db) {
                    // Prevent for adding words again when navigate
                    if (DataWords.dataList.length == 0) {
                        console.log('Select all rows from table Word');
                        return db.eachAsync('SELECT designation, translation, description, modificationdate, known, idWord, LanguageId, nameLanguage, idLanguage, TypeId, abreviationType, idType FROM Word1, Language1, Type1 WHERE LanguageId = idLanguage AND TypeId = idType ORDER BY modificationdate DESC', function (row) {
                            console.log(row.designation + " " + row.translation + " " + row.description + " " + row.LanguageId + " " + row.nameLanguage + " id = " + row.idWord);

                            // Add each word from the DB in the dataList binding list
                            DataWords.dataList.push(new DataWords.Word({
                                designation: row.designation,
                                translation: row.translation,
                                description: row.description,
                                modificationdate: row.modificationdate,
                                known: row.known == 1 ? DataWords.imageWordKnown : DataWords.imageWordNotKnown,
                                language: row.nameLanguage,
                                type: row.abreviationType,
                                idWord: row.idWord
                            }));
                        });
                    } else {
                        return db;
                    }
                }, function (error) {
                    console.log('Error Selecting all rows: ' + error.message);
                })

                // Close Database
                .then(function (db) {
                    console.log('Close Database');
                    db.close();
                }, function (error) {
                    console.log('Error Closing Database: ' + error.message);
                })

                .then(function () {
                    if (callback) {
                        callback();
                    }
                });
        },



        /* Add a new word to the database */
        addWordInDB: function (newWord, languageChoosenId, typeChoosenId, callback) {
            // Open Database
            SQLite3JS.openAsync(DataAccess.dbPath)
                // Insert the new Word
                .then(function (db) {
                    console.log('Insert a row in Word Table with the word ' + newWord.designation);
                    return db.runAsync('INSERT INTO Word1 (designation, LanguageId, translation, TypeId, description, modificationdate, known) VALUES (?, ?, ?, ?, ?, ?, ?)', [newWord.designation, languageChoosenId, newWord.translation, typeChoosenId, newWord.description, newWord.modificationdate, false])
                }, function (error) {
                    console.log('Error Inserting a row in Language Table: ' + error.message);
                })

                // Select the new word
                .then(function (db) {
                    console.log('Select the word just added');
                    return db.eachAsync('SELECT designation, translation, description, MAX(modificationdate) as modificationdate, known, idWord, LanguageId, nameLanguage, idLanguage, TypeId, abreviationType, idType FROM Word1, Language1, Type1 WHERE LanguageId = idLanguage AND TypeId = idType', function (row) {
                        console.log(row.designation + " " + row.translation + " " + row.description + " " + row.LanguageId + " " + row.nameLanguage + " id = " + row.idWord);
                        newWord = null;
                        newWord = new DataWords.Word({
                            designation: row.designation,
                            translation: row.translation,
                            description: row.description,
                            modificationdate: row.modificationdate,
                            known: row.known == 1 ? DataWords.imageWordKnown : DataWords.imageWordNotKnown,
                            language: row.nameLanguage,
                            type: row.abreviationType,
                            idWord: row.idWord
                        });
                    });
                }, function (error) {
                    console.log('Error Selecting a row in Word Table: ' + error.message);
                })

                // Close Database
                .then(function (db) {
                    console.log('Close Database');
                    db.close();
                }, function (error) {
                    console.log('Error Closing Database: ' + error.message);
                })

                // Return the new word added to the DB
                .then(function () {
                    if (callback) {
                        callback(newWord);
                    }
                });
        },



        /* Delete a word from database */
        deleteWordInDB: function (id) {
            // Open Database
            SQLite3JS.openAsync(DataAccess.dbPath)
                // Delete the word
                .then(function (db) {
                    console.log('Delete word which has the id ' + id);
                    return db.runAsync('DELETE FROM Word1 WHERE idWord = ?', [id])
                }, function (error) {
                    console.log('Error Deleting a row in Word Table: ' + error.message);
                })

                // Close Database
                .then(function (db) {
                    console.log('Close Database');
                    db.close();
                }, function (error) {
                    console.log('Error Closing Database: ' + error.message);
                });
        },



        /* Get all words from DB filtered and sorted */
        getWordsFiltered: function (partWhere, callback) {
            var wordsArray = new Array();

            // Open Database
            SQLite3JS.openAsync(DataAccess.dbPath)
                // Select all the words regarding all the filters
                .then(function (db) {
                    console.log('Select words filtered');
                    return db.eachAsync('SELECT designation, translation, description, modificationdate, known, idWord, LanguageId, nameLanguage, idLanguage, TypeId, abreviationType, idType FROM Word1, Language1, Type1 WHERE LanguageId = idLanguage AND TypeId = idType' + partWhere, function (row) {
                        console.log(row.designation + " " + row.translation + " " + row.description + " " + row.LanguageId + " " + row.nameLanguage + " id = " + row.idWord);

                        // Add each word in the array
                        wordsArray.push(new DataWords.Word({
                            designation: row.designation,
                            translation: row.translation,
                            description: row.description,
                            modificationdate: row.modificationdate,
                            known: row.known == 1 ? DataWords.imageWordKnown : DataWords.imageWordNotKnown,
                            language: row.nameLanguage,
                            type: row.abreviationType,
                            idWord: row.idWord
                        }));
                    });
                }, function (error) {
                    console.log('Error Selecting all rows: ' + error.message);
                })

                // Close Database
                .then(function (db) {
                    console.log('Close Database');
                    db.close();
                }, function (error) {
                    console.log('Error Closing Database: ' + error.message);
                })

                .then(function () {
                    if (callback) {
                        callback(wordsArray);
                    }
                });
        },



        /* Count number of words in the database */
        countWords: function (callback) {
            // Open Database
            SQLite3JS.openAsync(DataAccess.dbPath)
                // Count how many words are in the DB
                .then(function (db) {
                    console.log('Count words');
                    return db.eachAsync('SELECT COUNT(*) as count FROM Word1', function (row) {
                        console.log(row.count);
                        DataQuiz.nbWordsInDB = row.count;
                        DataQuiz.nbWordsForTheQuiz = row.count;
                    });
                }, function (error) {
                    console.log('Error Counting words: ' + error.message);
                })

                // Count how many words known are in the DB
                .then(function (db) {
                    console.log('Count words known');
                    return db.eachAsync('SELECT COUNT(*) as count, known FROM Word1 WHERE known = 1', function (row) {
                        console.log(row.count);
                        DataQuiz.nbWordsKnown = row.count;
                    });
                }, function (error) {
                    console.log('Error Counting words: ' + error.message);
                })

                // Close Database
                .then(function (db) {
                    console.log('Close Database');
                    db.close();
                }, function (error) {
                    console.log('Error Closing Database: ' + error.message);
                })

                // Return the number of words in the DB
                .then(function () {
                    if (callback) {
                        callback();
                    }
                });
        },



        /* Get number of words filtered from DB */
        getNbWordsFiltered: function (partWhere, callback) {
            // Open Database
            SQLite3JS.openAsync(DataAccess.dbPath)
                // Count how many are in the DB regarding the filters
                .then(function (db) {
                    console.log('Count words filtered');
                    return db.eachAsync('SELECT COUNT(*) as count, known, LanguageId, nameLanguage, idLanguage, TypeId, abreviationType, idType FROM Word1, Language1, Type1 WHERE LanguageId = idLanguage AND TypeId = idType' + partWhere, function (row) {
                        console.log(row.count);
                        DataQuiz.nbWordsForTheQuiz = row.count;
                    });
                }, function (error) {
                    console.log('Error Counting words filterd: ' + error.message);
                })

                // Close Database
                .then(function (db) {
                    console.log('Close Database');
                    db.close();
                }, function (error) {
                    console.log('Error Closing Database: ' + error.message);
                })

                .then(function () {
                    if (callback) {
                        callback();
                    }
                });
        }
    });
})();