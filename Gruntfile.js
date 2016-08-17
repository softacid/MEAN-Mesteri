// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

    // ===========================================================================
    // CONFIGURE GRUNT ===========================================================
    // ===========================================================================
    grunt.initConfig({

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),


      //TODO activate this in production
      uglify: {
        options: {
          banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
        },
        build: {
          files: {
            'client/shared/concat.min.js': 'client/**/*.js'
          }
        }
      },
      less: {
        build: {
          files: {
            'client/shared/style.css': 'client/css/*.less'
          }
        }
      },
      cssmin: {
        options: {
          banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
        },
        build: {
          files: {
            'client/shared/style.min.css': 'client/shared/style.css'
          }
        }
      },
      clean: ["client/shared/shared.concat.js"],
      concat: {
        // JAVASCRIPT
        shared_js: {
          src: [
            'client/app.js',
            'client/js/**/*.js'
          ],
          dest: 'client/shared/shared.concat.js'
        }
      },
      watch: {
        stylesheets: {
          files: ['client/shared/style.min.css', 'client/css/*.less'],
          tasks: ['less', 'cssmin']
        },
        scripts: {
          files: ['client/app.js',
          'client/js/**/*.js'],
          tasks: ['clean', 'concat']
        }
      }
    });

    // ===========================================================================
    // CREATE TASKS ==============================================================
    // ===========================================================================
    grunt.registerTask('default', ['less', 'cssmin', 'clean', 'concat']);

    // ===========================================================================
    // LOAD GRUNT PLUGINS ========================================================
    // ===========================================================================
    // we can only load these if they are in our package.json
    // make sure you have run npm install so our app can find these
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');

};
