/*!
 * Bootstrap-fullscreen-select v1.5 (http://craftpip.github.io/bootstrap-fullscreen-select/)
 *
 * www.craftpip.com
 *
 * Copyright 2013-2014 bootstrap-select
 * Licensed under MIT (https://github.com/craftpip/bootstrap-fullscreen-select/blob/master/LICENSE)
 */

try {
    jQuery;
} catch (e) {
    console.error('MobileSelect\'s javascript requires jQuery');
}

(function ($) {

    $.fn.mobileSelect = function (options) {
        var $this = $(this);
        if (!$this.length)
            return 'no elements to process';
        if (!options)
            options = {};

        if(options == 'hide'){
            if($(this).length == 1){
                var id = $(this).attr('data-id');
                if (id)
                    mobileSelect.hide(id);
            }
        }
        if(options == 'show'){
            if($(this).length == 1){
                var id = $(this).attr('data-id');
                if (id)
                    mobileSelect.show(id);
            }
        }
        if (options == 'destroy') {
            $.each($(this), function (i, a) {
                var id = $(this).attr('data-id');
                if (id)
                    mobileSelect.destroy(id);
            });
        }
        if (options == 'refresh' || options == 'sync') {
            $.each($(this), function (i, a) {
                var id = $(this).attr('data-id');
                if (id) {
                    mobileSelect.sync(id);
                } else {
                    console.error('cannot refresh or sync without initializing it.');
                }
            });
        }

        // user global options
        if ($.mobileSelect.defaults) {
            $.extend($.fn.mobileSelect.defaults, $.mobileSelect.defaults);
        }

        // element specific options
        // $.fn.mobileSelect.defaults['animation'] = 'anim-' + $.fn.mobileSelect.defaults.animation;

        options = $.extend({}, $.fn.mobileSelect.defaults, options);

        $this.each(function () {
            var $self = $(this);
            if ($self[0].tagName !== 'SELECT') {
                console.warn('Sorry, ' + $self[0].tagName + ' element is illegal here.');
                return true;
            }
            var generateId = new Date().getTime() + Math.floor(Math.random() * 10000000000);
            /*
             * assigning id to the select element and its properties.
             */
            $self.attr('data-id', generateId);
            mobileSelect[generateId] = $.extend({}, options); //creating a copy for storage.
            mobileSelect.elements.push(generateId); //list of selects generated
            var opt = mobileSelect[generateId];
            opt.id = generateId;
            opt.isMultiple = $self.attr('multiple') ? true : false;
            opt.$this = $self;

            $self.hide();
            if ($self.attr('data-triggerOn') !== undefined) {
                opt.triggerElement = $($self.attr('data-triggerOn'));
            } else {
                if ($self.data('style') !== undefined) {
                    opt.style = $self.data('style');
                }
                // $self.before('<button class="btn '+opt.style+' btn-mobileSelect-gen"><span class="text">0 Selected</span> <span class="glyphicon glyphicon-chevron-down"></span></button>');
                $self.before('<button class="btn '+opt.style+' btn-mobileSelect-gen"><span class="text">0 Selected</span> <span class="caret"></span></button>');
                opt.triggerElement = $self.prev();
            }
            opt.triggerElement.data('id', opt.id);

            if ($self.data('title') !== undefined) {
                opt.title = $self.data('title');
            }
            if ($self.data('animation') !== undefined) {
                opt.animation = $self.data('animation');
            }
            if ($self.attr('data-animationSpeed') !== undefined) {
                opt.animationSpeed = $self.attr('data-animationSpeed');
            }
            if ($self.data('padding') !== undefined) {
                opt.padding = $self.data('padding');
            }
            if ($self.data('btntext-save') !== undefined) {
                opt.buttonsText.save = $self.data('btntext-save');
            }
            if ($self.data('btntext-clear') !== undefined) {
                opt.buttonsText.clear = $self.data('btntext-clear');
            }
            if ($self.data('btntext-cancel') !== undefined) {
                opt.buttonsText.cancel = $self.data('btntext-cancel');
            }
            if ($self.data('theme') !== undefined) {
                opt.theme = $self.data('theme');
            }
            mobileSelect._build(opt.id);
            delete opt;
        });
    };

    $.mobileSelect = {};
    $.fn.mobileSelect.defaults = {
        template: '<div><div class="mobileSelect-title"></div><div class="list-container"></div><div class="mobileSelect-buttons"><a href="#" class="mobileSelect-savebtn"></a><a href="#" class="mobileSelect-clearbtn"></a><a href="#" class="mobileSelect-cancelbtn"></a></div></div>',
        title: 'Select an option',
        buttonsText: {
            save: 'Save',
            clear: 'Clear',
            cancel: 'Cancel'
        },
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
        style: 'btn-default'
    };

    window.mobileSelect = {
        elements: [],
        animations: ['anim-top', 'anim-bottom', 'anim-left', 'anim-right', 'anim-opacity', 'anim-scale', 'anim-zoom', 'anim-none'],
        _build: function (id) {
            this.events();
            this._events(id);
            this._buildHTML(id);
        },
        _buildHTML: function (id) {
            var options = this[id];
            var animationSpeed = options.animationSpeed / 1000;
            var $container = $('<div class="mobileSelect-container"></div>')
                    .attr('data-id', id)
                    .addClass(options.theme)
                    .appendTo('body');
            var template = $.fn.mobileSelect.defaults.template;
            $container.html(template);
            $container
                    .children('div')
                    .css({
                        '-webkit-transition': 'all ' + animationSpeed + 's',
                        'transition': 'all ' + animationSpeed + 's'
                    })
                    .css(options.padding)
                    // .addClass($.fn.mobileSelect.defaults.animation);
                    .addClass('anim-'+options.animation);

            $listcontainer = $container
                    .find('.mobileSelect-title').html(options.title).end()
                    .find('.mobileSelect-savebtn').html(options.buttonsText.save).end()
                    .find('.mobileSelect-clearbtn').html(options.buttonsText.clear).end()
                    .find('.mobileSelect-cancelbtn').html(options.buttonsText.cancel).end()
                    .find('.list-container');

            if (!options.isMultiple) {
                $container.find('.mobileSelect-clearbtn').remove();
            } else {
                $listcontainer.attr('data-multiple', 'true');
            }
            this._buildOptions(id);
            this.refectSelected();
        },
        _buildOptions: function(id){
            this._extract(id);
            var options = this[id];
            var $listcontainer = $('.mobileSelect-container[data-id="'+id+'"] .list-container');
            $listcontainer.html('');
            $.each(options.options, function (i, a) {
                $listcontainer.append('<a href="#" class="mobileSelect-control" data-value="' + a.value + '">' + a.text + '</a>');
            });
        },
        destroy: function (id) {
            id = (id == undefined) ? this.elements : [id];
            var self = this;
            id.forEach(function (el, i) {
                var options = mobileSelect[el];
                $('.mobileSelect[data-id="' + el + '"]').remove();
                options.triggerElement.unbind('click');
                self.elements.shift(self.elements.indexOf(el));
                delete mobileSelect[el];
            });
        },
        sync: function (id) {

            id = (id == undefined) ? this.elements : [id];
            var that = this;
            id.forEach(function (el, i) {

                that._buildOptions(el);
                var options = mobileSelect[el],
                        $container = $('.mobileSelect-container[data-id="' + el + '"]');

                var selectedOptions = options.$this.val();
                if (!options.isMultiple)
                    selectedOptions = [selectedOptions];

                $container.find('a').removeClass('selected');
                for (var i in selectedOptions) {
                    $container.find('a[data-value="' + selectedOptions[i] + '"]').addClass('selected');
                }
            });
        },
        syncR: function (id) {
            id = (id == undefined) ? this.elements : [id];

            id.forEach(function (el, i) {

                var options = mobileSelect[el],
                        container = $('.mobileSelect-container[data-id="' + el + '"]'),
                        selectedOptions = [];

                container.find('.selected').each(function () {
                    selectedOptions.push($(this).data('value'));
                });

                options.$this.val(selectedOptions);

            });
        },
        _events: function (id) {
            var options = this[id],
                    self = this;
            options.triggerElement
                    .unbind('click')
                    .on('click', function (e) {
                        var $this = $(this);
                        var id = $this.data('id');
                        mobileSelect.sync(id);
                        mobileSelect.show(id);
                        return false;
                    });
        },
        _extract: function (id) {
            var options = this[id],
                    $this = options['$this'];
            var selectOptions = [];
            $.each($this.find('option'), function (i, a) {
                if ($(this).text()) {
                    var grouplabel = $(this).parent().prop('tagName') == 'OPTGROUP' ? $(this).parent().attr('label') : false;
                    selectOptions.push({
                        value: $(this).val(),
                        text: $.trim($(this).text()),
                        grouplabel: grouplabel
                    });
                }
            });
            this[id]['options'] = selectOptions;
        },
        hide: function (id) {
            if (id) {
                var options = this[id];
            }else{
                return false;
            }
            this.refectSelected();
            var animation = 'anim-'+options.animation;
            id ? $('.mobileSelect-container[data-id="' + id + '"] > div').addClass(animation) : $('.mobileSelect-container > div').addClass(animation);
            setTimeout(function () {
                $('.mobileSelect-container[data-id="' + id + '"] ').hide();
                $('body').removeClass('mobileSelect-noscroll');
                if (id)
                    options.onClose.apply(options.$this);
            }, options.animationSpeed);
        },
        refectSelected: function () {
            var self = this;
            $.each(self.elements, function (i, e) {
                var count;
                var t = self[e];
                if (!t.triggerElement.hasClass('btn-mobileSelect-gen')) {
                    return false;
                } else if (self[e].$this.val() == null) {
                    count = '0';
                } else if (self[e].isMultiple) {
                    count = self[e].$this.val().length;
                } else {
                    count = self[e].$this.val();
                }
                self[e].triggerElement.find('span.text').html('<strong>' + count + '</strong> selected');
            });
        },
        show: function (id) {
            var options = this[id];
            var classes = this.animations.join(' ');
            $('.mobileSelect-container[data-id="' + id + '"] ').show();
            $('body').addClass('mobileSelect-noscroll');
            setTimeout(function () {
                id ? $('.mobileSelect-container[data-id="' + id + '"] > div').removeClass(classes) : $('.mobileSelect-container > div').removeClass(classes);
                options.onOpen.apply(options.$this);
            }, 500);
        },
        // base events
        events: function () {
            if (this.eventsFired)
                return false;

            /*
             * global events
             */

            $(document).on('click', '.mobileSelect-control', function (e) {
                var $this = $(this);

                if ($this.parent().attr('data-multiple') === 'true') {
                    $this.toggleClass('selected');
                } else {
                    $this.siblings().removeClass('selected').end()
                            .addClass('selected');
                }
                return false;
            });

            $(document).on('click', '.mobileSelect-cancelbtn', function (e) {
                var id = $(this).parents('.mobileSelect-container').data('id');
                mobileSelect.hide(id);
                return false;
            });

            $(document).on('click', '.mobileSelect-savebtn', function (e) {
                var $this = $(this);
                var id = $this.parents('.mobileSelect-container').data('id');
                mobileSelect.syncR(id);
                mobileSelect.hide(id);
                return false;
            });

            $(document).on('click', '.mobileSelect-clearbtn', function (e) {
                var $this = $(this);
                var $parent = $this.parents();
                $parent.find('.selected').removeClass('selected');
                var id = $this.parents('.mobileSelect-container').data('id');
                mobileSelect.syncR(id);
                mobileSelect.hide(id);
                return false;
            });

            this.eventsFired = true;
        }
    }

})(jQuery);