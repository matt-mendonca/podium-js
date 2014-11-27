// Library Depencies
  var Ember = require('ember'),
      DS = require('ember');

// App Code
  module.exports = function(App) {
    /** 
     * Create view hook that is equivalent to doc.ready
     * https://mavilein.github.io/javascript/2013/08/01/Ember-JS-After-Render-Event/
     */
      Ember.View.reopen({
        didInsertElement : function(){
          this._super();
          Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
        },
        afterRenderEvent : function(){}
      });

    App.ApplicationAdapter = DS.FixtureAdapter;
    App.Models = {};
    App.UserRoles = {};
    App.Mixins = {};
  }(App);