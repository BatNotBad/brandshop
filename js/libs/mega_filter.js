/**
 * Mega Filter
 */

let mf, cnt;

$(document).ready(function () {
    // let filterText = $('#filter .mainheader h1').text();
    // if ($('#filter').length) {
    //     $('#filter').insertAfter('main');
    mf = new MegaFilter();
    // cnt = $('#filter');
    // $('.btn-filter').click(function () {
    //     cnt.addClass('active');
    //     showSelectedFilter();
    //     $('.btn-loading', cnt).removeClass('btn-loading');
    // });

    // $('.filter-overlay, #filter .close').click(closeFilter);

    // $(document).on('click', '.mfilter-heading-content', function () {
    //     $(this).closest('.mfilter-filter-item').addClass('active');
    //     cnt.addClass('items');
    //     $('#filter .mainheader h1').text($('em', this).text());
    // });

    // $(document).on('click', '#goback', function () {
    //     mf._initCountInfo();
    //     cnt.removeClass('items');
    //     $('.mfilter-filter-item.active').removeClass('active');
    //     $('#filter .mainheader h1').text(filterText);
    //     showSelectedFilter();
    // });

    // $(document).on('click', '#filter .btn-blue', function () {
    //     mf.ajax();
    // });

    // $(document).on('click', '#filter .mainheader .mfilter-button', function () {
    //     mf.resetFilters();
    //     mf.ajax();
    //     $(this).hide();
    // });

    initFilter();
    // }
});
//
// function showSelectedFilter() {
//     $('#filter .mfilter-heading-content span').remove();
//     let selected = false;
//     $('#filter ul li').each(function () {
//         let heading = $('.mfilter-heading-content', this);
//         $('.mfilter-option', this).each(function () {
//             if ($('input', this).is(':checked')) {
//                 selected = true;
//                 heading.append('<span>' + $('label', this).text().replace(/\s+$/, '') + '</span>');
//             }
//         });
//
//         $('#filter .mainheader .mfilter-button');
//
//         /*if ($(this).hasClass('mfilter-price')) {
//             if ($('#mfilter-opts-price-min', this).val() != $('#mfilter-opts-price-min', this).attr('min') || $('#mfilter-opts-price-max', this).val() != $('#mfilter-opts-price-max', this).attr('max')) {
//                 heading.append('<span>' + $('#mfilter-opts-price-min', this).val() + ' – ' + $('#mfilter-opts-price-max', this).val() + '</span>');
//             }
//          }*/
//     });
//     if (selected) $('#filter .mainheader .mfilter-button').show();
//     else $('#filter .mainheader .mfilter-button').hide();
// }
//
let mfinit = false;

//
function initFilter() {
    if (typeof opts != "undefined" && $('.box.mfilter-box').length && !$('.box.mfilter-box').hasClass('init')) {
        let _t = $('.box.mfilter-box').addClass('init');
        if (mfinit) {
            mf.update(_t, opts);
        } else {
            mfinit = true;
            mf.init(_t, opts);
        }
    }
}

//
// function closeFilter() {
//     mf.calculateSelected();
// }

let MegaFilter = function () {
};

MegaFilter.prototype = {
    calculateSelected: function () {
        let self = this;
        $('#filter-count').text($('.mfilter-box input[type=radio]:checked, .mfilter-box input[type=checkbox]:checked').length);
    },
    /**
     * Kontener filtrów
     */
    _box: null,

    /**
     * Opcje
     */
    _options: null,

    /**
     * @let int
     */
    _timeoutAjax: null,

    _timeoutSearchFiled: null,

    /**
     * @let string
     */
    _url: null,

    /**
     * Separator URL
     *
     * @let string
     */
    _urlSep: null,

    /**
     * Lista parametrów
     *
     * @let object
     */
    _params: null,

    /**
     * Kontener główny
     *
     * @let jQuery
     */
    _jqContent: null,

    /**
     * Loader
     *
     * @let jQuery
     */
    _jqLoader: null,

    /**
     * ID kontenera głównego
     *
     * @let string
     */
    _contentId: '#content',

    /**
     * Trwa oczekiwanie na odpowiedź serwera
     *
     * @let bool
     */
    _busy: false,

    /**
     * W trakcie ładowania danych z serwra wprowadzono zmiany
     *
     * @let bool
     */
    _waitingChanges: false,

    /**
     * Ostania odpowiedź serwera
     *
     * @let string
     */
    _lastResponse: '',

    _refreshPrice: function () {
    },

    _inUrl: null,

    _isInit: false,

    _cache: null,

    _dataAlias: null,

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Inicjuj klasę
     */
    init: function (box, options) {
        let self = this,
            i;

        if (options.contentSelector)
            self._contentId = options.contentSelector;

        self._jqContent = $(self._contentId);

        if (!self._jqContent.length) {
            self._contentId = '#maincontent';

            self._jqContent = $(self._contentId);
        }

        self._box = box;
        self._options = options;
        self._cache = {
            'lastResponse': {},
            'mainContent': {}
        };

        self.initUrls();

        for (let i in options.params) {
            if (typeof self._params[i] == 'undefined') {
                self._params[i] = options.params[i];
            }
        }

        for (let i in self)
            if (i.indexOf('_init') === 0)
                self[i]();

        self._isInit = true;
        self.calculateSelected();
    },

    initUrls: function (url) {
        let self = this;

        if (typeof url == 'undefined')
            url = document.location.href.split('#')[0];

        self._urlSep = self._parseSep(url).urlSep;
        self._url = self._parseSep(url).url;
        self._params = self._parseUrl(url);
        self._inUrl = self._parseUrl(url);
    },

    _initMfImage: function () {
        let self = this;

        self._box.find('.mfilter-image input').change(function () {
            let s = $(this).is(':checked');

            $(this).parent()[s ? 'addClass' : 'removeClass']('mfilter-image-checked');
        });

        self._box.find('.mfilter-image input:checked').parent().addClass('mfilter-image-checked');
    },

    _initBox: function () {
        let self = this;

        if (self._isInit) return;

        if (self._box.hasClass('mfilter-content_top')) {
            self._box.find('.mfilter-content > ul > li').each(function (i) {
                if (i && i % 4 == 0) {
                    $(this).before('<li style="clear:both; display:block;"></li>')
                }
            });
        }
    },

    encode: function (string) {
        string = string.replace(/,/g, 'LA==');
        string = string.replace(/\[/g, 'Ww==');
        string = string.replace(/\]/g, 'XQ==');

        return string;
    },

    decode: function (string) {
        string = string.replace(/LA==/g, ',');
        string = string.replace(/Ww==/g, '[');
        string = string.replace(/XQ==/g, ']');

        return string;
    },

    _parseSep: function (url) {
        let self = this,
            urlSep = null;

        if (typeof url == 'undefined')
            url = self._url;

        if (url.indexOf('?') > -1) {
            url = url.split('?')[0];
            urlSep = {
                'f': '?',
                'n': '&'
            };
        } else {
            if (!self._options.smp.isInstalled || self._options.smp.disableConvertUrls) {
                url = self.parse_url(url);//.split('&')[0];
                url = url.scheme + '://' + url.host + (url.port ? ':' + url.port : '') + url.path;
                url = url.split('&')[0];
                urlSep = {
                    'f': '?',
                    'n': '&'
                };
            } else {
                url = url.split(';')[0];
                urlSep = {
                    'f': ';',
                    'n': ';'
                };
            }
        }

        return {
            url: url,
            urlSep: urlSep
        };
    },

    /**
     * Inicjuj kontener
     */
    _initContent: function () {
        let self = this;

        self._jqContent
            .css('position', 'relative');
    },

    /**
     * @return {scheme: 'http', host: 'hostname', user: 'username', pass: 'password', path: '/path', query: 'arg=value', fragment: 'anchor'}
     */
    parse_url: function (str, component) {
        let query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
                'relative', 'path', 'directory', 'file', 'query', 'fragment'
            ],
            ini = (this.php_js && this.php_js.ini) || {},
            mode = (ini['phpjs.parse_url.mode'] &&
                ini['phpjs.parse_url.mode'].local_value) || 'php',
            parser = {
                php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
            };

        let m = parser[mode].exec(str),
            uri = {},
            i = 14;
        while (i--) {
            if (m[i]) {
                uri[key[i]] = m[i];
            }
        }

        if (component) {
            return uri[component.replace('PHP_URL_', '')
                .toLowerCase()];
        }
        if (mode !== 'php') {
            let name = (ini['phpjs.parse_url.queryKey'] &&
                ini['phpjs.parse_url.queryKey'].local_value) || 'queryKey';
            parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
            uri[name] = {};
            query = uri[key[12]] || '';
            query.replace(parser, function ($0, $1, $2) {
                if ($1) {
                    uri[name][$1] = $2;
                }
            });
        }
        delete uri.source;
        return uri;
    },

    _parseInfo: function (data) {
        let self = this,
            filters = self.filters(),
            json = $.parseJSON(data);
        this.calculateSelected();
        for (let i in json) {
            switch (i) {
                case 'price' : {
                    let priceRange = self.getPriceRange();

                    if (priceRange.min == self._options.priceMin && priceRange.max == self._options.priceMax) {
                        self._box.find('[id="mfilter-opts-price-min"]').val(json[i].min);
                        self._box.find('[id="mfilter-opts-price-max"]').val(json[i].max);
                    }

                    self._options.priceMin = json[i].min;
                    self._options.priceMax = json[i].max;

                    self._refreshPrice();

                    break;
                }
                case 'attributes' :
                case 'options' :
                case 'manufacturers' :
                case 'stock_status' : {
                    self._box.find('.mfilter-filter-item.mfilter-' + i).each(function () {
                        let $item = $(this),
                            seo = $item.attr('data-seo-name'),
                            base_type = $item.attr('data-base-type'),
                            id = $item.attr('data-id');

                        $item.find('.mfilter-options .mfilter-option').each(function () {
                            let $self = $(this),
                                $input = $self.find('input[type=checkbox],input[type=radio],select'),
                                val = $input.val(),
                                $counter = $(this).find('.mfilter-counter'),
                                text = '',
                                cnt = json[i];
                            if (id && typeof cnt[id] != 'undefined') {
                                cnt = cnt[id];
                            }

                            if (Object.keys(cnt).length) {
                                /* обновляем в фильтре только если пришли его данные в ответ */
                                if ($self.hasClass('mfilter-select')) {
                                    $input.find('option').each(function () {
                                        let id = $(this).attr('id');

                                        if (!id) return;

                                        id = id.split('-').pop();

                                        if (typeof cnt[id] != 'undefined') {
                                            $(this).removeAttr('disabled').html('(' + cnt[id] + ') ' + $(this).val());
                                        } else {
                                            $(this).attr('disabled', true).html('(0) ' + $(this).val());
                                        }
                                    });
                                } else {
                                    let idd = $input.attr('id').split('-').pop();
                                    if (typeof filters[seo] != 'undefined') {
                                        if (filters[seo].indexOf(encodeURIComponent(self.encode(val))) > -1) {
                                            $counter.addClass('mfilter-close');
                                        } else {
                                            if (!$item.hasClass('mfilter-radio') /*&& base_type != 'option'*/)
                                                text += '+';

                                            $counter.removeClass('mfilter-close');
                                        }
                                    } else {
                                        $counter.removeClass('mfilter-close');
                                    }

                                    if (typeof cnt[idd] != 'undefined') {
                                        text += cnt[idd];

                                        $self.removeClass('mfilter-disabled');
                                        $input.attr('disabled', false);
                                    } else {
                                        text = '0';

                                        //if( $counter.hasClass( 'mfilter-close' ) ) {
                                        //	$self.removeClass( 'mfilter-disabled' );
                                        //	$input.attr('disabled', false);
                                        //} else {
                                        $self.addClass('mfilter-disabled');
                                        $input.attr('disabled', true);
                                        //}
                                    }

                                    $counter.text(text);
                                }
                            }
                        });
                    });

                    break;
                }
            }
        }
        /*if (self._options.priceMin == self._options.priceMax){
            $('.mfilter-price').hide();
        } else {
            $('.mfilter-price').show();
        }*/
    },

    _initAlwaysSearch: function () {
        let self = this;

        function search() {
            self._jqContent.find('[name^=filter_],[name=search],[name=category_id],[name=sub_category],[name=description]').each(function () {
                let name = $(this).attr('name'),
                    value = $(this).val(),
                    type = $(this).attr('type');

                if (['checkbox', 'radio'].indexOf(type) > -1 && !$(this).is(':checked'))
                    value = '';

                if (name) {
                    self._inUrl[name] = value;
                    self._params[name] = value;
                }
            });

            self.reload();
            //self.ajax();
        }

        $('#button-search').unbind('click').click(function (e) {
            e.preventDefault();

            search();
        });

        self._jqContent.find('input[name=filter_name],input[name=search]').unbind('keydown').unbind('keyup').bind('keydown', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();

                search();
            }
        });
    },

    __initLoader: function () {
        let self = this;

        self._jqLoader = $('<span style="cursor: wait; z-index: 1; margin: 0; padding: 0; position: absolute; text-align: center; background-color: rgba(242,242,242,0.7);"></span>')
            .prependTo(self._jqContent)
            .html('<img src="/view/theme/brandshop2019/img/icons/preload/preload.svg" width="36" height="36" alt="" style="border-radius:50%; position: fixed; padding:4px; background-color:#FFF" />')
            .hide();
    },

    /**
     * Inicjuj nagłówki
     */
    _initHeading: function () {
        let self = this;

        if (self._box.hasClass('mfilter-content_top'))
            return;

        self._box.find('.mfilter-heading').click(function () {
            let parent = $(this).parent();
            let opts = parent.find('> .mfilter-content-opts');

            if ($(this).hasClass('mfilter-collapsed')) {
                opts.slideDown();
                parent.addClass('active');
                $(this).removeClass('mfilter-collapsed');
            } else {
                opts.slideUp();
                $(this).addClass('mfilter-collapsed');
                parent.removeClass('active');
            }
        });
    },

    /**
     * Inicjuj sposób wyświetlania listy
     */
    _initDisplayListOfItems: function () {
        let self = this;

        self._box.find('.mfilter-filter-item').each(function (i) {
            let _level0 = $(this),
                type = _level0.attr('data-type'),
                mode = _level0.attr('data-display-list-of-items');

            if (!mode)
                mode = self._options.displayListOfItems.type;

            if (type == 'price') return;

            let wrapper = _level0.find('.mfilter-content-wrapper'),
                content = _level0.find('> .mfilter-content-opts'),
                heading = _level0.find('> .mfilter-heading');

            if (!self._box.hasClass('mfilter-content_top') && heading.hasClass('mfilter-collapsed'))
                content.show();

            if (mode == 'scroll') {
                let h = wrapper.outerHeight();
                if (h > self._options.displayListOfItems.maxHeight) {
                    wrapper
                        .attr('id', 'mfilter-content-opts-' + i)
                    //.css('max-height', self._options.displayListOfItems.maxHeight + 'px');

                }
            } else if (mode == 'button_more' && !self._box.hasClass('mfilter-content_top')) {
                let lessHeight = 0,
                    moreHeight = 0,
                    show = false,
                    count = 0;

                _level0.find('.mfilter-option').each(function (i) {
                    let h = $(this).outerHeight(true);

                    moreHeight += h;

                    if (i >= self._options.displayListOfItems.limit_of_items) {
                        lessHeight += h;
                        count++;
                    }
                });

                lessHeight = moreHeight - lessHeight;
                /*
                                if (count) {
                                    wrapper.css('overflow', 'hidden').css('height', lessHeight + 'px');

                                    _level0.find('.mfilter-content-opts').append($('<div>')
                                            .addClass('mfilter-button-more')
                                            .append($('<a>')
                                                .attr('href', '#')
                                                .addClass('mfilter-button-more')
                                                .text(self._options.displayListOfItems.textMore.replace('%s', count))
                                                .bind('click', function () {
                                                    wrapper.animate({
                                                        'height': !show ? moreHeight : lessHeight
                                                    }, 500);

                                                    $(this).text(show ? self._options.displayListOfItems.textMore.replace('%s', count) : self._options.displayListOfItems.textLess);

                                                    show = !show;

                                                    return false;
                                                })
                                        )
                                    );
                                }*/
            }

            if (!self._box.hasClass('mfilter-content_top') && heading.hasClass('mfilter-collapsed'))
                content.hide();
        });
    },

    /**
     *
     */
    _initEvents: function () {
        let self = this;

        function val($input) {
            let val = $input.val(),
                parent = $input.parent().parent();

            if ($input.attr('type') == 'checkbox' || $input.attr('type') == 'radio') {
                val = $input.is(':checked');

                if (!self._options.showNumberOfProducts)
                    parent.find('.mfilter-counter')[val ? 'addClass' : 'removeClass']('mfilter-close');
            }

            parent[val ? 'addClass' : 'removeClass']('mfilter-input-active');
        }

        self._box.find('input[type=checkbox],input[type=radio],select').change(function () {
            self._dataAlias = $(this).attr('data-alias');
            if (self._options['refreshResults'] != 'using_button')
                self.runAjax();
            val($(this));
        });

        self._box.find('.mfilter-option').each(function () {
            let input = $(this).find('input[type=checkbox],input[type=radio]');

            if (!input.length) return;

            $(this).find('.mfilter-counter').bind('click', function () {
                if (!$(this).hasClass('mfilter-close')) return;

                input.attr('checked', false).trigger('change');
                //$(this).removeClass('mfilter-close');
            });

            val(input);
        });

        self._box.find('.mfilter-button a').bind('click', function () {
            if ($(this).hasClass('mfilter-button-reset')) {
                self.resetFilters();
            }

            self.ajax();

            return false;
        });
    },

    /**
     * Uruchom ładowanie
     */
    runAjax: function () {
        let self = this;

        switch (self._options['refreshResults']) {
            case 'using_button' :
            case 'immediately' : {
                self.ajax();

                break;
            }
            case 'with_delay' : {
                if (self._timeoutAjax)
                    clearTimeout(self._timeoutAjax);

                self._timeoutAjax = setTimeout(function () {
                    self.ajax();

                    self._timeoutAjax = null;
                }, self._options['refreshDelay']);

                break;
            }
        }
    },

    /**
     * Pobierz aktualny zakres cen
     */
    getPriceRange: function () {
        let self = this,
            minInput = self._box.find('[id="mfilter-opts-price-min"]'),
            maxInput = self._box.find('[id="mfilter-opts-price-max"]'),
            min = minInput.val(),
            max = maxInput.val();

        if (!/^[0-9]+$/.test(min) || min < self._options.priceMin)
            min = self._options.priceMin;

        if (!/^[0-9]+$/.test(max) || max > self._options.priceMax)
            max = self._options.priceMax;

        return {
            min: parseInt(min),
            max: parseInt(max)
        };
    },

    /**
     * Inicjuj przedział cenowy
     */
    _initPrice: function () {
        let self = this,
            priceRange = self.getPriceRange(),
            filters = self.urlToFilters(),
            minInput = self._box.find('[id="mfilter-opts-price-min"]').bind('change', function () {
                changePrice();
            }).val(filters.price ? filters.price[0] : priceRange.min),
            maxInput = self._box.find('[id="mfilter-opts-price-max"]').bind('change', function () {
                changePrice();
            }).val(filters.price ? filters.price[1] : priceRange.max),
            //slider = self._box.find('[id="mfilter-price-slider"]');
            slider = document.getElementById("mfilter-price-slider");

        self._refreshPrice = function (minMax) {
            let priceRange = self.getPriceRange();

            if (priceRange.min < self._options.priceMin) {
                priceRange.min = self._options.priceMin;
            }

            if (priceRange.max > self._options.priceMax) {
                priceRange.max = self._options.priceMax;
            }

            if (priceRange.min > priceRange.max) {
                priceRange.min = priceRange.max;
            }
        };

        function changePrice() {
            self._refreshPrice(false);
            if (self._options['refreshResults'] != 'using_button')
                self.runAjax();
        }

        $(document).on('blur', '#mfilter-opts-price-max, #mfilter-opts-price-min', function () {
            //$(document).on('change keyup', '#mfilter-opts-price-max, #mfilter-opts-price-min', function(){
            slider.noUiSlider.set([$('#mfilter-opts-price-min').val(), $('#mfilter-opts-price-max').val()]);
        });
        $(document).on('keypress', '#mfilter-opts-price-max, #mfilter-opts-price-min', function (e) {
            if (e.which === 13) {
                changePrice();
            }
        });

        self._refreshPrice(true);
    },

    _initWindowOnPopState: function () {
        let self = this;

        if (self._isInit) return;

        window.onpopstate = function (e) {
            if (e.state) {
                self.initUrls();
                self.setFiltersByUrl();

                self._render(e.state.html, e.state.json, true);
            } else if (typeof self._cache.mainContent[document.location] != 'undefined') {
                self.initUrls();
                self.setFiltersByUrl();

                self._render(self._cache.mainContent[document.location].html, self._cache.mainContent[document.location].json, true);
            }
        }
    },

    setFiltersByUrl: function () {
        let self = this,
            params = self.urlToFilters();

        self.resetFilters();

        self._box.find('li[data-type]').each(function () {
            let _this = $(this),
                type = _this.attr('data-type'),
                seoName = _this.attr('data-seo-name'),
                value = params[seoName];

            if (typeof value == 'undefined')
                return;

            switch (type) {
                case 'stock_status' :
                case 'manufacturers' :
                case 'image' :
                case 'radio' :
                case 'checkbox' : {
                    for (let i in value) {
                        _this.find('input[value="' + value[i] + '"]').attr('checked', true).parent().parent().find('.mfilter-counter').addClass('mfilter-close');
                    }

                    break;
                }
                case 'select' : {
                    _this.find('select option[value="' + value[0] + '"]').attr('selected', true);

                    break;
                }
            }
        });
    },

    /**
     * Pokaż loader
     */
    _showLoader: function () {
        let self = this,
            w = self._jqContent.outerWidth(),
            h = self._jqContent.outerHeight(),
            j = self._jqContent.find('.product-list'),
            k = j.length ? j : self._jqContent.find('.product-grid'),
            l = k.length ? k : self._jqContent,
            t = k.length ? k.offset().top - 150 : l.offset().top;

        if (self._jqLoader == null)
            self.__initLoader();

        self._jqLoader
            .css('width', w + 'px')
            .css('height', h + 'px')
            .fadeTo('normal', 1)
            .find('img')
            /*.css('margin-top', t + 'px');*/
            .css('margin-top', 150 + 'px');

        if (self._options.autoScroll) {
            $('html,body').stop().animate({
                scrollTop: self._jqContent.offset().top + self._options.addPixelsFromTop
            }, 'low', function () {
                self._busy = false;
                self.render();
            });
        } else {
            self._busy = false;
            self.render();
        }
    },

    /**
     * Ukryj loader
     */
    _hideLoader: function () {
        let self = this;

        if (self._jqLoader === null)
            return;

        self._jqLoader.remove();
        self._jqLoader = null;
    },

    /**
     * Pokaż wczytane dane
     */
    render: function (history) {
        let self = this;

        if (self._lastResponse === '' || self._busy)
            return;

        self._hideLoader();

        // usuń wszystkie linki do skryptów JS
        self._lastResponse = self._lastResponse.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        let tmp = $('<tmp>').html(self._lastResponse),
            content = tmp.find(self._contentId), // znajdź treść główną
            json = self._options.showNumberOfProducts ? tmp.find('#mfilter-json') : null; // informacje JSON zawierające dane o ilości produktów wg kategorii

        if (!content.length)
            content = tmp.find('#mfilter-content-container');

        if (content.length) {
            let styles = self._jqContent.html().match(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi);

            if (styles != null && styles.length) {
                for (let i in styles)
                    $('head:first').append(styles[i]);
            }

            self._render(content.html(), self._options.showNumberOfProducts && json && json.length ? json.html() : null, history);

            self._lastResponse = '';
        } else {
            self.reload();
        }
    },

    _render: function (html, json, history) {
        let self = this;
        if (json) {
            self._parseInfo(json);
        }

        self._jqContent.html(html);

        if (history !== true) {
            try {
                window.history.pushState({
                    'html': html,
                    'json': json
                }, '', self.createUrl());
            } catch (e) {
            }
        }

        if (self._box.hasClass('mfilter-content_top')) {
            self._jqContent.prepend(self._box.removeClass('init'));
            self.init(self._box, self._options);
        }

        if (typeof display == 'function') {
            if (typeof $.totalStorage == 'function' && $.totalStorage('display')) {
                display($.totalStorage('display'));
            } else if (typeof $.cookie == 'function' && $.cookie('display')) {
                display($.cookie('display'));
            } else {
                display('list');
            }
        }

        for (let i in self) {
            if (i.indexOf('_initAlways') === 0 && typeof self[i] == 'function')
                self[i]();
        }

        // Support for Product Quantity Extension (15186)
        if (typeof pq_initExt == 'function')
            pq_initExt();


        $('.mfilter-filter-item:not(.mfilter-price)').each(function () {
            $('.mfilter-option:not(.mfilter-disabled)', this).length > 1 ? $(this).show() : $(this).hide();
        });
    },

    /**
     * Załaduj dane
     */
    ajax: function () {
        let self = this;

        if (self._busy) {
            self._waitingChanges = true;

            return;
        }

        let url = self.createUrl(),
            cname = url + self._options.idx;


        self._busy = true;
        self._lastResponse = '';
        self._showLoader();

        if (typeof self._params['page'] != 'undefined')
            delete self._params['page'];

        if (typeof self._cache.lastResponse[cname] != 'undefined') {
            self._lastResponse = self._cache.lastResponse[cname];

            setTimeout(function () {
                self._busy = false;
                self.render();
            }, 100);

            return;
        }

        $.ajax({
            'type': 'GET',
            'url': url,
            'timeout': 10 * 1000,
            'cache': false,
            'data': {
                'mfilterAjax': '1',
                'mfilterIdx': self._options.idx
            },
            'success': function (response) {
                self._busy = false;

                if (response) {
                    self._lastResponse = response;
                    self._cache.lastResponse[cname] = response;
                    self.render();

                    if (self._waitingChanges) {
                        self._waitingChanges = false;
                        self.ajax();
                    }
                    $('img').one('load', function () {
                        window.retinajs();
                    });
                } else {
                    self.reload();
                }

            },
            'error': function () {
                self.reload();
            }
        });
    },

    /**
     * Utwórz pełny adres URL
     */
    createUrl: function (url, attribs) {
        let self = this,
            params = self.paramsToUrl(url, attribs),
            filters = self.filtersToUrl(),
            urlSep = self._urlSep;
        if (typeof url == 'undefined') {
            url = self._url;
        } else {
            urlSep = self._parseSep(url.split('#')[0]).urlSep;
            url = self._parseSep(url.split('#')[0]).url;
        }

        if (params || filters) {
            url += urlSep.f;

            if (params) {
                url += params;
            }

            if (filters) {
                if (params) {
                    url += urlSep.n;
                }

                url += 'mfp' + (urlSep.n == '&' ? '=' : urlSep.n) + filters;
            }
        }

        return url;
    },

    /**
     * Sprawdź poprawność wpisanego zakresu cen
     *
     * @return bool
     */
    _validPrice: function (min, max) {
        let self = this;

        min = parseInt(min);
        max = parseInt(max);

        if (min < self._options.priceMin)
            return false;

        if (max > self._options.priceMax)
            return false;

        if (min > max)
            return false;

        if (min == max && min == self._options.priceMin && max == self._options.priceMax)
            return false;

        return true;
    },

    /**
     * Przekształć parametry z adresu URL na obiekt
     *
     * @return object
     */
    urlToFilters: function () {
        let self = this,
            params = {};

        if (!self._params.mfp)
            return params;

        self._params.mfp = decodeURIComponent(self._params.mfp);

        let matches = self._params.mfp.match(/[a-z0-9\-_]+\[[^\]]+\]/g);

        if (!matches)
            return params;

        for (let i = 0; i < matches.length; i++) {
            let key = matches[i].match(/([a-z0-9\-_]+)\[[^\]]+\]/)[1],
                val = matches[i].match(/[a-z0-9\-_]+\[([^\]]+)\]/)[1].split(',');

            switch (key) {
                case 'price' : {
                    if (typeof val[0] != 'undefined' && val[1] != 'undefined') {
                        if (self._validPrice(val[0], val[1]))
                            params[key] = val;
                    }

                    break;
                }
                default : {
                    params[key] = val;
                }
            }
        }
        return params;
    },

    resetFilters: function () {
        let self = this;

        self._box.find('li[data-type]').each(function () {
            let _this = $(this),
                type = _this.attr('data-type');

            switch (type) {
                case 'image' : {
                    _this.find('input[type=checkbox]:checked,input[type=radio]:checked').attr('checked', false).parent().removeClass('mfilter-image-checked');

                    break;
                }
                case 'stock_status' :
                case 'manufacturers' :
                case 'checkbox' :
                case 'radio' : {
                    _this.find('input[type=checkbox]:checked,input[type=radio]:checked').prop('checked', false);
                    break;
                }
                case 'search' : {
                    _this.find('input[id="mfilter-opts-search"]').val('');

                    break;
                }
                case 'price' : {
                    /*_this.find('input[id="mfilter-opts-price-min"]').val(self._options.priceMin);
                    _this.find('input[id="mfilter-opts-price-max"]').val(self._options.priceMax);
                    _this.find('[id="mfilter-price-slider"]').each(function () {
                        $(this).slider('option', 'min', self._options.priceMin);
                        $(this).slider('option', 'max', self._options.priceMax);
                        $(this).slider('option', 'values', [self._options.priceMin, self._options.priceMax]);
                        $(this).slider('value', $(this).slider('value'));
                    })*/

                    break;
                }
                case 'select' : {
                    _this.find('select option').removeAttr('selected');
                    _this.find('select option:first').attr('selected', true);
                    _this.find('select').prop('selectedIndex', 0);

                    break;
                }
            }
        });
    },

    /**
     * Pobierz aktualne wartości filtrów
     *
     * @return object
     */
    filters: function () {
        let self = this,
            params = {},
            stockStatusExist = self._box.find('li[data-type="stock_status"]').length ? true : false;

        self._box.find('li[data-type]').each(function () {
            let _this = $(this),
                type = _this.attr('data-type'),
                seoName = _this.attr('data-seo-name');

            switch (type) {
                case 'stock_status' :
                case 'manufacturers' :
                case 'image' :
                case 'checkbox' : {
                    _this.find('input[type=checkbox]:checked').each(function () {
                        if (typeof params[seoName] == 'undefined')
                            params[seoName] = [];

                        params[seoName].push(encodeURIComponent(self.encode($(this).val())));
                    });

                    break;
                }
                case 'radio' : {
                    _this.find('input[type=radio]:checked').each(function () {
                        params[seoName] = [encodeURIComponent(self.encode($(this).val()))];
                    });

                    break;
                }
                case 'price' : {
                    let priceRange = self.getPriceRange();

                    if (priceRange.min != self._options.priceMin || priceRange.max != self._options.priceMax) {
                        if (self._validPrice(priceRange.min, priceRange.max))
                            params[seoName] = [priceRange.min, priceRange.max];
                    }

                    break;
                }
                case 'search' : {
                    _this.find('input[id="mfilter-opts-search"]').each(function () {
                        if ($(this).val() !== '') {
                            params[seoName] = [encodeURIComponent(self.encode($(this).val()))];
                        }
                    });

                    break;
                }
                case 'select' : {
                    _this.find('select').each(function () {
                        if ($(this).val())
                            params[seoName] = [encodeURIComponent(self.encode($(this).val()))];
                    });

                    break;
                }
            }
        });

        // sprawdź czy domyślnie powinna być zaznaczona opcja "in stock"
        if (self._options.inStockDefaultSelected && typeof params['stock_status'] == 'undefined') {
            params['stock_status'] = stockStatusExist ? [] : [self._options.inStockStatus];
        }

        return params;
    },

    /**
     * Utwórz URL na podstawie parametrów
     */
    filtersToUrl: function () {
        let self = this,
            url = '',
            params = self.filters();
        for (let i in params) {
            url += url ? ',' : '';
            url += '' + i + '[' + params[i].join(',') + ']';
        }

        return url;
    },

    /**
     * Przekształć parametry na adres URL
     *
     * @return string
     */
    paramsToUrl: function (url, attribs) {
        let self = this,
            str = '',
            params = typeof url == 'undefined' ? self._params : self._parseUrl(url, attribs),
            urlSep = typeof url == 'undefined' ? self._urlSep : self._parseSep(url).urlSep;

        for (let i in params) {
            if (['mfilter-ajax', 'mfp'].indexOf(i) > -1) continue;
            if (typeof url == 'undefined' && typeof self._inUrl[i] == 'undefined') continue;

            str += str ? urlSep.n : '';
            str += i + (urlSep.n == '&' ? '=' : urlSep.n) + params[i];
        }

        return str;
    },

    /**
     * @param url string
     * @param attribs object
     * @return object
     */
    _parseUrl: function (url, attribs) {
        if (typeof attribs != 'object')
            attribs = {
                'mfilter-ajax': '1'
            };

        if (typeof url == 'undefined')
            return attribs;

        let self = this,
            params, i, name, value, param;

        url = url.split('#')[0];

        if (url.indexOf('?') > -1 || url.indexOf('&') > -1) {
            params = typeof self.parse_url(url).query != 'undefined' ? self.parse_url(url).query.split('&') : url.split('&');//( url.indexOf( '?' ) > -1 ? url.split('?')[1] : url ).split('&');

            for (i = 0; i < params.length; i++) {
                if (params[i].indexOf('=') < 0) continue;

                param = params[i].split('=');
                name = param[0];
                value = param[1];

                if (!name) continue;

                attribs[name] = value;
            }
        } else {
            params = url.split(';');
            name = null;

            for (i = 1; i < params.length; i++) {
                if (name === null)
                    name = params[i];
                else {
                    attribs[name] = params[i];
                    name = null;
                }
            }
        }

        return attribs;
    },

    /**
     * Przeładuj stronę
     */
    reload: function () {
        let self = this;

        window.location.href = self.createUrl();
    }
};