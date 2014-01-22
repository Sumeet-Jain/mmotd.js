(function utilExporter (exports) {
    
    if (typeof _ === 'undefined') {
        _ = require('underscore');
    }

    exports.floatsEqual = function(x, y, epislon) {
        return (
            _.isNumber(x) &&
            _.isNumber(y) && 
            Math.abs(x - y) < epislon
        );
    }

    exports.removeFromArr = function (arr, item) {
        var index = arr.indexOf(item);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }

}) (typeof exports === 'undefined' ? this['Utility'] = {} : exports);

