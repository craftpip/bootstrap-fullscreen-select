// |-------------------------------------------------|
// |    bootstrap select for mobile devices. v1.2    |
// |-------------------------------------------------|
// |   Made specially for use with cordova/phonegap  |
// |-------------------------------------------------|
// |    &copy; boniface pereira. www.craftpip.com    |
// |-------------------------------------------------|

var bootSelect = {
	settings: {
		template: 'js/bootstrap-fullscreen-select.html'
	},
	init: function(object){

		if(bootSelect[object.on]) {
			var b = bootSelect[object.on];
			$('.bootSelect[data-obj="'+b.object.on.substr(1)+'"]').remove();
			console.log('BootSelect: intialized Twice. removing old element and reloading.');
		};

		$selectContorl = $(object.selectControl);

		var array = [];
		$.each($selectContorl.find('option'), function(i, a){
			var a = {
				value: $(this).val(),
				html: $(this).text()
			};
			array.push(a);
		});

		object.isMultiple = $selectContorl.attr('multiple') ? true : false;

		window.a = $selectContorl; //debug

		this[object.on] = {
			array: array,
			object : object
		};

		console.log(this[object.on]);
		this.baseEvents();
		this.events(object);

		$.get(bootSelect.settings.template, function(d){

			$('body').prepend('<div class="bootSelect" style="display:none" data-obj="'+object.on.substr(1)+'"></div>');
			$bs = $('.bootSelect[data-obj="'+object.on.substr(1)+'"]');
			$bs.html(d);
			$bs.find('.bootSelect-title').html(object.title || 'select one');
			$bs.find('.list-container').css('height', $(window).height()-120+'px');
			$bs.find('.list-container').attr('data-multiple', object.isMultiple);
			var obj = bootSelect[object.on];
			
			$.each(obj.array, function(i,a){
				$bs.find('.list-container').append('<a href="#" class="bs-control" data-value="'+a.value+'">'+a.html+'</a>');
			});

		});
	},

	eventsLoaded: false, //base events loaded.

	events:function(object){

		$(document).on('click', object.on, function(e){
			$('body').css({
				overflow: 'hidden'
			});
			$('.bootSelect[data-obj="'+object.on.substr(1)+'"]').show();
			bootSelect.syncR(object.on);
		});

	},
	removeOverflow: function(){
		$('body').css({
			overflow: 'auto'
		})
	},
	baseEvents: function(){

		if(this.eventsLoaded) return false;

		$(window).resize(function(){
			$('.bootSelect .list-container').css('height', $(window).height()-120+'px');
		});

		$(document).on('click', '.bootSelect .bootSelect-btncancel', function(e){
			$(this).parents('.bootSelect').hide();
			bootSelect.removeOverflow();
			return false;
		});

		$(document).on('click', '.bootSelect .bootSelect-btnsave', function(){
			var a = $(this).parents('.bootSelect');
			bootSelect.sync(a) ? $(this).parents('.bootSelect').hide() : '';
			bootSelect.removeOverflow();
			return false;
		});

		$(document).on('click', '.bootSelect .bootSelect-btnclear', function(){
			var a = $(this).parents('.bootSelect');
			a.find('.check').removeClass('check');
			a.find('.bootSelect-btnsave').trigger('click');
			bootSelect.removeOverflow();
			return false;
		});

		$(document).on('click', '.bootSelect .list-container a.bs-control', function(e){
			bootSelect.clickCheck(e);
			return false;
		});

		this.eventsLoaded = true;
	},

	clickCheck: function(e){
		$this = $(e.currentTarget);

		if($this.hasClass('check')){
			$this.removeClass('check');
		}else{
			if($this.parent().data('multiple') == false){
				$this.parent().children().removeClass('check');
			}
			$this.addClass('check');
		}
	},
	
	sync: function(a){
		var list = a.find('.list-container .check');
		var res = [];
		$.each(list, function(i,b){
			res.push($(this).data('value'));
		});
		var obj = bootSelect['#'+a.data('obj')];
		$(obj.object.selectControl).val(res);
		$(obj.object.selectControl).trigger('change');
		return true;
	},

	syncR: function(a){
		var obj = bootSelect[a];
		var b = $(obj.object.selectControl).val();
		$b = $('.bootSelect[data-obj="'+a.substr(1)+'"]');
		$.each($b.find('.list-container a'), function(i ,c){
			if(b.indexOf($(c).data('value')+'') != -1){
				$(c).addClass('check');
			}else{
				$(c).removeClass('check');
			}
		});
	}
}

