module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'game/bundle.js': ['game/init.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    
    grunt.registerTask('default', ['browserify']);
}
