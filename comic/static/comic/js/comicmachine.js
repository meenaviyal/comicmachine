// Run only when HTML is loaded and
// DOM properly initialized (courtesy jquery)
$(function() {


    var selectedFont = "sans-serif";
    // Obtain a canvas drawing surface from fabric.js
    var canvas = new fabric.Canvas('c');
    canvas.setBackgroundColor('white');
    canvas.counter = 0;
    var newleft = 0;
    canvas.selection = false;

    var state = [];
    var mods = 0;
    canvas.on(
        'object:modified',
        function() {
            updateModifications(true);
        },
        'object:added',
        function() {
            updateModifications(true);
        });

    function updateModifications(savehistory) {
        if (savehistory === true) {
            myjson = JSON.stringify(canvas);
            state.push(myjson);
        }
    }

    $('#undoBtn').on('click', function() {
        if (mods < state.length) {
            canvas.clear().renderAll();
            canvas.loadFromJSON(state[state.length - 1 - mods - 1]);
            canvas.renderAll();
            //console.log("geladen " + (state.length-1-mods-1));
            //console.log("state " + state.length);
            mods += 1;
            //console.log("mods " + mods);
        }

    });

    $('#redoBtn').on('click', function() {
        if (mods > 0) {
            canvas.clear().renderAll();
            canvas.loadFromJSON(state[state.length - 1 - mods + 1]);
            canvas.renderAll();
            //console.log("geladen " + (state.length-1-mods+1));
            mods -= 1;
            //console.log("state " + state.length);
            //console.log("mods " + mods);
        }
    });

    $('#clearBtn').on('click', function() {
        canvas.clear().renderAll();
        newleft = 0;
    });

    $('#deleteBtn').on('click', function() {
        canvas.remove(canvas.getActiveObject());
    });

    $('#textAddBtn').on('click', function() {
        var textToadd = $('#textAddArea').val()
        var newtext = new fabric.IText(textToadd, {
            fontFamily: selectedFont,
            left: canvas.getWidth() / 1.5,
            top: canvas.getHeight() / 1.5
        });
        canvas.add(newtext);
        $('#textAddArea').val('')
    });

    $('.img-responsive').on('click', function() {
        var thisImage = $(this).attr('src');

        fabric.Image.fromURL(thisImage, function(oImg) {
            // scale image down, and flip it, before adding it onto canvas
            //oImg.scale(0.5);
            canvas.add(oImg);
        });
        //alert(srcText);
    });

    $('#saveBtn').on('click', function() {
        var activeObj = canvas.getActiveObject()

        if (!fabric.Canvas.supports('toDataURL')) {
            alert('This browser doesn\'t provide means to serialize canvas to an image');
        } else {
            activeObj.hasBorders = false;
activeObj.hasControls = false;
canvas.renderAll();
            window.open(canvas.toDataURL('png'));
            activeObj.hasBorders = true;
activeObj.hasControls = true;
canvas.renderAll();
        }
    });


    // Image adding
    // TODO: Same image cant be added one after the other
    //TODO: restrict upload types.

    var imageAddBtn = document.getElementById('imageAddBtn');
    imageAddBtn.addEventListener('change', handleImage, false);

    function handleImage(e) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                var imgInstance = new fabric.Image(img, {
                    scaleX: 0.2,
                    scaleY: 0.2
                })
                canvas.add(imgInstance);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }


    // Create a text object.
    // Does not display it-the canvas doesn't
    // know about it yet.
    var hi = new fabric.IText('hello! Click Me! :)', {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2
    });

    // Attach it to the canvas object, then (re)display
    // the canvas.
    canvas.add(hi);

    $('.fontSelector').on('click', function(){
        selectedFont = $(this).attr('id');
    });

    // canvas.on('text:changed', function(e) {
    //     console.log(e, e.target)
    // $
// });


});
