let activated;
const API_KEY = "AIzaSyAeebo7DlkB6YyCem51Lq9AOAmFG1Nbkxg";
let countApiCalls = 0;

// notifiy content script when youtube dynamically updates DOM
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  console.log('page updated')
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {query: "Page updated"}, function(response) {
    });
  });
})

// fetch request won't get a response in content script in context of web page due to Cors restritions
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.createNotification == true) {
        showNotification();
    } else {
      console.log('request url: ' + request.url);
    
      initiateisAllowed(request.url).then(json => {
        sendResponse({json: json});
      })
  
      return true; // return true to indicate you want to send a response asynchronously
    }
  });


  async function initiateisAllowed(url, sendResponse) {
    let videoId = parseToId(url);
    console.log('New Youtube video id:' + videoId)

    if(videoId == null){
       return; // If URL is NOT a Youtube video then return true
    }

    const restAPI = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}&fields=items(snippet(categoryId))`

    countApiCalls++;
    console.log("API calls so far: " + countApiCalls)
    const response = await fetch(restAPI);
    console.log(response);

    const json = await response.json();
    console.log('--response json--')
    console.log(json);
    return json;
  }

  function parseToId(url){
    var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regEx);

    return (match && match[2].length == 11) ? match[2] : null; 
  }

  function showNotification() {
    let options = {
        type: 'basic', 
        iconUrl: 'icon.png', 
        title: "Youtube Study", 
        message: "You were watching a non educational youtube video so you were redirected to the homepage.\nOnly Education, Science & Technology, or Howto & Style videos are allowed.",
        requireInteraction: true
    }
    chrome.notifications.create('Youtube Study', options, function() { console.log("Last error:", chrome.runtime.lastError);})
  }


$(document).ready(function(){

  getActivated();

  function getActivated() {
    chrome.storage.local.get('activated', function(data) {
        if(data.activated === undefined) {
          activated = false
          setActivated(false)
          deactivateJQuery();
        } else {
          console.log('Chrome storage GET activated value is ' + data.activated)
          if(data.activated === false) {
            deactivateJQuery();  
          } else {
            activateJQuery();
          }
          activated = data.activated;
        }
    })
  }

  function setActivated(value) {
    chrome.storage.local.set({activated : value}, function(){
      console.log('You set chrome storage activated value to ' + value)
      if(chrome.runtime.lastError) {
        throw Error(chrome.runtime.lastError);
      }
   })
  }

  $('#startButton').on("click", function() {
    if(!activated) {
      activateAction();

      // refresh tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log(tabs[0].url);
        let url = tabs[0].url;
        if(url.search("youtube.com") != -1) {
          chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        }
      });
    } 
    else {
        deactivateAction();
    }
    setActivated(activated)
  });


  function activateJQuery() {
    // currently activated
    $('#startButton').css('background-color','#f44336')
    $('#startButton').text("Deactivate")
  }

  function activateAction() {
    activateJQuery()
    activated = !activated
  }

  function deactivateJQuery() {
    // currently deactivated
    $('#startButton').css('background-color','#4CAF50')
    $('#startButton').text("Activate")
  }

  function deactivateAction() {
    if(confirm('Are you sure you really need to deactivate?')) {
       deactivateJQuery();
    }
    activated = !activated
  }

});
