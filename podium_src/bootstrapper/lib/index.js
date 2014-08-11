/**
 * Module dependencies.
 */
var fileSystem = require('fs');

module.exports = function() {
  /** 
   * Load up the configuration and fire up the express server.
   * Note that init function at the very bottom is what really
   * starts everything.
   */
  var loadConfig = function (data, server, app, rootDir) {
        var config = JSON.parse(data);

        server.listen(config.port);
        app.set('views', rootDir + '/views');
        app.set('view engine', 'jade');
        console.log('podium server listening on port '+config.port);
        
        return config;
      },

      scanSlidesDir = function(directories, slides, rootDir) {
        var slideDeck = null;

        // Iterate over the contents of the Slides directory
        directories.forEach(function(slidesDirectory) {
          if(slidesDirectory === '.DS_Store') {
            // OSX garbage
            // continue;

          // Check if a podium json file exists in the directory 
          } else if (fileSystem.existsSync(rootDir + "/slides/"+slidesDirectory+"/podium.json")) {
            // parse the podium file and add it to our podium.slides object
            slideDeck = JSON.parse(
              fileSystem.readFileSync(rootDir + "/slides/"+slidesDirectory+"/podium.json")
            );

            /* 
              Note: route is both the key and a property. This 
              is so we can identify the slide by the client's 
              window.location.pathname (key) and access it as 
              a property for templating (property - might rethink 
              this later). 
             */
            slides[slideDeck.route] = {
              name: slideDeck.name,
              location: location = "/slides/"+slidesDirectory+"/",
              route: slideDeck.route,
              // initial slide horizontal index
              indexh : 0,  
              // initial slide veriticlal index
              indexv : 0,
              // if the slides are in overview mode
              overview: false  
            };
          } else {
            console.log("\nNote: There is no podium config file in /slides/"+slidesDirectory+"/\nSlide config will be automatically set.");

            slideDeck = {
              route: "/" + slidesDirectory.replace(/\s+/g, '-').replace(/_/g, '-').toLowerCase(),
              name: slidesDirectory.replace(/-/g, ' ').replace(/_/g, ' ')
            };

            slides[slideDeck.route] = {
              name: slideDeck.name,
              location: location = "/slides/"+slidesDirectory+"/",
              route: slideDeck.route,
              // initial slide horizontal index
              indexh : 0,  
              // initial slide veriticlal index
              indexv : 0,
              // if the slides are in overview mode
              overview: false  
            };
          }
        });

        return slides;
      }

  return {
    loadConfig: loadConfig,
    scanSlidesDir: scanSlidesDir
  };
}();