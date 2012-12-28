(function () {
    "use strict";


    // Define Namespace "DataAccess"
    WinJS.Namespace.define("DataAccess", {

        /* Launch the App */
        launchApp: function () {
            // Add some words in the dataList binding list
            DataWords.dataList.push(new DataWords.Word({
                designation: "a binder",
                translation: "un classeur",
                description: "I have a binder in my school bag.",
                modificationdate: Date.now(),
                known: DataWords.imageWordNotKnown,
                language: "English",
                type: "N",
                idWord: "1"
            }));

            DataWords.dataList.push(new DataWords.Word({
                designation: "steep",
                translation: "pentu",
                description: "These moutains are very steep!",
                modificationdate: Date.now(),
                known: DataWords.imageWordNotKnown,
                language: "English",
                type: "Adj",
                idWord: "1"
            }));
        }
    });



    // Start
    DataAccess.launchApp();
})();