(function () {
    "use strict";

    var page = WinJS.UI.Pages.define("/pages/quiz/quiz.html", {
        ready: function (element, options) {
            // Apply translations
            WinJS.Resources.processAll();

            // Launch the Quiz
            Quiz.launch();
        }
    });


    WinJS.Namespace.define("Quiz", {
        // Binding variable for the Quiz panel informations
        quizInfosBS: null,

        // Binding variables for the buttons
        knowButtonBS: null,
        dontknowButtonBS: null,

        // Binding variable for the word to find
        wordToFindBS: null,

        // Containers to hide/to display and Binding
        displayTranslationContainerHideBS: null,
        displayWordContainerHideBS: null,
        idContainerToBlink: null,
        bindingSourceToBlink: null,

        // Style class
        Style: WinJS.Binding.define({
            display: "",
            disabled: ""
        }),


        /* Launch the Quiz */
        launch: function () {
            // When all page is loaded and UI controls too
            WinJS.UI.processAll().done(function () {
                // Do all the bindings
                Quiz.doBindings();

                // Kind of Quiz to determine which container to hide and which one to display
                if (DataQuiz.currentQuiz.kind.value == 1) {
                    // User have to find the translation
                    Quiz.idContainerToBlink = "translationToFindContainerHide";
                    Quiz.bindingSourceToBlink = Quiz.displayTranslationContainerHideBS;
                } else {
                    // User have to find the word
                    Quiz.idContainerToBlink = "wordToFindContainerHide";
                    Quiz.bindingSourceToBlink = Quiz.displayWordContainerHideBS;
                }

                // Hide the part to guess and disable buttons
                Quiz.hideAnswer();

                // Add event listeners to elements
                Quiz.addEventListenersToElements();

                // Retrieve words for the Quiz from DB
                Quiz.getWordsForQuiz(function () {
                    // Start the Quiz
                    Quiz.beginQuiz();
                });
            });
        },



        /* Do all bindings */
        doBindings: function () {
            // Binding One-Way on the Quiz panel informations
            var quizInfos = new DataQuiz.Quiz({ nbWordsRemaining: DataQuiz.currentQuiz.nbWords, nbWordsKnownNow: 0, nbWordsUnknownNow: 0 });
            WinJS.Binding.processAll(document.getElementById("nbWordsRemaining"), quizInfos);
            WinJS.Binding.processAll(document.getElementById("nbWordsKnownNow"), quizInfos);
            WinJS.Binding.processAll(document.getElementById("nbWordsUnknownNow"), quizInfos);
            Quiz.quizInfosBS = WinJS.Binding.as(quizInfos);

            // Binding One-Way on Translation container hide display style
            var displayTranslationContainerHide = new Quiz.Style({ display: "none" });
            WinJS.Binding.processAll(document.getElementById("translationToFindContainerHide"), displayTranslationContainerHide);
            Quiz.displayTranslationContainerHideBS = WinJS.Binding.as(displayTranslationContainerHide);

            // Binding One-Way on Word container hide display style
            var displayWordContainerHide = new Quiz.Style({ display: "none" });
            WinJS.Binding.processAll(document.getElementById("wordToFindContainerHide"), displayWordContainerHide);
            Quiz.displayWordContainerHideBS = WinJS.Binding.as(displayWordContainerHide);

            // Binding One-Way on "Know" button
            var knowButton = new Quiz.Style({ disabled: "true" });
            WinJS.Binding.processAll(document.getElementById("buttonKnow"), knowButton);
            Quiz.knowButtonBS = WinJS.Binding.as(knowButton);

            // Binding One-Way on "Dont know" button
            var dontknowButton = new Quiz.Style({ disabled: "true" });
            WinJS.Binding.processAll(document.getElementById("buttonDontKnow"), dontknowButton);
            Quiz.dontknowButtonBS = WinJS.Binding.as(dontknowButton);

            // Binding One-Way on the designation of the word to find
            var wordToFind = new DataWords.Word({ designation: "", translation: "", description: "" });
            WinJS.Binding.processAll(document.getElementById("wordToFind"), wordToFind);
            WinJS.Binding.processAll(document.getElementById("translationToFind"), wordToFind);
            WinJS.Binding.processAll(document.getElementById("descriptionToFind"), wordToFind);
            Quiz.wordToFindBS = WinJS.Binding.as(wordToFind);

            // Binding One-Time on the infos from the 1st column and the summary
            document.getElementById("nbWordsKnownBefore").innerText = DataQuiz.currentQuiz.nbWordsKnownBefore;
            document.getElementById("nbWordsUnknownBefore").innerText = DataQuiz.currentQuiz.nbWordsUnknownBefore;
            document.getElementById("nbWordsForQuiz").innerText = DataQuiz.currentQuiz.nbWords;
            document.getElementById("quizLanguageChoosen").innerText = DataQuiz.currentQuiz.language.name;
            document.getElementById("quizTypeChoosen").innerText = DataQuiz.currentQuiz.type.name;
            document.getElementById("quizKnowChoosen").innerText = DataQuiz.currentQuiz.wordsKnown.name;
            document.getElementById("quizKindChoosen").innerText = DataQuiz.currentQuiz.kind.name;
        },



        /* Add Event Listeners to Elements */
        addEventListenersToElements: function () {
            // On Click on the Know button
            document.getElementById("buttonKnow").addEventListener("click", function (evt) {
                evt.preventDefault();
                Quiz.updateWordToKnown();
            }, false);

            // On Click on the Dont Know button
            document.getElementById("buttonDontKnow").addEventListener("click", function (evt) {
                evt.preventDefault();
                Quiz.updateWordToUnknown();
            }, false);

            // On Click on the container
            document.getElementById(Quiz.idContainerToBlink).addEventListener("click", function (evt) {
                evt.preventDefault();
                Quiz.displayAnswer();
            }, false);
        },



        /* Retrieve all words for the Quiz */
        getWordsForQuiz: function (callback) {
            // Get the words from DB
            DataAccess.getWordsFiltered(DataQuiz.partWhereFilterQuery, function (wordsArray) {
                // Save them
                DataQuiz.currentQuiz.wordsForQuiz = wordsArray;

                // Add a fake word because we are going to do a "pop()" on the words for quiz array
                DataQuiz.currentQuiz.wordsForQuiz.push(new DataWords.Word());

                if (callback) {
                    callback();
                }
            });
        },



        /* Start/Continue the Quiz */
        beginQuiz: function () {
            // Update Quiz panel informations
            Quiz.updatePanelInfos();

            // Update the current word
            Quiz.displayNextWord();

            // Hide the part to guess
            Quiz.hideAnswer();
        },



        /* Update Quiz Panel Informations */
        updatePanelInfos: function () {
            Quiz.quizInfosBS.nbWordsRemaining = DataQuiz.currentQuiz.nbWordsRemaining;
            Quiz.quizInfosBS.nbWordsKnownNow = DataQuiz.currentQuiz.nbWordsKnownNow;
            Quiz.quizInfosBS.nbWordsUnknownNow = DataQuiz.currentQuiz.nbWordsUnknownNow;
        },



        /* Update the current word for the quiz */
        displayNextWord: function () {
            // Delete the word from the wordsForQuiz Array
            DataQuiz.currentQuiz.wordsForQuiz.pop();

            if (DataQuiz.currentQuiz.wordsForQuiz.length > 0) {
                // Update Current Word
                DataQuiz.currentQuiz.currentWord = DataQuiz.currentQuiz.wordsForQuiz[DataQuiz.currentQuiz.wordsForQuiz.length - 1];

                // Update the display with the new word to guess
                Quiz.wordToFindBS.designation = DataQuiz.currentQuiz.currentWord.designation;
                Quiz.wordToFindBS.translation = DataQuiz.currentQuiz.currentWord.translation;
                Quiz.wordToFindBS.description = DataQuiz.currentQuiz.currentWord.description;
            } else {
                // Display Scores
                Quiz.displayScores();
            }
        },



        /* Display the container and disable the buttons "Know" and "Dont Know" */
        hideAnswer: function () {
            // Display the container
            Quiz.bindingSourceToBlink.display = "block";

            // Disable buttons
            Quiz.knowButtonBS.disabled = true;
            Quiz.dontknowButtonBS.disabled = true;
        },



        /* Hide the container and enable the buttons "Know" and "Dont Know" */
        displayAnswer: function () {
            // Hide the container
            Quiz.bindingSourceToBlink.display = "none";

            // Enable buttons
            Quiz.knowButtonBS.disabled = false;
            Quiz.dontknowButtonBS.disabled = false;
        },



        /* Update the word to known in DB if needed and update Quiz information */
        updateWordToKnown: function () {
            // If user didn't know this word before
            if (DataQuiz.currentQuiz.currentWord.known == DataWords.imageWordNotKnown) {
                // Update the word in DB
                DataAccess.updateWordKnown(DataQuiz.currentQuiz.currentWord.idWord, 1);

                // Update Quiz informations
                DataQuiz.currentQuiz.nbWordsKnownNow++;
                DataQuiz.currentQuiz.nbWordsUnknownNow--;
            }

            // Update Quiz informations
            DataQuiz.currentQuiz.nbWordsRemaining--;

            // Continue the Quiz
            Quiz.beginQuiz();
        },



        /* Update the word to unkown in DB if needed and update Quiz information */
        updateWordToUnknown: function () {
            // If user knew this word before
            if (DataQuiz.currentQuiz.currentWord.known == DataWords.imageWordKnown) {
                // Update the word in DB
                DataAccess.updateWordKnown(DataQuiz.currentQuiz.currentWord.idWord, 0);

                // Update Quiz informations
                DataQuiz.currentQuiz.nbWordsKnownNow--;
                DataQuiz.currentQuiz.nbWordsUnknownNow++;
            }

            // Update Quiz informations
            DataQuiz.currentQuiz.nbWordsRemaining--;

            // Continue the Quiz
            Quiz.beginQuiz();
        },



        /* Open a popup displaying the score */
        displayScores: function () {
            // Determine if user has improved or not
            var result = (DataQuiz.currentQuiz.nbWordsKnownNow - DataQuiz.currentQuiz.nbWordsKnownBefore);
            var messagePopup, percentResult;

            if (result > 0) {
                messagePopup = new Windows.UI.Popups.MessageDialog(WinJS.Resources.getString("messageGoodScore").value, WinJS.Resources.getString("results").value);
            } else if (result < 0) {
                messagePopup = new Windows.UI.Popups.MessageDialog(WinJS.Resources.getString("messageBadScore").value, WinJS.Resources.getString("results").value);
            } else {
                messagePopup = new Windows.UI.Popups.MessageDialog(WinJS.Resources.getString("messageEqualScore").value, WinJS.Resources.getString("results").value);
            }
            messagePopup.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("okButton").value, function () { WinJS.Navigation.navigate("/pages/home/home.html"); }));
            messagePopup.showAsync();
        }
    });
})();