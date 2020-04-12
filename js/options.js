$(document).ready(function(){
    let activated;
    initiateHarderToDeactivateActions();
    initiateActivatedValueActions();

    function initiateActivatedValueActions() {
        chrome.storage.local.get('activated', function(data) {
            if(data.activated === false) {
                activated = false
            } 
            else if(data.activated == true) {
                activated = true;
            }
            console.log('activated value: ' + activated)
        })
    }    

    function initiateHarderToDeactivateActions() {
        chrome.storage.local.get('harderDeactivateClicks', function(data) {
            let value = data.harderDeactivateClicks;
            console.log('harderDeactivate value is ' + value)
            if (!value) {
                $('#harder10').prop("checked", true);
                setHarderDeactivateClicks("10");
            }
            else if (value == "10") {
                $("#harder10").prop("checked", true);
            }
            else if (value == "20") {
                $('#harder20').prop("checked", true);
            }
            else if (value == "30") {
                $('#harder30').prop("checked", true);
            }
        }); 
    }

    $("#saveHarderClicks").click(function() {
        let radioVal = $("input[name=clicksRadio]:checked", '#myForm').val();
        console.log(radioVal)
        if (activated) {
            alert("You cannot change clicks options when YouTube Study is activated")
        }
        else if (radioVal) {
            alert("You have saved your option for " + radioVal + " clicks.");
            setHarderDeactivateClicks(radioVal);
        }
        else {
            alert("Please set a clicks value");
        }
    })

    function setHarderDeactivateClicks(value) {
        chrome.storage.local.set({harderDeactivateClicks : value}, function(){
            console.log('Set deactivate harder clicks  to ' + value)
            chrome.runtime.reload()
        })
    }
 }) 