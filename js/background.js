let activated;
let harderDeactivate;

let harderDeactivateClicksVal;

$(document).ready(function() {

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.runtime.reload();
});

chrome.runtime.onUpdateAvailable.addListener(function(details) {
  console.log("updating to version " + details.version);
  chrome.runtime.reload();
});

chrome.runtime.requestUpdateCheck(function(status) {
  if (status == "update_available") {
    console.log("update pending...");
  } else if (status == "no_update") {
    console.log("no update found");
  } else if (status == "throttled") {
    console.log("Oops, I'm asking too frequently - I need to back off.");
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log("Url changed. Page updated.")
  sendContentScriptMessage("Page updated")
});

// // notifiy content script when youtube dynamically updates DOM to prevent re fetching API
// chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
//   console.log('Page updated')
//   sendContentScriptMessage("Page updated")
//  });

function sendContentScriptMessage(message) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {query: message, activated: activated}, function(response) {
    });
    console.log("--- Sent content script message: " + message + "\nactivated: " + activated)
  })
}

// fetch request won't get a response in content script in context of web page due to Cors restritions
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.createNotification == true) { // content script already redirected page and blocked the url
        console.log("trigger you were watching message\ncreatenotifciation value: " + request.createNotification)
        let category = request.category
        var message = `You were watching a ${category} YouTube video so it was blocked.`
    } 
    else if (request.createNotification == false) { // content script already redirected page and blocked the url
      var message = "Failed to get Youtube Category. Please refresh."
    } 
    else if (request.getCategoryFail == true) {
      let category = request.category
      var message = `Failed to get valid Youtube Category: ${category}. Sorry! Please send the video url on the contact developer page so we can fix it. Thank you.`
    }
    showNotification(message);
});

  function showNotification(message) {
    console.log("trigger notification")
    let options = {
        type: 'basic', 
        iconUrl: '../resources/icon.png', 
        title: "Youtube Blocker", 
        message: message,
        requireInteraction: true
    }
    chrome.notifications.create('Youtube Blocker', options, 
    function() { console.log("Last error:", chrome.runtime.lastError);})
  }

  $('#options').on('click', function() {
      chrome.tabs.create({ url: "../pages/options.html" });
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
      if(data.harderDeactivate == true) {
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
        if(data.activated === undefined) {
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
      console.log('--- Set activated to: ' + value)
      sendContentScriptMessage("Changed activated")
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
        if(clicks % harderDeactivateClicksVal == 0) {
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
    // transition activated to deactivated
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
