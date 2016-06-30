// Run only when HTML is loaded and
// DOM properly initialized (courtesy jquery)
// function csrfSafeMethod(method) {
//     // these HTTP methods do not require CSRF protection
//     return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
// }

function toggleSplash() {
    $('.rotatemodal').attr('style', 'display:block;');
    // $('#splashDiv').hide();
    var container = document.getElementById('container');
    var drop = document.getElementById('drop');
    var drop2 = document.getElementById('drop2');
    var outline = document.getElementById('outline');

    TweenMax.set(['svg'], {
        position: 'absolute',
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -50
    })

    TweenMax.set([container], {
        position: 'absolute',
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -50
    })

    TweenMax.set(drop, {
        transformOrigin: '50% 50%'
    })

    var tl = new TimelineMax({
        repeat: -1,
        paused: false,
        repeatDelay: 0,
        immediateRender: false
    });

    tl.timeScale(3);

    tl.to(drop, 4, {
            attr: {
                cx: 250,
                rx: '+=10',
                ry: '+=10'
            },
            ease: Back.easeInOut.config(3)
        })
        .to(drop2, 4, {
            attr: {
                cx: 250
            },
            ease: Power1.easeInOut
        }, '-=4')
        .to(drop, 4, {
            attr: {
                cx: 125,
                rx: '-=10',
                ry: '-=10'
            },
            ease: Back.easeInOut.config(3)
        })
        .to(drop2, 4, {
            attr: {
                cx: 125,
                rx: '-=10',
                ry: '-=10'
            },
            ease: Power1.easeInOut
        }, '-=4')



    setTimeout(function() {
        $('.rotatemodal').attr('style', 'display:none;');
    }, 3000);

    return
}


toggleSplash();

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


// Do some initializing stuff
fabric.Object.prototype.set({
    transparentCorners: false,
    hasRotatingPoint: false,
    padding: 5
});

$(function() {
    fabric.Canvas.prototype.customiseControls( {
        tl: {
            action: 'rotate',
        },
        tr: {
            action: 'scale'
        },
        bl: {
            action: 'remove',
            cursor: 'pointer'
        },
        br: {
            action: 'moveUp',
            cursor: 'pointer'
        },
        mb: {
            action: 'moveDown',
            cursor: 'pointer'
        },
        mr: {
            action: 'scaleX',
            cursor: 'pointer'
        },
        ml: {
            action: 'scaleX',
            cursor: 'pointer'
        },
        mt: {
            action: 'scaleY',
            cursor: 'pointer'
        }
    } );

fabric.Object.prototype.customiseCornerIcons( {
    settings: {
        borderColor: '#9D6B3F',
        cornerSize: 25,
        cornerBackgroundColor: '#9D6B3F',
        cornerShape: 'circle',
        cornerPadding: 10
    },
    tl: {
        icon: '/static/icons/rotate.svg'
    },
    tr: {
        icon: '/static/icons/scale.svg'
    },
    bl: {
        icon: '/static/icons/delete.svg'
    },
    br: {
        icon: '/static/icons/layer-up.svg'
    },
    mb: {
        icon: '/static/icons/layer-down.svg'
    },
    mt: {
        icon: '/static/icons/scaleup.svg'
    },
    mr: {
        icon: '/static/icons/scaleright.svg'
    },
    ml: {
        icon: '/static/icons/scaleleft.svg'
    }
});


    $('#editform').attr('style', 'color:white;');
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

    var selectedFont = "Rachana";
    // Obtain a canvas drawing surface from fabric.js
    var canvasWrap = $('.canvaswrap');
    // $('.canvaswrap').height(screen.availHeight - (screen.availHeight * 25 / 100));
    // var cWidth = $('.canvaswrap').width() - ($('.canvaswrap').width() * 10 / 100)
    // var cHeight = cWidth / (4 / 3)
    var cHeight = canvasWrap.height();
    var cWidth = cHeight / (3 / 4);
    console.log("Starting canvas with:\n")
    console.log(cWidth);
    console.log(cHeight);
    // var cHeight = 600;
    // var cWidth = 800;
    // console.log($('.canvaswrap').width());
    // console.log($('.canvaswrap').height());
    $('#c').attr('height', cHeight);
    $('#c').attr('width', cWidth);
    // $('#c').css('margin-left', ($('.canvaswrap').width() * 5 / 100));
    // $('#c').css('margin-top', ($('.canvaswrap').width() * 2 / 100));
    // $('#c').css('border', 'gray 1px solid');
    var canvas = new fabric.Canvas('c');
    canvas.setBackgroundColor('white');
    canvas.counter = 0;
    var newleft = 0;
    canvas.selection = false;
    var imageURI;





    //Initial call
    // respondCanvas();


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
                    $('#libraryView').append("<div class='col-lg-4 col-md-4 col-xs-6 thumb'>\
        <a class='thumbnail' href='#'><img class='img-responsive' src='" + value +
                        "' alt=''></a></div>");
                }); //each

                $('.img-responsive').hover(function() {
                    $(this).addClass('transition');

                }, function() {
                    $(this).removeClass('transition');
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
        canvas.remove(canvas.getActiveObject());
    });

    $('#textAddBtn').on('click', function() {
        var textToadd = $('#textAddArea').val();
        var newtext = new fabric.IText(textToadd, {
            fontFamily: selectedFont,
            left: 100,
            top: 100
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

    // $('#insertICULogo').on('click', function() {
    //     fabric.Image.fromURL('/static/images/iculogo.jpg', function(img) {

    //         // add image onto canvas
    //         canvas.add(img);
    //     });
    // });
    $(".dropdown-menu li a").click(function() {
        var selText = $(this).text();
        $(this).parents('.dropdown').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    });

});
