(function () {
    "use strict";


    WinJS.Namespace.define("DataQuiz", {
        // Quiz Class
        Quiz: WinJS.Binding.define({
            nbWords: "",
            language: "",
            type: "",
            wordsKnown: "",
            kind: "",
            nbWordsRemaining: "",
            nbWordsKnownNow: "",
            nbWordsUnknownNow: "",
            nbWordsKnownBefore: "",
            nbWordsUnknownBefore: "",
            wordsForQuiz: new Array(),
            currentWord: ""
        }),

        // Filter Class
        Filter: WinJS.Binding.define({
            name: "",
            value: ""
        }),

        // Filters Choosen for the Quiz
        filtersChoosen: new Array(),

        // Infos for 1st column
        nbWordsInDB: "",
        nbWordsKnown: "",
        nbWordsForTheQuiz: "",

        // Quiz
        currentQuiz: "",

        // Query to retrieve words for the Quiz
        partWhereFilterQuery: ""
    });
})();