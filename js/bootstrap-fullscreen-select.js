'use strict';
/*!
 * Bootstrap-fullscreen-select v1.5.1 (http://craftpip.github.io/bootstrap-fullscreen-select/)
 * Author: boniface pereira
 * Website: www.craftpip.com
 * Contact: hey@craftpip.com
 *
 * Copyright 2013-2014 bootstrap-select
 * Licensed under MIT (https://github.com/craftpip/bootstrap-fullscreen-select/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') {
    throw new Error('Mobileselect\' requires jQuery');
}

(function ($) {

    $.fn.mobileSelect = function (options) {
        var $this = $(this);

        /*
         * backout if no elements are selected.
         */
        if (!$this.length)
            return 'no elements to process';

        /*
         * set an empty object if options === undefined
         */
        if (!options)
            options = {};

        if (typeof options === 'string') {
            if (options === 'destroy') {
                // destroy the mobile select initialization.
                $this.each(function (i, a) {
                    var id = $(a).attr('data-msid');
                    $.mobileSelect.elements[id].destroy();
                    delete $.mobileSelect.elements[id];
                });
            }
            if (options === 'sync' || options === 'refresh') {
                //sync changes in the options.
                $this.each(function (i, a) {
                    var id = $(a).attr('data-msid');
                    $.mobileSelect.elements[id].refresh();
                });
            }
            if (options === 'hide') {
                // programmically hide a shown mobileSelect
                $this.each(function (i, a) {
                    var id = $(a).attr('data-msid');
                    $.mobileSelect.elements[id].hide();
                });
            }
            if (options === 'show') {
                // programmicallly show a mobileSelect
                $this.each(function (i, a) {
                    var id = $(a).attr('data-msid');
                    $.mobileSelect.elements[id].show();
                });
            }
			if(options === 'exists'){
				// test for existance of mobileSelect 
				var truthyVar = false;
				$.each($.mobileSelect.elements, function(i,e){ 
					if(e.$e[0] === $this[0]) 
						truthyVar = true;
				});
				return truthyVar;
			}
            return;
        }
        // if user defaults provided overwrite with mobileSelect defaults.
        if ($.mobileSelect.defaults) {
            $.extend($.fn.mobileSelect.defaults, $.mobileSelect.defaults);
        }
        // options to be merged with defaults.
        options = $.extend({}, $.fn.mobileSelect.defaults, options);
        // start iterating over!
        $this.each(function (i, a) {
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
        });
    };
    var Mobileselect = function (element, options) {
        this.$e = $(element);
        $.extend(this, options);
        this.init();
    };
    Mobileselect.prototype = {
        init: function () {
            this._setUserOptions();
            this._extractOptions();
            this._buildHTML();
            this._bindEvents();
        },
        _buildHTML: function () {

            /*
             * build and insert the trigger element
             */

            if (this.$e.attr('data-triggerOn') === undefined) {
                // no custom trigger element.
                if (this.$e.attr('data-style') !== undefined) {
                    this.style = this.$e.attr('data-style');
                }

                var b = this.$e.attr('disabled') || '';
                this.$e.before('<button type="button" class="btn ' + this.style + ' btn-mobileSelect-gen" ' + b + '><span class="text"></span> <span class="caret"></span></button>');
                this.$triggerElement = this.$e.prev();
                this.$e.hide();
            } else {
                this.$triggerElement = $(this.$e.attr('data-triggerOn'));
            }

            /*
             * Build mobile select container HTML.
             */

            //seting up the container.
            this.$c = $('<div class="mobileSelect-container"></div>').addClass(this.theme).appendTo('body');

            //appending the container template
            this.$c.html((!this.filterable ? $.fn.mobileSelect.defaults.template : $.fn.mobileSelect.defaults.templateFilterable));

            //settings container animations.
            this.$c.children('div').css({
                '-webkit-transition': 'all ' + this.animationSpeed / 1000 + 's',
                'transition': 'all ' + this.animationSpeed / 1000 + 's'
            }).css(this.padding).addClass('anim-' + this.animation);

            /*
             * set title buttons text.
             */
            if(!this.filterable)
                this.$c.find('.mobileSelect-title').html(this.title).end().find('.mobileSelect-selectallbtn').html(this.buttonSelectAll).end().find('.mobileSelect-savebtn').html(this.buttonSave).end().find('.mobileSelect-clearbtn').html(this.buttonClear).end().find('.mobileSelect-cancelbtn').html(this.buttonCancel).end();
            else
                this.$c.find('.mobileSelect-selectallbtn').html(this.buttonSelectAll).end().find('.mobileSelect-savebtn').html(this.buttonSave).end().find('.mobileSelect-clearbtn').html(this.buttonClear).end().find('.mobileSelect-cancelbtn').html(this.buttonCancel).end();
            this.$listcontainer = this.$c.find('.list-container');
            if (!this.isMultiple) {
                this.$c.find('.mobileSelect-clearbtn').remove();
            } else {
                this.$listcontainer.data('multiple', 'true');
            }
            this._appendOptionsList();
        },
        _appendOptionsList: function () {

            /*
             * append options list.
             */
            this.$listcontainer.html('');
            var that = this;
            var prevGroup = '';
            $.each(this.options, function (i, a) {

                if (a.group && a.group !== prevGroup) {
                    if (a.groupDisabled) {
                        var b = 'disabled';
                    }
                    that.$listcontainer.append('<div><button class="btn-link" data-toggle="collapse" style="width: 100%" data-target="#group' + a.group + '"><span class="mobileSelect-group" ' + b + '>' + a.group + '</span></button><div id="group' + a.group + '" class="collapse in"></div></div>');
                    prevGroup = a.group;
                }
                if (a.groupDisabled || a.disabled) {
                    var b = 'disabled';
                }

                if (a.group)
                    that.$listcontainer.filter($('#group' + a.group).append('<a href="#" class="mobileSelect-control" ' + b + ' data-value="' + a.value + '">' + a.text + '</a>'))
                else
                    that.$listcontainer.append('<a href="#" class="mobileSelect-control" ' + b + ' data-value="' + a.value + '">' + a.text + '</a>');

            });
            this.sync();
            this._updateBtnCount();
        },
        _updateBtnCount: function () {

            /*
             * Update generated button count.
             */
            var d = this.$triggerElement.find(".text"), c = this.$e.val();
            if (c === null) {
                d.html("Nothing selected");
                return false
            }

            if (this.isMultiple) {
                if (c.length === 1) {
                    d.html(c)
                } else {
                    d.html(c.length + " items selected")
                }
            } else {
                d.html(c)
            }
        },
        _bindEvents: function () {
            /*
             * binding events on trigger element & buttons.
             */
            var that = this;
            this.$triggerElement.on('click', function (e) {
                e.preventDefault();
                that.show();
            });
            this.$c.find('.mobileSelect-selectallbtn').on('click', function (e) {
                e.preventDefault();
                that.$listcontainer.find($('.mobileSelect-control')).filter(':visible').addClass('selected')
                that.syncR();
                $(window).trigger('mobileSelectAll');
            });
            this.$c.find('.mobileSelect-savebtn').on('click', function (e) {
                e.preventDefault();
                that.syncR();
                that.hide();
                $(window).trigger('mobileSelectSave');
            });
            this.$c.find('.mobileSelect-clearbtn').on('click', function (e) {
                e.preventDefault();
                that.$listcontainer.find('.selected').removeClass('selected');
                that.syncR();
                $(window).trigger('mobileSelectClear');
            });
            this.$c.find('.mobileSelect-cancelbtn').on('click', function (e) {
                e.preventDefault();
                that.hide();
                $(window).trigger('mobileSelectCancel');
            });
            this.$c.find('.mobileSelect-filter').on('keyup', function (e) {
                var string = $(this).val().toLowerCase()
                if (string === "") {
                    that.$listcontainer.find($('.mobileSelect-control')).show();

                }
                else {
                    that.$listcontainer.find($('.mobileSelect-control')).hide();
                    $.each(that.$listcontainer.find($('.mobileSelect-control')), function (i, item) {
                        if ($(item).text().toLowerCase().indexOf(string) >= 0)
                            $(item).show();
                    });
                }
            });
            this.$c.find('.mobileSelect-control').on('click', function (e) {
                e.preventDefault();
                var $this = $(this);

                if ($this.attr('disabled') == 'disabled')
                    return false;

                if (that.isMultiple) {
                    $this.toggleClass('selected');
                } else {
                    $this.siblings().removeClass('selected').end().addClass('selected');
                }
            });
           
        },
        _unbindEvents: function () {

            /*
             * to unbind events while destroy.
             */
            this.$triggerElement.unbind('click');
            this.$c.find('.mobileSelect-clearbtn').unbind('click');
            this.$c.find('.mobileSelect-cancelbtn').unbind('click');
            this.$c.find('.mobileSelect-control').unbind('click');
        },
        sync: function () {

            /*
             * sync from select element to mobile select container
             */
            var selectedOptions = this.$e.val();
            if (!this.isMultiple)
                selectedOptions = [selectedOptions];
            this.$c.find('a').removeClass('selected');
            for (var i in selectedOptions) {
                this.$c.find('a[data-value="' + selectedOptions[i] + '"]').addClass('selected');
            }
        },
        syncR: function () {

            /*
             * sync from mobile select container to select element
             */
            var selectedOptions = [];
            this.$c.find('.selected').each(function () {
                selectedOptions.push($(this).data('value'));
            });
            this.$e.val(selectedOptions);
        },
        hide: function () {

            /*
             * hide animation with onClose callback
             */
            this.$c.children('div').addClass('anim-' + this.animation);
            var that = this;
            this._updateBtnCount();
            setTimeout(function () {
                that.$c.hide();
                $('body').removeClass('mobileSelect-noscroll');
                that.onClose.apply(that.$e);
            }, this.animationSpeed);
        },
        show: function () {

            /*
             * show animation with onOpen callback
             */
            this.$c.show();
            this.sync();
            $('body').addClass('mobileSelect-noscroll');
            var that = this;
            setTimeout(function () {
                that.$c.children('div').removeClass($.mobileSelect.animations.join(' '));
            }, 10);
            this.onOpen.apply(this.$e);
        },
        _setUserOptions: function () {

            /*
             * overwrite options with data-attributes if provided.
             */
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
            if (this.animation === 'none') {
                this.animationSpeed = 0;
            }
        },
        _extractOptions: function () {

            /*
             * Get options from the select element and store them in an array.
             */
            var options = [];
            $.each(this.$e.find('option'), function (i, a) {
                var $t = $(a);
                if ($t.text()) {

                    //                    var label = $t.parent().is('optgroup') ? $t.parent().attr('label') : false;

                    if ($t.parent().is('optgroup')) {
                        var label = $t.parent().attr('label');
                        var labelDisabled = $t.parent().prop('disabled');
                    } else {
                        var label = false;
                        var labelDisabled = false;
                    }

                    options.push({
                        value: $t.val(),
                        text: $.trim($t.text()),
                        disabled: $t.prop('disabled'),
                        group: label,
                        groupDisabled: labelDisabled
                    });

                }
            });
            this.options = options;
        },
        destroy: function () {

            /*
             * destroy the select
             * unbind events
             * remove triggerElement, container
             * show the Native select
             */
            this.$e.removeAttr('data-msid');
            this._unbindEvents();
            this.$triggerElement.remove();
            this.$c.remove();
            this.$e.show();
            console.log('done ');
        },
        refresh: function () {

            /*
             * refresh/sync the native select with the mobileSelect.
             */
            this._extractOptions();
            this._appendOptionsList();
            this._unbindEvents();
            this._bindEvents();
        }
    };

    /*
     * for user defaults.
     */
    $.mobileSelect = {
        elements: {}, //to store records
        animations: ['anim-top', 'anim-bottom', 'anim-left', 'anim-right', 'anim-opacity', 'anim-scale', 'anim-zoom', 'anim-none'] //supported animations
    };

    /*
     * plugin defaults
     */
    $.fn.mobileSelect.defaults = {
        template: '<div><div class="mobileSelect-title"></div><div class="list-container"></div><div class="mobileSelect-buttons"><a href="#" class="mobileSelect-selectallbtn"></a><a href="#" class="mobileSelect-savebtn"></a><a href="#" class="mobileSelect-clearbtn"></a><a href="#" class="mobileSelect-cancelbtn"></a></div></div>',
        templateFilterable:'<div><div class="mobileSelect-title"><div class="right-inner-addon"><i class="glyphicon glyphicon-search"></i><input class="form-control mobileSelect-filter" type="search" /></div></div><div class="list-container"></div><div class="mobileSelect-buttons"><a href="#" class="mobileSelect-selectallbtn"></a><a href="#" class="mobileSelect-savebtn"></a><a href="#" class="mobileSelect-clearbtn"></a><a href="#" class="mobileSelect-cancelbtn"></a></div></div>',
        title: 'Select an option',
        buttonSelectAll: 'Select All Visible',
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
        onOpen: function () {
        },
        onClose: function () {
        },
        style: 'btn-default',
        filterable: false
    };
})(jQuery);
