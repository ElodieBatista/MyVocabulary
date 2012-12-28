(function () {
    "use strict";

    var page = WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
            // Apply translations
            WinJS.Resources.processAll();
        }
    });
})();