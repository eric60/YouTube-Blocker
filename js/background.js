var currentURL;
var videoCategory;
var API_KEY = "AIzaSyAeebo7DlkB6YyCem51Lq9AOAmFG1Nbkxg";
var allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, and Science & technology
let activated = chrome.storage.local.get(['activated'], function(result) {
  console.log('Settings retrieved', result.activated);
});

(function() {
  var queryInfo = {
    'active': true, 
    'lastFocusedWindow': true,
    'windowId': chrome.windows.WINDOW_ID_CURRENT
  }
  chrome.tabs.query(queryInfo,
   function(tabs){
      currentURL = tabs[0].url;
      console.log(currentURL)
   }
  );
})();


$(document).ready(function(){

  function parseToId(url){
    var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regEx);
    return (match && match[2].length == 11) ? match[2] : null; // check match array not null first, returns string id of YouTube video
  }


  async function isAllowed(url) {
    var videoId = parseToId(url);
    if(!videoId){
       return true; // If URL is NOT a Youtube video then return true
    }
    const restAPI = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&fields=items(snippet(categoryId))&part=snippet`
    
    // fetch method to return if current page's youtube video is allowed or not through Youtube's Data API
     const response = await fetch(restAPI)
     const json = await response.json()
     console.log(JSON.stringify(json))
     processYoutubeData(json)
  }

  function processYoutubeData(json) {
    videoCategory = json.items[0].snippet.categoryId;
    console.log("The video category of the current Youtube video is " + videoCategory);
    return allowedIds.includes(videoCategory);
  }

  console.log('current url: ' + currentURL);
  var isAllowedUrl = isAllowed(currentURL);
  console.log('isAllowedUrl: ' + isAllowedUrl);

  /*
   * Listens if url is a youtube video and blocks accordingly.
   * Function does not run automatically! Must call it directly
   *
   */
  function initializeBlocking(){
    chrome.webRequest.onBeforeRequest.addListener(
      function listener() {
        if(!isAllowed(currentUrl) && activated){
            return {redirectUrl:'https://www.youtube.com/channel/UCdxpofrI-dO6oYfsqHDHphw'};
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


  $('#startButton').on("click",function(){
    activated = !activated
    if(activated) {
      $(this).css('background-color','#f44336')
      $(this).text("Deactivate")
      initializeBlocking();
    } 
    else {
      $(this).css('background-color','#4CAF50')
      $(this).text("Activate")
    }
    chrome.storage.local.set({activated: activated}, function() {
      console.log('Activated set to ' + activated);
    });
  });


});
