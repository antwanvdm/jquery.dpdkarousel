jquery.dpdkarousel
==================

This plugin is a custom carousel build from the ground up. We use it at dpdk to have full
flexibility within our requirements. This project will be updated through our projects when
we need to extend the current functionality.

Withing the example folder you can see the possibilities of the slider. You can make extend
the look and feel by using CSS3 animations on active class changing.

##Current plugin options
     :widthIsFluid       Default: true         Set to true for awesome full screen experience/resizing
     :width              Default: 1000         Number in pixels, only used if widthIsFluid is false
     :height             Default: 400          Height in PX for the carousel, or a decimal (0.7) if heightIsPercentage is true
     :resizeHeight       Default: false        Set to a number to resize the height - the given number
     :heightIsPercentage Default: false        Set to true if the height is a percentage of the window and should be resized
     :timer              Default: true         If true, slider will auto animate after delay time
     :delay              Default: 10000        Total milliseconds between transition (only if timer is set to true)
     :animateEl          Default: 'li.slide'   HTML children selector to animate
     :touchEnabled       Default: false        Enabled touch for touch devices to swipe to next/prev slide
     :onHoverStop        Default: true         Stop animating on hover (pause transition)
     :animationDuration  Default: 700          Duration in milliseconds for transitions
     :animationEasing    Default: 'swing'      Easing type for transitions
     :progressBar        Default: false        Set to true to see a progress bar fill up from 0 to 100%
     :pager              Default: false        Set to 'li' for a pager consisting of li elements. Set to 'numbered' to have a numbered pager (1/5)
     :pagerClickable     Default: false        Set to true to make pager clickable to slides, only works if pager is set to 'li'
     :previousTrigger    Default: '.previous'  Selector for previous arrow
     :nextTrigger        Default: '.next'      Selector for next arrow

##Dependencies

* jquery.js (http://jquery.com/download)
* underscore.js (https://github.com/jashkenas/underscore)

##Optional

* When you love CSS3 and want jQuery.animate only as fallback: jquery.transit.js (https://github.com/rstacruz/jquery.transit)
* When you need to support touch devices (touchEnabled: true): jquery.touchSwipe.js (https://github.com/mattbryson/TouchSwipe-Jquery-Plugin)