// Make the showSidebar function into a variable so it can be easily called
var showSidebar = function() {
  $('body').toggleClass("active");
};

// add/remove classes everytime the window resize event fires
jQuery(window).resize(function(){
  var off_canvas_nav_display = $('.off-canvas-navigation').css('display');
  if (off_canvas_nav_display === 'block') {
    $("body").removeClass("active");
  }
});

jQuery(document).ready(function($) {
    // Toggle for sidebar
    $('#sidebar_button').click(function(e) {
      e.preventDefault();
      showSidebar();
    });
});