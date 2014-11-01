$(window).resize(function () {
    adjustWidth();
});
function adjustWidth() {
   $('.sticky-alt').css('width', $('.sticky-alt').parent().width() + 'px');
}
$(document).ready(function () {
    adjustWidth();
    hljs.initHighlightingOnLoad();
});
$(window).scroll(function(){
    var sti = $('.sticky-alt').parent().offset().top-30
    // console.log(sti);
    var scr = $(window).scrollTop()
    // console.log(scr);

    if(scr > sti){
        $('.sticky-alt').css({
            'position':'fixed',
            'top':'15px',
        });
    }else{
        $('.sticky-alt').css({
            'position':'relative',
            'top':'0px',
        });
    }

});
$('.gotoSmooth').click(function(){
    var body = $("html, body");
    body.animate({
        scrollTop: $($(this).attr('href')).offset().top-10
    }, '500', 'swing');
    return false;
});