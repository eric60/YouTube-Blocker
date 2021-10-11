let previousSourceVideoData = [];
let activated;
const allowedVideoCategories = ["Howto & Style", "Education", "Science & Technology"]

chrome.storage.local.get(['activated'], function(data) {
    activated = data.activated;  
    console.log('Activated value: ' + activated)  

    if (activated == true) {
        console.log('Blocking is activated. Initiating blocking')
        initiateBlockingBasedOnInnerHtml();
    } 
    else {
        console.log('Blocking not activated. Not initiating')
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  
    if (request.query === 'Page updated')
    {
        console.log('Page updated');
        initiateBlockingBasedOnInnerHtml();
    }
 });


 function initiateBlockingBasedOnInnerHtml() {
    console.log("initiating BlockingBasedOnInnerHtml")
    var curUrl = window.location.href;
    window.setInterval(function(){
        console.log("Checking url")
        if(curUrl != window.location.href) {
            curUrl = window.location.href;

            setTimeout(function(){
                checkUrl();
            }, 1000);
        }
    }, 60000);
    checkUrl();
 }

function checkUrl(){
    console.log("inside checkUrl")
    var scripts = document.scripts;
    for(index in scripts) {
        if(typeof scripts[index].innerHTML !== "undefined" && scripts[index].innerHTML.indexOf('"category":') !== -1) {
            pos = scripts[index].innerHTML.indexOf('"category":');
            videoMetadata = scripts[index].innerHTML.substring(pos+12,pos+100);
            console.log("videoMetadata: " + videoMetadata)
            pos = videoMetadata.indexOf('"');
            videoCategory = videoMetadata.substring(0,pos);
            console.log('Youtube Video category is: ' + videoCategory)
            handleYoutubeBlocking(videoCategory)
            break;
        }

        if(typeof scripts[index].innerHTML !== "undefined" && scripts[index].innerHTML.indexOf('"genre":') !== -1) {
            pos = scripts[index].innerHTML.indexOf('"genre":');
            videoMetadata = scripts[index].innerHTML.substring(pos+9,pos+100);
            console.log("videoMetadata: " + videoMetadata)
            pos = videoMetadata.indexOf('"');
            videoCategory = videoMetadata.substring(0,pos);
            handleYoutubeBlocking(videoCategory)
            break;
        }
    }
}

function handleYoutubeBlocking(videoCategoryString) {
    isVideoCategoryAllowed = allowedVideoCategories.includes(videoCategoryString)
    console.log("isVideoCategoryAllowed: " + isVideoCategoryAllowed)
    if (isVideoCategoryAllowed == false) {
        blockYoutubeVideo(videoCategoryString)
    }
    return true;
}

function blockYoutubeVideo(videoCategoryString) {
    console.log('in blockYoutubeVideo')
    chrome.storage.local.get(['activated'], function(data) {
        console.log('Blocking Activated value: ' + data.activated)
    
        if (data.activated === true) {  
            console.log('---- Sent create notification to background ----');
            // Block redirecting happens here
            location.replace('http://youtube.com')
            chrome.runtime.sendMessage({createNotification: true, videoCategoryString: videoCategoryString}, 
                function(response) {
            });     
        }
    });
}







