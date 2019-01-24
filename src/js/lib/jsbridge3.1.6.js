(function(win) {

    function isIOS() {
        return navigator.userAgent.match(/(iPad|iPhone)/);
    }

    function connectWebViewJavascriptBridge(callback) {

        if (window.WebViewJavascriptBridge) {
            typeof callback === 'function' && callback.call(this, WebViewJavascriptBridge);
        } else {
            document.addEventListener(
                'WebViewJavascriptBridgeReady',
                function() {
                    typeof callback === 'function' && callback.call(this, WebViewJavascriptBridge);
                },
                false
            );
        }
    }

    /**
     * @func
     * @desc IOS js调用native插件
     * @param {string} method - 插件名称
     * @param {object} params - 是传入参数对象,
     * @param {object} callback - 回调函数
     */
    function iosHandler(method, param, callback) {
        typeof method === 'function' && method.apply(this, [param, function(respones) {
            typeof callback && callback.call(this, respones);
        }]);

    }
    /**
     * @func
     * @desc Android js调用native插件
     * @param {string} method - 插件名称
     * @param {object} params - 是传入参数对象,
     * @param {object} callback - 回调函数
     */

    function androidHandler(method, param, callback) {

        win.WebViewJavascriptBridge.callHandler(
            method, param,
            function(responseData) {
                typeof callback === 'function' && callback.apply(this, arguments);
            }
        );
    }
    /**
     * @func
     * @desc 版本对比 对比v1版本是否>=v2
     * @param {string} v1 - 需要对比的版本 例：4.0.0
     * @param {string} v2 - 被对比的版本 例：3.9.9
     */
    function compareVersion(v1, v2) {
        var arr = v1 && v1.split(".");
        var list = v2 && v2.split(".");
        if (!arr || !list) return;

        var i = 0;
        var arrlength = arr.length;
        var listlength = list.length;
        var length = arrlength > listlength ? arrlength : listlength; //取最长的数组长度
        var isEqual = false;
        var item1 = "";
        var item2 = "";
        for (; i < length; i++) {
            item1 = Number(arr[i]);
            item2 = Number(list[i]);

            item1 = isNaN(item1) ? 0 : item1;
            item2 = isNaN(item2) ? 0 : item2;
            if (i == length - 1)
                isEqual = item1 === item2; //是否包含等于

            if (item1 > item2 || isEqual) {
                return true;
            } else if (item1 < item2) {
                return false
            }
        }
        return false;
    }

    function values(obj) {
        var vals = [];

        for (var key in obj) {
            vals.push(obj[key]);
        }

        return vals;
    }

    function caller(method, params, callback, isJson) {

        try {
            if (isIOS()) {
                var params = params || undefined;
                if (isJson) {

                    iosHandler(method, params ? params : null, callback)
                } else {
                    params = values(params ? params : {});
                    typeof method === 'function' && method.apply(this, params.length === 0 ? undefined : params);
                }
            } else {
                androidHandler(method, params ? params : null, callback);
            }
        } catch (e) {
            console.info("不支持jsbridge", e);
        }
    }


    var Jsbridge = function() {};
    Jsbridge.prototype = {
        // 跳转到注册
        toAppRegister: function() {
            var method = isIOS() ? ToAppRegister : 'ToAppRegister';
            caller(method, null);
        },
        //跳转到登录
        toAppLogin: function() {
            var method = isIOS() ? ToAppLogin : 'ToAppLogin';
            caller(method, null);
        },
        // 返回首页
        toAppMainPage: function() {
            var method = isIOS() ? ToAppHomePage : 'ToAppHomePage';
            caller(method, null);

        },
        //首页-团贷公告列表
        // toAppPublicNoticeList: function() {
        //     var method = isIOS() ? ToAppPublicNoticeList : 'ToAppPublicNoticeList';
        //     caller(method, null);
        // },
        //首页-个人消息列表
        // toAppSystemMessagesList: function() {
        //     var method = isIOS() ? ToAppSystemMessagesList : 'ToAppSystemMessagesList';
        //     caller(method, null);
        // },
        //团贷签到
        toAppSignIn: function() {
            var method = isIOS() ? ToAppSignIn : 'ToAppSignIn';
            caller(method, null);
        },
        //团贷公告详情
        /*
            id: 公告id
            url: 公告链接 如果有值表示跳转到该url地址的h5页面，否则跳转到原生页面,
            title: 公告标题 目标页面标题
        */
        toAppPublicNoticeDetails: function(id, url, title) {
            var reqParam = {
                'id': id,
                'url': url,
                'title': title
            };
            var method = isIOS() ? ToAppPublicNoticeDetails : 'ToAppPublicNoticeDetails';
            caller(method, reqParam);
        },
        //系统消息详情
        /*
            id: 系统消息id
            url: 如果有值表示跳转到该url地址的h5页面，否则跳转到原生页面,
            title: 目标页面标题
        */
        toAppSystemMessagesDetails: function(id, url, title) {
            var reqParam = {
                'id': id,
                'url': url,
                'title': title
            };
            var method = isIOS() ? ToAppSystemMessagesDetails : 'ToAppSystemMessagesDetails';
            caller(method, reqParam);
        },
        //投资-自动投标服务
        toAppP2p: function() {
            var method = isIOS() ? ToAppP2p : 'ToAppP2p';
            caller(method, null);
        },
        // 跳转到WE计划项目详情
        /**
            productId: string 标id
            typeId: 标类型 100：自动投标服务
            weXPlanType: 0：普通WE计划 1：WE分期宝 2：复投宝 3:复投宝新手标 4：速盈宝
            subTypeId： 非必要参数
            title：非必要参数
        */
        toAppWePlanDetail: function(productId, typeId, subTypeId, weXPlanType, title) {
            var wxInvestParam = {
                'ProductId': productId,
                'TypeId': typeId,
                'SubTypeId': subTypeId,
                'TDWeXPlanType': weXPlanType,
                'Title': title
            };
            var method = isIOS() ? ToAppWePlanDetails : 'ToAppWePlanDetails';
            caller(method, wxInvestParam);
        },
        // 跳转到散标项目详情(底标项目详情) (531无法跳转)
        /**
            id: string 标id
            typeId: int 标类型 1：商友贷 3：零售贷 6：净值标  7：股权抵押标 9：车贷 11：房贷 15：分期宝 19：供应链(电商融资) 20：供应链 24：分期宝（项目集类型 消费金融）25：分期宝（项目集类型 小贷业务） 26：分期宝（项目集类型 车贷业务）27：分期宝（你我金融----话费分期）28：分期宝（项目集类型 快来贷）29：沐金农 31：分期宝（项目集类型，拿下分期）32：有信贷33：分期宝（项目集类型，正合循环借）34：新房贷 35：小派钱包 投即计息 36：三农金融（农饲贷）39：车全业务 41：二手车商 42：正好有钱（正合业务）51：商贸贷 52：商贸贷共借标 53：业主贷 54：业主贷共借标 55：家装分期 56：俊拓新供应链 58：医疗分期

            subTypeId String 子类型 当typeId == 15时才有值，其他传0 1：普通分期 2：分期乐 3、4、5：小树时代

            ProfitTypeId： int 收益类型 1-浮动 2-固定 （非必要参数）
            XmbSubType： boolean 项目宝子类型  0-默认值 1-私募股权2-房地产3-其它 （非必要参数）
        */

        toAppInvestDetails: function(id, typeId, subTypeId, profitTypeId, xmbSubType) {
            var investParam = {
                'Id': id,
                'TypeId': typeId,
                'SubTypeId': subTypeId,
                'ProfitTypeId': profitTypeId,
                'XmbSubType': xmbSubType
            };
            var method = isIOS() ? ToAppScatteredDetails : 'ToAppScatteredDetails';
            caller(method, investParam);
        },
        //我-投资记录-自动投标服务投资详情（531无法跳转）
        /**
            investId: string 投资id
            type: int 标类型 100：we计划
            weXPlanType: int 计划子类型 0：普通WE计划 1：WE分期宝 2：复投宝 3：复投宝新手标 4：速盈宝

            projectId: 项目id 非必要参数
            profitTypeId：非必要参数
            isWePlanX：是否为we计划X 非必要参数
            subTypeId：项目类型子id 非必要参数
            title：非必要参数
        */
        toAppMyInvestWePlanDetails: function(projectId, type, investId, profitTypeId, isWePlanX, subTypeId, weXPlanType, title) {
            var param = {
                'ProjectId': projectId,
                'Type': type,
                'InvestId': investId,
                'ProfitTypeId': profitTypeId,
                'IsWePlanX': isWePlanX,
                'subTypeId': subTypeId,
                'TDWeXPlanType': weXPlanType,
                'Title': title
            };
            var method = isIOS() ? ToAppMyInvestWePlanDetails : 'ToAppMyInvestWePlanDetails';
            caller(method, param);
        },

        // 我-投资记录-优质项目/底标-投资详情（531无法跳转）
        /**
            investId: String 投资id
            type: int 标类型 1:商友贷 2:商贸联保贷(del) 3:零售贷 4:部分担保贷(del) 5:团贷宝 6:净值标 7:股权抵押标 8:信用贷款标(del) 9:车贷 10:消费贷 11:房贷 12:房宝宝 13:新手投资 15:分期宝 16:股票质押 18:私募宝 19:供应链(电商融资) 20:供应链 22:项目宝（固定期限）23:项目宝（浮动期限）24:分期宝（项目集类型 消费金融）25:分期宝（项目集类型 小贷业务）26:分期宝（项目集类型 车贷业务）27:分期宝（你我金融----话费分期）28:分期宝（项目集类型 快来贷）29：沐金农 31:分期宝（项目集类型，拿下分期）32:有信贷 33：分期宝（项目集类型，正合循环借）34：新房贷35：小派钱包 投即计息 36：三农金融（农饲贷）39:车全业务 41:二手车商 42：正好有钱（正合业务）51:商贸贷 52：商贸贷共借标 53:业主贷 54：业主贷共借标 55：家装分期 56：俊拓新供应链 58：医疗分期 99:债权转让
            subTypeId: int 子类型 当typeId == 15时才有值，其他传0  1：普通分期宝 2：分期乐 3、4、5：小树时代
            profitTypeId： int 计划子类型

            projectId：非必要参数
            isWePlanX： 非必要参数
            weXPlanType：非必要参数
            title： weXPlanType：非必要参数
        */
        toAppMyInvestDetail: function(projectId, type, investId, profitTypeId, isWePlanX, subTypeId, weXPlanType, title) {
            var investParam = {
                'ProjectId': projectId,
                'Type': type,
                'InvestId': investId,
                'ProfitTypeId': profitTypeId,
                'IsWePlanX': isWePlanX,
                'SubTypeId': subTypeId,
                'TDWeXPlanType': weXPlanType,
                'Title': title
            }
            var method = isIOS() ? ToAppMyInvestmentDetails : 'ToAppMyInvestmentDetails';
            caller(method, investParam);
        },
        //我-周转管理-我的周转-发起记录-发起详情（531无法跳转）
        /**
            projectId: String 标id
            type: int 标类型 6:净值标 7:股权抵押标
            subTypeId 子类型 传0

            investId：非必要参数
            profitTypeId：非必要参数
            isWePlanX： 非必要参数
        */
        toAppMyBorrowingDetails: function(projectId, type, investId, profitTypeId, isWePlanX, subTypeId) {
            var investParam = {
                'ProjectId': projectId,
                'Type': type,
                'InvestId': investId,
                'ProfitTypeId': profitTypeId,
                'IsWePlanX': isWePlanX,
                'SubTypeId': subTypeId
            };
            //531 android已删除该方法
            var method = isIOS() ? ToAppMyBorrowingDetails : 'ToAppMyBorrowingDetails';
            caller(method, investParam);
        },
        //活动分享
        /*
        params(json):
        {
            shareTypeList: [{
                ShareToolType: 分享类型 1-微信分享 2-短信分享 3-微博分享 4-QQ分享 5-朋友圈分享 6-QQ空间分享 7-二维码 8-复制链接 9-一键分享 11-小程序分享
                ShareToolName: 第三方的产品名称， 如微信
                IconUrl: 图片地址
                Title: 标题
                ShareContent: 分享文本内容(微信朋友圈取ShareContent显示内容，不是取title)
                ShareUrl: 分享地址
                IsEnabled: 是否启用 true： 启用 False： 未启用
                WebPageUrl: 分享小程序时，兼容低版本的网页链接
                Path: 小程序页面路径
                SmallProgramID: 小程序id
            }]
        }
        callback: 分享回调 返回参数：成功-onComplete，失败-onError，取消-onCancel

        */
        toAppWebViewShare: function(params, callback) {
            var method = isIOS() ? ToAppWebViewShare : 'ToAppWebViewShare';
            caller(method, params, callback, true);
            typeof callback === 'function' && this.registeEvent('RightButtonClick', callback);
        },
        //电话客服
        toAppCallService: function() {
            var method = isIOS() ? ToAppIosCallService : 'ToAppCallService';
            caller(method, null);
        },
        //人工客服
        toAppOnlineService: function() {
            var method = isIOS() ? ToAppIosOnlineService : 'ToAppOnlineService';
            caller(method, null);
        },
        //webview播放视频
        /*
            screentype: int 1横屏 2竖屏
            videoUrl: string 视频播放地址
        */
        toAppViedoWebView: function(screentype, videoUrl) {
            var params = {
                'screentype': screentype,
                'videoUrl': videoUrl
            };
            var method = isIOS() ? ToAppViedoWebView : 'ToAppViedoWebView';
            caller(method, params);
        },
        //P2P-债权转让项目详情（531无法跳转）
        /**
            id: string 标id
            typeId: int 99：债权转让
            subTypeId: string 传0
        */
        toAppBondsTransferDetails: function(id, typeId, subTypeId) {
            var param = {
                'Id': id,
                'TypeId': typeId,
                'SubTypeId': subTypeId
            };
            var method = isIOS() ? ToAppBondsTransferDetails : 'ToAppBondsTransferDetails';
            caller(method, param);
        },

        //关闭页面
        closeWeb: function() {
            var method = isIOS() ? CloseWeb : 'CloseWeb';
            caller(method, null);
        },
        appPlayMusic: function(musicUrl, isPlayLoop) {
            var param = {
                'url': musicUrl,
                'isPlayLoop': isPlayLoop
            };
            var method = isIOS() ? ToAppIosPlayMusic : 'WebViewOnPlayMusic';
            caller(method, param);
        },
        appStopMusic: function() {
            var method = isIOS() ? ToAppIosStopMusic : 'WebViewOnPauseMusic';
            caller(method, null);
        },
        //设置原生标题栏文字及右侧按钮
        /*
                titleContent 标题栏内容
                rightbuttonVisible 右侧按钮是否显示
                rightbuttonContent 右侧按钮内容
                rightbuttonTyppe 右侧按钮类型（ 1: 分享 2: 调用js事件） 为2时，点击按钮触发rightBtnCb 类型为1时不传shareTypeList参数默认为分享邀请好友
                shareTypeList: 分享列表（array）
                showTitleComponent: 是否显示标题栏 Boolean true为显示， false为不显示
                rightBtnCb: 右侧按钮回调函数，rightbuttonTyppe为1则为分享成功后的回调
                */
        setTitleComponent: function(params) {
            var _params = {
                'titleContent': '',
                'rightbuttonVisible': false,
                'rightbuttonContent': '',
                'rightbuttonTyppe': 2,
                'showTitleComponent': true,
                'shareTypeList': [],
                'rightBtnCb': null
            }
            _params = $.extend(_params, params);
            //修正rightbuttonTyppe单词拼写错误的传值
            _params.rightbuttonType && (_params.rightbuttonTyppe = _params.rightbuttonType);

            var method = isIOS() ? setTitleComponent : 'setTitleComponent';
            // var cb = params.shareCb ? params.shareCb : null;
            caller(method, _params, null, true);
            if (_params.rightBtnCb) {
                this.registeEvent('RightButtonClick', _params.rightBtnCb);
            }
        },
        //非固定插件调用
        /*
        params,--参数 （json），
        methodName: 方法名
        callback：回调函数

        */
        exec: function(methodName, params, callback) {
            var method = isIOS() ? window[methodName] : methodName;
            caller(method, params, callback, true)
        },
        //监听app事件
        registeEvent: function(method, callback) {
            if (isIOS()) {
                window[method] = function(data) {
                    typeof callback === 'function' && callback.apply(this, arguments);
                }
            } else {
                //android需要注册方法
                connectWebViewJavascriptBridge(function(bridge) {
                    try {
                        if (!window.WebViewJavascriptBridge._messageHandler) {
                            bridge.init(function(message, responseCallback) {
                                typeof responseCallback === 'function' && responseCallback(data);
                            });
                        }
                    } catch (e) {
                        console.error("jsbridge-----error--", e);
                    }

                    bridge.registerHandler(method, function(data, responseCallback) {
                        var responseData = "Javascript Says Right back aka!";
                        typeof callback === 'function' && callback.apply(this, arguments);
                        typeof responseCallback === 'function' && responseCallback(responseData);
                    });

                });
            }

        },
        isApp: function() {
            var useragent = navigator.userAgent;
            return useragent.indexOf("tuandaiapp_android") != -1 || useragent.indexOf("tuandaiapp_IOS") != -1;

        },
        isCorrectVersion: function(v) {
            var str = navigator.userAgent;
            var arr = str.match(/\[([^\[\]]*)\]/);
            if (arr && arr[1]) {
                var vst = arr[1].split('_');
                var curVersion = vst[vst.length - 1];
                var isCorrect = compareVersion(curVersion, v);
                return isCorrect;
            } else {
                return false;
            }
        },


        // 生命周期
        /*
            readyCb：打开活动页回调（只执行一次）
            webonPauseCb：离开活动页回调
            webonDestroyCb：销毁进程回调
            webonResumeHomeCb: 离开后回到页面时回调
         **/
        appLifeHook: function(readyCb, webonPauseCb, webonDestroyCb, webonResumeHomeCb) {
            if (isIOS()) {
                /*              window.ToAppIosPostLoginToken = function(data) {

                                    loginTokenCb.apply(this, arguments);
                                }*/
                /*
                step:
                1： h5界面加载完毕 注册h5调用原生的方法， 此时原生调用h5 传参数1
                2： 当前的h5界面 将进入了下一个界面或者上一个界面。 此时传参2
                3: 用户按home键 将程序退至后台， 此时传参3
                4: 用户重新启动程序(程序由后台切换至前台), 此时传数4
                */
                win.ToAppLifeCycle = function(step) {
                    switch (step) {
                        case 1:
                            typeof readyCb === 'function' && readyCb.apply(this, arguments);
                            break;
                        case 2:
                            typeof webonPauseCb === 'function' && webonPauseCb.apply(this, arguments);
                            break;
                        case 3:
                            typeof webonPauseCb === 'function' && webonPauseCb.apply(this, arguments);
                            break;
                        case 4:
                            typeof webonResumeHomeCb === 'function' && webonResumeHomeCb.apply(this, arguments);
                            break;
                    }

                }
            } else {
                connectWebViewJavascriptBridge(function(bridge) {
                    try {
                        if (!window.WebViewJavascriptBridge._messageHandler) {

                            bridge.init(function(message, responseCallback) {
                                console.log('JS got a message', message);
                                typeof responseCallback === 'function' && responseCallback();
                            });
                        }
                    } catch (e) {
                        console.error("jsbridge-----error--", e);
                    }

                    bridge.registerHandler("LoginToken", function(data, responseCallback) {
                        typeof responseCallback === 'function' && responseCallback();
                    });

                    bridge.registerHandler("WebonResume", function(data, responseCallback) {
                        typeof readyCb === 'function' && readyCb.apply(this, arguments);
                        typeof responseCallback === 'function' && responseCallback();

                    });
                    bridge.registerHandler("WebonResumeHome", function(data, responseCallback) {
                        typeof webonResumeHomeCb === 'function' && webonResumeHomeCb.apply(this, arguments);
                        typeof responseCallback === 'function' && responseCallback();
                    });

                    bridge.registerHandler("WebonPause", function(data, responseCallback) {
                        typeof webonPauseCb === 'function' && webonPauseCb.apply(this, arguments);
                        typeof responseCallback === 'function' && responseCallback();
                    });
                    bridge.registerHandler("WebonDestroy", function(data, responseCallback) {
                        typeof webonDestroyCb === 'function' && webonDestroyCb.apply(this, arguments);
                        typeof responseCallback === 'function' && responseCallback();
                    });
                });
            }

        }

    }
    var jsbridge = new Jsbridge();
    win.Jsbridge = jsbridge;
})(window);
