(function () {
    "use strict";

    WinJS.Namespace.define("Utils.Array", {

        /* Return an element from an array which has a certain propertie */
        searchByPropertie: function(array, propertie, wantedValue) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][propertie] == wantedValue) {
                    return array[i];
                }
            }
        }
    });


    WinJS.Namespace.define("Utils.List", {

        /* Fill a Select HTML list with a list of objects whose first propertie is an ID and the second is a NAME */
        fillSelectList: function (list, elements, defaultTitle, defaultValue) {
            // Fill the first option with translation
            list.appendChild(new Option(WinJS.Resources.getString(defaultTitle).value, defaultValue));

            // For each elements, add a new Option to the Select list
            var properties;
            for (var i = 0; i < elements.length; i++) {
                properties = Object.keys(elements[i]._backingData);
                list.appendChild(new Option(elements[i][properties[1]], elements[i][properties[0]]));
            }
        }
    });
})();