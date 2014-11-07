$(window).resize(function () {
    adjustWidth();
});

function adjustWidth() {
   $('.sticky-alt').css('width', $('.sticky-alt').parent().width() + 'px');
        $('.sticky-alt').css({
            'position':'fixed',
            'top':'60px',
        });
}

$(document).ready(function () {
    adjustWidth();
    hljs.initHighlightingOnLoad();
});

$('.gotoSmooth').click(function(){
    var body = $("html, body");
    var href = $(this).attr('href');
    // location.hash = href;
    body.animate({
        scrollTop: $(href).offset().top-60
    },{
        queue: false,
        duration: 500,
        easing: 'easeOutExpo'
    });
    return false;
});
