'use strict';

// console.log('\'Allo \'Allo! Content script');

var stopped = false;
var loggedin = false;

function submit() {
  chrome.storage.local.get(null, function(obj) {
    try {
      if (obj.autoSubmit) {
        document.querySelector('#' + obj.formID).submit();
      }
    } catch (e) {
      chrome.runtime.sendMessage({
        msg: 'missing'
      });
    }
  });
}

function fill(callback) {
  chrome.storage.local.get(null, function(obj) {
    for (var key in obj) {
      if (obj[key] === '') {
        return;
      }
    }

    try {
      document.querySelector('#' + obj.loginNameFieldID).value = obj.loginNameFieldValue;
      document.querySelector('#' + obj.passwordFieldID).value = obj.passwordFieldValue;

      var image = new Image();
      image.src = document.querySelector('#' + obj.captchaPictureID).src;
      var canvas = document.createElement('canvas');
      canvas.height = image.height;
      canvas.width = image.width;
      var imgDraw = canvas.getContext('2d');
      imgDraw.drawImage(image, 0, 0);
      var string = OCRAD(imgDraw);
      document.querySelector('#' + obj.captchaInputFieldID).value = string;

      if (callback) {
        callback();
      }
    } catch (e) {
      chrome.runtime.sendMessage({
        msg: 'missing'
      });
    }
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(sender.tab ?
    //   "from a content script:" + sender.tab.url :
    //   "from the extension");
    if (request.msg === 'fill') {
      fill(submit);
      sendResponse({
        res: 'complete'
      });
    }
  });

window.onload = function() {
  setTimeout(function() {
    Array.prototype.filter.call(document.querySelectorAll('div'), function(el) {
      if (el.innerHTML === 'Login Success!') {
        loggedin = true;
        return;
      } else if (el.innerHTML === 'Wrong Combination Or Wrong Captcha!') {
        stopped = true;
        setTimeout(function() {
          window.alert('Auto Login Failed.');
        }, 1);
        return;
      }
    });

    if (stopped) {
      fill();
    } else if (!loggedin) {
      fill(submit);
    }
  }, 1000);
};
