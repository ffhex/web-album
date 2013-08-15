
/*
  Web album JS web app.
  It takes all the photos in a G+ or Picasa Web specified album and make them 
  browsable using a layout similar to Pinterest.

  It is still not completed (photo view has dimensions not yet adaptable 
  to the device used to access the application).
  
  Author: f2hex (Franco Fiorese) - August 2013

*/

var PHOTO_SIZE = 600;
var PHOTO_VSIZE = 600;
var PHOTO_HSIZE = 800;
var THUMB_HSIZE = 200;

// Generate url for photo scaled to specified size

function img_scaled_url(url, kind, size) {
    var split = url.lastIndexOf("/");
    return url.substring(0, split) + "/" + kind + size + url.substring(split);
}

function create_photo_element_li(thumb, photo, title, coords) {
    var li = document.createElement("li");
    var url = "";
    var iw = 0;
    var ih = 0;
    var or = "s";
    var psize = PHOTO_SIZE;
    var geotag = "";

    li.setAttribute("class", "photo-thumb-li");
    var link = document.createElement("a");
    link.setAttribute("class", "photo-thumb-link");
    link.setAttribute("rel", "lightbox");
    if (photo.width > photo.height) {
        psize = PHOTO_HSIZE;
        or = "w"
    } else if (photo.width < photo.height) {
        psize = PHOTO_VSIZE;
        or = "h";
    }
    console.log("w=" + photo.width + "  h=" + photo.height + " or=" + or + " psize=" + psize);

    link.setAttribute("href", img_scaled_url(photo.url, or, psize));
    link.setAttribute("title", title + " (loc: " + coords[0] + "," + coords[1] + ")");
    if (typeof coords[0] != "undefined") {
	geotag = "*"
    }
    link.setAttribute("title", title + " " + geotag);
    var img = document.createElement("img");
    url = thumb.url;;
    if (thumb.width < THUMB_HSIZE) {
        url = img_scaled_url(photo.url, "w", THUMB_HSIZE);
        iw = THUMB_HSIZE;
        ih = Math.round(thumb.height / thumb.width * THUMB_HSIZE);
    } else {
        ih = thumb.height;
        iw = thumb.width;
    }
    img.setAttribute("src", url);
    img.setAttribute("height", ih);
    img.setAttribute("width", iw);
    link.appendChild(img);
    var para = document.createElement("p");
    var node = document.createTextNode(title);
    para.appendChild(node);
    li.appendChild(link);
    li.appendChild(para);
    return li;
}

function load_photo_album(userid, albumid, authkey, bbox, thumbsize) {

    $j = jQuery.noConflict();
    $j(document).ready(function () {
        var tiles = $j('#tiles');

        $j.getJSON("https://picasaweb.google.com/data/feed/base/user/" +
            userid +
            "/album/" + albumid +
            "?authkey=" + authkey +
            "&bbox=" + bbox +
            "&thumbsize=" + THUMB_HSIZE + "&kind=photo&access=public&alt=json-in-script&callback=?",
            function (data, status) {
                $j("#photo-album-title").text(data.feed.title.$t);
                $j("#photo-album-subtitle").text(data.feed.subtitle.$t);

                $j.each(data.feed.entry, function (i, pic) {
                    var thumb = pic.media$group.media$thumbnail[0];
                    var photo = pic.media$group.media$content[0];
                    var desc = pic.media$group.media$description.$t;
                    var geotag_lat = "";
                    var geotag_lon = "";
                    var coords = "";
                    if (pic.hasOwnProperty("georss$where")) {
                        coords = pic.georss$where.gml$Point.gml$pos.$t.split(' ');
                    }
                    var elem = create_photo_element_li(thumb, photo, desc, coords);
                    tiles[0].appendChild(elem);
                });


                // Prepare layout options.
                var options = {
                    autoResize: true, // This will auto-update the layout when the browser window is resized.
                    container: $j('#main'), // Optional, used for some extra CSS styling
                    offset: 5, // Optional, the distance between grid items
                    outerOffset: 10, // Optional, the distance to the containers border
                    itemWidth: 210 // Optional, the width of a grid item
                };

                // Get a reference to your grid items.
                var handler = $j('#tiles li');

                // Call the layout function.
                handler.wookmark(options);

		// Init lightbox
		$j('a', handler).colorbox({
		    rel: 'lightbox'
		});

            });

    });
}
