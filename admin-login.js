/**
 * admin-login.js — 酆江三院内部系统登录
 * 朴素风格，追求真实感，去除一切游戏化视觉元素
 */
(function () {
    'use strict';

    var VALID_ACCOUNT = 'ZhiQiang_Wang123';
    var VALID_PASSWORD = 'Taihnti tsee gnig.s k';
    var STORAGE_KEY = 'fj3h_admin_mode';

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
            tipLost: '忘记密码？请联系信息科机房 (内线 8228)'
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
            tipLost: 'Forgot password? Contact IT Office (ext. 8228)'
        }
    };

    function getLang() {
        if (typeof currentLang !== 'undefined') return currentLang;
        return (document.documentElement.lang || 'zh').startsWith('en') ? 'en' : 'zh';
    }
    function t(k) { return LANG[getLang()][k] || k; }

    // ===== CSS：朴素白底，与医院网站风格一致 =====
    var css = '' +
        '.admin-login-mask{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.45);' +
            'display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;' +
            'transition:opacity .15s,visibility .15s;}' +
        '.admin-login-mask.show{opacity:1;visibility:visible;}' +
        '.admin-login-box{background:#fff;width:460px;max-width:92vw;border-radius:3px;' +
            'box-shadow:0 2px 16px rgba(0,0,0,0.25);font-family:inherit;}' +
        '.admin-login-box .al-head{background:#1a5276;color:#fff;padding:10px 16px;font-size:14px;' +
            'border-radius:3px 3px 0 0;display:flex;justify-content:space-between;align-items:center;}' +
        '.admin-login-box .al-head .al-close{background:none;border:none;color:rgba(255,255,255,0.6);' +
            'font-size:18px;cursor:pointer;line-height:1;padding:0;}' +
        '.admin-login-box .al-head .al-close:hover{color:#fff;}' +
        '.admin-login-box .al-body{padding:20px 18px 16px;}' +
        '.admin-login-box .al-row{display:flex;gap:12px;margin-bottom:14px;}' +
        '.admin-login-box .al-field{flex:1;}' +
        '.admin-login-box .al-field label{display:block;font-size:12px;color:#555;margin-bottom:3px;}' +
        '.admin-login-box .al-field label .al-hint{color:#aaa;font-weight:normal;margin-left:4px;}' +
        '.admin-login-box .al-field input{width:100%;border:1px solid #ccc;border-radius:2px;' +
            'padding:7px 9px;font-size:13px;color:#333;outline:none;font-family:inherit;' +
            'transition:border-color .15s;box-sizing:border-box;}' +
        '.admin-login-box .al-field input:focus{border-color:#1a5276;}' +
        '.admin-login-box .al-err{color:#c0392b;font-size:12px;min-height:16px;margin-bottom:8px;}' +
        '.admin-login-box .al-submit{width:100%;padding:8px;background:#1a5276;color:#fff;' +
            'border:none;border-radius:2px;font-size:14px;cursor:pointer;font-family:inherit;}' +
        '.admin-login-box .al-submit:hover{background:#2980b9;}' +
        '.admin-login-box .al-submit:disabled{background:#999;cursor:not-allowed;}' +
        '.admin-login-box .al-tip{font-size:11px;color:#999;margin-top:10px;text-align:center;}' +
        /* 已登录状态：顶栏朴素文字 */
        '.admin-status{color:#1abc9c;}' +
        '.admin-status .admin-sep{color:rgba(255,255,255,0.2);margin:0 4px;}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ===== 注入登录框 =====
    var mask = document.createElement('div');
    mask.className = 'admin-login-mask';
    mask.innerHTML =
        '<div class="admin-login-box">' +
            '<div class="al-head">' +
                '<span class="al-title"></span>' +
                '<button class="al-close">&times;</button>' +
            '</div>' +
            '<div class="al-body">' +
                '<div class="al-row">' +
                    '<div class="al-field">' +
                        '<label class="al-lbl-user"></label>' +
                        '<input type="text" class="al-user" autocomplete="off">' +
                    '</div>' +
                    '<div class="al-field">' +
                        '<label class="al-lbl-pass"></label>' +
                        '<input type="password" class="al-pass" autocomplete="off">' +
                    '</div>' +
                    '<div class="al-field">' +
                        '<label class="al-lbl-verify"></label>' +
                        '<input type="text" class="al-verify" autocomplete="off">' +
                    '</div>' +
                '</div>' +
                '<div class="al-err"></div>' +
                '<button class="al-submit"></button>' +
                '<div class="al-tip"></div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(mask);

    function $(s) { return mask.querySelector(s); }

    function fillText() {
        $('.al-title').textContent = t('title');
        $('.al-lbl-user').textContent = t('labelUser');
        $('.al-lbl-pass').textContent = t('labelPass');
        // 验证字段标签后跟一个小字提示
        $('.al-lbl-verify').innerHTML = t('labelVerify') +
            '<span class="al-hint">' + t('verifyHint') + '</span>';
        $('.al-user').placeholder = t('phUser');
        $('.al-pass').placeholder = t('phPass');
        $('.al-verify').placeholder = t('phVerify');
        var btn = $('.al-submit');
        if (!btn.disabled) btn.textContent = t('submit');
        $('.al-tip').textContent = t('tipLost');
    }

    function open() { fillText(); mask.classList.add('show'); $('.al-user').focus(); }
    function close() { mask.classList.remove('show'); $('.al-err').textContent = ''; }

    $('.al-close').addEventListener('click', close);
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mask.classList.contains('show')) close();
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

        // 真实系统有短暂响应延迟
        setTimeout(function () {
            // 先验账户——账户错给"不存在"提示，更像真实系统
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
            // 通过
            localStorage.setItem(STORAGE_KEY, '1');
            close();
            applyState();
            // 极朴素的反馈：仅地址栏hash变化 + 静默刷新顶栏
        }, 700);
    });

    // 回车提交
    mask.querySelectorAll('input').forEach(function (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); submitBtn.click(); }
        });
    });

    // ===== 顶栏状态 =====
    function isLoggedIn() {
        return localStorage.getItem(STORAGE_KEY) === '1';
    }

    function applyState() {
        var link = document.querySelector('[data-i18n="topAccessibility"], .admin-link');
        if (!link) return;

        if (isLoggedIn()) {
            // 已登录：显示"后台 | 退出"，朴素无动画
            link.innerHTML = t('loggedIn') +
                '<span class="admin-sep">|</span>' +
                '<a href="#" class="admin-logout" style="color:#1abc9c;text-decoration:none;">' + t('logout') + '</a>';
            link.classList.add('admin-status');
            link.removeAttribute('href');
            link.style.cursor = 'default';
            link.onclick = function (e) { e.preventDefault(); };
            // 退出链接
            var lo = link.querySelector('.admin-logout');
            if (lo) {
                lo.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    localStorage.removeItem(STORAGE_KEY);
                    location.reload();
                });
            }
        } else {
            // 未登录：显示"内部系统"，点击打开登录框
            link.textContent = t('link');
            link.classList.remove('admin-status');
            link.setAttribute('href', '#');
            link.style.cursor = 'pointer';
            link.onclick = function (e) { e.preventDefault(); open(); };
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
        // 覆盖 i18n 词条，让语言切换时自动更新
        if (typeof i18n !== 'undefined') {
            if (i18n.zh) i18n.zh.topAccessibility = LANG.zh.link;
            if (i18n.en) i18n.en.topAccessibility = LANG.en.link;
        }
        applyState();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 语言切换时同步
    document.addEventListener('click', function (e) {
        if (e.target.classList && e.target.classList.contains('lang-switch')) {
            setTimeout(applyState, 50);
        }
    }, true);
})();
