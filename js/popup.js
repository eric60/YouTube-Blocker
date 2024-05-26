let activated = false;
let harderToDeactivate = false;
const DEFAULT_API_KEY = "No Key Set";
let USER_API_KEY = DEFAULT_API_KEY
let harderDeactivateClicksVal = 10;

var jQueryScript = document.createElement('script');
jQueryScript.setAttribute('src', 'js/jquery-3.4.1.min.js');
document.head.appendChild(jQueryScript);

// we have to wait a moment before the document has jQuery as a part of it.
setTimeout(function() {

  // ============================== Default States =========================================
  $('#options').on('click', function () {
    console.log("options click: activate options page")
    activateOptionsPage()
   });


 // ============================== Initiating functions =========================================
  initiateHarderToDeactivateActions();
  initiateHarderDeactivateClicks();
  initiateActivatedValueActions();

  function initiateHarderToDeactivateActions() {
    chrome.storage.local.get('harderDeactivate', function(data) {
      if (data.harderDeactivate === true) {
        checkHarderToDeactivateCheckBox()
        harderToDeactivate = true;
      }
      else {
          harderToDeactivate = false;
      }
      console.log('harderDeactivate value is ' + harderToDeactivate)
    });
  }

  function initiateHarderDeactivateClicks() {
    chrome.storage.local.get('harderDeactivateClicks', function(data) {
        let value = data.harderDeactivateClicks;
        if (!value) {
          harderDeactivateClicksVal = 10;
        }
        else {
          harderDeactivateClicksVal = value;
        }
        if (activated && harderToDeactivate) {
          setupActivatedStateWithDeactivateHarderJQuery()
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
          setupInDeactivatedStateJQuery();
        }
        else {
          console.log('activated value is ' + data.activated)
          if (data.activated === false) {
            console.log('trigger 1')
            setupInDeactivatedStateJQuery();
          }
          else if (harderToDeactivate === true && data.activated == true) {
            console.log('trigger 2');
            setupActivatedStateWithDeactivateHarderJQuery();
            setupMakeItHarderjQuery();
          }
          else if (data.activated == true) {
            console.log('trigger 3')
            inActivatedStateJQuery();
          }
          activated = data.activated;
        }
        handleStartButton();
    })
  }

  function activateOptionsPage() {
   chrome.runtime.sendMessage({"action": "openOptionsPage"});
  }

  chrome.storage.local.get('apiKey', function(data) {
    if (data.apiKey === undefined) {
        setupInInitialSetupState();
    }
    else {
      setUpAlreadySetupState()
      if (data.apiKey === "" || data.apiKey === undefined) {
        console.log('trigger empty key')
        USER_API_KEY = DEFAULT_API_KEY;
        setupWarningTextjQuery()
      }
      else {
        // console.log('---------------- API Key:' + data.apiKey + " ----------------")
        USER_API_KEY = data.apiKey
      }
    }

  })

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
      harderToDeactivate = value;
      resetStartButton()
    })
  }



// =================== Popup States ===================
  function setupInInitialSetupState() {
    $('#startButton').hide();
    $('#text').hide();
    $("#options").text("Set your YouTube key first to start blocking");
    $('#harderDeactivateText').hide()
    $('#harderDeactivate').hide()
  }

  function setUpAlreadySetupState() {
    $('#harderDeactivateDiv').show()

    $('#harderDeactivate').mousedown(function () {
      if ($(this).is(':checked')) {
        setHarderDeactivateValue(false)
      } else {
        setHarderDeactivateValue(true)
      }
    })
  }

  // =================== Handle Start button based on harderDeactivate and Activated values ===================
  let clicks = 0;

  function handleStartButton() {
    console.log('trigger handleStartButton. \nharderDeactivate is: ' + harderToDeactivate + "\nactivated is: " + activated)

    if (harderToDeactivate == false) {
      $('#startButton').on("click", handleButtonWhenHarderToDeactivateIsFalse)
    } else {
      $('#startButton').on("click", handleButtonWhenHarderToDeactivateIsTrue)
    }
  }

  function handleButtonWhenHarderToDeactivateIsFalse() {
    console.log('Inside handleStartButton harderDeactivate false\nactivated is: ' + activated)
    if (activated == false) {
      activateAction();
    } else {
      console.log('trigger harderDeactivefalse and activate true')
      deactivateAction();
    }
  }

  function handleButtonWhenHarderToDeactivateIsTrue() {
    console.log('Inside handleStartButton harderDeactivate true')
    if (!activated) {
      activateWhenDeactivateHarderAction();
    } else {
      clicks++;
      console.log(clicks)
      if (clicks % harderDeactivateClicksVal == 0) {
        deactivateAction();
      }
    }
  }


  // ================================ jQuery and Action methods ===================================
  function clearErrorMessage() {
    $('.errorMessage').text("")
  }

  function checkHarderToDeactivateCheckBox() {
    $('#harderDeactivate').prop('checked', true);
  }

  function resetStartButton() {
    console.log('Trigger resetStartButton')
    $('#startButton').unbind('click');
    handleStartButton()
  }

  function activateAction() {
    // activated and not harderDeactivate
    inActivatedStateJQuery()
    activated = !activated
    setActivated(activated)
    refreshPage();
  }

  function refreshPage() {
    // refresh tab
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      console.log(tabs[0].url);
      let url = tabs[0].url;
      if (url.search("youtube.com") != -1) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      }
    });
  }

  function inActivatedStateJQuery() {
    $('#startButton').css('background-color', '#f44336')
    $('#startButton').text("Deactivate")
    hideMakeItHarderjQuery();
  }

  function deactivateAction() {
    if (confirm('Are you sure you really need to deactivate?')) {
      setupInDeactivatedStateJQuery();
      resetMadeItHarderjQuery();
      activated = !activated
      setActivated(activated)
    }
  }

  function setupInDeactivatedStateJQuery() {
    $('#startButton').css('background-color', '#4CAF50')
    $('#startButton').text("Activate")
    if (activated != undefined) {
      showMakeItHarderjQuery();
    }
  }

  function activateWhenDeactivateHarderAction() {
    setupActivatedStateWithDeactivateHarderJQuery();
    activated = !activated
    setActivated(activated)
    refreshPage();
  }

  function setupActivatedStateWithDeactivateHarderJQuery() {
    console.log('trigger jquery')
    $('#startButton').css({'background-color': '#f44336', 'font-size': '15px', 'width': '11em', 'height': '4em'})
    $('#startButton').text(`Click ${harderDeactivateClicksVal} times to deactivate`)
    setupMakeItHarderjQuery()
  }

  function setupMakeItHarderjQuery() {
    $('#harderDeactivate').hide();
    $('#harderDeactivateText').text("You made it harder to deactivate")
  }

  function resetMadeItHarderjQuery() {
    $('#harderDeactivate').show();
    $('#harderDeactivateText').text("Make it harder to deactivate")
    $('#startButton').css({'font-size': '17px', 'width': '9em', 'height': '3em'})
  }

  function hideMakeItHarderjQuery() {
    $('#harderDeactivateText').hide()
    $('#harderDeactivate').hide()
  }

  function showMakeItHarderjQuery() {
    $('#harderDeactivateText').show()
    $('#harderDeactivate').show()
  }

  function setupWarningTextjQuery() {
    $("#warning").textContent("You do not have a key set. Please set one in the Options page below.")
    $("#warning").show();
    $('body').css({'height': '390px'});
  }
  
}, 30);