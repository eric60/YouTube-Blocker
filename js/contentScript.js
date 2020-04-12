
let firstRun = false;
let activated;
let category;

chrome.storage.local.get(['activated'], function(data) {
    activated = data.activated;  

    if(activated == true) {
        console.log('Blocking is activated. Initiating blocking')
        $(document).ready(initiate)
        // initiate();
    } else {
        console.log('Blocking not activated. Not initiating')
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  
    if(request.query === 'Page updated')
    {
        console.log('Page updated');
        initiate();
    }
 });
 
 // clickMore
 // getCategory
 // processYoutubeCategory 
 // BlockYoutubeUrl
 function initiate() {
    var url = window.location.href;
    if(!isYoutubeVideo(url)) {
        console.log("Not youtube video")
        return;
    } 
    else {
        console.log("Initiating Youtube Study for " + url);

        $(document).ready(function() {
            let running = true;
            let cnt = 0;
            setTimeout(function() {
                while(running) {
                    running = false;
                    try {
                        clickMoreToExposeCategory(getCategory)
                    }
                    catch(err) {
                        cnt++;
                        if(cnt < 3) {
                           running = true
                        }
                        console.log("running cnt: " + cnt)
                        console.log(err)
                    }
                }
            }, 400);
        })
    }
 }

 function isYoutubeVideo(url) {
    let match = url.includes("v=")
    if(!match) {
        return false
    }
    return true
 }

 function clickMoreToExposeCategory(getCategorycallBack) {
    document.querySelector("paper-button#more").click()
    console.log("triggered click more")
    setTimeout(function(){
        getCategorycallBack()
    }, 100);
 }

 function getCategory(processYoutubecallback) {
     try {
        category = document.getElementById("collapsible").getElementsByTagName("a")[0].text
        console.log('triggered getCategory: ' + category)
        processYoutubeCategory()
     } catch(err) {
        console.log(err)
     }
 }

function processYoutubeCategory() {
    console.log("inside processYoutube")
    console.log('------>' +  category)
    let allowedCategories = ["Education", "Science & Technology", "Howto & Style"]

    if(category) {
        let isAllowedResult = allowedCategories.includes(category);
        console.log('isAllowedUrl: ' + isAllowedResult);

        if(isAllowedResult == false) {
            blockYoutubeUrl();
        }
    }   
}

function blockYoutubeUrl() {
    console.log('in blockYoutubeUrl')
    chrome.storage.local.get(['activated'], function(data) {
        console.log('Blocking Activated value: ' + data.activated)
    
        if (data.activated === true) {  
            console.log('---- Sent create notification to background ----');
            // Block redirecting happens here
            location.replace('http://youtube.com')
            chrome.runtime.sendMessage({createNotification: true}, function(response) {
            });           
        }
    });
}





