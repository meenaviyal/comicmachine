// Run only when HTML is loaded and
// DOM properly initialized (courtesy jquery)
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

//document load
$(function() {
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    var selectedFont = "sans-serif";
    var csrftoken = $.cookie('csrftoken');
    // Obtain a canvas drawing surface from fabric.js
    var canvas = new fabric.Canvas('c');
    canvas.setBackgroundColor('white');
    canvas.counter = 0;
    var newleft = 0;
    canvas.selection = false;
    var selectedMoods = 'all';
    var imageURI;

    var get_images = function(dataToSend) {

        $.ajax({
            "url": "library/", // the endpoint
            "type": "POST", // http method
            "data": dataToSend, // data sent with the post request

            // handle a successful response
            success: function(data) {
                recieved_data = JSON.parse(data);
                $('#libraryView').empty();
                $.each(recieved_data['images'], function(index, value) {
                    console.log(value);
                    $('#libraryView').append("<div class='col-lg-3 col-md-4 col-xs-6 thumb'>\
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

                //update paginator
                $('#paginator').twbsPagination({
                    totalPages: 1,
                    visiblePages: 1,
                    first: '<<',
                    prev: '<',
                    next: '>',
                    last: '>>'
                });//paginator

                //update paginator
                $('#paginator').twbsPagination({
                    totalPages: recieved_data['total_pages'],
                    visiblePages: 5,
                    first: '<<',
                    prev: '<',
                    next: '>',
                    last: '>>',
                    onPageClick: function(event, page) {
                        console.log('Page ' + page);
                        var data_dict = {
                            'search_in': 'all',
                            'tags': selectedMoods,
                            'page': recieved_data['current_page']
                        };

                        var dataToSend = JSON.stringify(data_dict);
                        // console.log(dataToSend);
                        // var dataToSend = JSON.stringify(data_dict);
                        get_images(dataToSend);

                    }
                });//paginator

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
        get_images(dataToSend);


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

            $('#exportModal').modal('show');

        }
    });

    $('#exportModal').on('shown.bs.modal', function() {
        var imgData = {
            'img_URI': imageURI
        };

        var imgDataToSend = JSON.stringify(imgData);

        $.ajax({
            "url": "comicstrip/", // the endpoint
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


        $('#imagePreview').empty();
        $("#imagePreview").html("<img src='" + imageURI + "' alt='Preview Image' width='200px;' height='150px'/>");
    });

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
    var hi = new fabric.IText(':)', {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2
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
});
