(function () {
    "use strict";

    
    // Define Namespace "DataWords"
    WinJS.Namespace.define("DataWords", {
        // Binding List of Words
        dataList: new WinJS.Binding.List(),

        // Word Class
        Word: WinJS.Binding.define({
            designation: "",
            translation: "",
            description: "",
            modificationdate: "",
            known: "",
            language: "",
            type: "",
            idWord: ""
        }),

        // Language Class
        Language: WinJS.Binding.define({
            idLanguage: "",
            nameLanguage: ""
        }),

        // Type Class
        Type: WinJS.Binding.define({
            idType: "",
            nameType: "",
            abreviationType: ""
        }),

        // ListView
        listView: null,

        // Current selected Item
        currentItem: null,

        // Arrays for Languages and Types
        languages: new Array(),
        types: new Array(),

        // Images
        imageWordKnown: "/images/known.png",
        imageWordNotKnown: "/images/notKnown.png"
    });
})();