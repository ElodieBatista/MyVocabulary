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



        /* Launch the App */
        launch: function () {
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
                
                if (DataWords.dataList.length > 0) {
                    // Select the first word in the list
                    Home.selectFirstWord();
                } else {
                    Home.warnNoWords();
                }
            });
        },



        /* Add Event Listeners to Elements */
        addEventListenersToElements: function () {
            // On click on a listView item
            DataWords.listView.addEventListener("iteminvoked", function (evt) {
                evt.preventDefault();
                Home.updateWordInfos();
            }, false);
        },



        /* Select the first word in the ListView */
        selectFirstWord: function () {
            DataWords.listView.selection.add(0).done(function () {
                Home.updateWordInfos();
            });
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
    });
})();