(function () {
    "use strict";

    var page = WinJS.UI.Pages.define("/pages/about/about.html", {
        ready: function (element, options) {
            // Apply translations
            WinJS.Resources.processAll();
        }
    });
})();