let activated;
let harderDeactivate;
const DEFAULT_API_KEY = "No Key Set";
let USER_API_KEY = ""
let apiKeysQueue = []
let countApiCalls = 0;
let harderDeactivateClicksVal;

$(document).ready(function() {

  $('#harderDeactivateDiv').show()    


// notifiy content script when youtube dynamically updates DOM to prevent re fetching API
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
    if (request.createNotification == true) { 
        let videoCategoryString = request.videoCategoryString;
        let message = `You were watching a ${videoCategoryString} video so it was blocked.`
        showNotification(message);
    } 
    else if (request.url){
      console.log('request url: ' + request.url);
    
      initiateisAllowed(request.url).then(json => {
        if (json.error) {
          handleYoutubeAPIError(json)
        } 
        else {
          $('.errorMessage').text("")
          sendResponse({json: json});
        }
      })
  
      return true; // return true to indicate you want to send a response asynchronously
    }
});

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
      if (data.harderDeactivate == true) {
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

});
