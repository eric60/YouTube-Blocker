var currentURL;
var videoCategory;
var apiKEY = "AIzaSyBF9SR0ml6IhuO0mXvRXPKBeBgklC2qvDU";
var allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, and Science & technology

(function() {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
   function(tabs){
      currentURL = tabs[0].url;
   }
  );
})();
console.log('testing')


$(document).ready(function(){

  if (typeof jQuery !== 'undefined'){
      console.log('jQuery Loaded');
  }
  else{
      console.log('Not loaded yet');
  }

  function parseToId(url){
    var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regEx);
    return (match && match[2].length == 11) ? match[2] : null; // check match array not null first, returns string id of YouTube video
  }


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
  console.log('testing')
  console.log(currentURL);
  var isAllowedUrl = isAllowed(currentURL);
  console.log(isAllowedUrl);

  /*
   * Listens if url is a youtube video and blocks accordingly.
   * Function does not run automatically! Must call it directly
   *
   */
  function initializeBlocking(){
    chrome.webRequest.onBeforeRequest.addListener(
      function(currentURL) {
        if(!isAllowed(currentUrl)){
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

  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get("state", function(result) {
    if(result.state == null) {
      chrome.storage.local.set({state: false});
    }
    let activated = result.state
    $('#startButton').on("click",function(){
      activated = !activated
      if(activated) {
        $(this).css('background-color','#f44336')
        $(this).text("Deactivate")
        chrome.storage.local.set({state: true});
        initializeBlocking();
      } else {
        $(this).css('background-color','#4CAF50')
        $(this).text("Activate")
        chrome.storage.local.set({state: false});
      }
  
    })
  })
  
});

});
