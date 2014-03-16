$(document).ready(function init() {
    //See documentation in jquery.dpdkarousel.js for all possible parameters
    $("#slider").dpdkarousel({
        delay: 8000,
        progressBar: true,
        pager: 'li',
        pagerClickable: true,
        height: 0.8,
        heightIsPercentage: true
    });

    //Needed to active resize magic for height
    $(window).trigger('resize');
});