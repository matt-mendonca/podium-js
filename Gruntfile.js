module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    compass: {
      dist: { 
        options: { 
          config: 'config.rb'
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          'public/js/podium.min.js': ['public/js/podium/podium.js'],
          'public/js/podium_admin.min.js': ['public/js/podium/podium_admin.js'],
          'public/js/podium_client.min.js': ['public/js/podium/podium_client.js'],
          'public/js/podium_presentation_controller.min.js': ['public/js/podium/podium_presentation_controller.js'],
          'public/js/podium_slides_editor.min.js': ['public/js/podium/podium_slides_editor.js']
        }
      }
    },
    watch: {
      sass: {
        files: 'public/sass/*',
        tasks: ['compass'],
      },
      js: {
        files: 'public/js/podium/*',
        tasks: ['uglify'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['compass', 'uglify']);

};