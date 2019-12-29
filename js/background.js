let activated;
const API_KEY = "AIzaSyAeebo7DlkB6YyCem51Lq9AOAmFG1Nbkxg"

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('request url: ' + request.url);
    
    initiateisAllowed(request.url).then(json => {
      sendResponse({json: json});
    })

    return true; // return true to indicate you want to send a response asynchronously
  });


  async function initiateisAllowed(url, sendResponse) {
    let videoId = parseToId(url);
    console.log('Youtube video id:' + videoId)

    if(videoId == null){
       return; // If URL is NOT a Youtube video then return true
    }

    const restAPI = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}&fields=items(snippet(categoryId))`
    console.log(restAPI)

    const response = await fetch(restAPI);
    console.log(response);

    const json = await response.json();
    console.log(json);
    return json;
  }

  function parseToId(url){
    var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regEx);

    return (match && match[2].length == 11) ? match[2] : null; 
  }


$(document).ready(function(){

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
