"use strict";
var defaultOptions = {
    name: 'Philipp'
};
var Test = (function () {
    function Test(options) {
        this.name = defaultOptions.name;
        this.year = 0;
        if (options.name) {
            this.name = options.name;
        }
    }
    return Test;
}());
var myTest = new Test({ name: 'ok' });
//# sourceMappingURL=example.js.map