import {activated, harderDeactivate, setHarderDeactivateValue} from "./service_worker.js";
import activateOptionsPage from "./contentScript"

var jQueryScript = document.createElement('script');
jQueryScript.setAttribute('src', './jquery-3.4.1.min.js');
document.head.appendChild(jQueryScript);

/*
setTimeout(function() {
  // Add the rest of your code here, as we have to wait a moment before the document has jQuery as a part of it.
  $("body").html("<h1>It Works!</h1>");
}, 1000);
*/


// =================== Popup States ===================
  export function inInitialSetupState() {
    $('#startButton').hide();
    $('#text').hide();
    clearWarningTextjQuery();
    $("#options").text("Set your YouTube key first to start blocking");
    $('#harderDeactivateText').hide()
    $('#harderDeactivate').hide()
  }

  export function inAlreadySetupState() {
    $('#harderDeactivateDiv').show()

     $('#options').on('click', function () {
      activateOptionsPage()
    });

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

  export function handleStartButton() {
    console.log('trigger handleStartButton. harderDeactivate is: ' + harderDeactivate + "\nactivated is: " + activated)

    if (harderDeactivate == false) {
      $('#startButton').on("click", buttonWhenHarderDeactivateFalse)
    } else {
      $('#startButton').on("click", buttonWhenHarderDeactivateTrue)
    }
  }

  export function buttonWhenHarderDeactivateFalse() {
    console.log('Inside handleStartButton harderDeactivate false\nactivated is: ' + activated)
    if (activated == false) {
      activateAction();
    } else {
      console.log('trigger harderDeactivefalse and activate true')
      deactivateAction();
    }
  }

  export function buttonWhenHarderDeactivateTrue() {
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
  export function clearErrorMessage() {
    $('.errorMessage').text("")
  }

  export function checkHarderToDeactivateCheckBox() {
    $('#harderDeactivate').prop('checked', true);
  }

  export function resetStartButton() {
    console.log('Trigger resetStartButton')
    $('#startButton').unbind('click');
    handleStartButton()
  }

  export function activateAction() {
    // activated and not harderDeactivate
    inActivatedStateJQuery()
    activated = !activated
    setActivated(activated)
    refreshPage();
  }

  export function refreshPage() {
    // refresh tab
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      console.log(tabs[0].url);
      let url = tabs[0].url;
      if (url.search("youtube.com") != -1) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      }
    });
  }

  export function inActivatedStateJQuery() {
    $('#startButton').css('background-color', '#f44336')
    $('#startButton').text("Deactivate")
    hideMakeItHarderjQuery();
  }

  export function deactivateAction() {
    if (confirm('Are you sure you really need to deactivate?')) {
      inDeactivatedStateJQuery();
      resetMadeItHarderjQuery();
      activated = !activated
      setActivated(activated)
    }
  }

  export function inDeactivatedStateJQuery() {
    $('#startButton').css('background-color', '#4CAF50')
    $('#startButton').text("Activate")
    if (activated != undefined) {
      showMakeItHarderjQuery();
    }
  }

  export function activateWhenDeactivateHarderAction() {
    activateWhenDeactivateHarderJQuery();
    activated = !activated
    setActivated(activated)
    refreshPage();
  }

  export function activateWhenDeactivateHarderJQuery() {
    console.log('trigger jquery')
    $('#startButton').css({'background-color': '#f44336', 'font-size': '15px', 'width': '11em', 'height': '4em'})
    $('#startButton').text(`Click ${harderDeactivateClicksVal} times to deactivate`)
    madeItHarderjQuery()
  }

  export function madeItHarderjQuery() {
    $('#harderDeactivate').hide();
    $('#harderDeactivateText').text("You made it harder to deactivate")
  }

  export function resetMadeItHarderjQuery() {
    $('#harderDeactivate').show();
    $('#harderDeactivateText').text("Make it harder to deactivate")
    $('#startButton').css({'font-size': '17px', 'width': '9em', 'height': '3em'})
  }

  export function hideMakeItHarderjQuery() {
    $('#harderDeactivateText').hide()
    $('#harderDeactivate').hide()
  }

  export function showMakeItHarderjQuery() {
    $('#harderDeactivateText').show()
    $('#harderDeactivate').show()
  }

  export function setWarningTextjQuery() {
    $("#warning").show();
    $('body').css({'height': '390px'});
  }

  export function clearWarningTextjQuery() {
    $("#warning").hide();
    $('body').css({'height': '360px'});
  }