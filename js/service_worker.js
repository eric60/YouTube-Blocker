let activated;
let harderDeactivate;
const DEFAULT_API_KEY = "No Key Set";
let USER_API_KEY = ""
let apiKeysQueue = []
let countApiCalls = 0;
let harderDeactivateClicksVal;

// ======================== Service Workers Documentation =========================================
/*
 * Service workers are by definition event-driven and will terminate on inactivity. This way Chrome can optimize performance and memory consumption of your extension
 * Service workers will be reinitialized when the event is dispatched
 * Your extension scripts should use message passing to communicate between a service worker and other parts of your extension. Currently that entails using sendMessage() and implementing chrome.runtime.onMessage in your extension service worker. Long term, you should plan to replace these calls with postMessage() and a service worker's message event handler.
 */


$(document).ready(function() {

  // ============================== All Event Listeners =========================================
/*
 * ALL listeners MUST be registered in the top level of the script because service_workers are not constantly running.
 * https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers
 * This works with a persistent background page because the page is constantly running and never reinitialized. In Manifest V3, the service worker will be reinitialized when the event is dispatched. This means that when the event fires, the listeners will not be immediately registered already at that exact moment in time (since they are added asynchronously), and the event will be missed.
 * Instead, move the event listener registration to the top level of your script. This ensures that Chrome will be able to immediately find and invoke your action's click handler, even if your extension hasn't finished executing its startup logic.
 */

/*
 * we addEventListener for messages from content script to call YouTube Data API to determine if the video is allowed or now
 * Note: fetch request doesn't work in content script in context of web page due to CORs restrictions so we have to do this login in the service_worker
*/
chrome.runtime.onMessage.addListener("load",
  function(request, sender, sendResponse) {
    let messageForBlockingUrlRequest = request.url;

    if (request.createNotification == true) {
        let videoCategoryString = request.videoCategoryString;
        let message = `You were watching a ${videoCategoryString} video so it was blocked.`
        showNotification(message);
    } else if (messageForBlockingUrlRequest) {
      console.log('request url: ' + request.url);

      initiateisAllowed(request.url).then(jsonData => {
        if (jsonData.error) {
          handleYoutubeAPIError(jsonData)
        }
        else {
          $('.errorMessage').text("")
          sendResponse({json: jsonData});
        }
      })

      return true; // return true to indicate you want to send a response asynchronously
    }
});

// notify content script when youtube dynamically updates DOM to prevent re fetching API
chrome.webNavigation.onHistoryStateUpdated.addListener("load", function(details) {
  console.log('page updated')
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {query: "Page updated"}, function(response) {
    });
  });
})

  function initialSetupjQuery() {
    $('#startButton').hide();
    $('#text').hide();
    clearWarningTextjQuery();
    $("#options").text("Set your YouTube key to start blocking");
    $('#harderDeactivateText').hide()
    $('#harderDeactivate').hide()
  }

  chrome.storage.local.get('apiKey', function(data) {
    if (data.apiKey === undefined) {
        initialSetupjQuery();
    }
    else {
      $('#harderDeactivateDiv').show()
      if (data.apiKey == "") {
        console.log('trigger empty key')
        USER_API_KEY = DEFAULT_API_KEY;
        warningTextjQuery()
      }
      else {
        clearWarningTextjQuery();
        console.log('---------------- API Key:' + data.apiKey + " ----------------")
        USER_API_KEY = data.apiKey
      }
    }

  })

  function handleYoutubeAPIError(json) {
    let message = json.error.message;
    console.log("------ API error trigger: " + message)

    let showingMessage = "Your Youtube key is invalid. Please make sure it is correct in the options page"

    let isBadRequest = message.indexOf("not valid");
    if (!isBadRequest) {
      showingMessage = "The Youtube key call limit was reached so it will not block videos anymore. It will reset at midnight PT/3 am EST. You can set a new key in the options page."
    }
    showNotification(showingMessage)
  }

  async function initiateisAllowed(url) {
    let videoId = parseToId(url);
    console.log('New Youtube video id:' + videoId)

    let isURLNotYoutubeVideo = videoId == null;
    if (isURLNotYoutubeVideo){
       return;
    }

    const restAPI = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${USER_API_KEY}&fields=items(snippet(categoryId))`
    console.log("--- restAPI call: ")
    console.log(restAPI);

    countApiCalls++;
    console.log("API calls so far: " + countApiCalls)
    const response = await fetch(restAPI);
    console.log('--response message--')
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

  function showNotification(message) {
    let options = {
        type: 'basic',
        iconUrl: '../resources/icon.png',
        title: "Youtube Blocker",
        message: message,
    }
    chrome.notifications.create('Youtube Blocker', options)
  }

  $('#options').on('click', function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  });

  $('#harderDeactivate').mousedown(function() {
    if ($(this).is(':checked')) {
      setHarderDeactivateValue(false)
    }
    else {
      setHarderDeactivateValue(true)
    }
  });

  // ============================== Initiating functions =========================================
  initiateHarderToDeactivateActions();
  initiateHarderDeactivateClicks();
  initiateActivatedValueActions();

  function initiateHarderToDeactivateActions() {
    chrome.storage.local.get('harderDeactivate', function(data) {
      if (data.harderDeactivate === true) {
        $('#harderDeactivate').prop('checked', true);
        harderDeactivate = true;
      }
      else {
          harderDeactivate = false;
      }
      console.log('harderDeactivate value is ' + harderDeactivate)
    });
  }

  function initiateHarderDeactivateClicks() {
    chrome.storage.local.get('harderDeactivateClicks', function(data) {
        let value = data.harderDeactivateClicks;
        if (!value) {
          harderDeactivateClicksVal = "10";
        }
        else {
          harderDeactivateClicksVal = value;
        }
        if (activated && harderDeactivate) {
          activateWhenDeactivateHarderJQuery()
        }
        console.log('harderDeactivateClicks value is ' + value)
        console.log('harderDeactivateClicksVal set to ' + harderDeactivateClicksVal)
    });
  }

  function initiateActivatedValueActions() {
    chrome.storage.local.get('activated', function(data) {
        if (data.activated === undefined) {
          activated = false
          setActivated(false)
          deactivateJQuery();
        }
        else {
          console.log('activated value is ' + data.activated)
          if (data.activated === false) {
            console.log('trigger 1')
            deactivateJQuery();
          }
          else if (harderDeactivate == true && data.activated == true) {
            console.log('trigger 2');
            activateWhenDeactivateHarderJQuery();
            madeItHarderjQuery();
          }
          else if (data.activated == true) {
            console.log('trigger 3')
            activateJQuery();
          }
          activated = data.activated;
        }
        handleStartButton();
    })
  }

  // ================================= Chrome Storage setters ======================================
  function setActivated(value) {
    chrome.storage.local.set({activated : value}, function(){
      console.log('You set chrome storage activated value to ' + value)
      if (chrome.runtime.lastError) {
        throw Error(chrome.runtime.lastError);
      }
   })
  }

  // Start button needs to reinitialize when user sets new harderDeactivate value.
  function setHarderDeactivateValue(value) {
    chrome.storage.local.set({harderDeactivate : value}, function(){
      console.log('set deactivate harder value to ' + value)
      harderDeactivate = value;
      resetStartButton()
    })
  }

  // =================== Handle Start button based on harderDeactivate and Activated values ===================
  let clicks = 0;
  function handleStartButton() {
    console.log('trigger handleStartButton. harderDeactive is: ' + harderDeactivate + "\nactivated is: " + activated)

    if (harderDeactivate == false) {
      $('#startButton').on("click", buttonWhenHarderDeactivateFalse)
    }
    else {
      $('#startButton').on("click", buttonWhenHarderDeactivateTrue)
    }
  }

  function buttonWhenHarderDeactivateFalse() {
    console.log('Inside handleStartButton harderDeactivate false\nactivated is: ' + activated)
    if (activated == false) {
      activateAction();
    }
    else {
      console.log('trigger harderDeactivefalse and activate true')
      deactivateAction();
    }
  }

  function buttonWhenHarderDeactivateTrue() {
    console.log('Inside handleStartButton harderDeactivate true')
    if (!activated) {
      activateWhenDeactivateHarderAction();
    }
    else {
        clicks++;
        console.log(clicks)
        if (clicks % harderDeactivateClicksVal == 0) {
          deactivateAction();
        }
    }
  }

  function resetStartButton() {
    console.log('Trigger resetStartButton')
    $('#startButton').unbind('click');
    handleStartButton()
  }

  // ================================ jQuery and Action methods ===================================
  function activateAction() {
    // activated and not harderDeactivate
    activateJQuery()
    activated = !activated
    setActivated(activated)
    refreshPage();
  }

  function refreshPage() {
    // refresh tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      console.log(tabs[0].url);
      let url = tabs[0].url;
      if(url.search("youtube.com") != -1) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      }
    });
  }

  function activateJQuery() {
    $('#startButton').css('background-color','#f44336')
    $('#startButton').text("Deactivate")
    hideMakeItHarderjQuery();
  }

  function deactivateAction() {
    if(confirm('Are you sure you really need to deactivate?')) {
       deactivateJQuery();
       resetMadeItHarderjQuery();
       activated = !activated
       setActivated(activated)
    }
  }

  function deactivateJQuery() {
    // deactivated
    $('#startButton').css('background-color','#4CAF50')
    $('#startButton').text("Activate")
    if(activated != undefined) {
      showMakeItHarderjQuery();
    }
  }

  function activateWhenDeactivateHarderAction() {
    activateWhenDeactivateHarderJQuery();
    activated = !activated
    setActivated(activated)
    refreshPage();
  }

  function activateWhenDeactivateHarderJQuery() {
    console.log('trigger jquery')
    $('#startButton').css({'background-color':'#f44336', 'font-size': '15px', 'width':'11em', 'height': '4em'})
    $('#startButton').text(`Click ${harderDeactivateClicksVal} times to deactivate`)
    madeItHarderjQuery()
  }

  function madeItHarderjQuery() {
    $('#harderDeactivate').hide();
    $('#harderDeactivateText').text("You made it harder to deactivate")
  }

  function resetMadeItHarderjQuery() {
    $('#harderDeactivate').show();
    $('#harderDeactivateText').text("Make it harder to deactivate")
    $('#startButton').css({'font-size': '17px', 'width':'9em', 'height': '3em'})
  }

  function hideMakeItHarderjQuery() {
    $('#harderDeactivateText').hide()
    $('#harderDeactivate').hide()
  }

  function showMakeItHarderjQuery() {
    $('#harderDeactivateText').show()
    $('#harderDeactivate').show()
  }

  function warningTextjQuery() {
    $("#warning").show();
    $('body').css({'height':'390px'});
  }

  function clearWarningTextjQuery() {
    $("#warning").hide();
    $('body').css({'height':'360px'});
  }

});
