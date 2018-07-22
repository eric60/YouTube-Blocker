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
var currentURL;
var countDownTime;
var videoCategory;
var apiKEY = "AIzaSyBF9SR0ml6IhuO0mXvRXPKBeBgklC2qvDU";
var allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, and Science & technology

(function() {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
   function(tabs){
      currentURL = tabs[0].url;
      console.log(currentURL);
      return currentURL;
   }
  );
})();

$(document).ready(function(){

  if (typeof jQuery !== 'undefined'){
      console.log('jQuery Loaded');
  }
  else{
      console.log('Not loaded yet');
  }

  function getCurrentUrl() {
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
     function(tabs){
        currentURL = tabs[0].url;
        console.log(currentURL);
        return currentURL;
     }
    );
  }

  function parseToId(url){
    var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regEx);
    return (match && match[2].length == 11) ? match[2] : null; // check match array not null first, returns string id of YouTube video
  }

  // returns true if allowed youtube video category or any other website, false if blocked youtube category
  function isAllowed(url) {
    var videoId = parseToId(url);
    if(!videoId){
       return true; // If URL is NOT a Youtube video then return true
    }
    const restAPI = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKEY}&fields=items(snippet(categoryId))&part=snippet`
    // fetch method to return if current page's youtube video is allowed or not through Youtube's Data API
    return fetch(restAPI)
    .then(function(response){
      return response.json();
    })
    .then(function(json) {
      videoCategory = json.items[0].snippet.categoryId;
      console.log("The video category of the current Youtube video is " + videoCategory);
      return allowedIds.includes(videoCategory);
    })
    .catch(function(error) {
      console.log(error);
    })
  }
// ---------------------------------------------------------------------------------------------------------------------

  console.log(currentURL);
  var promise = isAllowed(currentURL).then((isAllowedUrl) => {
    console.log("This Youtube video is allowed and will NOT be blocked: " + isAllowedUrl);
    return isAllowedUrl;
  });



  /*
   * Listens if url is a youtube video and blocks accordingly.
   * Function does not run automatically! Must call it directly
   *
   */
  function initializeBlocking(){
    chrome.webRequest.onBeforeRequest.addListener(
      function(currentURL) {
        if(!isAllowed(currentUrl)){
            return {redirectUrl:'https://www.youtube.com/channel/UC3yA8nDwraeOfnYfBWun83g'};

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
  initializeBlocking();

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
        // show hidden elements, the logo and time left
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

        if(difference == 0){
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
  } // end startTiner function

  $('#startButton').on("click",function(){
    countDownTime = $('#rangeSlider').val();
    startTimer(countDownTime * 60 * 30); // countDownTime * 60 * 30 - convert to seconds then minutes by 30 min blocks

  })

});
