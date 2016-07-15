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

$body = $("body");
//document load
var selectedFont = 'Rachana';


$(function() {

// Do some initializing stuff
fabric.Object.prototype.set({
    transparentCorners: false,
    padding: 5,
    borderColor: '#9D6B3F',
    cornerSize: 10,
    cornerColor: '#9D6B3F',
});


    $('#editform').attr('style', 'color:white;');

    // Obtain a canvas drawing surface from fabric.js
    var canvasWrap = $('#centre-panel');
    // $('.canvaswrap').height(screen.availHeight - (screen.availHeight * 25 / 100));
    // var cWidth = $('.canvaswrap').width() - ($('.canvaswrap').width() * 10 / 100)
    // var cHeight = cWidth / (4 / 3)
    // var cHeight = canvasWrap.height();
    // var cWidth = cHeight / (3 / 4);
    // console.log("Starting canvas with:\n")
    // console.log(cWidth);
    // console.log(cHeight);
    var cHeight = 600;
    var cWidth = 800;
    $('#c').attr('height', cHeight);
    $('#c').attr('width', cWidth);
    // $('#c').css('margin-left', ($('.canvaswrap').width() * 5 / 100));
    // $('#c').css('margin-top', ($('.canvaswrap').width() * 2 / 100));
    // $('#c').css('border', 'gray 1px solid');
    var canvas = new fabric.Canvas('c');
    canvas.setBackgroundColor('white');
    canvas.counter = 0;
    var newleft = 0;
    canvas.selection = true;
    var imageURI;
    $('#canvaswrap')
        .draggable({
            handle: '#canvashandle'
        })
        .resizable()
        .bind({
            resize : function(event,ui) {
                canvas.setHeight(ui.size.height-30);
                canvas.setWidth(ui.size.width);
                canvas.renderAll();
            },
        });

    //Initial call
    // respondCanvas();

    function getActiveElement() {
        return (canvas.getActiveObject() || canvas.getActiveGroup());
    };

    function removeActiveElement() {
        var e = getActiveElement();
        if (e === null) {
            return;
        }
        if (e.get('type') === 'group') {
            canvas.getActiveGroup().forEachObject(function(o) { 
                canvas.remove(o) 
            });
            canvas.discardActiveGroup().renderAll();
        } else {
            canvas.remove(e);
        }
    }

    function get_images(dataToSend) {
        reqid = String(Math.random()).split(".")[1]
        $.ajax({
            "url": "/library/?r=" + reqid, // the endpoint
            "type": "POST", // http method
            "data": dataToSend, // data sent with the post request

            // handle a successful response
            success: function(data) {
                recieved_data = JSON.parse(data);
                $('#libraryView').html('');
                $.each(recieved_data['images'], function(index, value) {
                    $('#libraryView').append("<div class='col-md-4 librarycol'>\
        <div class='img-back'><img class='img-responsive' src='" + value +
                        "' alt=''></div></div>");
                }); //each

                $('.img-back').hover(function() {
                    $(this).find(".img-responsive").addClass('transition');

                }, function() {
                    $(this).find(".img-responsive").removeClass('transition');
                });

                //fix for zoom blocking issue
                $('.img-back').mousemove(function(event) { 
                    var left = event.pageX - $(this).offset().left;
                    var top = event.pageY - $(this).offset().top;
                    if (left<0 || left>$(this).width() || top<0 || top>$(this).height()) {
                        $(this).find(".img-responsive").removeClass('transition');
                    }
                });

                $(".img-responsive").click(function() {
                    var thisImage = $(this).attr('src');

                    fabric.Image.fromURL(thisImage, function(oImg) {
                        // scale image down, and flip it, before adding it onto canvas
                        //oImg.scale(0.5);
                        canvas.add(oImg);
                    });
                }); //bind click

                $('#paginator').twbsPagination({
                    totalPages: recieved_data['total_pages'],
                    // visiblePages: 5,
                    first: '',
                    prev: '<',
                    next: '>',
                    last: '',
                    onPageClick: function(event, page) {
                        var data_dict = {
                            'search_in': Cookies.get('selected_collection'),
                            'page': page
                        };

                        var dataToSend = JSON.stringify(data_dict);
                        // console.log(dataToSend);
                        // var dataToSend = JSON.stringify(data_dict);
                        get_images(dataToSend);

                    }
                }); //paginator

                // console.log(data); // log the returned json to the console

            },

            // handle a non-successful response
            error: function(xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        }); //ajax

        // toggleSplash(0);

    }; //fn get_images

    var get_images_firstRun = function() {
        var data_dict = {
            'search_in': Cookies.get('selected_collection'),
            'page': 1
        };

        var dataToSend = JSON.stringify(data_dict);
        // console.log(dataToSend);
        // var dataToSend = JSON.stringify(data_dict);
        get_images(dataToSend);
    }; //get_images_firstRun


    get_images_firstRun();
    //image library population on btn click

    $('#collectionSel').on('change', function() {
        Cookies.set('selected_collection', $("#collectionSel").val());
        coll = Cookies.get('selected_collection');

        var data_dict = {
            'search_in': coll,
            'page': 1
        };

        var dataToSend = JSON.stringify(data_dict);
        // console.log(dataToSend);
        // var dataToSend = JSON.stringify(data_dict);
        $('#paginationholder').html('');
        $('#paginationholder').html('<ul id="paginator" class="pagination-sm"></ul>');
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

    // $('#zoominBtn').click(function(){
    //     // canvas.setZoom(canvas.getZoom() * 1.1 ) ;
    //     canvas.setWidth = canvas.width *2;
    // }) ;

    // $('#zoomoutBtn').click(function(){
    //     canvas.setZoom(canvas.getZoom() / 1.1 ) ;
    // }) ;
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
        removeActiveElement();
    });

    window.addEventListener("keydown", function(e){
	   // Allow use of backspace or delete key to delete objects
	   if(e.keyCode === 8 || e.keyCode === 46) {
            removeActiveElement();
	   }
    });

    $('#moveUp').on('click', function() {
        canvas.bringToFront(getActiveElement());
    });

    $('#moveDown').on('click', function() {
        canvas.sendToBack(getActiveElement());
    });

    $('#textAddBtn').on('click', function() {
        var selectedFontSize =  $('#fontSizeSelector').val();
        var textToadd = $('#textAddArea').val();
        var newtext = new fabric.ScalableTextbox(textToadd, {
            fontFamily: selectedFont,
            left: 50,
            top: 50,
            fontSize: selectedFontSize,
        });
        canvas.add(newtext);
        $('#textAddArea').val('');
    });
    
    $(document).on('focusin', '#textAddArea', function(e) { 
        canvas.deactivateAll().renderAll();
    });

    $('.img-responsive').on('click', function() {
        $(this).removeClass('transition');
        var thisImage = $(this).attr('src');

        fabric.Image.fromURL(thisImage, function(oImg) {
            // scale image down, and flip it, before adding it onto canvas
            //oImg.scale(0.5);
            canvas.add(oImg);
        });
        //alert(srcText);
    });

    $('#exportBtn').on('click', function() {
        canvas.deactivateAll().renderAll();
        imageURI = canvas.toDataURL('png');

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
            var tWidth = canvas.width;
            var tHeight = canvas.height;
            var img = new Image;

            img.onload = resizeImage;
            img.src = imageURI;

            function resizeImage() {
                var newDataUri = imageToDataUri(this, tWidth, tHeight);
                // continue from here...
                download(newDataUri, "ChaliStrip.png", "image/png");
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
    var hi = new fabric.ScalableTextbox('Click Me! :)', {
        left: 200,
        top: 200,
        width: 200
    });


    // Attach it to the canvas object, then (re)display
    // the canvas.
    canvas.add(hi);

    // $('.fontSelector').on('click', function() {
    //     selectedFont = $(this).attr('id');
    // });

    // canvas.on('object:selected', function(e) {
    //     var selectedType = e.target.get('type')
    //     console.log(selectedType);

    // });

    // $('#insertICULogo').on('click', function() {
    //     fabric.Image.fromURL('/static/images/iculogo.jpg', function(img) {

    //         // add image onto canvas
    //         canvas.add(img);
    //     });
    // });
    $(".dropdown-menu li a").click(function(){
      var selText = $(this).text();
      $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
    });

    $("#fontSelector li a").click(function(){
      selectedFont = $(this).attr('id');
      console.log(selectedFont);
    });


  $('.spinner .btn:first-of-type').on('click', function() {
    $('.spinner input').val( parseInt($('.spinner input').val(), 10) + 1);
  });
  $('.spinner .btn:last-of-type').on('click', function() {
    $('.spinner input').val( parseInt($('.spinner input').val(), 10) - 1);
  });

  $('#canvashandle').hover(function (){
    $('#panicon').toggle();
  });

});
