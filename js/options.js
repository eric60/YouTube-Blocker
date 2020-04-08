function save_options() {
    if(confirm("Are you sure you want to save this key?")) {
        setApiKey()
        alert('You have saved your options')
    }
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


$(document).ready(function(){
    // let save = document.getElementById('save');
    // save.addEventListener('click', save_options);
    getApiKey();
    $('#saveKey').click(save_options);

    let extensionLink = document.getElementById('extensions')
    extensionLink.addEventListener('click', function() {
        chrome.tabs.update({ url: 'chrome://extensions' });
    })

    (function initiateHarderToDeactivateActions() {
        chrome.storage.local.get('harderDeactivateClicks', function(data) {
            let value = data.harderDeactivateClicks;
            if(!value) {
                $('#harder10').prop("checked", true);
                setHarderDeactivateClicks("10");
            }
            else if(data.harderDeactivateVal == "10") {
                $('#harder10').prop("checked", true);
            }
            else if(data.harderDeactivateVal == "20") {
                $('#harder20').prop("checked", true);
            }
            else if(data.harderDeactivateVal == "30") {
                $('#harder30').prop("checked", true);
            }
            console.log('harderDeactivate value is ' + value)
        }); 
    })

    $("#saveHarderClicks").click(function() {
        let radioVal = $("#input[name='harderDeactivateClicks']:checked").val();
        alert(radioVal);
        setHarderDeactivateClicks(radioVal);
    })


    function setHarderDeactivateClicks(value) {
        chrome.storage.local.set({harderDeactivateClicks : value}, function(){
            console.log('Set deactivate harder clicks  to ' + value)
        })
    }
 }) 