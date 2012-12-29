(function () {
    "use strict";

    var page = WinJS.UI.Pages.define("/pages/quizPreparation/quizPreparation.html", {
        ready: function (element, options) {
            // Apply translations
            WinJS.Resources.processAll();

            // Launch the Preparation for a new Quiz
            QuizPreparation.launch();
        }
    });


    WinJS.Namespace.define("QuizPreparation", {
        // Binding variable for the number of words for the quiz
        nbWordsForQuizBS: null,

        // Filters
        filters: [  { name: "languagesList",    beginQuery: "LanguageId = ",    isSorter: false     },
                    { name: "typesList",        beginQuery: "TypeId = ",        isSorter: false     },
                    { name: "knowList",         beginQuery: "known = ",         isSorter: false     },
                    { name: "kindList",         beginQuery: "",                 isSorter: true      }],



        /* Launch the Preparation for a new Quiz */
        launch: function () {
            // When all page is loaded and UI controls too
            WinJS.UI.processAll().done(function () {
                // Binding One-Way on the number of words for the quiz
                var nbWordsForQuiz = new DataQuiz.Quiz({ nbWords: 0 });
                WinJS.Binding.processAll(document.getElementById("nbWordsForQuiz"), nbWordsForQuiz);
                QuizPreparation.nbWordsForQuizBS = WinJS.Binding.as(nbWordsForQuiz);

                // Binding One-Time on the infos from the 1st column
                DataAccess.countWords(function () {
                    document.getElementById("nbWords").innerText = DataQuiz.nbWordsInDB;
                    document.getElementById("nbWordsKnown").innerText = DataQuiz.nbWordsKnown;
                    document.getElementById("nbWordsUnknown").innerText = DataQuiz.nbWordsInDB - DataQuiz.nbWordsKnown;

                    // Update number of words for the Quiz
                    QuizPreparation.updateNbWordsForQuiz(DataQuiz.nbWordsForTheQuiz);
                });

                // Add event listeners to elements
                QuizPreparation.addEventListenersToElements();

                // Fill Languages list and Types list
                Utils.List.fillSelectList(document.getElementById("languagesList"), DataWords.languages, "allLanguages", "");
                Utils.List.fillSelectList(document.getElementById("typesList"), DataWords.types, "allTypes", "");
            });
        },



        /* Add Event Listeners to Elements */
        addEventListenersToElements: function () {
            // On Submit the Form to create a new Quiz
            var formNewQuiz = document.getElementById("formNewQuiz");
            formNewQuiz.addEventListener("submit", function (evt) {
                evt.preventDefault();
                QuizPreparation.validateQuiz();
            }, false);

            // On Change to the Filters
            for (var i = 0; i < QuizPreparation.filters.length; i++) {
                document.getElementById(QuizPreparation.filters[i].name).addEventListener("change", function (evt) {
                    evt.preventDefault();
                    QuizPreparation.getNbOfWordsFiltered();
                }, false);
            }
        },



        /* Update the number of words for the quiz */
        updateNbWordsForQuiz: function (nb) {
            QuizPreparation.nbWordsForQuizBS.nbWords = nb;
        },



        /* Get the new number of words for the quiz */
        getNbOfWordsFiltered: function () {
            // Get all values from filters
            var filtersValues = [];
            DataQuiz.partWhereFilterQuery = "";
            for (var i = 0; i < QuizPreparation.filters.length; i++) {
                filtersValues[i] = document.getElementById(QuizPreparation.filters[i].name).value;
                if (!QuizPreparation.filters[i].isSorter && filtersValues[i] != "") {
                    DataQuiz.partWhereFilterQuery += " AND " + QuizPreparation.filters[i].beginQuery + filtersValues[i];
                }
            }
            
            // Get number of words filtered from the database
            DataAccess.getNbWordsFiltered(DataQuiz.partWhereFilterQuery, function () {
                // Update number of words for the Quiz
                QuizPreparation.updateNbWordsForQuiz(DataQuiz.nbWordsForTheQuiz);
            });
        },



        /* Check if the Quiz to create contains at least 1 word */
        validateQuiz: function () {
            if (QuizPreparation.nbWordsForQuizBS.nbWords > 0) {
                QuizPreparation.createQuiz();
            } else {
                // Open a popup to explain that there is no word for the Quiz
                var messagePopup = new Windows.UI.Popups.MessageDialog(WinJS.Resources.getString("messageQuizCreationImpossible").value, WinJS.Resources.getString("quizCreationImpossible").value);
                messagePopup.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("okButton").value));
                messagePopup.showAsync();
            }
        },



        /* Create the Quiz */
        createQuiz: function () {
            // Get filters choosen
            QuizPreparation.updateFiltersChoosen();

            // Create the Quiz
            DataQuiz.currentQuiz = new DataQuiz.Quiz({
                nbWords: DataQuiz.nbWordsForTheQuiz,
                language: DataQuiz.filtersChoosen[0],
                type: DataQuiz.filtersChoosen[1],
                wordsKnown: DataQuiz.filtersChoosen[2],
                kind: DataQuiz.filtersChoosen[3],
                nbWordsRemaining: DataQuiz.nbWordsForTheQuiz,
                nbWordsKnownNow: DataQuiz.nbWordsKnown,
                nbWordsUnknownNow: (DataQuiz.nbWordsInDB - DataQuiz.nbWordsKnown),
                nbWordsKnownBefore: DataQuiz.nbWordsKnown,
                nbWordsUnknownBefore: (DataQuiz.nbWordsInDB - DataQuiz.nbWordsKnown)
            })

            // Navigate to the quiz page
            WinJS.Navigation.navigate("/pages/quiz/quiz.html");
        },



        /* Get the filters values and save them */
        updateFiltersChoosen: function () {
            var filterElement;

            // Init the Filter Array
            DataQuiz.filtersChoosen = null;
            DataQuiz.filtersChoosen = new Array();

            for (var i = 0; i < 4; i++) {
                filterElement = document.getElementById(QuizPreparation.filters[i].name);
                DataQuiz.filtersChoosen.push(new DataQuiz.Filter({
                    name: filterElement[filterElement.selectedIndex].label,
                    value: filterElement.value
                }));
            }
        }
    });
})();