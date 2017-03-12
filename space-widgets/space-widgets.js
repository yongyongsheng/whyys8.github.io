/**
 * Space Widgets
 * Released on: 2016-12-22
 * Author: YS
 * 
 * How to use:
 *    <div class="spaces_widget" data-widget="#search_tag" data-seq="1000"></div>
 *    
 *    All DIV with class "spaces_widget" will be reloaded by this pluggin.
 *    Json data will be loaded from "https://www.hachi.tech/api/Spaces/search_tag/seq"
 *    
 *    Original Template File: assets/plugins/space-widgets.html
 *    
 * How it works:
 *    1. Elements with class spaces_widget are loaded
 *    2. API call to Spaces to look for data with corresponding "search_tag"
 *    3. (genMainSpaceTpl) Load respective div template for the "space_type", add an unique LAYER_ID for every space
 *    4. (genSpace-) Draw the objects and append to LAYER_ID
 *    4a. If object is item, 2nd api call for item info will be made.
 */

var LOADING_CIRCLE = '<center><br><br><i class="fa fa-circle-o-notch fa-spin fa-2x fa-fw" style="color:lightgrey;"></i><br></center>';
var SpacesCarousel = [];

if (typeof (SPACE_WIDGET_TEMPLATES) == "undefined") {
    var SPACE_WIDGET_TEMPLATES = "https://www.hachi.tech/assets/plugins/space-widgets.html";
}
if (typeof (apiUrl) == "undefined") {
    var apiUrl = "https://www.hachi.tech/api";
}

(function($){
    
    function swsc(TYPE,var1,var2,var3) {
        // Spacewidget-special-contents
        if (TYPE=="viewmore")
            return '<div class="wtpl-viewmorefoot"><a href="'+var1+'" class="btn btn-black">View More</a></div>';
    }
    function swrp(HTML,keyword,content) {
        // Spacewidget-replace
        if (typeof (content) != "undefined")
            content = content;
        else
            content = '';
        return HTML.replace(new RegExp('{{'+keyword+'}}', 'g'), content);
    }

    // 1. Draw the main space template
    function genMainSpaceTpl(divid, dataset) { 
        var HTML = $("#wtpl_" + dataset.space_type).html();
        var show_header = (dataset.show_header=="N") ? 'hidden' : '';
        HTML = swrp(HTML,'LAYER_ID','L1'+dataset.uniquelayerid);
        HTML = swrp(HTML,'HEADER_ACTIVE',show_header);
        HTML = swrp(HTML,'TITLE',dataset.title);
        HTML = swrp(HTML,'SUBTITLE',dataset.subtitle);
        HTML = swrp(HTML,'LINK0_URL', (typeof (dataset.images) != "undefined") ? dataset.images[0].link_url : '' );
        HTML = swrp(HTML,'IMAGE0_URL', (typeof (dataset.images) != "undefined") ? dataset.images[0].image_url : '' );
        
        if (dataset.viewmore_url!="" && dataset.viewmore_url!=null)
            HTML += swsc('viewmore', dataset.viewmore_url);
        $("#" + divid).append('<div id="'+dataset.uniquelayerid+'">'+HTML+'</div>');
    }
    
    // 2. Draw object-area into space LAYER_ID
    function genSpaceBanner(divid, dataset) {
        if (dataset.img_cnt > 0) {
            $.each(dataset.images, function (i, dataimg) {
                var HTMLimg = draweach_image(dataimg, "ea_banner"); 
                $("#" + divid + " #L1" + dataset.uniquelayerid).append(HTMLimg);
            });
            
            var SwiperArrow = '<div class="wtpl-swiper-button-next spacebanner-next SbNext'+'L1'+dataset.uniquelayerid+'" style="display:none"></div>';
            SwiperArrow+= '<div class="wtpl-swiper-button-prev spacebanner-prev SbPrev'+'L1'+dataset.uniquelayerid+'" style="display:none"></div>';
            $("#" + divid + " .swiper-wrapper").after(SwiperArrow);
        }
        var Space1Carousel = new Swiper('.spacebanner-container', {
            //pagination: '.banner-pag',
            nextButton: '.SbNext'+'L1'+dataset.uniquelayerid,
            prevButton: '.SbPrev'+'L1'+dataset.uniquelayerid,
            //paginationClickable: true,
            centeredSlides: true,
            autoplay: 2500,
            autoplayDisableOnInteraction: false,
            loop: true,
            observer: true
        });
        SpacesCarousel.push(Space1Carousel);
        if (dataset.img_cnt > 1) {
            // Only show arrows if more than 1 image
            $('.SbNext'+'L1'+dataset.uniquelayerid).show();
            $('.SbPrev'+'L1'+dataset.uniquelayerid).show();
        } 
    }
    function genSpaceImage(divid, dataset) {
        if (dataset.img_cnt > 0) {
            if (dataset.space_type == "4icons")
                var HTMLclass = "col-md-3 col-xs-6";
            else if (dataset.space_type == "6icons")
                var HTMLclass = "col-md-2 col-xs-4";
            else
                var HTMLclass = "col-md-12";
            $.each(dataset.images, function (i, dataimg) {
                var HTMLimg = draweach_image(dataimg, "ea_icon");
                $("#" + divid + " #L1" + dataset.uniquelayerid).append('<div class="' + HTMLclass + ' text-center">' + HTMLimg + '</div>');
            });
        }
    }
    function genSpaceItems(divid, dataset) {
        if (dataset.item_cnt > 0) {
            // Add scroll arrows to slider
            var Cid = 'L2' + dataset.uniquelayerid;
            $("#" + divid + " .wtpl-container").attr("id", Cid)
            
            var SwiperArrow = '<div class="wtpl-swiper-button-prev wtpl-scroll SbPrev'+Cid+'" data-id="' + Cid + '" data-direction="left"></div>';
            SwiperArrow+= '<div class="wtpl-swiper-button-next wtpl-scroll SbNext'+Cid+'" data-id="' + Cid + '" data-direction="right"></div>';
            $("#" + divid + " .wtpl-container").after(SwiperArrow); 

            var WidgetURL = apiUrl + '/ProductCatalog/items/' + dataset.item_string;
            $.getJSON(WidgetURL, function (data_it) {
                $.each(data_it, function (i, row_it) {
                    var HTMLitem = draweach_item(row_it,"ea_itemusual");
                    $("#" + divid + " #L1" + dataset.uniquelayerid).append(HTMLitem);
                });
            });
        }
    }
    
    // 3. Draw individual object into area (called by genSpace).
    function draweach_image(obj, tpltype) {
        var HTML = $("#wtpl_" + tpltype).html();
        HTML = swrp(HTML,'link_url',obj.link_url);
        HTML = swrp(HTML,'image_url',obj.image_url);
        HTML = swrp(HTML,'text',obj.text); 
        return HTML;
    }
    function draweach_item(obj, tpltype) { 
        var HTML = $("#wtpl_"+tpltype).html();
        HTML = swrp(HTML,'item_url',baseUrl + 'product/' + obj.item_id.trim() + '/' + obj.item_desc.trim().replace(/[^0-9a-zA-Z ]/g, ""));
        HTML = swrp(HTML,'image_url',PRODUCT_IMAGE_URL + obj.image_name);
        HTML = swrp(HTML,'item_id',obj.item_id.trim());
        HTML = swrp(HTML,'short_desc',obj.short_desc);
        HTML = swrp(HTML,'image_name',obj.image_name);
        HTML = swrp(HTML,'final_price','S$ ' + obj.final_price);
        HTML = swrp(HTML,'id_img','P3COMIMG_' + obj.item_id.trim());
        
        var HTMLrebate = (obj.unit_point_multipler > 0) ? ' + ' + parseInt(obj.unit_point_multipler) + PRODUCT_REBATE_DESC : '';
        HTML = swrp(HTML,'rebate',HTMLrebate);
        
        if (tpltype=="ea_itemcart") {
            //HTML = swrp(HTML,'regular_price','U.P. S$ '+obj.reg_price);
            HTML = swrp(HTML,'JSON','<div id="COMPJSON_' + obj.item_id.trim() + '" class="hidden">' + JSON.stringify(obj) + '</div>');
            HTML = swrp(HTML,'id_btn','P3COMBTN_' + obj.item_id.trim());
            var id_btn_class = (obj.qty_avail>0) ? '' : 'hidden';
            HTML = swrp(HTML,'id_btn_class',id_btn_class);
        }
        else if (tpltype=="ea_itemusual") {
            var HTMLup = (obj.reg_price > 0) ? 'U.P. S$ ' + obj.reg_price : '';
            HTML = swrp(HTML,'regular_price',HTMLup);

            var legends = (obj.color_qty > 1) ? '<a class="hidden-xs hidden-sm"><span class="colours-special">More colours</span></a> ' : '';
            legends += (obj.hasPWP.trim() == 'Y') ? '<a class="hidden-xs hidden-sm"><span class="colours-special">View specials</span></a> ' : '';
            if (obj.start_balqty == 0)
                legends = '<a class="hidden-xs hidden-sm publish_inv_check" id="' + obj.item_id.trim() + '"><span class="colours-special" style="text-align:center;width:100%;color: #EE1C24;">Sold Out</span></a> ';

            HTML = HTML.replace('{{legends}}', legends);
        }
        
        return HTML;
    }
    
    
    function wtplScrollCheck(uid){
        
        var ID = "L2"+uid;
        $(".SbNext"+ID).show();
        $(".SbPrev"+ID).show();
        
        //width of the area
        var cwidth = $("#L1" + uid + " ").width();
        
        // left position of first element
        var cfirst = $("#L1" + uid + " > .wtpl-catalog-box").first().position().left;
        console.log(cfirst);
        
        // right position of last element
        var clast = $("#L1" + uid + " > .wtpl-catalog-box").last().position().left + $("#L1" + uid + " > .wtpl-catalog-box").last().width();
        console.log(clast);
        
        if (cfirst > 0)
            $(".SbPrev"+ID).hide();
        if (clast < cwidth)
            $(".SbNext"+ID).hide();
        
//        console.log("WIN: "+$( window ).width() );
//        console.log("ID: "+uid);
//        console.log("DIV: "+$("#L1" + uid + " ").width() );
        
        
        
//        if ( ( ( - Move) + $("#L1" + uid + " > .wtpl-catalog-box").last().width() ) < () ) {
//            $(".SbNext"+ID).hide();
//        }
//        if ( ( - Move) >= 0 ) {
//            $(".SbPrev"+ID).hide();
//        }
    }


    $.fn.ItemWidgetRun = function (q) {
        var divid = $(this).attr("id");
        var widgetdata = $(this).data("widgetdata"); // Widget searchterm (item ids)
        var maxitems = $(this).data("maxitems"); // Max number of items can display 
        var itemtype = ($(this).data("widgettype")) ? $(this).data("widgettype") : 'ea_itemcart'; // Type of item-widget to display
        var container = ($(this).data("container")) ? $(this).data("container") : ''; // Main container layer to set display:block at end of code

        var WidgetURL = apiUrl + '/ProductCatalog/items/' + widgetdata +'/'+q;
        $.getJSON(WidgetURL, function (data) {
            var cntitems = 0;
            $.each(data, function (i, row) {
                if (cntitems < maxitems) {
                    $("#" + divid).append(draweach_item(row,itemtype));
                    cntitems++;
                    
                    if (container!='') 
                        $("#"+container).show();
                }
            });
        });
    }

    $.fn.SpaceWidgetRun = function () {
        var divid = $(this).attr("id");
        var space_campaign = $(this).data("widget");
        var space_seq = ($(this).data("seq")) ? $(this).data("seq") : ''; // Seq level of the container

        //$("#" + divid).html(LOADING_CIRCLE);
        var WidgetURL = apiUrl + '/Spaces' + '/' + space_campaign + '/' + space_seq;
        $.getJSON(WidgetURL, function (data) {
            $("#" + divid).html('');
            if (data != null) {
                $.each(data, function (id, dataset) {

                    // 1. Draw the main space template
                    genMainSpaceTpl(divid,dataset);

                    // 2. Draw object-area into space LAYER_ID
                    var innerdivid = dataset.uniquelayerid;
                    if (dataset.space_type == "mainbanner") {
                        genSpaceBanner(innerdivid, dataset)
                    }
                    if (dataset.space_type == "6icons" || dataset.space_type == "4icons") {
                        genSpaceImage(innerdivid, dataset)
                    }
                    if (dataset.space_type == "sidebanner" || dataset.space_type == "productcarousel") {
                        genSpaceItems(innerdivid, dataset)
                    }

                });
            }
        });
    } 
    
    function CheckSoldout() {
        //-- Check Stock & Update 
        var chkList = '';
        $(".publish_inv_check").each(function () {
            chkList += $(this).attr('id').trim() + ',';
        });
        chkList = chkList.substr(0, (chkList.length - 1));
        $.getJSON(apiUrl + "/Inventory/check/" + chkList, function (oosList) {
            $(".publish_inv_check").each(function () {
                var Iid = $(this).attr('id').trim();
                if ($.inArray(Iid, oosList) >= 0) {
                    $(this).removeClass("hide");
                }
            });
        });
    }

})(jQuery);

$(document).ready(function () {
    
    $("body").append('<div id="space-widgets-init" style="display: none"></div>');
    $("#space-widgets-init").load(SPACE_WIDGET_TEMPLATES);

    $(".spaces_widget").each(function () {
        $(this).SpaceWidgetRun();
    });
    $(".products_widget").each(function(){ 
        $(this).ItemWidgetRun('');
    });

    $("body").delegate(".wtpl-scroll", "click", function () {
        var ID = $(this).data("id");
        var uid = ID.substring(2);
        var Move = ($(this).data("direction") == "right") ? 0 + 300 : 0 - 300;
        $("#" + ID).animate( {scrollLeft: $("#" + ID).scrollLeft() + Move }, 300 );
        //wtplScrollCheck(uid)
    });
    
    
    $("body").delegate(".wtpl-scroll", "mouseleave", function () {
        $(this).css("background-color","rgba(200,200,200, 0)")
    });
    $("body").delegate(".wtpl-scroll", "mouseenter", function () {
        $(this).css("background-color","rgba(200,200,200, 0.3)")
    });

});