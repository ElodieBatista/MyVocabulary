(function () {
    "use strict";

    var page = WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
            // Apply translations
            WinJS.Resources.processAll();

            // Get the listView
            DataWords.listView = element.querySelector("#wordsListView").winControl;

            // Launch the App
            Home.launch();
        }
    });


    WinJS.Namespace.define("Home", {
        // Binding variables for translation & description of the selected word
        translationSelectedWordBS: null,
        descriptionSelectedWordBS: null,

        // Filters
        filters: [  { name: "filterLanguages",  beginQuery: "LanguageId = ",    isSorter: false     },
                    { name: "filterTypes",      beginQuery: "TypeId = ",        isSorter: false     },
                    { name: "filterKnown",      beginQuery: "known = ",         isSorter: false     },
                    { name: "filterSort",       beginQuery: "",                 isSorter: true      }],



        /* Launch the App */
        launch: function () {
            // Launch the DB
            DataAccess.launchDB(function () {
                // When all page is loaded and UI controls too
                WinJS.UI.processAll().done(function () {
                    // Binding One-Way on the translation of the selected Word
                    var translationSelectedWord = new DataWords.Word({ translation: "" });
                    WinJS.Binding.processAll(document.getElementById("translation"), translationSelectedWord);
                    Home.translationSelectedWordBS = WinJS.Binding.as(translationSelectedWord);

                    // Binding One-Way on the description of the selected Word
                    var descriptionSelectedWord = new DataWords.Word({ description: "" });
                    WinJS.Binding.processAll(document.getElementById("description"), descriptionSelectedWord);
                    Home.descriptionSelectedWordBS = WinJS.Binding.as(descriptionSelectedWord);

                    // Add event listeners to elements
                    Home.addEventListenersToElements();

                    // Fill Languages list and Types list
                    Utils.List.fillSelectList(document.getElementById("languagesList"), DataWords.languages, "language", "");
                    Utils.List.fillSelectList(document.getElementById("typesList"), DataWords.types, "type", "");

                    // Fill Filters lists
                    Utils.List.fillSelectList(document.getElementById("filterLanguages"), DataWords.languages, "allLanguages", "");
                    Utils.List.fillSelectList(document.getElementById("filterTypes"), DataWords.types, "allTypes", "");

                    // Apply translations
                    WinJS.Resources.processAll();

                    if (DataWords.dataList.length > 0) {
                        // Select the first word in the list
                        Home.selectFirstWord();
                    } else {
                        // Display the message "No Words"
                        Home.warnNoWords();
                    }
                });
            });
        },



        /* Add Event Listeners to Elements */
        addEventListenersToElements: function () {
            // On click on a listView item
            DataWords.listView.addEventListener("iteminvoked", function (evt) {
                evt.preventDefault();
                Home.updateWordInfos();
            }, false);

            // On Submit the Form to add a new Word
            var formAddWord = document.getElementById("formNewWord");
            formAddWord.addEventListener("submit", function (evt) {
                evt.preventDefault();
                Home.addWord(formAddWord);
            }, false);

            // On Change to the Filters
            for (var i = 0; i < Home.filters.length; i++) {
                document.getElementById(Home.filters[i].name).addEventListener("change", function (evt) {
                    evt.preventDefault();
                    Home.sortAndFilterWords();
                }, false);
            }

            // On Click on the Delete button
            document.getElementById("buttonDelete").addEventListener("click", function (evt) {
                evt.preventDefault();
                Home.confirmDelete(DataWords.currentItem.idWord);
            }, false);

            // On Click on the the Quiz button
            document.getElementById("buttonQuiz").addEventListener("click", function (evt) {
                evt.preventDefault();

                // Remove all words from the binding list
                Home.eraseAllList();

                // Navigate to the quizPreparation page
                WinJS.Navigation.navigate("/pages/quizPreparation/quizPreparation.html");
            }, false);
        },



        /* Select the first word in the ListView */
        selectFirstWord: function () {
            DataWords.listView.selection.add(0).done(function () {
                Home.updateWordInfos();
            });
        },



        /* Add a new Word */
        addWord: function (form) {
            // Find choosen Type and choosen Language
            var typeChoosen = Utils.Array.searchByPropertie(DataWords.types, "idType", form.typesList.value);
            var languageChoosen = Utils.Array.searchByPropertie(DataWords.languages, "idLanguage", form.languagesList.value);

            // Create a new Word instance
            var newWord = new DataWords.Word({
                designation: form.newWordDesignation.value,
                translation: form.newWordTranslation.value,
                description: form.newWordDescription.value,
                modificationdate: Date.now(),
                known: DataWords.imageWordNotKnown,
                language: languageChoosen.nameLanguage,
                type: typeChoosen.abreviationType
            });

            // Add the new Word to the Database
            DataAccess.addWordInDB(newWord, languageChoosen.idLanguage, typeChoosen.idType, function (newWordAdded) {
                // Delete filters and sorters
                if (DataWords.partWhereFilterQuery != ""
                    && DataWords.partWhereFilterQuery != " ORDER BY modificationdate DESC") {
                    Home.resetFilters();
                    Home.sortAndFilterWords();
                } else {
                    // Add the new Word to the dataList binding list
                    DataWords.dataList.unshift(newWordAdded);

                    if (DataWords.dataList.length == 1) {
                        // Erase the message "No Words"
                        Home.deleteWarnNoWords();

                        // Select the first word in the list
                        Home.selectFirstWord();
                    }
                }
            });

            // Reset the form
            Home.resetFormNewWord(form);
        },



        /* Delete a new Word */
        deleteWord: function (id) {
            // Delete the word from the DB
            DataAccess.deleteWordInDB(id);

            // Delete the word from the dataList binding list
            for (var i = 0; i < DataWords.dataList.length; i++) {
                if (DataWords.dataList.getItem(i).data.idWord == id) {
                    DataWords.dataList.splice(i, 1);
                    break;
                }
            }

            if (DataWords.dataList.length > 0) {
                // Select the first word in the list
                Home.selectFirstWord();
            } else {
                // Display message "No Words"
                Home.warnNoWords();
            }
        },


        /* Update the list of words regarding the filters */
        sortAndFilterWords: function () {
            // Get all values from filters
            var filtersValues = [];
            DataWords.partWhereFilterQuery = "";
            for (var i = 0; i < Home.filters.length; i++) {
                filtersValues[i] = document.getElementById(Home.filters[i].name).value;
                if (Home.filters[i].isSorter && filtersValues[i] != "") {
                    if (filtersValues[i] == "modificationdate") {
                        DataWords.partWhereFilterQuery += " ORDER BY " + filtersValues[i] + " DESC";
                    } else {
                        DataWords.partWhereFilterQuery += " ORDER BY LOWER(" + filtersValues[i] + ") ASC";
                    }
                } else if (filtersValues[i] != "") {
                    DataWords.partWhereFilterQuery += " AND " + Home.filters[i].beginQuery + filtersValues[i];
                }
            }

            // Remove all words from "words" array and from the binding list
            Home.eraseAllList();

            // Get words from the database
            DataAccess.getWordsFiltered(DataWords.partWhereFilterQuery, function () {
                if (DataWords.dataList.length > 0) {
                    // Select the first word in the list
                    Home.selectFirstWord();

                    // Erase the message from the 2nd column and reactivate the buttons from the third column
                    Home.deleteWarnNoWords();
                } else {
                    // Display a message saying there is no word and disable buttons from the third column
                    Home.warnNoWords();
                }
            });
        },



        /* Reset the form to add a new Word */
        resetFormNewWord: function (form) {
            form.newWordDesignation.value = "";
            form.newWordTranslation.value = "";
            form.newWordDescription.value = "";
            form.languagesList.value = "";
            form.typesList.value = "";
        },



        /* Update the third column of the home page with the word informations */
        updateWordInfos: function () {
            // Save current selected item
            DataWords.listView.selection.getItems().done(function (items) {
                DataWords.currentItem = items[0].data;

                // Update 3rd column
                Home.translationSelectedWordBS.translation = DataWords.currentItem.translation;
                Home.descriptionSelectedWordBS.description = DataWords.currentItem.description;
            });
        },



        /* Erase words list */
        eraseAllList: function () {
            while (DataWords.dataList.length > 0) {
                DataWords.dataList.pop();
            };
        },



        /* Delete all filters and sorters */
        resetFilters: function () {
            document.getElementById("filterLanguages").value = "";
            document.getElementById("filterTypes").value = "";
            document.getElementById("filterKnown").value = "";
            document.getElementById("filterSort").value = "modificationdate";
        },



        /* Display a message saying there is no words and disable third column */
        warnNoWords: function () {
            document.getElementById("wordMessage").innerHTML = WinJS.Resources.getString("messageNoWord").value;
            Home.translationSelectedWordBS.translation = "";
            Home.descriptionSelectedWordBS.description = "";
            document.getElementById("buttonEdit").disabled = true;
            document.getElementById("buttonDelete").disabled = true;
        },



        /* Delete the message saying there is no words and enable third column */
        deleteWarnNoWords: function () {
            document.getElementById("wordMessage").innerHTML = "";
            document.getElementById("buttonEdit").disabled = false;
            document.getElementById("buttonDelete").disabled = false;
        },



        /* Open a popup and ask the user deletion confirmation */
        confirmDelete: function (idWordToDelete) {
            var messagePopup = new Windows.UI.Popups.MessageDialog(WinJS.Resources.getString("messageConfirmationDelete").value, WinJS.Resources.getString("confirmation").value);
            messagePopup.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("yesButton").value, function () { Home.deleteWord(idWordToDelete) }));
            messagePopup.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("noButton").value));
            messagePopup.showAsync();
        }
    });
})();