'use strict';
/*!
 * Bootstrap-fullscreen-select v1.5 (http://craftpip.github.io/bootstrap-fullscreen-select/)
 *
 * www.craftpip.com
 *
 * Copyright 2013-2014 bootstrap-select
 * Licensed under MIT (https://github.com/craftpip/bootstrap-fullscreen-select/blob/master/LICENSE)
 */

// $e = select element
// $c = container element
// $triggerElement = trigger element

try {
    jQuery;
} catch (e) {
    console.error('MobileSelect\'s javascript requires jQuery');
}
(function($) {
    $.fn.mobileSelect = function(options) {
        var $this = $(this);
        // dont go further if no elements selected.
        if (!$this.length) return 'no elements to process';
        // set an empty object if options === undefined
        if (!options) options = {}
        if (typeof options == 'string') {
            if (options == 'destroy') {
                $this.each(function(i, a) {
			        var id = $(a).attr('data-msid');
                    $.mobileSelect.elements[id].destroy();
                    delete $.mobileSelect.elements[id];
                });
            }
            if (options == 'sync' || options == 'refresh') {
            	$this.each(function(i, a){
			        var id = $(a).attr('data-msid');
                    $.mobileSelect.elements[id].refresh();
            	});
            }
            return;
        }
        // if options == hide
        // if options == show
        // if options == sync
        // if options == destroy
        // if user defaults provided overwrite with mobileSelect defaults.
        if ($.mobileSelect.defaults) {
            $.extend($.fn.mobileSelect.defaults, $.mobileSelect.defaults);
        }
        // options to be merged with defaults.
        options = $.extend({}, $.fn.mobileSelect.defaults, options);
        // start iterating over!
        $this.each(function(i, a) {
            console.log(i);
            var $elm = $(a);
            //reject non SELECT elements
            if ($elm[0].tagName !== 'SELECT') {
                console.warn('Sorry, cannot initialized a ' + $elm[0].tagName + ' element');
                return true;
                // continue;
            }
            if ($elm.attr('data-msid') !== undefined) {
                console.error('This element is already Initialized');
                return true;
                // continue
            }
            // track objects via generated IDs
            var id = Math.floor(Math.random() * 999999);
            $elm.attr('data-msid', id);
            var mobileSelectObj = new Mobileselect(a, options);
            $.mobileSelect.elements[id] = mobileSelectObj;
        })
    }
    var Mobileselect = function(element, options) {
        this.$e = $(element);
        $.extend(this, options);
        this.init();
    }
    Mobileselect.prototype = {
        init: function() {
            this._setUserOptions();
            this._extractOptions();
            this._buildHTML();
            this._bindEvents();
        },
        _buildHTML: function() {
            // build and insert the trigger element
            if (this.$e.attr('data-triggerOn') === undefined) {
                // no custom trigger element.
                if (this.$e.attr('data-style') !== undefined) {
                    this.style = this.$e.attr('data-style');
                }
                this.$e.before('<button class="btn ' + this.style + ' btn-mobileSelect-gen"><span class="text"></span> <span class="caret"></span></button>');
                this.$triggerElement = this.$e.prev();
                this.$e.hide();
            } else {
                this.$triggerElement = $(this.$e.attr('data-triggerOn'));
            }
            //----------
            //build mobileSelect container HTML.
            //----------
            //seting up the container.
            this.$c = $('<div class="mobileSelect-container"></div>').addClass(this.theme).appendTo('body');
            //appending the container template
            this.$c.html($.fn.mobileSelect.defaults.template);
            //settings container animations.
            this.$c.children('div').css({
                '-webkit-transition': 'all ' + this.animationSpeed / 1000 + 's',
                'transition': 'all ' + this.animationSpeed / 1000 + 's'
            }).css(this.padding).addClass('anim-' + this.animation);
            // set title and buttons text.
            this.$c.find('.mobileSelect-title').html(this.title).end().find('.mobileSelect-savebtn').html(this.buttonSave).end().find('.mobileSelect-clearbtn').html(this.buttonClear).end().find('.mobileSelect-cancelbtn').html(this.buttonCancel).end();
            this.$listcontainer = this.$c.find('.list-container');
            if (!this.isMultiple) {
                this.$c.find('.mobileSelect-clearbtn').remove();
            } else {
                this.$listcontainer.data('multiple', 'true');
            }

            this._appendOptionsList();
        },
        _appendOptionsList: function(){
            //----------
            // append options list.
            //----------
            this.$listcontainer.html('');
            var that = this;
            $.each(this.options, function(i, a) {
                that.$listcontainer.append('<a href="#" class="mobileSelect-control" data-value="' + a.value + '">' + a.text + '</a>');
            });
            this.sync();
            this._updateBtnCount();
        },
        _updateBtnCount: function() {
            // if(this.$triggerElement.is('button') && )
            if (this.$triggerElement.is('button') && this.$triggerElement.hasClass('btn-mobileSelect-gen')) {
                var a = this.$triggerElement.find('.text'),
                    b = this.$e.val();
                if (b == null) {
                    a.html(this.title);
                    return false;
                }
                if (this.isMultiple) {
                    a.html('<strong>' + b.length + '</strong> Items selected');
                } else {
                    a.html('<strong>' + b + '</strong>');
                }
            }
        },
        _bindEvents: function() {
            var that = this;
            this.$triggerElement.on('click', function() {
                that.show();
            });
            this.$c.find('.mobileSelect-savebtn').on('click', function(e) {
                e.preventDefault();
                that.syncR();
                that.hide();
            });
            this.$c.find('.mobileSelect-clearbtn').on('click', function(e) {
                e.preventDefault();
                that.$listcontainer.find('.selected').removeClass('selected');
                that.syncR();
                that.hide();
            });
            this.$c.find('.mobileSelect-cancelbtn').on('click', function(e) {
                e.preventDefault();
                that.hide();
            });
            this.$c.find('.mobileSelect-control').on('click', function(e) {
                e.preventDefault();
                var $this = $(this);
                if (that.isMultiple) {
                    $this.toggleClass('selected');
                } else {
                    $this.siblings().removeClass('selected').end().addClass('selected');
                }
            });
        },
        _unbindEvents: function() {
            console.log('unbind events');
            this.$triggerElement.unbind('click');
            this.$c.find('.mobileSelect-clearbtn').unbind('click');
            this.$c.find('.mobileSelect-cancelbtn').unbind('click');
            this.$c.find('.mobileSelect-control').unbind('click');
        },
        sync: function() {
            //sync from select element to mobile select container
            var selectedOptions = this.$e.val();
            if (!this.isMultiple) selectedOptions = [selectedOptions];
            this.$c.find('a').removeClass('selected');
            for (var i in selectedOptions) {
                this.$c.find('a[data-value="' + selectedOptions[i] + '"]').addClass('selected');
            }
        },
        syncR: function() {
            //sync from mobile select container to select element
            var selectedOptions = [];
            this.$c.find('.selected').each(function() {
                selectedOptions.push($(this).data('value'));
            });
            this.$e.val(selectedOptions);
        },
        hide: function() {
            this.$c.children('div').addClass('anim-' + this.animation);
            var that = this;
            this._updateBtnCount();
            setTimeout(function() {
                that.$c.hide();
                $('body').removeClass('mobileSelect-noscroll');
                that.onClose.apply(that.$e);
            }, this.animationSpeed);
        },
        show: function() {
            this.$c.show();
            this.sync();
            $('body').addClass('mobileSelect-noscroll');
            var that = this;
            setTimeout(function() {
                that.$c.children('div').removeClass($.mobileSelect.animations.join(' '));
            }, 0);
            this.onOpen.apply(this.$e);
        },
        _setUserOptions: function() {
            this.isMultiple = this.$e.attr('multiple') ? true : false;
            if (this.$e.data('title') !== undefined) {
                this.title = this.$e.data('title');
            }
            if (this.$e.data('animation') !== undefined) {
                this.animation = this.$e.data('animation');
            }
            if (this.$e.data('animation-speed') !== undefined) {
                this.animationSpeed = this.$e.data('animation-speed');
            }
            if (this.$e.data('padding') !== undefined) {
                this.padding = this.$e.data('padding');
            }
            if (this.$e.data('btntext-save') !== undefined) {
                this.buttonSave = this.$e.data('btntext-save');
            }
            if (this.$e.data('btntext-clear') !== undefined) {
                this.buttonClear = this.$e.data('btntext-clear');
            }
            if (this.$e.data('btntext-cancel') !== undefined) {
                this.buttonCancel = this.$e.data('btntext-cancel');
            }
            if (this.$e.data('theme') !== undefined) {
                this.theme = this.$e.data('theme');
            }
            if (this.animation == 'none') {
                this.animationSpeed = 0;
            }
        },
        _extractOptions: function() {
            var options = [];
            $.each(this.$e.find('option'), function(i, a) {
                if ($(this).text()) {
                    var label = $(this).parent().is('optgroup') ? $(this).parent().attr('label') : false;
                    options.push({
                        value: $(this).val(),
                        text: $.trim($(this).text()),
                        grouplabel: label
                    });
                }
            });
            this.options = options;
        },
        destroy: function() {
            this.$e.removeAttr('data-msid');
            this._unbindEvents();
            this.$triggerElement.remove();
            this.$c.remove();
            this.$e.show();
            console.log('done ');
        },
        refresh: function(){
        	this._extractOptions();
        	this._appendOptionsList();
        	this._unbindEvents();
        	this._bindEvents();
        }
    }
    // object for user defaults.
    $.mobileSelect = {
        elements: {}, //to store records
        animations: ['anim-top', 'anim-bottom', 'anim-left', 'anim-right', 'anim-opacity', 'anim-scale', 'anim-zoom', 'anim-none'] //supported animations
    };
    // plugin defaults.
    $.fn.mobileSelect.defaults = {
        template: '<div><div class="mobileSelect-title"></div><div class="list-container"></div><div class="mobileSelect-buttons"><a href="#" class="mobileSelect-savebtn"></a><a href="#" class="mobileSelect-clearbtn"></a><a href="#" class="mobileSelect-cancelbtn"></a></div></div>',
        title: 'Select an option',
        buttonSave: 'Save',
        buttonClear: 'Clear',
        buttonCancel: 'Cancel',
        padding: {
            'top': '20px',
            'left': '20px',
            'right': '20px',
            'bottom': '20px'
        },
        animation: 'scale',
        animationSpeed: 400,
        theme: 'white',
        onOpen: function() {},
        onClose: function() {},
        style: 'btn-default'
    };
})(jQuery);