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

var gettxt = function () { return $('#input').val(); },
    getpw  = function () { return $('#pw').val(); },
    settxt = function (i) {
      prevtxt = $('#input').val();
      $('#input').val(i);
    };

// Undo
$('#undo').on('click', function() {
  if (prevtxt !== undefined) {
    settxt(prevtxt);
    count();
  }
});

// String.fromCodePoint非対応ブラウザへの対応
if (!String.fromCodePoint) {
  var stringFromCharCode = String.fromCharCode;
  var floor = Math.floor;
  var fromCodePoint = function() {
    var MAX_SIZE = 0x4000,
        codeUnits = [],
        index = -1,
        length = arguments.length;
    var highSurrogate, lowSurrogate;
    if (!length) { return ''; }
    var result = '';
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if ( !isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint ) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
      if (index + 1 == length || codeUnits.length > MAX_SIZE) {
        result += stringFromCharCode.apply(null, codeUnits);
        codeUnits.length = 0;
      }
    }
    return result;
  };
  String.fromCodePoint = fromCodePoint;
}

// サロゲートペア・異体字セレクタに対応したlength
String.prototype.fixed_length = function() {
  var x = this.match(/[\ud800-\udb3f\udb41-\udbff]/g);    // サロゲートペアから異体字セレクタを引いたもの
  if (x !== null) {x = x.length;} else {x = 0;}
  return this.replace(/[\ud800-\udfff\u180b-\u180d\ufe00-\ufe0f]/g, '').length + x;
};

// テキストのカウントfunction
var count = function () {
  var val = gettxt();
  $('#char').text('文字数：' + val.fixed_length());
  $('#line').text('行数：' + val.split('\n').length);
};

// テキストの更新時にカウント
$('#input').on('input', function() { count(); });

}); // $
