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
					
			
			completeCallback(that.menuItems);
			
		});					
	};
	
	Wedding.loadMap = function(canvas){
		Utils.log("begin wedding.loadmap");
        
		var ramayana = new Microsoft.Maps.Location(18.888,-99.196522);
		var church =  new Microsoft.Maps.Location(18.885,-99.196522);
		
        var map = new Microsoft.Maps.Map(document.getElementById(canvas), 
                {credentials: "AnSepjvY36zVBp3Lcq4MmaaDSOqKjOWcnN2mopsHS1QVDOthjOIRMMZb-A_sUwap",
                 center: ramayana,
                 mapTypeId: Microsoft.Maps.MapTypeId.road,
                 zoom: 15});
        
        var pinParty = new Microsoft.Maps.Pushpin(ramayana, {text: '1'});
        var pinChurch =  new Microsoft.Maps.Pushpin(church, {text: '2'});
        
        map.entities.push(pinParty);
        map.entities.push(pinChurch);
        
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
		//remove all the current binds
		
		
		var that = this;
		var menus = $('a.menuItem');
		
		//remove all the current binds
		menus.unbind('click');
		
		menus.bind('click', function(e){
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
			
			var that = this;
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
				//If the request was successful rebing the links
				that.setMenuBehavior();	
			});
			Utils.log('new page stack created');				
		}else{
			Utils.log("using preloaded page from stack");
		}		
		
		//http://css-tricks.com/examples/AnythingSlider/#panel1-6
		//window.location = '#' + page;
		Utils.log("scrolling to element");
		Utils.log("enabling temporal scrolling");
		
		$('html,body').animate(
				{ 
					scrollTop: $("#" + page).offset().top
				}, 
				{ 
					duration: '450', easing: 'swing'				
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
		return {"name":"Blank" + Math.random(),"displayName":"Blank_" + name};
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
