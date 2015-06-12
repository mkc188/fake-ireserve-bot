'use strict';

// console.log('\'Allo \'Allo! Popup');

function restore() {
  chrome.storage.local.get(null, function(obj) {
    for (var key in obj) {
      var el = document.querySelector('#' + key);
      if (key === 'autoSubmit') {
        el.checked = obj[key];
      } else {
        el.value = obj[key];
      }
    }
  });
}

function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(restore);

function fill() {
  document.querySelector('#messageArea').innerHTML = '';
  var formElements = document.querySelectorAll('#infoForm input:not([type=button]):not(#autoSubmit)');
  for (var i = 0; i < formElements.length; i++) {
    var value = formElements[i].value;
    // if (value === '') {
    //   chrome.storage.local.clear();
    //   document.querySelector('#messageArea').innerHTML = 'Please fill the all the blanks';
    //   formElements[i].focus();
    //   return;
    // }
    var id = formElements[i].id;
    var obj = {};
    obj[id] = value;
    chrome.storage.local.set(obj);
  }
  chrome.storage.local.set({
    'autoSubmit': document.querySelector('#autoSubmit').checked
  });
}

var save = document.querySelector('#save');
save.addEventListener('click', function() {
  fill();
  document.querySelector('#messageArea').innerHTML = 'Save success';
});

var fillSave = document.querySelector('#fillSave');
fillSave.addEventListener('click', function() {
  fill();
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      msg: 'fill'
    }, function(response) {
      if (response.res === 'complete') {
        document.querySelector('#messageArea').innerHTML = 'Fill success';
      } else {
        document.querySelector('#messageArea').innerHTML = 'Could not find content script';
      }
    });
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === 'missing') {
      sendResponse({
        res: 'ack'
      });
      document.querySelector('#messageArea').innerHTML = 'Wrong input';
    }
  });
