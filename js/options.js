function save_options() {
    setApiKey()
    alert('You have saved your options')
}

window.onload=function(){
    let save = document.getElementById('save');
    save.addEventListener('click', save_options);
}

function setApiKey() {
    let key = document.getElementById('API_KEY').value
    console.log(key)
    chrome.storage.local.set({apiKey : key}, function(){
        console.log('set api key')
    })
}