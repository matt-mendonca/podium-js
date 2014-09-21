var Podium = Podium || {};

;(function($) {
  CKEDITOR.disableAutoInline = true;

  Podium.slidesEditor = function() {
    var slidesPageUrl = "/admin/slides" + window.location.pathname,
        toolBarMarkup = "<div class='editor-resource tool-bar'>"+
                          "<form action='"+slidesPageUrl+"/update-content' method='post' class='slides-update-form'>"+
                            "<textarea class='slidesMarkup' name='slidesMarkup'></textarea>"+
                            "<input type='submit' value='Save' class='button success save'>"+
                            "<a href='"+slidesPageUrl+"' class='button secondary right exit'>Exit</a>"+
                            "</form>"+
                        "</div>",

        init = function() {
          prepMarkup();
          $('body').prepend(toolBarMarkup);
          $('.slides-update-form').submit(updateFormSubmit);
        },

        prepMarkup = function() {
          $('section[data-markdown]').removeAttr('data-markdown').attr('data-markdown-disabled-podium', '');
          $('section pre > code').parent().replaceWith(function() { return "<div class='podium-editor-code-wrapper'>"+this.innerHTML+"</div>"; });
        },

        updateFormSubmit = function(event) {
          var slidesDOM = '';
          
          removeCkEditorInstances();

          $('.reveal section').each(function(index) {
            if($(this).children('section').length === 0) {
              $(this).removeAttr('contenteditable');
            }
          });

          if(Reveal.isOverview()) {
            Reveal.toggleOverview();
          }

          if(Reveal.isPaused()) {
            Reveal.togglePause();
          }

          $('.slides-update-form .slidesMarkup').val($('.slides').html());

          return true;
        },

        addCkEditorInstance = function(currentSlide) {
          removeCkEditorInstances();

          // Skip WYSIWYG if slide contains markdown or code (for now)
          if(!$(currentSlide).is('[data-markdown-disabled-podium') && !$(currentSlide).find('.podium-editor-code-wrapper').length) {
            $(currentSlide).attr('contenteditable', 'true');
            CKEDITOR.inline(currentSlide);
          }
        },

        removeCkEditorInstances = function() {
          for(name in CKEDITOR.instances) {
            CKEDITOR.instances[name].destroy(true);
          }
        };

    return {
      init: init,
      addCkEditorInstance: addCkEditorInstance,
      removeCkEditorInstances: removeCkEditorInstances
    }
  }();

  $(document).ready(function() {
    Podium.slidesEditor.init();

    // Was having issues attaching CKEditor Instaces to everything all at once
    // Some of the slides would not be properly editable
    // Now doing lazy instances
    Reveal.addEventListener('ready', function(event) {
      Podium.slidesEditor.addCkEditorInstance(event.currentSlide);
    });

    Reveal.addEventListener('slidechanged', function(event) {
      Podium.slidesEditor.addCkEditorInstance(event.currentSlide);
    });
  });
})(jQuery);