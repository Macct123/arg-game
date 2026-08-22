/**
 * admin-login.js — 酆江三院内部系统登录 + 王志强即时消息
 * 朴素直角风格，追求真实系统观感
 */
(function () {
    'use strict';

    var VALID_ACCOUNT = 'ZhiQiang_Wang123';
    var VALID_PASSWORD = 'Taihnti tsee gnig.s k';
    var STORAGE_KEY = 'fj3h_admin_mode';
    var WANG_MSG_KEY = 'fj3h_wang_shown';  // 本次会话内是否已展示过王志强消息流程

    var LANG = {
        zh: {
            link: '内部系统',
            loggedIn: '后台',
            logout: '退出',
            title: '酆江市第三医院 - 内部管理系统',
            labelUser: '用户名',
            labelPass: '密码',
            labelVerify: '安全验证',
            verifyHint: '进化的时间',
            phUser: '请输入用户名',
            phPass: '请输入密码',
            phVerify: '请输入验证答案',
            submit: '登录',
            verifying: '登录中...',
            errEmpty: '请填写所有字段',
            errFail: '用户名、密码或验证答案错误',
            errAccount: '该账户不存在或已被禁用',
            tipLost: '忘记密码？请联系信息科机房 (内线 8228)',
            adminBadge: '系统管理员模式',
            notifyFrom: '即时通讯',
            notifyTitle: '王志强 发来一条新消息',
            notifyBody: '我这边显示管理员权限已被使用……',
            chatTitle: '即时通讯 - 王志强',
            chatOnline: '在线',
            chatMe: '我',
            chatSend: '发送',
            chatPh: '输入口令……'
        },
        en: {
            link: 'Staff',
            loggedIn: 'Console',
            logout: 'Logout',
            title: 'Fengjiang Third Hospital - Intranet',
            labelUser: 'Username',
            labelPass: 'Password',
            labelVerify: 'Verification',
            verifyHint: 'Time of evolution',
            phUser: 'Enter username',
            phPass: 'Enter password',
            phVerify: 'Enter answer',
            submit: 'Sign In',
            verifying: 'Signing in...',
            errEmpty: 'Please fill in all fields',
            errFail: 'Incorrect username, password, or verification answer',
            errAccount: 'Account not found or disabled',
            tipLost: 'Forgot password? Contact IT Office (ext. 8228)',
            adminBadge: 'Admin Mode',
            notifyFrom: 'IM',
            notifyTitle: 'Wang Zhiqiang sent a new message',
            notifyBody: 'Admin login detected on my end...',
            chatTitle: 'IM - Wang Zhiqiang',
            chatOnline: 'Online',
            chatMe: 'Me',
            chatSend: 'Send',
            chatPh: 'Enter the command...'
        }
    };

    var wangMessages = [
        '我这边显示管理员权限已被使用',
        '我草见鬼了，这老电脑怎么自己开机了',
        '它说……需要一个……口令？'
    ];

    function getLang() {
        if (typeof currentLang !== 'undefined') return currentLang;
        return (document.documentElement.lang || 'zh').startsWith('en') ? 'en' : 'zh';
    }
    function t(k) { return LANG[getLang()][k] || k; }

    // ===== 通用直角风格 CSS（覆盖所有弹窗类） =====
    var css = '' +
        /* --- 登录框（直角） --- */
        '.admin-login-mask{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.45);' +
            'display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;' +
            'transition:opacity .15s,visibility .15s;}' +
        '.admin-login-mask.show{opacity:1;visibility:visible;}' +
        '.admin-login-box{background:#fff;width:460px;max-width:92vw;border:none;' +
            'box-shadow:0 2px 16px rgba(0,0,0,0.25);font-family:inherit;}' +
        '.admin-login-box .al-head{background:#1a5276;color:#fff;padding:10px 16px;font-size:14px;' +
            'display:flex;justify-content:space-between;align-items:center;}' +
        '.admin-login-box .al-head .al-close{background:none;border:none;color:rgba(255,255,255,0.6);' +
            'font-size:18px;cursor:pointer;line-height:1;padding:0;}' +
        '.admin-login-box .al-head .al-close:hover{color:#fff;}' +
        '.admin-login-box .al-body{padding:20px 18px 16px;}' +
        '.admin-login-box .al-row{display:flex;gap:12px;margin-bottom:14px;}' +
        '.admin-login-box .al-field{flex:1;}' +
        '.admin-login-box .al-field label{display:block;font-size:12px;color:#555;margin-bottom:3px;}' +
        '.admin-login-box .al-field label .al-hint{color:#aaa;font-weight:normal;margin-left:4px;}' +
        '.admin-login-box .al-field input{width:100%;border:1px solid #ccc;' +
            'padding:7px 9px;font-size:13px;color:#333;outline:none;font-family:inherit;' +
            'transition:border-color .15s;box-sizing:border-box;}' +
        '.admin-login-box .al-field input:focus{border-color:#1a5276;}' +
        '.admin-login-box .al-err{color:#c0392b;font-size:12px;min-height:16px;margin-bottom:8px;}' +
        '.admin-login-box .al-submit{width:100%;padding:8px;background:#1a5276;color:#fff;' +
            'border:none;font-size:14px;cursor:pointer;font-family:inherit;}' +
        '.admin-login-box .al-submit:hover{background:#2980b9;}' +
        '.admin-login-box .al-submit:disabled{background:#999;cursor:not-allowed;}' +
        '.admin-login-box .al-tip{font-size:11px;color:#999;margin-top:10px;text-align:center;}' +
        /* --- 顶栏已登录状态 --- */
        '.admin-status{color:#1abc9c;}' +
        '.admin-status .admin-sep{color:rgba(255,255,255,0.2);margin:0 4px;}' +
        /* --- 页脚管理员标识（低调，浅灰小字） --- */
        '.admin-footer-tag{position:fixed;right:10px;bottom:6px;z-index:50;' +
            'font-size:11px;color:#b0b0b0;letter-spacing:1px;pointer-events:none;font-family:Tahoma,SimSun,sans-serif;}' +
        /* --- 右下角通知条（真实系统风：灰底蓝边） --- */
        '.admin-notify{position:fixed;right:18px;bottom:18px;z-index:9990;' +
            'width:320px;max-width:90vw;background:#f4f6f9;border:1px solid #b9c3ce;border-left:4px solid #1a5276;' +
            'box-shadow:0 3px 10px rgba(0,0,0,0.18);padding:12px 14px;' +
            'cursor:pointer;opacity:0;transform:translateY(20px);' +
            'transition:opacity .3s,transform .3s;}' +
        '.admin-notify.show{opacity:1;transform:translateY(0);}' +
        '.admin-notify .an-src{font-size:11px;color:#6a7a8a;margin-bottom:4px;letter-spacing:1px;}' +
        '.admin-notify .an-title{font-size:13.5px;color:#1a5276;font-weight:600;margin-bottom:4px;}' +
        '.admin-notify .an-body{font-size:12.5px;color:#333;line-height:1.5;}' +
        '.admin-notify .an-close{position:absolute;top:6px;right:8px;background:none;border:none;' +
            'font-size:14px;color:#999;cursor:pointer;line-height:1;}' +
        '.admin-notify .an-close:hover{color:#333;}' +
        /* --- 聊天窗口（直角、朴素、灰蓝、像医院内部IM） --- */
        '.admin-chat-mask{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.4);' +
            'display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;' +
            'transition:opacity .15s,visibility .15s;}' +
        '.admin-chat-mask.show{opacity:1;visibility:visible;}' +
        '.admin-chat-box{width:520px;max-width:94vw;height:560px;max-height:88vh;background:#fff;' +
            'box-shadow:0 3px 22px rgba(0,0,0,0.28);display:flex;flex-direction:column;}' +
        '.admin-chat-head{background:#1a5276;color:#fff;padding:10px 16px;font-size:14px;' +
            'display:flex;justify-content:space-between;align-items:center;}' +
        '.admin-chat-head .ac-who{display:flex;align-items:center;gap:8px;}' +
        '.admin-chat-head .ac-dot{width:8px;height:8px;background:#2ecc71;display:inline-block;}' +
        '.admin-chat-head .ac-status{font-size:11px;color:rgba(255,255,255,0.7);font-weight:normal;}' +
        '.admin-chat-head .ac-close{background:none;border:none;color:rgba(255,255,255,0.6);' +
            'font-size:18px;cursor:pointer;line-height:1;padding:0;}' +
        '.admin-chat-head .ac-close:hover{color:#fff;}' +
        '.admin-chat-body{flex:1;padding:16px 18px;background:#eef2f6;overflow-y:auto;' +
            'font-family:inherit;font-size:13.5px;line-height:1.6;color:#222;}' +
        '.ac-msg{display:flex;margin-bottom:14px;gap:8px;align-items:flex-start;}' +
        '.ac-msg.ac-right{justify-content:flex-end;}' +
        '.ac-msg .ac-avatar{width:32px;height:32px;background:#1a5276;color:#fff;' +
            'font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;' +
            'font-weight:600;}' +
        '.ac-msg.ac-right .ac-avatar{background:#7f8c8d;order:2;}' +
        '.ac-msg .ac-bubble{max-width:72%;padding:8px 12px;background:#fff;border:1px solid #d7dde4;}' +
        '.ac-msg.ac-right .ac-bubble{background:#d6e8f7;border-color:#a8c5e0;order:1;}' +
        '.ac-msg .ac-name{font-size:11px;color:#7a8a9a;margin-bottom:3px;}' +
        '.ac-msg.ac-right .ac-name{text-align:right;}' +
        '.ac-typing{font-size:11.5px;color:#7a8a9a;padding:4px 0 4px 40px;min-height:18px;}' +
        '.ac-typing::before{content:"";display:inline-block;vertical-align:middle;' +
            'width:6px;height:6px;background:#1a5276;margin-right:4px;animation:ac-blink 1s infinite;}' +
        '@keyframes ac-blink{0%,100%{opacity:0.2}50%{opacity:1}}' +
        /* --- 聊天输入区 --- */
        '.admin-chat-input{display:flex;border-top:1px solid #d7dde4;background:#fff;}' +
        '.admin-chat-input input{flex:1;border:none;padding:10px 14px;font-size:13.5px;' +
            'outline:none;font-family:inherit;color:#222;background:transparent;}' +
        '.admin-chat-input button{padding:0 20px;background:#1a5276;color:#fff;border:none;' +
            'font-size:13.5px;cursor:pointer;font-family:inherit;}' +
        '.admin-chat-input button:hover{background:#2980b9;}' +
        '.admin-chat-input input:disabled,.admin-chat-input button:disabled{background:#f0f0f0;color:#999;cursor:not-allowed;}' +
        /* --- 全站弹窗统一样式覆盖：强制取消圆角 --- */
        '*[class*="modal"],*[class*="dialog"],*[class*="popup"],*[class*="toast"]{' +
            'border-radius:0 !important;}' +
        '*[class*="mask"]{border-radius:0 !important;}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ===== 登录框 DOM =====
    var mask = document.createElement('div');
    mask.className = 'admin-login-mask';
    mask.innerHTML =
        '<div class="admin-login-box">' +
            '<div class="al-head"><span class="al-title"></span>' +
                '<button class="al-close">&times;</button></div>' +
            '<div class="al-body">' +
                '<div class="al-row">' +
                    '<div class="al-field"><label class="al-lbl-user"></label>' +
                        '<input type="text" class="al-user" autocomplete="off"></div>' +
                    '<div class="al-field"><label class="al-lbl-pass"></label>' +
                        '<input type="password" class="al-pass" autocomplete="off"></div>' +
                    '<div class="al-field"><label class="al-lbl-verify"></label>' +
                        '<input type="text" class="al-verify" autocomplete="off"></div>' +
                '</div>' +
                '<div class="al-err"></div>' +
                '<button class="al-submit"></button>' +
                '<div class="al-tip"></div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(mask);
    function $(s) { return mask.querySelector(s); }

    // ===== 页脚管理员标识 =====
    var adminBadge = document.createElement('div');
    adminBadge.className = 'admin-footer-tag';
    adminBadge.style.display = 'none';
    adminBadge.textContent = t('adminBadge');
    document.body.appendChild(adminBadge);

    // ===== 右下角通知条 =====
    var notify = document.createElement('div');
    notify.className = 'admin-notify';
    notify.style.display = 'none';
    notify.innerHTML =
        '<button class="an-close" title="关闭">&times;</button>' +
        '<div class="an-src"></div>' +
        '<div class="an-title"></div>' +
        '<div class="an-body"></div>';
    document.body.appendChild(notify);
    notify.querySelector('.an-close').addEventListener('click', function (e) {
        e.stopPropagation(); hideNotify();
    });
    notify.addEventListener('click', function () { hideNotify(); openChat(); });

    function showNotify() {
        notify.querySelector('.an-src').textContent = '[' + t('notifyFrom') + ']';
        notify.querySelector('.an-title').textContent = t('notifyTitle');
        notify.querySelector('.an-body').textContent = t('notifyBody');
        notify.style.display = 'block';
        setTimeout(function () { notify.classList.add('show'); }, 20);
        // 12秒后自动消失
        setTimeout(function () { if (notify.classList.contains('show')) hideNotify(); }, 12000);
    }
    function hideNotify() {
        notify.classList.remove('show');
        setTimeout(function () { notify.style.display = 'none'; }, 400);
    }

    // ===== 王志强聊天窗口 =====
    var chatMask = document.createElement('div');
    chatMask.className = 'admin-chat-mask';
    chatMask.innerHTML =
        '<div class="admin-chat-box">' +
            '<div class="admin-chat-head">' +
                '<div class="ac-who"><span class="ac-title"></span>' +
                    '<span class="ac-dot"></span><span class="ac-status"></span></div>' +
                '<button class="ac-close">&times;</button>' +
            '</div>' +
            '<div class="admin-chat-body"></div>' +
            '<div class="admin-chat-input">' +
                '<input type="text" class="ac-input" disabled>' +
                '<button class="ac-send" disabled></button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(chatMask);
    var chatBody = chatMask.querySelector('.admin-chat-body');
    var chatInput = chatMask.querySelector('.ac-input');
    var chatSendBtn = chatMask.querySelector('.ac-send');

    chatMask.querySelector('.ac-close').addEventListener('click', closeChat);
    chatMask.addEventListener('click', function (e) { if (e.target === chatMask) closeChat(); });
    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); chatSendBtn.click(); }
    });
    // 口令发送按钮暂时只记录，不做命中判定
    chatSendBtn.addEventListener('click', function () {
        var val = chatInput.value.trim();
        if (!val) return;
        appendMsg(t('chatMe'), val, true);
        chatInput.value = '';
        // 暂不判定，留空后续接入
    });

    function openChat() {
        chatMask.querySelector('.ac-title').textContent = t('chatTitle');
        chatMask.querySelector('.ac-status').textContent = t('chatOnline');
        chatSendBtn.textContent = t('chatSend');
        chatInput.placeholder = '';
        chatMask.classList.add('show');
        // 如果消息还没播过，开始依次播放
        if (!sessionStorage.getItem(WANG_MSG_KEY)) {
            playWangMessages();
        }
    }
    function closeChat() { chatMask.classList.remove('show'); }

    function appendMsg(name, text, isRight) {
        var wrap = document.createElement('div');
        wrap.className = 'ac-msg' + (isRight ? ' ac-right' : '');
        var av = name === t('chatMe') ? '我' : '王';
        wrap.innerHTML =
            '<div class="ac-avatar">' + av + '</div>' +
            '<div>' +
                '<div class="ac-name"></div>' +
                '<div class="ac-bubble"></div>' +
            '</div>';
        wrap.querySelector('.ac-name').textContent = name;
        wrap.querySelector('.ac-bubble').textContent = text;
        chatBody.appendChild(wrap);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    function showTyping() {
        var t = document.createElement('div');
        t.className = 'ac-typing';
        t.textContent = '王志强 正在输入……';
        chatBody.appendChild(t);
        chatBody.scrollTop = chatBody.scrollHeight;
        return t;
    }
    function playWangMessages() {
        chatBody.innerHTML = '';
        chatInput.disabled = true;
        chatSendBtn.disabled = true;
        var idx = 0;
        function next() {
            if (idx >= wangMessages.length) {
                // 最后一条说完 → 开放输入
                chatInput.disabled = false;
                chatSendBtn.disabled = false;
                chatInput.placeholder = t('chatPh');
                setTimeout(function () { chatInput.focus(); }, 300);
                sessionStorage.setItem(WANG_MSG_KEY, '1');
                return;
            }
            var tp = showTyping();
            setTimeout(function () {
                tp.remove();
                appendMsg('王志强', wangMessages[idx], false);
                idx++;
                // 每条之间间隔 1.4~2.2s
                setTimeout(next, 1400 + Math.random() * 800);
            }, 900 + Math.random() * 500);
        }
        setTimeout(next, 500);
    }

    // ===== 登录框 文本填充 =====
    function fillLoginText() {
        $('.al-title').textContent = t('title');
        $('.al-lbl-user').textContent = t('labelUser');
        $('.al-lbl-pass').textContent = t('labelPass');
        $('.al-lbl-verify').innerHTML = t('labelVerify') +
            '<span class="al-hint">' + t('verifyHint') + '</span>';
        $('.al-user').placeholder = t('phUser');
        $('.al-pass').placeholder = t('phPass');
        $('.al-verify').placeholder = t('phVerify');
        var btn = $('.al-submit');
        if (!btn.disabled) btn.textContent = t('submit');
        $('.al-tip').textContent = t('tipLost');
    }

    function openLogin() { fillLoginText(); mask.classList.add('show'); $('.al-user').focus(); }
    function closeLogin() { mask.classList.remove('show'); $('.al-err').textContent = ''; }

    $('.al-close').addEventListener('click', closeLogin);
    mask.addEventListener('click', function (e) { if (e.target === mask) closeLogin(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (mask.classList.contains('show')) closeLogin();
            else if (chatMask.classList.contains('show')) closeChat();
        }
    });

    function checkAnswer(input) {
        var n = input.trim().toLowerCase();
        return n === '12' || n === '十二' || n === '拾贰' ||
               n === '12点' || n === '十二点' ||
               n === '12时' || n === '十二时' || n === '壹拾贰';
    }

    var submitBtn = $('.al-submit');
    submitBtn.addEventListener('click', function () {
        var u = $('.al-user').value.trim();
        var p = $('.al-pass').value.trim();
        var v = $('.al-verify').value.trim();
        var err = $('.al-err');

        if (!u || !p || !v) { err.textContent = t('errEmpty'); return; }

        submitBtn.disabled = true;
        submitBtn.textContent = t('verifying');
        err.textContent = '';

        setTimeout(function () {
            if (u !== VALID_ACCOUNT) {
                err.textContent = t('errAccount');
                submitBtn.disabled = false;
                submitBtn.textContent = t('submit');
                return;
            }
            if (p !== VALID_PASSWORD || !checkAnswer(v)) {
                err.textContent = t('errFail');
                submitBtn.disabled = false;
                submitBtn.textContent = t('submit');
                return;
            }
            // 登录通过
            localStorage.setItem(STORAGE_KEY, '1');
            closeLogin();
            applyState();
            // 本次会话标记王志强消息未播放
            sessionStorage.removeItem(WANG_MSG_KEY);
            // 1.5秒后弹出王志强的消息通知
            setTimeout(showNotify, 1500);
        }, 700);
    });

    mask.querySelectorAll('input').forEach(function (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); submitBtn.click(); }
        });
    });

    // ===== 顶栏/管理员模式状态 =====
    function isLoggedIn() { return localStorage.getItem(STORAGE_KEY) === '1'; }

    function applyState() {
        var link = document.querySelector('[data-i18n="topAccessibility"], .admin-link');
        if (!link) return;
        // 管理员模式下把 data-i18n 摘掉，避免页面的 switchLang() 再次用字典覆盖为普通文本
        if (isLoggedIn()) {
            if (link.hasAttribute('data-i18n')) link.removeAttribute('data-i18n');
        } else {
            // 未登录时保留 data-i18n，使语言切换能正常显示「内部系统 / Staff」
            if (!link.hasAttribute('data-i18n')) link.setAttribute('data-i18n', 'topAccessibility');
        }
        if (isLoggedIn()) {
            link.innerHTML = t('loggedIn') +
                '<span class="admin-sep">|</span>' +
                '<a href="#" class="admin-logout" style="color:#1abc9c;text-decoration:none;">' + t('logout') + '</a>';
            link.classList.add('admin-status');
            link.removeAttribute('href');
            link.style.cursor = 'default';
            link.onclick = function (e) { e.preventDefault(); };
            var lo = link.querySelector('.admin-logout');
            if (lo) {
                lo.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    localStorage.removeItem(STORAGE_KEY);
                    sessionStorage.removeItem(WANG_MSG_KEY);
                    location.reload();
                });
            }
            // 页脚管理员标识显示
            adminBadge.textContent = t('adminBadge');
            adminBadge.style.display = 'block';
            // 如果已登录但本次会话还没弹过通知 → 页面加载时弹一次
            if (!sessionStorage.getItem(WANG_MSG_KEY + '_notified')) {
                sessionStorage.setItem(WANG_MSG_KEY + '_notified', '1');
                setTimeout(showNotify, 1200);
            }
        } else {
            link.textContent = t('link');
            link.classList.remove('admin-status');
            link.setAttribute('href', '#');
            link.style.cursor = 'pointer';
            link.onclick = function (e) { e.preventDefault(); openLogin(); };
            adminBadge.style.display = 'none';
        }
    }

    // ===== 初始化 =====
    function init() {
        var link = document.querySelector('[data-i18n="topAccessibility"]');
        if (link) {
            link.classList.add('admin-link');
            link.removeAttribute('href');
            link.style.cursor = 'pointer';
        }
        // 把字典里的「无障碍浏览」直接替换为「内部系统」，避免页面初始 switchLang 把文字改回旧内容
        if (typeof i18n !== 'undefined') {
            if (i18n.zh) i18n.zh.topAccessibility = LANG.zh.link;
            if (i18n.en) i18n.en.topAccessibility = LANG.en.link;
        }
        applyState();

        // 防御：用 MutationObserver 盯住 .admin-link 的 textContent/innerHTML，
        // 如果被页面里的 switchLang() 或其他初始化逻辑覆盖，立刻重新渲染成管理员样式
        if (link && window.MutationObserver) {
            var guardTimer = null;
            function guardedReapply() {
                if (guardTimer) return;
                guardTimer = setTimeout(function () {
                    guardTimer = null;
                    // 如果管理员模式下 innerHTML 已经被改成单纯文字（不含admin-logout子元素），重绘
                    if (isLoggedIn() && !link.querySelector('.admin-logout')) {
                        applyState();
                    }
                }, 30);
            }
            new MutationObserver(guardedReapply).observe(link, {
                childList: true, characterData: true, subtree: true, attributes: true
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 监听语言按钮点击后立即重绘（确保中英文切换时"后台|退出"会同步变语言）
    document.addEventListener('click', function (e) {
        if (e.target.classList && e.target.classList.contains('lang-switch')) {
            setTimeout(applyState, 60);
        }
    }, true);
    // 另外轮询兜底：某些页面的 switchLang 可能不是按钮触发而是其他机制
    var _lastLang = (typeof currentLang !== 'undefined') ? currentLang : document.documentElement.lang;
    setInterval(function () {
        var cur = (typeof currentLang !== 'undefined') ? currentLang : document.documentElement.lang;
        if (cur !== _lastLang) { _lastLang = cur; applyState(); }
    }, 400);
})();
