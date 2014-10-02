/**
 * This file contains the slides deck management functions.
 */
 
var cheerio = require('cheerio');

module.exports = function() {
  var getPublishedSlides = function(slides) {
        var publishedSlides = {};

        for(deckRoute in slides) {
          if(deckRoute && slides[deckRoute].published === true) {
            publishedSlides[deckRoute] = slides[deckRoute];
          }
        }

        return publishedSlides;
      },

      createSlideDeck = function(slides, slideInfo, baseDir) {
        if(!slideInfo.title || !slideInfo.route || !slideInfo.summary) {
          return {message: 'emptyFields'};
        }

        // Add a / to the front of the route if it isn't there
          if(slideInfo.route.charAt(0) !== '/') {
            slideInfo.route = "/" + slideInfo.route;
          }
        // Lowercase and replace spaces with dashes
          slideInfo.route = slideInfo.route.toLowerCase().replace(/\s+/g, '-');
        
        if(slideInfo.route === '/' || slideInfo.route.substring(0, 6) === '/admin') {
          return {message: 'routeTaken'};
        }

        for(slideRoutes in slides) {
          if(slideInfo.route === slideRoutes) {
            return {message: 'routeTaken'};
          }
        }

        slideInfo.published = false;

        return {
          'message': null,
          'slideInfo': slideInfo
        };
      },

      updateSlideDeck = function(slides, currentSlideInfo, updatedSlideInfo, baseDir) {
        if(!updatedSlideInfo.title || !updatedSlideInfo.route || !updatedSlideInfo.summary) {
          return {message: 'emptyFields'};
        }

        // Add a / to the front of the route if it isn't there
          if(updatedSlideInfo.route.charAt(0) !== '/') {
            updatedSlideInfo.route = "/" + updatedSlideInfo.route;
          }
        // Lowercase and replace spaces with dashes
          updatedSlideInfo.route = updatedSlideInfo.route.toLowerCase().replace(/\s+/g, '-');
        
        if(updatedSlideInfo.route === '/' || updatedSlideInfo.route.substring(0, 6) === '/admin') {
          return {message: 'routeTaken'};
        }

        for(slideRoutes in slides) {
          if(updatedSlideInfo.route !== currentSlideInfo.route && updatedSlideInfo.route === slideRoutes) {
            return {message: 'routeTaken'};
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

        return {
          'message': null,
          'currentSlideInfo': currentSlideInfo,
          'updatedSlideInfo': updatedSlideInfo
        };
      },

      updateSlideDeckContent = function(config, slides, currentSlideInfo, currentSlideContent, updatedSlideContent, baseDir) {
        var slidesMarkup = '',
           
        $current = cheerio.load(currentSlideContent);
        
        $updated = cheerio.load(updatedSlideContent);

        // Clean up dom
        $updated('.slides').removeAttr('style');

        $updated('a').removeAttr('data-cke-saved-href');
        $updated('img').removeAttr('data-cke-saved-src');

        $updated('[data-markdown-disabled-podium]')
          .removeAttr('data-markdown-disabled-podium')
          .attr('data-markdown', '');
        
        $updated('.podium-editor-code-wrapper').each(function(index) {
          var codeHtml = $updated(this).html();
        
          $updated(this).replaceWith("<pre>"+codeHtml+"</pre>");
        });

        $updated('section')
          .removeClass('present')
          .removeClass('past')
          .removeClass('stack')
          .removeClass('future')
          .removeAttr('hidden')
          .removeAttr('data-previous-indexv')
          .removeAttr('style');

        $updated('section').each(function(index) {
          var classAttr = $updated(this).attr('class');

          if(!classAttr) {
            $updated(this).removeAttr('class');
          }
        });

        $current('.slides').html($updated.html());

        return $current.html();
      };

  return {
    getPublishedSlides: getPublishedSlides,
    createSlideDeck: createSlideDeck,
    updateSlideDeck: updateSlideDeck,
    updateSlideDeckContent: updateSlideDeckContent
  };
}();