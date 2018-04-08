$(function() {

// Header
$('#nav').load('../nav.html?201804062022');

// Change tabs
$('.tabs li').on('click', function() {
  $('.tabs li').removeClass('is-active');
  $(this).addClass('is-active');
  $('#tab-contents > div').addClass('hidden');
  $('#tab-contents > div').eq( $('.tabs li').index(this) ).removeClass('hidden');
});

var gettxt = function () { return $('#input').val(); },
    getpw  = function () { return $('#pw').val(); },
    settxt = function (i) {
      prevtxt = $('#input').val();
      $('#input').val(i);
      count();
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
  $('#char').text('文字数：' + val.replace(/\n/g, '').fixed_length());
  $('#line').text('行数：' + val.split('\n').length);
};

// テキストの更新時にカウント
$('#input').on('input', function() { count(); });

// Unicode(\uXXXXXX)
var uc_e = function(str) {
  // var i = 0, len = str.length, points = '';
  // while (i < len) {
  //   var x = str.charCodeAt(i++);
  //   if (0xD800 <= x && x < 0xDC00) {
  //     var y = str.charCodeAt(i++);
  //     points += '\\u' + (0x10000 + ((x & 0x3FF) << 10) | (y & 0x3FF));
  //   } else {
  //     points += '\\u' + x;
  //   }
  // }
  // return points;
  var code, pref = {1: '\\u000', 2: '\\u00', 3: '\\u0', 4: '\\u'};
  return str.replace(/\W/g, function(c) {
    return pref[(code = c.charCodeAt(0).toString(16)).length] + code;
  });
};
var uc_d = function(str) {
  // return unescape(str.replace(/\\u([\d\w]+)/gi, function (match, grp) {
  //   return String.fromCodePoint(parseInt(grp, 10));
  // }));
  return str.replace(/\\u([a-fA-F0-9]{4})/g, function(m0, m1) {
    return String.fromCharCode(parseInt(m1, 16));
  });
};

// HTML(&#NNNN;)
var html_10_e = function(str) {
  var i = 0, len = str.length, points = '';
  while (i < len) {
    var x = str.charCodeAt(i++);
    if (0xD800 <= x && x < 0xDC00) {
      var y = str.charCodeAt(i++);
      points += '&#' + (0x10000 + ((x & 0x3FF) << 10) | (y & 0x3FF)) + ';';
    } else {
      points += '&#' + x + ';';
    }
  }
  return points;
};
var html_10_d = function(str) {
  return unescape(str.replace(/&#([\d]{2,7});/g, function (match, grp) {
    return String.fromCodePoint(parseInt(grp, 10));
  }));
};

// HTML(&#xXXXXX;)
var html_16_e = function(str) {
  var i = 0, len = str.length, points = '';
  while (i < len) {
    var x = str.charCodeAt(i++);
    if (0xD800 <= x && x < 0xDC00) {
      var y = str.charCodeAt(i++);
      points += '&#x' + (0x10000 + ((x & 0x3FF) << 10) | (y & 0x3FF)).toString(16) + ';';
    } else {
      points += '&#x' + x.toString(16) + ';';
    }
  }
  return points;
};
var html_16_d = function(str) {
  return unescape(str.replace(/&#x([\w]{1,5});/g, function (match, grp) {
    return String.fromCodePoint(parseInt(grp, 16));
  }));
};

// HTML(&lt;, &gt;, &amp;)
var html_e = function(str) {
  return $('<div>').text(str).html();
};
var html_d = function(str) {
  return $('<div>').html(str).text();
};











//////////////////////////// テキスト操作 ////////////////////////////

$('#replace-str').on('click', function () {
  var before = $('#replace-before').val();
  var after = $('#replace-after').val();
  settxt( gettxt().split(before).join(after) );
});

$('#emptyline-remove').on('click', function () {
  settxt(gettxt().replace(/^\n/gm, '').replace(/\n$/, ''));
});

$('#return-remove').on('click', function () {
  settxt(gettxt().replace(/\n/g, ''));
});

$('#duplicates-remove').on('click', function () {
  var a = gettxt().split('\n');
  var b = a.filter(function (x, i, self) {
    return self.indexOf(x) === i;
  });
  settxt(b.join('\n'));
});

$('#duplicates-removeall').on('click', function() {
  var a = gettxt().split('\n');
  var b = a.filter(function(x, i, self) {
    var num = 0;
    for (var n = 0; n < self.length; n++) {
      if (self[n] == x) { num++; }
    }
    return num === 1;
  });
  settxt( (b.join('\n')) );
});

// 行並べ替え（昇順）
$('#sort-asc').on('click', function () {
  settxt(gettxt().split('\n').sort().join('\n'));
});

// 行並べ替え（降順）
$('#sort-desc').on('click', function () {
  settxt(gettxt().split('\n').sort().reverse().join('\n'));
});

// 行シャッフル
$('#line-shuffle').on('click', function () {
  var array = gettxt().split('\n');
  var n = array.length, t, i;
  while (n) {
    i = Math.floor(Math.random() * n--);
    t = array[n];
    array[n] = array[i];
    array[i] = t;
  }
  settxt(array.join('\n'));
});

//////////////////////////// エンコード ////////////////////////////

$('#uc-e').on('click', function () { settxt(uc_e(gettxt())); });
$('#uc-d').on('click', function () { settxt(uc_d(gettxt())); });

$('#puny-e').on('click', function () { settxt('xn--' + punycode.encode(gettxt())); });
$('#puny-d').on('click', function () { settxt(punycode.decode(gettxt().replace('xn--', ''))); });

$('#html-10-e').on('click', function () { settxt(html_10_e(gettxt())); });
$('#html-10-d').on('click', function () { settxt(html_10_d(gettxt())); });

$('#html-16-e').on('click', function () { settxt(html_16_e(gettxt())); });
$('#html-16-d').on('click', function () { settxt(html_16_d(gettxt())); });

$('#b64-e').on('click', function () { settxt(CryptoJS.enc.Utf8.parse(gettxt()).toString(CryptoJS.enc.Base64)); });
$('#b64-d').on('click', function () { settxt(CryptoJS.enc.Base64.parse(gettxt()).toString(CryptoJS.enc.Utf8)); });

$('#hex-e').on('click', function () { settxt(CryptoJS.enc.Utf8.parse(gettxt()).toString(CryptoJS.enc.Hex)); });
$('#hex-d').on('click', function () { settxt(CryptoJS.enc.Hex.parse(gettxt()).toString(CryptoJS.enc.Utf8)); });

$('#url-e').on('click', function () { settxt(encodeURIComponent(gettxt())); });
$('#url-d').on('click', function () { settxt(decodeURIComponent(gettxt())); });

$('#html-e').on('click', function () { settxt(html_e(gettxt())); });
$('#html-d').on('click', function () { settxt(html_d(gettxt())); });

//////////////////////////// AES ////////////////////////////
$('#aes-e').on('click', function () { settxt(CryptoJS.AES.encrypt(gettxt(), getpw())); });
$('#aes-d').on('click', function () { settxt(CryptoJS.AES.decrypt(gettxt(), getpw()).toString(CryptoJS.enc.Utf8)); });

//////////////////////////// MD5 / SHA ////////////////////////////

$('#md5-hex').on('click', function () { settxt(CryptoJS.MD5(gettxt())); });
$('#md5-b64').on('click', function () { settxt(CryptoJS.MD5(gettxt()).toString(CryptoJS.enc.Base64)); });

$('#sha1-hex').on('click', function () { settxt(CryptoJS.SHA1(gettxt())); });
$('#sha1-b64').on('click', function () { settxt(CryptoJS.SHA1(gettxt()).toString(CryptoJS.enc.Base64)); });

$('#sha224-hex').on('click', function () { settxt(CryptoJS.SHA224(gettxt())); });
$('#sha224-b64').on('click', function () { settxt(CryptoJS.SHA224(gettxt()).toString(CryptoJS.enc.Base64)); });

$('#sha256-hex').on('click', function () { settxt(CryptoJS.SHA256(gettxt())); });
$('#sha256-b64').on('click', function () { settxt(CryptoJS.SHA256(gettxt()).toString(CryptoJS.enc.Base64)); });

$('#sha384-hex').on('click', function () { settxt(CryptoJS.SHA384(gettxt())); });
$('#sha384-b64').on('click', function () { settxt(CryptoJS.SHA384(gettxt()).toString(CryptoJS.enc.Base64)); });

$('#sha512-hex').on('click', function () { settxt(CryptoJS.SHA512(gettxt())); });
$('#sha512-b64').on('click', function () { settxt(CryptoJS.SHA512(gettxt()).toString(CryptoJS.enc.Base64)); });

$('#sha3-224-hex').on('click', function () { settxt(CryptoJS.SHA3(gettxt(), {outputLength:224})); });
$('#sha3-224-b64').on('click', function () { settxt(CryptoJS.SHA3(gettxt(), {outputLength:224}).toString(CryptoJS.enc.Base64)); });

$('#sha3-256-hex').on('click', function () { settxt(CryptoJS.SHA3(gettxt(), {outputLength:256})); });
$('#sha3-256-b64').on('click', function () { settxt(CryptoJS.SHA3(gettxt(), {outputLength:256}).toString(CryptoJS.enc.Base64)); });

$('#sha3-384-hex').on('click', function () { settxt(CryptoJS.SHA3(gettxt(), {outputLength:384})); });
$('#sha3-384-b64').on('click', function () { settxt(CryptoJS.SHA3(gettxt(), {outputLength:384}).toString(CryptoJS.enc.Base64)); });

$('#sha3-512-hex').on('click', function () { settxt(CryptoJS.SHA3(gettxt())); });
$('#sha3-512-b64').on('click', function () { settxt(CryptoJS.SHA3(gettxt()).toString(CryptoJS.enc.Base64)); });


}); // $
