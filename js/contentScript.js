let previousvideoMetaData = [];
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
    console.log("--- inside checkUrl ---")
    let scripts = document.scripts;
    console.log(scripts)
    for(index in scripts) {
        if(typeof scripts[index].innerHTML !== "undefined" && scripts[index].innerHTML.indexOf('"category":') !== -1) {
            if (handleVideoMetaData(scripts, '"category":', 12, 100)) {
                break;
            }
        }
        if(typeof scripts[index].innerHTML !== "undefined" && scripts[index].innerHTML.indexOf('"genre":') !== -1) {
            if (handleVideoMetaData(scripts, '"genre":', 9, 100)) {
                break;
            }
        }
    }
    // handleNoWayToCheckVideoCategoryError()
}

function handleNoWayToCheckVideoCategoryError() {
    alert("Error: Youtube Blocker could not detect the video category of this video.")
}

function handleVideoMetaData(scripts, videoMetadataHtmlStartStr, startOffset, endOffset) {
    pos = scripts[index].innerHTML.indexOf(videoMetadataHtmlStartStr);
    videoMetadata = scripts[index].innerHTML.substring(pos + startOffset, pos + endOffset);
    if (isVideoMetadataDuplicate(videoMetadata)) {
        return false;
    }
    console.log(`videoMetadata for ${videoMetadataHtmlStartStr}: ` + videoMetadata)
    pos = videoMetadata.indexOf('"');
    videoCategory = videoMetadata.substring(0,pos);
    videoCategory = videoCategory.replace("\\u0026", "&")
    console.log('Youtube Video category is: ' + videoCategory)
    handleYoutubeBlocking(videoCategory)
    return true;
}

function isVideoMetadataDuplicate(videoMetadata) {
    console.log("previousvideoMetaData: " + previousvideoMetaData)
    if (previousvideoMetaData.includes(videoMetadata)) {
        console.log("video meta data is duplicate")
        return true;
    }
    console.log("video meta data is NOT duplicate")
    previousvideoMetaData.push(videoMetadata);
    return false;
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
            //location.replace('http://youtube.com')
            chrome.runtime.sendMessage({createNotification: true, videoCategoryString: videoCategoryString}, 
                function(response) {
            });     
        }
    });
}







