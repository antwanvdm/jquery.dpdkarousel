/**
 * jQuery Plugin for a beautiful carousel, homemade for dpdk awesomeness
 *
 * @author antwanvdm
 * @licence Licensed under the MIT license
 * @dependencies underscore.js | jquery.touchSwipe.js
 * @todo Create object for methods etc.
 */
(function ($) {
  //Default settings object
  var settings = {
    widthIsFluid: true,
    width: 1000,
    height: 400,
    resizeHeight: false,
    heightIsPercentage: false,
    timer: true,
    delay: 10000,
    animateEl: 'li',
    touchEnabled: false,
    onHoverStop: true,
    animationDuration: 700,
    animationEasing: 'swing',
    progressBar: false,
    pager: false,
    pagerClickable: false,
    previousTrigger: '.previous',
    nextTrigger: '.next'
  };

  //Plugin local methods
  var methods = {
    /**
     * All the 'this.vars' needed in methods
     */
    $pager: null,
    currentActiveSlide: 0,
    totalSlides: 0,
    timer: null,
    width: 0,
    isAnimating: false,
    apiPause: false,
    apiActiveSlide: -1,

    /**
     * Initialize Plugin logic
     * @param $element
     */
    init: function ($element) {
      //Set al start variables
      this.$el = $element;
      this.settings = this.$el.settings;

      //If no percentage height, we only need to set it once
      if (this.settings.heightIsPercentage == false) {
        this.$el.height(this.settings.height);
      }

      //If width is fluid, set to window width
      this.width = this.settings.widthIsFluid ? $(window).width() : this.settings.width;

      //Get total slides (reset timer if only 1 slide) & add default classes
      this.totalSlides = this.$el.find(this.settings.animateEl).length;
      this.settings.timer = this.totalSlides == 1 ? false : this.settings.timer;
      this.addClasses();

      //Start Interval
      this.timer = new RecurringTimer(this.$el, _.bind(this.animateSlides, this, "next"), this.settings.delay);

      //Click handlers for right/left navigation
      this.$el.find(this.settings.nextTrigger).on('click touchstart', _.bind(this.next, this));
      this.$el.find(this.settings.previousTrigger).on('click touchstart', _.bind(this.previous, this));

      //Progressbar
      if (this.settings.progressBar) {
        this.initProgressBar();
        this.$el.on("slideStart", _.bind(this.animateProgressBar, this, true));
        this.$el.on("pauseTimer", _.bind(this.pauseProgressBar, this));
        this.$el.on("resumeTimer", _.bind(this.animateProgressBar, this, false));
      }

      //Pager
      if (this.settings.pager) {
        this.initPager();
      }

      //Hover element with pause/resume
      if (this.settings.onHoverStop) {
        this.$el.on({mouseenter: _.bind(this.onHoverInHandler, this), mouseleave: _.bind(this.onHoverOutHandler, this)});
      }

      //If touch enabled
      if (this.settings.touchEnabled) {
        this.initTouchEvents();
      }
    },

    /**
     * Add Classes to elements
     */
    addClasses: function () {
      this.$el.addClass("dpdkarousel");

      //Loop children to add specific classes & count slides
      this.$el.find(this.settings.animateEl).each(function (index, el) {
        var $slide = $(el);
        $slide.addClass("slide-" + index);

        if (index == 0) {
          $slide.addClass("first");
          $slide.addClass("active");
        }
        if (index == this.totalSlides - 1) {
          $slide.addClass("last");
        }
      });
    },

    /**
     * Animate slides to next state
     * @param direction
     */
    animateSlides: function (direction) {
      //Check for animation state (don't animate when animate is active OR passed slide is already active
      if (this.isAnimating || this.currentActiveSlide == this.apiActiveSlide) {
        return;
      }
      this.$el.trigger("slideStart");
      this.isAnimating = true;

      //Pager state
      if (this.$pager) {
        this.updatePagerBeforeAnimateSlide();
      }

      //Animate current slide out
      var marginLeftNumber = (direction == "next" ? "-" : "") + this.width;
      var $animateSlideOut = this.$el.find(this.settings.animateEl).eq(this.currentActiveSlide);
      $animateSlideOut.removeClass("active").transition({marginLeft: marginLeftNumber + "px"}, this.settings.animationDuration, this.settings.animationEasing, _.bind(function () {
        $animateSlideOut.css({marginLeft: this.width});
        this.isAnimating = false;
      }, this));

      //Decide active slide number depending on direction
      if (this.apiActiveSlide != -1) {
        this.currentActiveSlide = this.apiActiveSlide;
        this.apiActiveSlide = -1;
      }
      else if (direction == "next") {
        this.currentActiveSlide = (this.currentActiveSlide == this.totalSlides - 1) ? 0 : this.currentActiveSlide + 1;
      }
      else {
        this.currentActiveSlide = (this.currentActiveSlide == 0) ? this.totalSlides - 1 : this.currentActiveSlide - 1;
      }

      //Set position of slide when other direction
      if (direction == "previous") {
        this.$el.find(this.settings.animateEl).eq(this.currentActiveSlide).css({marginLeft: "-" + this.width + "px"});
      }

      //Animate current slide in
      var $animateSlideIn = this.$el.find(this.settings.animateEl).eq(this.currentActiveSlide);
      $animateSlideIn.transition({marginLeft: 0}, this.settings.animationDuration, this.settings.animationEasing, _.bind(function () {
        if (this.$pager) {
          this.updatePagerAfterAnimateSlide();
        }

        $animateSlideIn.addClass("active");
        this.$el.trigger("slideDone", this.currentActiveSlide);
      }, this));
    },

    /**
     * Update the pager when the slide slides out
     */
    updatePagerBeforeAnimateSlide: function () {
      switch (this.settings.pager) {
        case 'li':
          this.$pager.find("li").eq(this.currentActiveSlide).removeClass("active");
          break;
        case 'numbered':
          this.$pager.find(".current").html(this.currentActiveSlide + 1);
          break;
      }
    },

    /**
     * Update the pager when the slide slides in
     */
    updatePagerAfterAnimateSlide: function () {
      switch (this.settings.pager) {
        case 'li':
          this.$pager.find("li").eq(this.currentActiveSlide).addClass("active");
          break;
        case 'numbered':
          this.$pager.find(".current").html(this.currentActiveSlide + 1);
          break;
      }
    },

    /**
     * Next handler
     */
    next: function () {
      this.timer.reset();
      this.animateSlides("next");
    },

    /**
     * Previous handler
     */
    previous: function () {
      this.timer.reset();
      this.animateSlides("previous");
    },

    /**
     * Init the progress bar & append to DOM
     */
    initProgressBar: function () {
      var $progressBarEl = $('<div><div class="front"></div><div class="back"></div></div>');
      $progressBarEl.addClass("progress-bar");
      this.$el.append($progressBarEl);

      this.animateProgressBar(true, null, false);
    },

    /**
     * Animate progress bar from 0 to 100%
     *
     * @param reset
     * @param e
     * @param remaining
     */
    animateProgressBar: function (reset, e, remaining) {
      if (reset) {
        this.$el.find(".progress-bar").stop();
        this.$el.find(".progress-bar").css({width: "0%"});
      }

      var delay = remaining ? remaining : this.settings.delay;
      this.$el.find(".progress-bar").animate({width: "100%"}, {duration: delay, queue: false, easing: 'linear'});
    },

    /**
     * Pause progressbar from looping
     */
    pauseProgressBar: function () {
      this.$el.find(".progress-bar").stop();
    },

    /**
     * Init the pager elements
     */
    initPager: function () {
      if (this.totalSlides == 1) {
        return;
      }

      switch (this.settings.pager) {
        case 'li':
          this.initLiPager();
          break;
        case 'numbered':
          this.initNumberedPager();
          break;
      }

      //Append to elements
      this.$el.append(this.$pager);
    },

    /**
     * Init a pager consisting of li elements
     */
    initLiPager: function () {
      //Create UL
      this.$pager = $("<ul>");
      this.$pager.addClass("pager");

      //Loop to add LI's
      for (var i = 0; i < this.totalSlides; i++) {
        var $li = $("<li>");
        $li.data("index", i);

        if (i == 0) {
          $li.addClass("active");
        }

        this.$pager.append($li);
      }

      this.$pager.on('click', 'li', _.bind(this.navigateToIndex, this));
    },

    /**
     * Click handler for pager elements
     *
     * @param e
     */
    navigateToIndex: function (e) {
      this.apiActiveSlide = $(e.currentTarget).data("index");
      this.animateSlides("next");
    },

    /**
     * Init the numbered pager
     */
    initNumberedPager: function () {
      this.$pager = $("<span />")
        .addClass("pager");

      var $current = $("<span />")
        .addClass("current")
        .html("1");

      var $seperator = $("<span />")
        .addClass("seperator")
        .html("/");

      var $total = $("<span />")
        .addClass("total")
        .html(this.totalSlides);

      this.$pager
        .append($current)
        .append($seperator)
        .append($total);
    },

    /**
     * Hover in handler
     * @param e
     */
    onHoverInHandler: function (e) {
      this.timer.pause();
    },

    /**
     * Hover out handler
     * @param e
     */
    onHoverOutHandler: function (e) {
      if (this.apiPause == true) {
        return;
      }
      this.timer.resume();
    },

    /**
     * Set touch events for touch devices
     */
    initTouchEvents: function () {
      this.$el.swipe({
        swipeLeft: _.bind(this.next, this),
        swipeRight: _.bind(this.previous, this),
        threshold: 100
      });
    },

    /**
     * Resize handler
     * @param e
     */
    resizeHandler: function (e) {
      //If width is fluid, set to window width
      this.width = this.settings.widthIsFluid ? $(window).width() : this.settings.width;

      //If resizeHeight is not false, resize like a boaws
      if (this.settings.resizeHeight !== false) {
        this.height($(window).height() - this.settings.resizeHeight);
      }

      //If percentage height, we set it on resize
      if (this.settings.heightIsPercentage) {
        this.height($(window).height() * this.settings.height);
      }
    },

    /**
     * Set Public API methods for the outside world
     */
    setPublicMethods: function () {
      this.$el.pause = _.bind(function () {
        this.apiPause = true;
        this.timer.pause();
      }, this);

      this.$el.resume = _.bind(function () {
        this.apiPause = false;
        this.timer.resume();
      }, this);

      this.$el.next = _.bind(function () {
        this.next();
      }, this);

      this.$el.previous = _.bind(function () {
        this.previous();
      }, this);

      this.$el.getCurrentActiveSlide = _.bind(function () {
        return this.currentActiveSlide;
      }, this);

      this.$el.setActiveSlide = _.bind(function (index) {
        this.apiActiveSlide = index;
        this.animateSlides("next");
      }, this);
    }
  };

  /**
   * Class used for start/pause logic
   *
   * @param callback
   * @param delay
   * @constructor
   */
  function RecurringTimer($el, callback, delay) {
    var timerId, start, remaining = delay;

    this.reset = function () {
      if ($el.settings.timer == false) {
        return;
      }

      remaining = delay;
    };

    this.pause = function () {
      if ($el.settings.timer == false) {
        return;
      }

      window.clearTimeout(timerId);
      remaining -= new Date() - start;
      $el.trigger("pauseTimer");
    };

    var resume = function () {
      if ($el.settings.timer == false) {
        return;
      }

      start = new Date();
      timerId = window.setTimeout(function () {
        remaining = delay;
        resume();
        callback();
      }, remaining);
      $el.trigger("resumeTimer", remaining);
    };

    this.resume = resume;
    if ($el.settings.timer == false) {
      return;
    }
    this.resume();
  }

  /**
   * Actual plugin call from the outside world
   *
   * @param options
   *          :widthIsFluid       Default: true         Set to true for awesome full screen experience/resizing
   *          :width              Default: 1000         Number in pixels, only used if widthIsFluid is false
   *          :height             Default: 400          Height in PX for the carousel, or a decimal (0.7) if heightIsPercentage is true
   *          :resizeHeight       Default: false        Set to a number to resize the height - the given number
   *          :heightIsPercentage Default: false        Set to true if the height is a percentage of the window and should be resized
   *          :timer              Default: true         If true, slider will auto animate after delay time
   *          :delay              Default: 10000        Total milliseconds between transition (only if timer is set to true)
   *          :animateEl          Default: 'li'         HTML children selector to animate
   *          :touchEnabled       Default: false        Enabled touch for touch devices to swipe to next/prev slide
   *          :onHoverStop        Default: true         Stop animating on hover (pause transition)
   *          :animationDuration  Default: 700          Duration in milliseconds for transitions
   *          :animationEasing    Default: 'swing'      Easing type for transitions
   *          :progressBar        Default: false        Set to true to see a progress bar fill up from 0 to 100%
   *          :pager              Default: false        Set to 'li' for a pager consisting of li elements. Set to 'numbered' to have a numbered pager (1/5)
   *          :pagerClickable     Default: false        Set to true to make pager clickable to slides, only works if pager is set to 'li'
   *          :previousTrigger    Default: '.previous'  Selector for previous arrow
   *          :nextTrigger        Default: '.next'      Selector for next arrow
   * @returns {*}
   */
  $.fn.dpdkarousel = function (options) {
    //If any options given, override default settings
    if (options) {
      var currentSettings = _.clone(settings);
      this.settings = $.extend(currentSettings, options);
    }

    //Init plugin with this scope (this == selector on which plugin is called on.)
    this.methods = _.clone(methods);
    this.methods.init(this);

    //Resize handler, with given element as scope
    $(window).on('resize', _.bind(_.debounce(this.methods.resizeHandler, 200), this));

    //Public methods
    this.methods.setPublicMethods();

    //Return this for jQuery chaining
    return this;
  };
})(jQuery);