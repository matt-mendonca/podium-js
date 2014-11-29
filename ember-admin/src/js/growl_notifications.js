// Library Depencies
  var Ember = require('ember');

// App Code
  module.exports = function(App) {
    /**
      Reworked from Bootstrap for Ember Growl Notification Component
     */

    App.GrowlNotifications = Ember.CollectionView.extend({
      /*
      @property {String[]} The array of concrete class names to put on this view's element
      */
      classNames: ['growl-notifications'],
      /*
      Binding to the GrowlNotificationManager's notifications array
      Each of the array element will be rendered as a notification view (see ItemViewClass)
      */
      contentBinding: 'App.GNM.notifications',
      attributeBindings: ['style'],
      showTime: 5000,
      /*
      @property {View} Notification view class
      Determines what view class to render for each item in the content array.
      */

      itemViewClass: Ember.View.extend({
        classNames: ['growl-notification'],
        templateName: 'growl-notification',
        classNameBindings: [":growl-notification", "content.closed", "isOpaque"],
        attributeBindings: ['style'],
        /*
        @property {Number} Will be set by `didInsertElement`, used for clearing the auto-hide timeout.
        */

        timeoutId: null,
        /*
        @property {Boolean} should the view be opaque now?
        Used for fancy fading purposes.
        */

        isOpaque: false,
        /*
        Lifecycle hook - called when view is created.
        */

        init: function() {
          var fn,
            _this = this;
          this._super();
          fn = (function() {
            return _this.notifyPropertyChange("style");
          });
          this.set("_recomputeStyle", fn);
          return $(window).bind("resize", fn);
        },
        /*
        View lifecycle hook - called when the view enters the DOM.
        */

        didInsertElement: function() {
          var _this = this;
          this.set("timeoutId", setTimeout((function() {
            return _this.send("close");
          }), this.get("parentView.showTime")));
          return Ember.run.later(this, (function() {
            return this.set("isOpaque", true);
          }), 1);
        },
        /*
        Lifecycle hook - called right before view is destroyed
        */

        willDestroyElement: function() {
          return $(window).unbind('resize', this.get('_recomputeStyle'));
        },
        style: (function() {
          var column,
              index,
              notifications,
              rightPx,
              row,
              topPx,
              unitHeight,
              unitWidth,
              unitsPerColumn,
              viewportHeight;

          notifications = this.get('parentView.content').rejectProperty('closed', true);
          index = notifications.indexOf(this.get('content'));
          viewportHeight = $(window).height();
          unitHeight = 80;
          unitWidth = 320;
          unitsPerColumn = Math.floor(viewportHeight / unitHeight);
          column = Math.floor(index / unitsPerColumn);
          row = index % unitsPerColumn;
          if (index === -1) {
            return '';
          }
          topPx = row * unitHeight;
          rightPx = column * unitWidth;
          return 'top: ' + topPx + 'px; right: ' + rightPx + 'px;';
        }).property('parentView.content.@each.closed'),

        actions: {
          close: function() {
            var _this = this;
            this.set('isOpaque', false);
            return setTimeout((function() {
              _this.get('parentView.content').removeObject(_this.get('content'));
              return clearTimeout(_this.get("timeoutId"));
            }), 300);
          }
        }
      })
    });

    Ember.Handlebars.helper('app-growl-notifications', App.GrowlNotifications);

    /*
    A manager that is responsible for getting told about new notifications and storing them within an array.
    */


    App.GNM = App.GrowlNotificationManager = Ember.Object.create({
      /*
      @property {Array} A global array for storing notification objects.
      */

      notifications: Ember.A(),

      push: function(type, message) {
        var notif,
            iconClass;

        switch(type) {
          case 'alert':
            iconClass = 'fi-alert';
            break;

          case 'success':
            iconClass = 'fi-check';
            break;

          case 'warning':
            iconClass = 'fi-prohibited';
            break;

          default:
            iconClass = 'fi-info';
            break;
        }

        notif = {
          type: type,
          iconClass: iconClass,
          message: message,
          closed: false
        };

        return this.get('notifications').pushObject(notif);
      }
    });

  }(App);