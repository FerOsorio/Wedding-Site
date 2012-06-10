$(document).ready(function(){
	var Wedding = {};
	Wedding.pageStack = [];
	Wedding.menuItems = {};
	
	
	Wedding.initialize = function (){
		Utils.log("begin wedding.initialize ");
		var that = this;
		//TODO: Cool initial animation
		this.loadMenu(function(dataItems){
			//If page already has a hash, load the hashed page
			if(window.location.href.indexOf('#')!==-1){
				var hashPage = window.location.href.split('#')[1];
				that.loadPage(hashPage);
			}else{
				that.loadPage("welcome");
			}
		});	
		
		Utils.log("end wedding.initialize ");
	};
	
	Wedding.loadMenu = function(completeCallback){
		var that = this;
		//Get menu items
		$.getJSON('./data/menuitems.json', function(data){
			that.menuItems = data.items;
			//Load EJS template 
			var menu = new EJS({url: './template/menu.ejs'}).render(data);
			//Render menu in page
			$("#pageMenu").append(menu);
			that.setMenuBehavior();			
			
			completeCallback(that.menuItems);
			
//			$(window).scroll(function(){
//				//Fix menu
//				var offset = $(document).scrollTop()+"px";				
//				$("#pageMenu").animate(
//						{top:offset},
//						{duration:500,queue:false},
//						function(){
//							//animation complete
//							alert("Worales...");
//						}); 
//			});
		});					
	};
	
	Wedding.loadMap = function(canvas){
		Utils.log("begin wedding.loadmap");
		
        var ramayana = new google.maps.LatLng(18.888183,-99.196522);
        var myOptions = {
          zoom: 17,
          center: ramayana,
          scrollwheel: !1,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        new google.maps.Map(document.getElementById(canvas), myOptions);
        
        Utils.log("end wedding.loadmap");
	};
	/*
	 * Gets a new content stack
	 * */
	Wedding.createContent = function(data){
		var templateFile = data.template || "frames/contentFrame.ejs";
		var contentHtml = Utils.renderTemplate(templateFile, {'content':data});
		return contentHtml;
	};
	
	Wedding.setMenuBehavior = function(){
		var that = this;
		var menus = $('a.menuItem'); 
		menus.click(function(e){
			e.preventDefault();			
			that.loadPage(this.href.split('#')[1]);
		});
	};

	/*
	 * Loads a page content in the main body of the page, if the content already has been loaded, we should
	 * set the focus to the current content. 
	 * 
	 * Parameters
	 *  @page: name of the page to load without extension, this page must be located under /root/content folder
	 *    
	 * */
	Wedding.loadPage = function(page){		
		Utils.log("begin wedding.loadPage " + page);	
		
		if(typeof(this.pageStack[page]) === 'undefined'){
			Utils.log('page ' + page + ' does not exist, creating a new page stack...');
			
			var pageElement = Utils.getMenuItemByName(page);
			this.pageStack[page] = this.createContent(pageElement); 
			//Appends the page frame to the body of the page
			$('.page-container').append(this.pageStack[page]);	
			var currentPage = $('.content-' + page);
			var pageString = './content/' + page + ".htm?seed=" + Math.random();
			Utils.log("Loading page content from :" + pageString);
			currentPage.load(pageString, function (response, status, xhr){
				if(status == 'error'){
					Utils.log('Oops...');
					currentPage.load('./content/error.htm');
				}
			});
			Utils.log('new page stack created');				
		}else{
			Utils.log("using preloaded page from stack");
		}		
		
		//http://css-tricks.com/examples/AnythingSlider/#panel1-6
		//window.location = '#' + page;
		Utils.log("scrolling to element");
		$('html,body').animate({ scrollTop: $("#" + page).offset().top }, 
				{ 
					duration: '450', easing: 'swing'
				},
				function(){
					//animation complete
					$('html,body').css("overflow","hidden");
				});
				
		Utils.log("end wedding.loadPage");
	};
	
	/*
	 * Load the hotel list in the page
	 * TODO: Switch to mysql database instead of using json
	 * */
	Wedding.loadHotelList = function(canvas){
		Utils.log("begin wedding.loadHotelList");
		//Get hotel data
		Utils.log("getting data from hotels.json");
		$.getJSON("./data/hotels.json", function(data){
			Utils.log(data);
			Utils.log("data acquired");
			var html = Utils.renderTemplate("accomodation/hotels.ejs", data);
			$("#" + canvas).html(html);
			Utils.log("data rendered");
		}).error(function(e){Utils.log(e);});
		Utils.log("end wedding.loadHotelList");
	};
	
	Wedding.loadGallery = function(canvas){
		Utils.log("Begin wedding.loadGallery");
		
		$.getJSON("./data/gallery.json", function(data){
			Utils.log(data);			
			var html = Utils.renderTemplate("gallery/gallery.ejs", data);	
			$("#" + canvas).html(html);
			Utils.log("data rendered");
			Utils.log("Initializing carousel");
			$('.carousel').carousel();
		});		
		
		Utils.log("End  wedding.loadGallery");
	};
	
	/*
	 * Region for Utilities and helper functions
	 * */
	
	var Utils = {};
	
	Utils.getMenuItemByName = function(name){
		Utils.log("getMenuItemByName " + name);

		for(var i=0; i < wedding.menuItems.length ; i++){
			if(wedding.menuItems[i].name == name)
				return wedding.menuItems[i];
		}
		return {"name":"Blank","displayName":"Blank"};
	};
	
	Utils.renderTemplate = function(templateName, data){
		var templatePath = "./template/";
		var template = templatePath + templateName;
		Utils.log("Rendering template from :" + template);
		return new EJS({url: template}).render(data);
	};
	
	Utils.log = function(message){
		if(typeof console !== 'undefined' && typeof Utils.log === 'function'){
			console.log(message);
		}
	};
	
	/*
	 * End region
	 * */
	
	if(window.wedding == null){
		window.wedding = Wedding;
	}
	
	window.wedding.initialize();
});
