
chrome.storage.local.get(['activated', 'allowed'], function(data) {
    console.log('content script allowed' + data.allowed)

    if (data.activated === true && data.allowed == false) {  
        alert("Bad youtube video")
        //location.replace('http://youtube.com')
    }
});



