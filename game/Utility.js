(function utilExporter (exports) {
    
    if (! _) _ = require('underscore')._;

    exports.floatsEqual = function(x, y, epislon) {
        return (
            _.isNumber(x) &&
            _.isNumber(y) && 
            Math.abs(x - y) < epislon
        );
    }

}) (typeof exports === 'undefined' ? this['Utility'] = {} : exports);

