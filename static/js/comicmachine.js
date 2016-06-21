// Run only when HTML is loaded and
// DOM properly initialized (courtesy jquery)
// function csrfSafeMethod(method) {
//     // these HTTP methods do not require CSRF protection
//     return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
// }
function imageToDataUri(img, width, height) {

    // create an off-screen canvas
    var tempcanvas = document.createElement('canvas'),
        ctx = tempcanvas.getContext('2d');

    // set its dimension to target size
    tempcanvas.width = width;
    tempcanvas.height = height;

    // draw source image into the off-screen canvas:
    ctx.drawImage(img, 0, 0, width, height);

    // encode image to data-uri with base64 version of compressed image
    return tempcanvas.toDataURL();
}

//document load
$(function() {
    var csrftoken = Cookies.get('csrftoken');
    //   console.log("csrf token is");
    //   console.log(csrftoken);
    // $.ajaxSetup({
    //         beforeSend: function(xhr, settings) {
    //             if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
    //                 // Only send the token to relative URLs i.e. locally.
    //                 xhr.setRequestHeader("X-CSRFToken", csrftoken);
    //             }
    //         }
    //     });

    var selectedFont = "sans-serif";
    // Obtain a canvas drawing surface from fabric.js
    var canvasWrap = $('.canvaswrap');
    $('.canvaswrap').height(screen.availHeight - (screen.availHeight * 25 / 100));
    var cWidth = $('.canvaswrap').width() - ($('.canvaswrap').width() * 10 / 100)
    var cHeight = cWidth / (4 / 3)
    $('#c').attr('height', cHeight);
    $('#c').attr('width', cWidth);
    $('#c').css('margin-left', ($('.canvaswrap').width() * 5 / 100));
    $('#c').css('margin-top', ($('.canvaswrap').width() * 2 / 100));
    // $('#c').css('border', 'gray 1px solid');
    var canvas = new fabric.Canvas('c');
    canvas.setBackgroundColor('white');
    canvas.counter = 0;
    var newleft = 0;
    canvas.selection = false;
    var selectedMoods = 'all';
    var imageURI;


    //Initial call
    // respondCanvas();


    var get_images = function(dataToSend) {

        $.ajax({
            "url": "/library/", // the endpoint
            "type": "POST", // http method
            "data": dataToSend, // data sent with the post request

            // handle a successful response
            success: function(data) {
                recieved_data = JSON.parse(data);
                $('#libraryView').empty();
                $.each(recieved_data['images'], function(index, value) {
                    console.log(value);
                    $('#libraryView').append("<div class='col-lg-4 col-md-4 col-xs-6 thumb'>\
        <a class='thumbnail' href='#'><img class='img-responsive' src='" + value +
                        "' alt=''></a></div>");
                }); //each

                $(".img-responsive").click(function() {
                    var thisImage = $(this).attr('src');

                    fabric.Image.fromURL(thisImage, function(oImg) {
                        // scale image down, and flip it, before adding it onto canvas
                        //oImg.scale(0.5);
                        canvas.add(oImg);
                    });
                }); //bind click

                // //update paginator
                // $('#paginator').twbsPagination({
                //     totalPages: 1,
                //     // visiblePages: 1,
                //     first: '<<',
                //     prev: '<',
                //     next: '>',
                //     last: '>>'
                // });//paginator

                //update paginator

                $('#paginator').twbsPagination({
                    totalPages: recieved_data['total_pages'],
                    // visiblePages: 5,
                    first: '<<',
                    prev: '<',
                    next: '>',
                    last: '>>',
                    onPageClick: function(event, page) {
                        console.log('Page ' + page);
                        var data_dict = {
                            'search_in': 'all',
                            'tags': selectedMoods,
                            'page': page
                        };

                        var dataToSend = JSON.stringify(data_dict);
                        // console.log(dataToSend);
                        // var dataToSend = JSON.stringify(data_dict);
                        get_images(dataToSend);

                    }
                }); //paginator

                console.log(data); // log the returned json to the console
                console.log("success"); // another sanity check

            },

            // handle a non-successful response
            error: function(xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        }); //ajax


    }; //fn get_images

    var get_images_firstRun = function() {
        var data_dict = {
            'search_in': 'all',
            'tags': 'all',
            'page': 1
        };

        var dataToSend = JSON.stringify(data_dict);
        // console.log(dataToSend);
        // var dataToSend = JSON.stringify(data_dict);
        get_images(dataToSend);
    }; //get_images_firstRun

    $('#moodSelectorBtn').prop('disabled', true);
    $('#moodSelector').multiselect({
        maxHeight: '300',
        buttonWidth: '235',
        nonSelectedText: 'Select the Mood',
        includeSelectAllOption: true,
        selectAllText: 'Load all Images!',
        selectAllValue: 'all',
        onChange: function(element, checked) {
            selectedMoods = $('#moodSelector').val();

            if (selectedMoods) {
                $('#moodSelectorBtn').prop('disabled', false);
            } else {
                $('#moodSelectorBtn').prop('disabled', true);
                selectedMoods = 'all';
            }

        }
    });

    get_images_firstRun();
    //image library population on btn click
    $('#moodSelectorBtn').on('click', function() {

        var data_dict = {
            'search_in': 'all',
            'tags': selectedMoods,
            'page': 1
        };

        var dataToSend = JSON.stringify(data_dict);
        // console.log(dataToSend);
        // var dataToSend = JSON.stringify(data_dict);
        $('#paginationholder').html('');
        $('#paginationholder').html('<ul id="paginator" class="pagination-sm"></ul>');
        get_images(dataToSend);


    });

    $('#collectionSel').on('change', function() {
        var selectedColl = $("#collectionSel :selected").val();
        if (selectedColl) {
        var data_dict = {
            'search_in': selectedColl,
            'tags': 'all',
            'page': 1
        };

        var dataToSend = JSON.stringify(data_dict);
        // console.log(dataToSend);
        // var dataToSend = JSON.stringify(data_dict);
        $('#paginationholder').html('');
        $('#paginationholder').html('<ul id="paginator" class="pagination-sm"></ul>');
        get_images(dataToSend);
        }
    });


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
        var textToadd = $('#textAddArea').val();
        var newtext = new fabric.IText(textToadd, {
            fontFamily: selectedFont,
            left: canvas.getWidth() / 1.5,
            top: canvas.getHeight() / 1.5
        });
        canvas.add(newtext);
        $('#textAddArea').val('');
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

    $('#exportBtn').on('click', function() {
        //remove selection controls
        var activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.hasBorders = false;
            activeObj.hasControls = false;
        }

        canvas.renderAll();
        imageURI = canvas.toDataURL('png');
        if (activeObj) {
            activeObj.hasBorders = true;
            activeObj.hasControls = true;
        }
        canvas.renderAll();

        if (!fabric.Canvas.supports('toDataURL')) {
            alert('This browser doesn\'t provide means to serialize canvas to an image');
        } else {
            //store exported Image
            var imgData = {
                'img_URI': imageURI
            };

            var imgDataToSend = JSON.stringify(imgData);

            $.ajax({
                "url": "/comicstrip/", // the endpoint
                "type": "POST", // http method
                "data": imgDataToSend, // data sent with the post request

                // handle a successful response
                success: function(data) {
                    recieved_data = JSON.parse(data);
                    console.log(data); // log the returned json to the console
                    console.log("success"); // another sanity check
                },

                // handle a non-successful response
                error: function(xhr, errmsg, err) {
                    console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                }
            }); //ajax



            // var resolution = $(this).attr('id');
            // resolution = resolution.split("x");
            // var tWidth = parseInt(resolution[0]);
            // var tHeight = parseInt(resolution[1]);
            var tWidth = 800;
            var tHeight = 600;
            var img = new Image;

            img.onload = resizeImage;
            img.src = imageURI;

            function resizeImage() {
                var newDataUri = imageToDataUri(this, tWidth, tHeight);
                // continue from here...
                download(newDataUri, "ComicStrip.png", "image/png");
            }

        }
    }); //export onclick


    // Image adding
    // TODO: Same image cant be added one after the other
    //TODO: restrict upload types.

    var imageAddBtn = document.getElementById('imageAddBtn');
    imageAddBtn.addEventListener('change', handleImage, false);

    function handleImage(e) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.onload = function() {
                var imgInstance = new fabric.Image(img, {
                    scaleX: 0.2,
                    scaleY: 0.2
                });
                canvas.add(imgInstance);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }


    // Create a text object.
    // Does not display it-the canvas doesn't
    // know about it yet.
    var hi = new fabric.IText('Click Me! :)', {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
//     hasBorders: false,
// hasControls: false,
// hasRotatingPoint: false,
// lockMovementX: true,
// lockMovementY: true
    });


    // Attach it to the canvas object, then (re)display
    // the canvas.
    canvas.add(hi);

    $('.fontSelector').on('click', function() {
        selectedFont = $(this).attr('id');
    });

    // canvas.on('object:selected', function(e) {
    //     var selectedType = e.target.get('type')
    //     console.log(selectedType);

    // });

    $('#insertICULogo').on('click', function(){
        var logochoice = $(this).is(":checked");
        if (!logochoice) {
            // None
        }
        else {
            

            fabric.Image.fromURL('/static/images/iculogo.jpg', function(img) {

              // add image onto canvas
              canvas.add(img);
            });
        }
    });
});
