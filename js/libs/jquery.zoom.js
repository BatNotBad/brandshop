(function ($) {
    $.fn.zoom = function (options) {
        let defaults = {
            container: $('#zoom'),
            initEvent: 'mouseenter',
            eventDisable: null,
            fade: true
        };
        let s = $.extend({}, defaults, options);

        return this.each(function () {
            if (!$('#zoom-overlay').length) {
                $(document.body).append('<div id="zoom-overlay"/>');
            }
            let o = {
                active: false,
                scale: {
                    x: 0,
                    y: 0
                },
                overlay: $('#zoom-overlay')
            };
            let _ = $(this);

            if (s.initEvent.indexOf('click') !== -1) {
                o.overlay.on('click', destroy);
            }

            if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                this.addEventListener(s.initEvent, init, false);
            }

            function init(event) {

                if (o.active) return;
                _.trigger('init');
                let img = $('<img>').attr({
                    'src': (_.attr('data-zoom-src')),
                    'data-rjs': (_.attr('data-zoom-rjs-src'))
                });
                img.one('load', function () {
                    s.container.removeClass('loading');
                    document.addEventListener('mousemove', move, false);

                    s.container.width(s.container.parent().outerWidth());
                    s.container.height(s.container.parent().outerHeight());

                    o.scale.x = s.container.width() / $(this).width();
                    o.scale.y = s.container.height() / $(this).height();
                    o.overlay
                        .width(_.width() * o.scale.x)
                        .height(_.height() * o.scale.y)
                        .fadeIn('fast');

                    s.container.parent().css({'background': 'transparent'});
                    retinajs();
                });
                s.container.empty().addClass('loading').append(img);
                o.active = true;
                if (s.fade) {
                    s.container.fadeIn('fast', function () {
                        s.container.addClass('active');
                    });
                } else {
                    s.container.addClass('active');
                }
            }

            function move(e) {
                setTimeout(function () {
                    if (!o.active) return;
                    let mouseOnImage = {
                        x: e.pageX - _.offset().left,
                        y: e.pageY - _.offset().top
                    };
                    if (mouseOnImage.x < 0 || mouseOnImage.y < 0 || mouseOnImage.x > _.width() || mouseOnImage.y > _.height()) {
                        destroy();
                        return;
                    }
                    let percX = (mouseOnImage.x - o.overlay.width() / 2) / (_.width() - o.overlay.width());
                    let percY = (mouseOnImage.y - o.overlay.height() / 2) / (_.height() - o.overlay.height());
                    if (percX < 0) percX = 0;
                    else if (percX > 1) percX = 1;
                    if (percY < 0) percY = 0;
                    else if (percY > 1) percY = 1;
                    let pos = {
                        x: percX * (_.width() - o.overlay.width()) + _.offset().left,
                        y: percY * (_.height() - o.overlay.height()) + _.offset().top
                    };
                    let zoomImgPos = {
                        x: -(s.container.width() / o.scale.x - s.container.width()) * percX,
                        y: -(s.container.height() / o.scale.y - s.container.height()) * percY
                    };
                    o.overlay.css('transform', 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0px)');
                    $('img', s.container).css('transform', 'translate3d(' + zoomImgPos.x + 'px,' + zoomImgPos.y + 'px,0px)');
                }, 0);
            }

            function destroy() {
                if (o.active) {
                    _.trigger('destroy');
                    document.removeEventListener('mousemove', move, false);
                    o.active = false;
                    o.overlay.fadeOut('fast');
                    s.container.removeClass('active');
                    s.container.parent().css({'background': '#ffffff'});
                    if (s.fade) {
                        s.container.fadeOut('fast', function () {
                            $(this).empty();
                        });
                    }
                }
            }

        });
    };
}(jQuery));