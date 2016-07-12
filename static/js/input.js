/* calling functions  */

function addLoadEvent(func) {

    if (window.addEventListener)
        window.addEventListener("load", func, false);
    else if (window.attachEvent)
        window.attachEvent("onload", func);
}

function addTranslit(editForm,textBox) {
    checkrt(editForm); // check for translit support

    if (textBox.addEventListener)
        textBox.addEventListener("keypress", processKeys, false);
    else if (textBox.attachEvent)
        textBox.attachEvent("onkeypress", processKeys);
}

function addTextEvent() {
    var editForm =document.getElementById('editform');
    if(editForm != null) {
        var textBox=document.getElementById('textAddArea');
        var textSummary = document.getElementById('wpSummary');
        addTranslit(editForm,textBox);
        addCheckbox(editForm,textBox );
        if(textSummary) { addTranslit(editForm,textSummary); }
    }

    // add transliteration feature to search form also
    var searchform = document.getElementById('searchform');
    var searchInput = document.getElementById('searchInput');
    if(searchInput) { addTranslit(searchform,searchInput); }
}

function addCheckbox(editform,textBox) {

    var element = document.createElement("input");
    element.setAttribute("type","checkbox");
    element.setAttribute("id","realtime");


    if (element.addEventListener)
        element.addEventListener("click", rtClick, false);
    else if (element.attachEvent)
        element.attachEvent("onclick", rtClick);

    //Add tab key shortcut to switch language
    $(document).on('keydown', textBox, function(e) {
		if (e.ctrlKey && e.keyCode == 77) {
			e.preventDefault();
			rtClick();
			element.checked = realTime;
        }
    });

    var h = document.createElement("label")
    var labelcheckBox = document.createTextNode(' Type in Malayalam[ctrl+m]');
    editform.insertBefore(element,textBox);
    document.getElementById("realtime").checked = realTime;
    editform.insertBefore(labelcheckBox,textBox);
    var p = document.createElement("p");
    p.setAttribute("style","width:100%;height:1px;");
    editform.insertBefore(p,textBox);

}

var imeStatus = false;

function processKeys(event) {
    if (rtsupported) {
        e = event || window.event;
        if ((e.keyCode == 13 && e.ctrlKey) || (e.which == 109 && e.ctrlKey))
        {
            realTime = !realTime;
            var chk = document.getElementById('realtime');
            if (chk) { chk.checked = realTime; }
            return false;
        }

        else if ((e.keyCode >= 3328 && e.keyCode <= 3455) || (e.which >= 3328 && e.which <= 3455)) {
            var chk = document.getElementById('realtime');
            if (imeStatus == false || realTime) {
                realTime = false;
                if (chk) { chk.checked = realTime; }
                imeStatus = true;
                alert('A Malayalam input tool was detected. Disabling in-built transliteration. To turn it on again use Ctrl+M');
                return false;
            }
        }

        else if (realTime) {
            imeStatus = false;
            transliterateKey(event); // call transliteration function
        }
    }
}

var realTime = true;

function rtClick(event) {
    realTime = !realTime;
}

var rtsupported = false;
var error;

function checkrt(editform) {
    try {

    /*
    var nav = navigator.userAgent.toUpperCase();
    rtsupported = (nav.indexOf("GECKO") >= 0 || nav.indexOf("OPERA") >= 0 || nav.indexOf("SAFARI") >= 0);
    */

        rtsupported = (document.selection != undefined)

        if (!rtsupported) {
            var element = document.createElement("TEXTAREA");
            editform.appendChild(element);

            if (element.selectionStart != undefined)
                rtsupported = true;
                editform.removeChild(element);
        }

    } catch (error) {}
}

addLoadEvent(addTextEvent);
