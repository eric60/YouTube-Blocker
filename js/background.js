let currentURL;
let API_KEY = "AIzaSyAeebo7DlkB6YyCem51Lq9AOAmFG1Nbkxg";
let allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, Science & technology
let activated;

(function() {
  var queryInfo = {
    'active': true, 
    'lastFocusedWindow': true,
    'windowId': chrome.windows.WINDOW_ID_CURRENT
  }
  chrome.tabs.query(queryInfo,
   function(tabs){
      currentURL = tabs[0].url;
   }
  );
})();

$(document).ready(function(){

  chrome.runtime.onInstalled.addListener(function(){
    console.log("App Installed");
    getActivated(executeContentScript);
  });

  chrome.tabs.onCreated.addListener((tab) => {
    getActivated(executeContentScript);
  }) 

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status == 'complete') {
      executeContentScript()
    }

  }) 

  // Determine Activated status and set button UI
  getActivated(executeContentScript);

  // Determine if URL allowed
  console.log('current url: ' + currentURL);
  isAllowed(currentURL);


  function getActivated(callback) {
    chrome.storage.local.get('activated', function(data) {
        if(data.activated === undefined) {
          activated = false
          setActivated(false)
        } else {
          console.log('Chrome storage GET activated value is ' + data.activated)
          if(data.activated == false) {
            $('#startButton').css('background-color','#4CAF50')
            $('#startButton').text("Activate")   
          } else {
            $('#startButton').css('background-color','#f44336')
            $('#startButton').text("Deactivate")
            console.log("calling callback")
            callback();
          }
          activated = data.activated;
        }
    })
  }

  function setActivated(value) {
    chrome.storage.local.set({activated : value}, function(){
      console.log('Chrome storage SET activated value ' + value)
      if(chrome.runtime.lastError) {
        throw Error(chrome.runtime.lastError);
      }
   })
  }
 
  function executeContentScript() {
    chrome.tabs.executeScript({
      file: 'js/contentScript.js'
    });
  }

  $('#startButton').on("click", function() {
    activated = !activated
    if(activated) {
      $(this).css('background-color','#f44336')
      $(this).text("Deactivate")
    } 
    else {
      $(this).css('background-color','#4CAF50')
      $(this).text("Activate")
    }
    setActivated(activated)
    executeContentScript();
  });



  function parseToId(url){
    var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regEx);

    // check match array not null first, returns string id of YouTube video
    return (match && match[2].length == 11) ? match[2] : null; 
  }


  async function isAllowed(url) {
    var videoId = parseToId(url);
    console.log('Youtube video id:' + videoId)
    if(videoId == null){
        setAllowed(true)
       return true; // If URL is NOT a Youtube video then return true
    }
    const restAPI = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&fields=items(snippet(categoryId))&part=snippet`
    
    // fetch method to return if current page's youtube video is allowed or not through Youtube's Data API
     const response = await fetch(restAPI)
     const json = await response.json()
     console.log(JSON.stringify(json))

     return processYoutubeData(json)
  }

  function processYoutubeData(json) {
    let videoCategory = json.items[0].snippet.categoryId;
    console.log("The video category of the Youtube video is " + videoCategory);

    let processResult = allowedIds.includes(videoCategory);
    setAllowed(processResult)
    
    console.log('isAllowedUrl: ' + processResult);
    return processResult
  }

  function setAllowed(value) {
    chrome.storage.local.set({allowed : value}, function(){
    })
  }

});
