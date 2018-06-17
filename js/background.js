'use strict';

var rangeValues = {
  1: "30 min",
  2: "1 hour",
  3: "1 hour 30 min",
  4: "2 hours",
  5: "2 hours 30 min",
  6: "3 hours",
  7: "3 hours 30 min",
  8: "4 hours",
  9: "4 hours 30 min",
  10: "5 hours",
  11: "5 hours 30 min",
  12: "6 hours",
  13: "6 hours 30 minutes"
};

var isOn = false;
var countDownTime;




$(document).ready(function(){

  /*
   * Listens if url is a youtube video and blocks accordingly.
   * Function does not run automatically! Must call it directly
   *
   */
  function initializeBlocking(){
    chrome.webRequest.onBeforeRequest.addListener(
      function(currentURL) {
        if(!isAllowed(currentUrl)){
            return {cancel: true};
            //'redirectUrl': 'https://www.youtube.com/channel/UC3yA8nDwraeOfnYfBWun83g';
        }
      },
      {
        urls: [
          "*://*.yahoo.com/*"
        ]
      },
      ["blocking"]
    );
  }

  // if backgroun current url is not allowed youtube video, then initialize blocking current webpage
  initializeBLocking();

  $(function(){
    // val() returns string value of rangeSlider so use bracket notation
    $('#rangeText').text(rangeValues[$('#rangeSlider').val()]);
    $('#rangeSlider').change(function(){
      $('#rangeText').text(rangeValues[$(this).val()]);
    });
  })

  function switchToTimer(){
        $('.footer').hide();
        $('.range').hide();
        // show hidden elements, logo and time left
        $('.addedElement').show();

  }

  function switchToMenu(){
    var options = {
      type: 'basic',
      title: 'Timer',
      message: 'Blocking time over!',
      iconUrl: 'icon.png',
      priority: 2
    }
    $('.footer').show();
    $('.range').show();
    $('.addedElement').hide();
  }

  function startTimer(addedTime){
      switchToTimer();

      var start = Date.now();

      function timer(){
        var difference = Math.floor(addedTime - ((Date.now() - start) / 1000));

        var hours = Math.floor(difference / 3600);
        var minutes = Math.floor(difference / 60 % 60);
        var seconds = difference % 60;

        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;

        if(difference <= 0){
          start = Date.now() + 1000;
        }

        $('#timer').text(hours + ':' + minutes + ':' + seconds);

        if(hours == 0 && minutes == 0 && seconds == 0){
          clearInterval(handle);
          switchToMenu();
        }
      }
      timer();
      var handle = setInterval(timer, 1000);
  }

  $('#startButton').on("click",function(){
    countDownTime = $('#rangeSlider').val();
    startTimer(5);
    //countDownTime * 30 * 60

  })

});
