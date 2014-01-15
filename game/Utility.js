(function utilExporter (exports) {

    exports.floatsEqual = function(x, y, epislon) {
        return (
            typeof x === 'number' && 
            typeof y === 'number' && 
            Math.abs(x - y) < epislon
        );
    }

}) (typeof exports === 'undefined' ? this['Utility'] = {} : exports);

