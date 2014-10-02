var Podium = function() {
  var queryString = {},
      token = localStorage.getItem('pjwt'),

      parseQueryString = function() {
        queryStringPieces = window.location.search.substring(1);

        if(queryStringPieces) {
          queryStringPieces = queryStringPieces.split('&');
          for (var index in queryStringPieces) {
            var queryStringParameter = queryStringPieces[index].split('=');

            queryString[queryStringParameter[0]] = queryStringParameter[1];
          }
        }
      },

      init = function() {
        parseQueryString();
      }();

  return {
    queryString: queryString,
    token: token
  };
}();