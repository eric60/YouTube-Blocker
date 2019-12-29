let activated;

// (function() {
//   var queryInfo = {
//     'active': true, 
//     'lastFocusedWindow': true,
//     'windowId': chrome.windows.WINDOW_ID_CURRENT
//   }
//   chrome.tabs.query(queryInfo,
//    function(tabs){
//       let currentURL = tabs[0].url;
//       console.log(currentURL)
//    }
//   );
// })();

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     currentURL = sender.tab.url;

//     if (request.initiate) {
//       initiateisAllowed(currentURL)
//       sendResponse({initiated: true});
//     }
    
// });

$(document).ready(function(){

  // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //   if(changeInfo.status == 'complete') {
  //     let isAllowed = isAllowed(currentURL)

  //     chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
  //       chrome.tabs.sendMessage(tabs[0].id, {isAllowed: isAllowed}, function(response) {

  //       });  
  //     });

  //   }

  // }) 

  // Determine Activated status and set button UI
  getActivated();

  function getActivated() {
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


 
  // function executeContentScript() {
  //   chrome.tabs.executeScript({
  //     file: 'js/contentScript.js'
  //   });
  // }

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
  });



 

 

});
