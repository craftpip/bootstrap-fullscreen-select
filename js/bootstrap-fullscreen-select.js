
try {
    jQuery;
} catch (e) {
    console.error('MobileSelect\'s javascript requires jQuery');
}

(function ($) {

    $.easing.jswing = $.easing.swing;

    $.extend($.easing, {
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0)
                return b;
            if ((t /= d) == 1)
                return b + c;
            if (!p)
                p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        }
    });

    $.fn.mobileSelect = function (options) {
        var $this = $(this);

        if (options == 'destroy') {
            $.each($(this), function(i, a){
                var id = $(this).attr('data-id');
                console.log(id);
                if(id)
                    mobileSelect.destroy(id);
            });
            return 'done';
        }

        if (options == 'update') {
            $.each($(this), function(i, a){
                var id = $(this).attr('data-id');
                if(id)
                    mobileSelect.sync(id);
            });
            return 'done';
        }

        // options
        if ($.mobileSelect.defaults) {
            $.fn.mobileSelect.defaults = $.extend($.fn.mobileSelect.defaults, $.mobileSelect.defaults);
        }
        options = $.extend($.fn.mobileSelect.defaults, options);
        $.fn.mobileSelect.defaults['animation'] = 'anim-'+$.fn.mobileSelect.defaults.animation;
        console.log($this.length + ' elements will be processed');

        $this.each(function () {
            /*
             * iterate through all the select elements.
             */
            var $self = $(this);
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

            if ($self.attr('data-mobile-select-triggerElement') !== undefined) {
                opt.triggerElement = $($self.attr('data-mobile-select-triggerElement'));
            } else {
                opt.triggerElement = $self;
            }
            opt.triggerElement.data('id', opt.id);

            if ($self.attr('data-mobile-select-title') !== undefined) {
                opt.title = $self.attr('data-mobile-select-title');
            }

            mobileSelect._build(opt.id);
            delete opt;
        });
    };

    $.mobileSelect = {};
    $.fn.mobileSelect.defaults = {
        template: 'js/bootstrap-fullscreen-select.html',
        title: 'Select an option',
        buttonsText: {
            save: 'Save',
            clear: 'Clear',
            cancel: 'Cancel'
        },
        animation: 'top',
        animationSpeed: 400
    };

    window.mobileSelect = {
        elements: [],
        animations: ['anim-top', 'anim-bottom', 'anim-left', 'anim-right', 'anim-opacity', 'anim-scale', 'anim-zoom', 'anim-none'],
        _build: function (id) {
            //options = this[id];
            this.events(); //bind base events
            this._extract(id);
            this._events(id);
            this._buildHTML(id);
        },
        _buildHTML: function (id) {
            var options = this[id];
            var animationSpeed = $.fn.mobileSelect.defaults.animationSpeed/1000;
            var $container = $('<div class="mobileSelect"></div>')
                    .attr('data-id', id)
                    .appendTo('body');
            $.get(options.template, function (template) {
                console.log('appending template');
                $container.html(template);
                $container
                    .children('div')
                    .css({
                        '-webkit-transition': 'all '+animationSpeed+'s',
                        'transition': 'all '+animationSpeed+'s'
                    })
                    .addClass( $.fn.mobileSelect.defaults.animation );

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

                $.each(options.options, function (i, a) {
                    $listcontainer.append('<a href="#" class="mobileSelect-control" data-value="' + a.value + '">' + a.text + '</a>');
                });
            });

        },
        destroy: function(id){
            id = (id == undefined) ? this.elements : [id];
            var self = this;
            id.forEach(function(el, i){
                var options = mobileSelect[el];
                $('.mobileSelect[data-id="'+el+'"]').remove();
                options.triggerElement.unbind('click');
                self.elements.shift(self.elements.indexOf(el));
                delete mobileSelect[el];
            });
        },
        sync: function (id) {
            id = (id == undefined) ? this.elements : [id];

            id.forEach(function (el, i) {
                var options = mobileSelect[el],
                        $container = $('.mobileSelect[data-id="' + el + '"]');

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
                        container = $('.mobileSelect[data-id="' + el + '"]'),
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
            console.log(selectOptions);
        },
        hide: function (id) {
            var animation = $.fn.mobileSelect.defaults.animation;
            id ? $('.mobileSelect[data-id="' + id + '"] > div').addClass(animation) : $('.mobileSelect > div').addClass(animation);
            setTimeout(function(){
                $('.mobileSelect[data-id="' + id + '"] ').hide();
                $('body').removeClass('mobileSelect-noscroll');
            }, $.fn.mobileSelect.defaults.animationSpeed);
        },
        show: function (id) {
            var classes = this.animations.join(' ');
            $('.mobileSelect[data-id="' + id + '"] ').show();
            $('body').addClass('mobileSelect-noscroll');
            setTimeout(function(){
                id ? $('.mobileSelect[data-id="' + id + '"] > div').removeClass(classes) : $('.mobileSelect > div').removeClass(classes);
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
                var id = $(this).parents('.mobileSelect').data('id');
                mobileSelect.hide(id);
                return false;
            });

            $(document).on('click', '.mobileSelect-savebtn', function (e) {
                var $this = $(this);
                var id = $this.parents('.mobileSelect').data('id');
                mobileSelect.syncR(id);
                mobileSelect.hide(id);
                return false;
            });

            $(document).on('click', '.mobileSelect-clearbtn', function (e) {
                var $this = $(this);
                var $parent = $this.parents();
                $parent.find('.selected').removeClass('selected');
                var id = $this.parents('.mobileSelect').data('id');
                mobileSelect.syncR(id);
                mobileSelect.hide(id);
                return false;
            });

            this.eventsFired = true;
        }
    }

})(jQuery);

var bootSelect = {
    settings: {
        template: 'js/bootstrap-fullscreen-select.html'
    },
    init: function (object) {

        if (bootSelect[object.on]) {
            var b = bootSelect[object.on];
            $('.bootSelect[data-obj="' + b.object.on.substr(1) + '"]').remove();
            console.log('BootSelect: intialized Twice. removing old element and reloading.');
        }
        ;

        $selectContorl = $(object.selectControl);

        var array = [];
        $.each($selectContorl.find('option'), function (i, a) {
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
            object: object
        };

        console.log(this[object.on]);
        this.baseEvents();
        this.events(object);

        $.get(bootSelect.settings.template, function (d) {

            $('body').prepend('<div class="bootSelect" style="display:none" data-obj="' + object.on.substr(1) + '"></div>');
            $bs = $('.bootSelect[data-obj="' + object.on.substr(1) + '"]');
            $bs.html(d);
            $bs.find('.bootSelect-title').html(object.title || 'select one');
            $bs.find('.list-container').css('height', $(window).height() - 120 + 'px');
            $bs.find('.list-container').attr('data-multiple', object.isMultiple);
            var obj = bootSelect[object.on];

            $.each(obj.array, function (i, a) {
                $bs.find('.list-container').append('<a href="#" class="bs-control" data-value="' + a.value + '">' + a.html + '</a>');
            });

        });
    },
    eventsLoaded: false, //base events loaded.

    events: function (object) {

        $(document).on('click', object.on, function (e) {
            $('body').css({
                overflow: 'hidden'
            });
            $('.bootSelect[data-obj="' + object.on.substr(1) + '"]').show();
            bootSelect.syncR(object.on);
        });

    },
    removeOverflow: function () {
        $('body').css({
            overflow: 'auto'
        })
    },
    baseEvents: function () {

        if (this.eventsLoaded)
            return false;

        $(window).resize(function () {
            $('.bootSelect .list-container').css('height', $(window).height() - 120 + 'px');
        });

        $(document).on('click', '.bootSelect .bootSelect-btncancel', function (e) {
            $(this).parents('.bootSelect').hide();
            bootSelect.removeOverflow();
            return false;
        });

        $(document).on('click', '.bootSelect .bootSelect-btnsave', function () {
            var a = $(this).parents('.bootSelect');
            bootSelect.sync(a) ? $(this).parents('.bootSelect').hide() : '';
            bootSelect.removeOverflow();
            return false;
        });

        $(document).on('click', '.bootSelect .bootSelect-btnclear', function () {
            var a = $(this).parents('.bootSelect');
            a.find('.check').removeClass('check');
            a.find('.bootSelect-btnsave').trigger('click');
            bootSelect.removeOverflow();
            return false;
        });

        $(document).on('click', '.bootSelect .list-container a.bs-control', function (e) {
            bootSelect.clickCheck(e);
            return false;
        });

        this.eventsLoaded = true;
    },
    clickCheck: function (e) {
        $this = $(e.currentTarget);

        if ($this.hasClass('check')) {
            $this.removeClass('check');
        } else {
            if ($this.parent().data('multiple') == false) {
                $this.parent().children().removeClass('check');
            }
            $this.addClass('check');
        }
    },
    sync: function (a) {
        var list = a.find('.list-container .check');
        var res = [];
        $.each(list, function (i, b) {
            res.push($(this).data('value'));
        });
        var obj = bootSelect['#' + a.data('obj')];
        $(obj.object.selectControl).val(res);
        $(obj.object.selectControl).trigger('change');
        return true;
    },
    syncR: function (a) {
        var obj = bootSelect[a];
        var b = $(obj.object.selectControl).val();
        $b = $('.bootSelect[data-obj="' + a.substr(1) + '"]');
        $.each($b.find('.list-container a'), function (i, c) {
            if (b.indexOf($(c).data('value') + '') != -1) {
                $(c).addClass('check');
            } else {
                $(c).removeClass('check');
            }
        });
    }
}

