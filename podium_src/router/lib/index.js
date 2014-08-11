/**
 * Module dependencies.
 */
var fileSystem = require('fs'),
    url = require('url'),
    cheerio = require('cheerio');

module.exports = function() {
  var podiumRoute = function(req, res, view, slides) {
        res.render(view, {slides: slides});
      },

      deckRoute = function(req, res, slides, rootDir, config) {
        /* 
          express includes the querystring in req.url
          we need just the url since the podium.slides
          is indexed without it.
        */
        var rawUrl = url.parse(req.url),
            route = rawUrl.pathname,
            queryString = null,
            controller = false,
            $ = null;

        if(rawUrl.search) {
          queryString = rawUrl.search.replace('?', '').split('&');
          queryString.forEach(function(property, index) {
            queryString[index] = property.split('=');

            if(queryString[index][0] === 'controller' && queryString[index][1] === 'true') {
              controller = true;
            }
          });
        }
        
        if(slides[route]) {
          // send the index.html file for the slides
          // append the socket io and podium js to body response
          $ = cheerio.load(fileSystem.readFileSync(rootDir + slides[route].location + 'index.html'));
          $('body').append(config.slidesHtmlScripts);
          
          if(controller) {
            $('body').append(config.inPresentationControllerScript);
          }

          res.send($.html());
        } else {
          // not found everything else
          console.log("\nWarning: no matching slide deck found for request "+route);
          res.render('not_found', {slides: slides});
        }
      };

  return {
    podiumRoute: podiumRoute,
    deckRoute: deckRoute
  };
}();