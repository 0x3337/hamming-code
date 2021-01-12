/**
 * Designed by Mirsaid Patarov
 * Created on: 08.04.2018
 * Build: 21A301
 */

(function () {
  var eHamming = document.querySelector('.hamming');

  var eInputGroup = eHamming.querySelector('.input-group');
  var eText = eInputGroup.querySelector('.text');
  var eFile = eInputGroup.querySelector('.file');

  var eEncoded = eHamming.querySelector('.encoded');
  var eEncodedP = eEncoded.querySelector('p');

  var eWithError = eHamming.querySelector('.with-error');
  var eWithErrorP = eWithError.querySelector('p');

  var eDecoded = eHamming.querySelector('.decoded');
  var eDecodedP = eDecoded.querySelector('p');

  function fillBits(bits, length, front = false) {
    if (front) {
      while (bits.length % length) {
        bits = '0' + bits;
      }
    } else {
      while (bits.length % length) {
        bits += '0';
      }
    }

    return bits;
  }

  // Part 04
  function hammingEncode(hex) {
    var hammingBitPos = [6, 5, 3];
    var hammingBits = [3, 5, 6, 7];

    var res = 0;

    res ^= ((hex >> 3) & 1) << 4;
    res ^= ((hex >> 2) & 1) << 2;
    res ^= ((hex >> 1) & 1) << 1;
    res ^= ((hex >> 0) & 1) << 0;

    for (var i = 0; i < 3; i++) {
      var sum = 0;
      var syndromeBits = '';

      for (var j = 0; j < 4; j++) {
        syndromeBits += ((hammingBits[j] >> i) & 1);
        sum += ((hex >> (3 - j)) & 1) * ((hammingBits[j] >> i) & 1);
      }

      res |= (sum % 2) << hammingBitPos[i];
    }

    return res;
  }

  // Part 06
  function hammingDecode(hex) {
    var res = 0;
    var syndrome = 0;

    for (var i = 0; i < 3; i++) {
      var sum = 0;

      for (var j = 0; j < 7; j++) {
        sum += ((hex >> (6 - j)) & 1) * (((j + 1) >> i) & 1);
      }

      syndrome |= (sum % 2) << i;
    }

    if (syndrome !== 0) {
      var bit = (1 << (7 - syndrome)) & hex;

      hex &= ~(1 << (7 - syndrome));
      hex |= ~bit & (1 << (7 - syndrome));
    }

    res |= ((hex >> 0) & 1) << 0;
    res |= ((hex >> 1) & 1) << 1;
    res |= ((hex >> 2) & 1) << 2;
    res |= ((hex >> 4) & 1) << 3;

    return res;
  }

  // Part 06
  function decode(error, origin) {
    var res = '';
    var resHTML = '', io = true;

    for (var i = 0; i < error.length; i += 7) {
      var bitStr = error.substr(i, 7);
      var bits = hammingDecode(parseInt(bitStr, 2));

      bits = fillBits(bits.toString(2), 4, true);

      res += bits;
      resHTML += bits + ' ';
    }

    eDecodedP.innerText = resHTML;
    eDecoded.classList.add('active');

    if (res === origin) {
      eDecoded.classList.add('success');
    } else {
      eDecoded.classList.add('error');
    }
  }

  // Part 05
  function addError(encoded, origin) {
    var res = '';
    var resHTML = '', io = true;

    for (var i = 0; i < encoded.length; i++) {
      var rand = Math.floor(Math.random() * 100);

      if (io && rand < 30) {
        io = false;
        res += encoded[i] === '1' ? '0' : '1';
        resHTML += '<span class="error">' + (encoded[i] === '1' ? '0' : '1') + '</span>';
      } else {
        res += encoded[i];
        resHTML += encoded[i];
      }

      if (i % 7 === 6) {
        io = true;
        resHTML += ' ';
      }
    }

    eWithErrorP.innerHTML = resHTML;
    eWithError.classList.add('active');

    decode(res, origin);
  }

  // Part 04
  function encode(uint) {
    var res = '';
    var resHTML = '';
    var origin = '';

    for (var i = 0; i < uint.length; i++) {
      var leftHalf = hammingEncode((uint[i] >> 4) & 0xf).toString(2);
      var rightHalf = hammingEncode(uint[i] & 0xf).toString(2);

      origin += fillBits(uint[i].toString(2), 8, true);

      leftHalf = fillBits(leftHalf, 7, true);
      rightHalf = fillBits(rightHalf, 7, true);

      res += leftHalf + rightHalf;
      resHTML += leftHalf + ' ' + rightHalf + ' ';
    }

    eEncodedP.innerText = resHTML;
    eEncoded.classList.add('active');

    addError(res, origin);
  }



  eInputGroup.addEventListener('focusin', function () {
    eInputGroup.classList.add('focus');
  });

  eInputGroup.addEventListener('focusout', function () {
    eInputGroup.classList.remove('focus');
  });

  eText.addEventListener('input', function () {
    var uint = new TextEncoder("utf-8").encode(eText.value);

    eEncoded.classList.remove('active');
    eWithError.classList.remove('active');
    eDecoded.classList.remove('active');

    if (eText.value) {
      encode(uint);
      eHamming.classList.add('active');
    } else {
      eHamming.classList.remove('active');
    }
  });

  eFile.addEventListener('change', function (event) {
    var element = event.target;
    var file = element.files[0];

    eHamming.classList.remove('active');

    if (file) {
      var reader = new FileReader();

      reader.onload = function(event) {
        element.value = '';
        var uint = new Uint8Array(event.target.result);
        encode(uint);
      }
      
      reader.readAsArrayBuffer(file);
      eHamming.classList.add('active');
    }
  });
})();
