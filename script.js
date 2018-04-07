$(function() {

// Header
$('#nav').load('../nav.html?201804062022')

// Change tabs
$('.tabs li').on('click', function() {
  $('.tabs li').removeClass('is-active');
  $(this).addClass('is-active');
  $('#tab-contents > div').addClass('hidden');
  $('#tab-contents > div').eq( $('.tabs li').index(this) ).removeClass('hidden')
});




});
