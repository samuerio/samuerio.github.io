/**
 *  目录滚动监听的Jquery插件
 *  Licensed under the MIT license
 *
 *  Author: zhenghe39@gmail.com
 *  Usage:
 *      事件:
     *      scrollNav,
     *      CallBack($curNavItem{当前激活的目录项元素},$navMenu{目录元素},curNavItemHeight{当前激活的目录项元素的高度},curNavItemTop{当前激活的目录项元素距离父元素顶端的距离})
     *      Note:由于在JQuery中,当父元素被隐藏,那么子元素的height()的值就会变为0,故保存NavItem高度curNavItemHeight. curNavItemTop也是同理
 *
 *      自定义配置属性:
 *          activeClass:激活的目录项元素Class,默认值为'active'
 *          fixOffsetClass:目录元素当被滚动轴给滚动覆盖时,会被添加的固定位置的类,默认值为'nav-fix',需使用者提供这样的类
                                                                                         * eg:
                                                                                         * .nav-fix{
                                                                                         *      position: fixed,
                                                                                         *      top: $fixOffset
                                                                                         *  }
                                                                                         *  进行导航目录的固定
 *          distinguishLineScale: 判别目录区域是否到达,以进行激活导航目录项的基准线(百分比类型,以当前窗口作为衡量标准,
 *                 eg.1/2代表当前窗口的中间线作为基准线).默认值为0,即代表以窗口顶端的线作为基准线
 *
 *
 */

+(function($){
    $.extend($.fn,{
        spyNavMenu:function(options){
            var navMenu = new $.NavMenu(options,this[0]);
            return navMenu;
        }
    });

    //NavMenu Creator
    $.NavMenu = function(options,navEle){
        this.settings = $.extend({}, $.NavMenu.defaults,options);
        this.eventLoop =$.extend({}, options.events);
        delete options.events;
        this.navEle = navEle;
        this.init();
    }

    $.extend($.NavMenu,{
        Events:{
            scrollNav:'scrollNav'
        },
        defaults:{
            activeClass:'active',
            fixOffsetClass:'nav-fix',
            distinguishLineScale:1/2,//基准线的比例值,默认为0.5,即当前窗口的中间线
            events:{}
        },
        prototype:{
            init:function(){
                var _self = this
                var navEle = _self.navEle;

                _self._navSectionInfos = _self._getNavSectionInfos(navEle);
                _self._navTopOffset = $(_self.navEle).offset().top;
                _self._listener().scrollEvent();
                $(window).on('scroll',_self._listener().scrollEvent)
            },
            /**
             * Event listeners
             * @returns {{scrollEvent: scrollEvent}}
             * @private
             */
            _listener:function(){
                var _self = this;
                return {
                    /**
                     * Window Scroll Event
                     * @param event
                     */
                    scrollEvent:function(event){
                        var navTopOffset = _self._navTopOffset;
                        var scrollDistance = $(this).scrollTop();

                        //Note: Nav fixed
                        var navEle = _self.navEle;
                        var fixOffsetClass = _self.settings.fixOffsetClass;
                        if(scrollDistance >= navTopOffset){
                            $(navEle).addClass(fixOffsetClass);
                        }else{
                            $(navEle).removeClass(fixOffsetClass);
                        }

                        //Note: distinguish line
                        //默认基准判别线为0*windowHeight,即Window顶端
                        var distinguishLineOffset = _self.settings.distinguishLineScale*$(window).height()+$(window).scrollTop();

                        var activeClass = _self.settings.activeClass;
                        $(_self.navEle).find('.'+activeClass).removeClass(activeClass)
                        $('.highlight-title').hide();

                        var curNavSectionInfo = _self._getCurNavSectionInfo(_self._navSectionInfos,distinguishLineOffset);
                        curNavSectionInfo && curNavSectionInfo.$navMenuItem.addClass(activeClass);
                        //执行用户自定义scroolNav事件
                        _self.eventLoop[$.NavMenu.Events.scrollNav] &&
                                    _self.eventLoop[$.NavMenu.Events.scrollNav](curNavSectionInfo && curNavSectionInfo.$navMenuItem,$(_self.navEle),
                                        curNavSectionInfo && curNavSectionInfo.navMenuItemHeight,curNavSectionInfo && curNavSectionInfo.navMenuItemTop)

                    }
                }
            },
            /**
             * Get NavSection PositionInfo
             * @param navEle
             * @returns {Array}
             * @private
             */
            _getNavSectionInfos:function(navEle){
                var navSectionInfo = [];

                $(navEle).find('a').each(function(){
                    var sectionId = $(this).attr('href').split('#')[1];

                    navSectionInfo.push({
                        id:sectionId,
                        offsetTop:$('#'+sectionId).offset().top,
                        $navMenuItem:$(this).parent(),
                        navMenuItemHeight:$(this).parent().height(),
                        navMenuItemTop:$(this).parent().position().top
                    });
                });

                return navSectionInfo;
            },
            /**
             * Get Current NavSectionInfo
             * @param navSectionInfos
             * @param distinguishLineOffset
             * @returns {*}
             * @private
             */
            _getCurNavSectionInfo:function(navSectionInfos,distinguishLineOffset){
                var curNavSectionInfo = null;

                var navSectionCount = navSectionInfos && navSectionInfos.length;
                if(navSectionCount){
                    if(1 === navSectionCount){
                        if(distinguishLineOffset >= navSectionInfos[0].offsetTop){
                            curNavSectionInfo = navSectionInfos[0];
                        }
                    }else{
                        $.each(navSectionInfos,function(idx,navSectionInfo){
                            if(idx !== navSectionCount-1){
                                var nextNavSectionInfo = navSectionInfos[idx+1];
                                if(navSectionInfo.offsetTop<= distinguishLineOffset
                                    && distinguishLineOffset < nextNavSectionInfo.offsetTop){
                                    curNavSectionInfo = navSectionInfo;
                                    return false;
                                }
                            }else{
                                if(navSectionInfo.offsetTop<= distinguishLineOffset){
                                    curNavSectionInfo = navSectionInfo;
                                    return false;
                                }
                            }
                        });
                    }
                }

                return curNavSectionInfo;
            },
            /**
             * 对外提供的事件绑定入口
             */
            on:function(eventType,callBack){
                this.eventLoop[eventType] = callBack;
            }
        }
    });




})(jQuery)