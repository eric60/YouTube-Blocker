function save_options() {
    setApiKey()
    alert('You have saved your options')
}

window.onload = function(){
    let save = document.getElementById('save');
    save.addEventListener('click', save_options);
    getApiKey();

    let extensionLink = document.getElementById('extensions')
    extensionLink.addEventListener('click', function() {
        chrome.tabs.update({ url: 'chrome://extensions' });
    })
}

function getApiKey() {
    chrome.storage.local.get('apiKey', function(data) {
        let value = ""
        console.log('trigger ' + data.apiKey)
        let key = data.apiKey;
        if(key == "") {
            value = "Your current Youtube key is the default key which will run out"
        } else {
            value = "Your current Youtube key is: <b>" + key + "</b>"
        }
        $('#currKey').html(value)
    })  
}

function setApiKey() {
    let key = $('#API_KEY').val()
    console.log(key)
    chrome.storage.local.set({apiKey : key}, function(){
        console.log('set api key: ' + key)
        location.reload()
    })
}