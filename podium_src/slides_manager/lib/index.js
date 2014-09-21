/**
 * This file contains the slides deck management functions.
 */
 
var fileSystem = require('fs-extra'),
    cheerio = require('cheerio');

module.exports = function() {
  var scanSlidesDir = function(slides, baseDir) {
        var slideDeck = null,
            directories = fileSystem.readdirSync(baseDir + '/slides');

        // Iterate over the contents of the Slides directory
        directories.forEach(function(slidesDirectory) {
          if(slidesDirectory !== '.DS_Store') {
            // OSX garbage
            if (fileSystem.existsSync(baseDir + "/slides/"+slidesDirectory+"/podium.json")) {
              // parse the podium file and add it to our podium.slides object
              slideDeck = JSON.parse(
                fileSystem.readFileSync(baseDir + "/slides/"+slidesDirectory+"/podium.json")
              );
            } else {
              console.log("\nNote: There is no podium config file in /slides/"+slidesDirectory+"/\nSlide config will be automatically set.");

              slideDeck = {
                route: "/" + slidesDirectory.replace(/\s+/g, '-').replace(/_/g, '-').toLowerCase(),
                title: slidesDirectory.replace(/-/g, ' ').replace(/_/g, ' '),
                summary: '',
                published: false
              };
            }

            /* 
              Note: route is both the key and a property. This 
              is so we can identify the slide by the client's 
              window.location.pathname (key) and access it as 
              a property for templating (property - might rethink 
              this later). 
             */
            slides[slideDeck.route] = {
              title: slideDeck.title,
              summary: slideDeck.summary,
              location: location = "/slides/"+slidesDirectory+"/",
              published: slideDeck.published,
              route: slideDeck.route,
              // initial slide horizontal index
              indexh : 0,  
              // initial slide veriticlal index
              indexv : 0,
              // if the slides are in overview mode
              overview: false
            }  
          };
        });

        return slides;
      },

      getPublishedSlides = function(slides) {
        var publishedSlides = {};

        for(deckRoute in slides) {
          if(deckRoute && slides[deckRoute].published === true) {
            publishedSlides[deckRoute] = slides[deckRoute];
          }
        }

        return publishedSlides;
      },

      createSlideDeck = function(config, slides, slideInfo, baseDir) {
        var templateDeckLocation = slides[config.templateDeck].location,
            newDeckLocation = '';

        if(!slideInfo.title || !slideInfo.route || !slideInfo.summary) {
          return 'emptyFields';
        }

        // Add a / to the front of the route if it isn't there
          if(slideInfo.route.charAt(0) !== '/') {
            slideInfo.route = "/" + slideInfo.route;
          }
        // Lowercase and replace spaces with dashes
          slideInfo.route = slideInfo.route.toLowerCase().replace(/\s+/g, '-');
        
        if(slideInfo.route === '/' || slideInfo.route.substring(0, 6) === '/admin') {
          return 'routeTaken';
        }

        for(slideRoutes in slides) {
          if(slideInfo.route === slideRoutes) {
            return 'routeTaken';
          }
        }

        slideInfo.published = false;

        slides[slideInfo.route] = slideInfo;

        newDeckLocation = '/slides' + slideInfo.route + '/';

        fileSystem.copySync(baseDir + templateDeckLocation, baseDir + newDeckLocation);
        
        fileSystem.writeFileSync(baseDir + newDeckLocation + 'podium.json', JSON.stringify(slideInfo));

        slides[slideInfo.route].location = newDeckLocation;
        slides[slideInfo.route].indexh = 0;  
        slides[slideInfo.route].indexv = 0;
        slides[slideInfo.route].overview = false;

        return null;
      },

      deleteSlideDeck = function(slides, slideInfo, baseDir) {
        delete slides[slideInfo.route];
        fileSystem.removeSync(baseDir + slideInfo.location);

        return null;
      },

      updateSlideDeck = function(slides, currentSlideInfo, updatedSlideInfo, baseDir) {
        if(!updatedSlideInfo.title || !updatedSlideInfo.route || !updatedSlideInfo.summary) {
          return 'emptyFields';
        }

        // Add a / to the front of the route if it isn't there
          if(updatedSlideInfo.route.charAt(0) !== '/') {
            updatedSlideInfo.route = "/" + updatedSlideInfo.route;
          }
        // Lowercase and replace spaces with dashes
          updatedSlideInfo.route = updatedSlideInfo.route.toLowerCase().replace(/\s+/g, '-');
        
        if(updatedSlideInfo.route === '/' || updatedSlideInfo.route.substring(0, 6) === '/admin') {
          return 'routeTaken';
        }

        for(slideRoutes in slides) {
          if(updatedSlideInfo.route !== currentSlideInfo.route && updatedSlideInfo.route === slideRoutes) {
            return 'routeTaken';
          }
        }

        currentSlideInfo.title = updatedSlideInfo.title;
        currentSlideInfo.summary = updatedSlideInfo.summary;

        if(updatedSlideInfo.published === 'on') {
          updatedSlideInfo.published = true;
          currentSlideInfo.published = true;
        } else {
          updatedSlideInfo.published = false;
          currentSlideInfo.published = false;
        }

        if(updatedSlideInfo.route !== currentSlideInfo.route) {
          delete slides[currentSlideInfo.route];

          currentSlideInfo.route = updatedSlideInfo.route;
        } 

        slides[currentSlideInfo.route] = currentSlideInfo;
        
        // Writing to file using updatedSlideInfo since it doesn't have properties set by the server (e.g. filesystem location)
        // Strictly meta / config
        fileSystem.writeFileSync(baseDir + currentSlideInfo.location + 'podium.json', JSON.stringify(updatedSlideInfo));

        return null;
      },

      updateSlideDeckContent = function(config, slides, currentSlideInfo, updatedSlideContent, baseDir) {
        var slidesMarkup = '',
            currentSlideContent = '';

        if(!updatedSlideContent) {
          return 'emptyFields';
        }

        currentSlideContent = fileSystem.readFileSync(baseDir + currentSlideInfo.location + 'index.html');

        $current = cheerio.load(currentSlideContent);
        
        $updated = cheerio.load(updatedSlideContent);

        // Clean up dom
        $updated('.slides').removeAttr('style');

        $updated('a').removeAttr('data-cke-saved-href');
        $updated('img').removeAttr('data-cke-saved-src');

        $updated('[data-markdown-disabled-podium]').removeAttr('data-markdown-disabled-podium').attr('data-markdown', '');
        
        $updated('.podium-editor-code-wrapper').each(function(index) {
          var codeHtml = $updated(this).html();
        
          $updated(this).replaceWith("<pre>"+codeHtml+"</pre>");
        });

        $updated('section').removeClass('present').removeClass('past').removeClass('stack').removeClass('future').removeAttr('hidden').removeAttr('style');

        $updated('section').each(function(index) {
          var classAttr = $updated(this).attr('class');

          if(!classAttr) {
            $updated(this).removeAttr('class');
          }
        });

        $current('.slides').html($updated.html());

        fileSystem.writeFileSync(baseDir + currentSlideInfo.location + 'index.html', $current.html());

        return null;
      };

  return {
    scanSlidesDir: scanSlidesDir,
    getPublishedSlides: getPublishedSlides,
    createSlideDeck: createSlideDeck,
    deleteSlideDeck: deleteSlideDeck,
    updateSlideDeck: updateSlideDeck,
    updateSlideDeckContent: updateSlideDeckContent
  };
}();