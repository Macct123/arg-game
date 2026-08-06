/**
 * admin-login.js — 酆江三院 ARG 管理员登录系统
 * 自动将顶栏"无障碍浏览"替换为登录入口，注入弹窗，管理管理员状态
 */
(function () {
    'use strict';

    // ===== 配置 =====
    var VALID_ACCOUNT = 'ZhiQiang_Wang123';
    var VALID_PASSWORD = 'Taihnti tsee gnig.s k';
    var STORAGE_KEY = 'fj3h_admin_mode';

    // ===== 多语言文案 =====
    var LANG = {
        zh: {
            loginLink: '登录入口',
            adminBadge: '管理员',
            modalTitle: '管理员验证',
            modalSub: '请输入完整凭证以进入管理员模式',
            labelAccount: '账户',
            labelPassword: '密码',
            labelQuestion: '进化的时间',
            placeholderAccount: '请输入账户',
            placeholderPassword: '请输入密码',
            placeholderQuestion: '院长的问题',
            submitBtn: '验证身份',
            verifying: '验证中...',
            errEmpty: '请填写所有字段',
            errFail: '凭证有误，请检查后重试',
            successToast: '已进入管理员模式',
            logoutConfirm: '确认退出管理员模式？',
            logoutBtn: '退出管理员'
        },
        en: {
            loginLink: 'Login',
            adminBadge: 'Admin',
            modalTitle: 'Admin Verification',
            modalSub: 'Enter full credentials to access admin mode',
            labelAccount: 'Account',
            labelPassword: 'Password',
            labelQuestion: 'Time of Evolution',
            placeholderAccount: 'Enter account',
            placeholderPassword: 'Enter password',
            placeholderQuestion: "Director's question",
            submitBtn: 'Verify',
            verifying: 'Verifying...',
            errEmpty: 'Please fill in all fields',
            errFail: 'Invalid credentials, please try again',
            successToast: 'Admin mode activated',
            logoutConfirm: 'Exit admin mode?',
            logoutBtn: 'Exit Admin'
        }
    };

    // 获取当前语言
    function getLang() {
        if (typeof currentLang !== 'undefined') return currentLang;
        return (document.documentElement.lang || 'zh').startsWith('en') ? 'en' : 'zh';
    }
    function t(key) {
        return LANG[getLang()][key] || key;
    }

    // ===== 注入CSS =====
    var css = [
        '/* ===== 管理员登录弹窗 ===== */',
        '.admin-login-overlay {',
        '    position:fixed; inset:0; z-index:10000;',
        '    background:rgba(0,0,0,0.75);',
        '    backdrop-filter:blur(4px);',
        '    display:flex; align-items:center; justify-content:center;',
        '    opacity:0; visibility:hidden; transition:opacity .3s,visibility .3s;',
        '}',
        '.admin-login-overlay.show { opacity:1; visibility:visible; }',
        '.admin-login-modal {',
        '    background:linear-gradient(145deg,#0e2f44,#1a5276);',
        '    border:1px solid rgba(22,160,133,0.3);',
        '    border-radius:12px; padding:32px 36px 28px;',
        '    width:90%; max-width:680px; position:relative;',
        '    box-shadow:0 0 40px rgba(22,160,133,0.15),0 20px 60px rgba(0,0,0,0.5);',
        '    transform:translateY(20px) scale(0.96); transition:transform .3s ease;',
        '}',
        '.admin-login-overlay.show .admin-login-modal { transform:translateY(0) scale(1); }',
        '.admin-login-close {',
        '    position:absolute; top:12px; right:16px;',
        '    background:none; border:none; color:rgba(255,255,255,0.4);',
        '    font-size:22px; cursor:pointer; line-height:1; transition:color .2s;',
        '}',
        '.admin-login-close:hover { color:#fff; }',
        '.admin-login-title {',
        '    color:#fff; font-size:22px; font-weight:600; letter-spacing:2px;',
        '    margin-bottom:4px;',
        '}',
        '.admin-login-title .lock-icon { color:var(--accent-glow,#1abc9c); margin-right:8px; }',
        '.admin-login-sub { color:rgba(255,255,255,0.45); font-size:13px; margin-bottom:24px; }',
        '.admin-login-fields { display:flex; gap:16px; margin-bottom:20px; }',
        '.admin-login-field { flex:1; display:flex; flex-direction:column; }',
        '.admin-login-field label {',
        '    color:rgba(255,255,255,0.6); font-size:12px; margin-bottom:6px;',
        '    letter-spacing:1px;',
        '}',
        '.admin-login-field input {',
        '    background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1);',
        '    border-radius:6px; padding:10px 14px; color:#fff; font-size:14px;',
        '    outline:none; transition:border-color .2s,box-shadow .2s;',
        '}',
        '.admin-login-field input::placeholder { color:rgba(255,255,255,0.25); }',
        '.admin-login-field input:focus {',
        '    border-color:#1abc9c;',
        '    box-shadow:0 0 0 2px rgba(26,188,156,0.15);',
        '}',
        '.admin-login-error {',
        '    color:#e74c3c; font-size:13px; min-height:20px; text-align:center;',
        '    margin-bottom:12px; transition:opacity .2s;',
        '}',
        '.admin-login-submit {',
        '    width:100%; padding:12px; border:none; border-radius:6px;',
        '    background:linear-gradient(135deg,#16a085,#1abc9c);',
        '    color:#fff; font-size:15px; font-weight:600; letter-spacing:2px;',
        '    cursor:pointer; transition:opacity .2s,transform .1s;',
        '}',
        '.admin-login-submit:hover { opacity:0.9; }',
        '.admin-login-submit:active { transform:scale(0.98); }',
        '.admin-login-submit:disabled { opacity:0.5; cursor:not-allowed; }',
        '/* 管理员徽章 */',
        '.admin-badge-link {',
        '    display:inline-flex; align-items:center; gap:5px;',
        '    color:#1abc9c !important; font-weight:600;',
        '}',
        '.admin-badge-link .admin-dot {',
        '    width:8px; height:8px; border-radius:50%; background:#1abc9c;',
        '    box-shadow:0 0 6px #1abc9c; animation:adminPulse 2s ease-in-out infinite;',
        '}',
        '@keyframes adminPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }',
        '/* 成功提示条 */',
        '.admin-toast {',
        '    position:fixed; top:0; left:50%; transform:translateX(-50%) translateY(-100%);',
        '    z-index:10001; background:linear-gradient(135deg,#16a085,#1abc9c);',
        '    color:#fff; padding:14px 36px; border-radius:0 0 8px 8px;',
        '    font-size:15px; font-weight:600; letter-spacing:2px;',
        '    box-shadow:0 4px 20px rgba(0,0,0,0.3);',
        '    transition:transform .4s cubic-bezier(0.34,1.56,0.64,1);',
        '}',
        '.admin-toast.show { transform:translateX(-50%) translateY(0); }',
        '/* 响应式 */',
        '@media(max-width:600px){',
        '    .admin-login-fields { flex-direction:column; gap:12px; }',
        '    .admin-login-modal { padding:24px 20px; }',
        '}'
    ].join('\n');

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ===== 注入弹窗HTML =====
    var overlay = document.createElement('div');
    overlay.className = 'admin-login-overlay';
    overlay.innerHTML =
        '<div class="admin-login-modal">' +
            '<button class="admin-login-close">&times;</button>' +
            '<div class="admin-login-title"><span class="lock-icon">&#128274;</span>' +
                '<span class="al-title-text"></span>' +
            '</div>' +
            '<div class="admin-login-sub al-sub-text"></div>' +
            '<div class="admin-login-fields">' +
                '<div class="admin-login-field">' +
                    '<label class="al-lbl-account"></label>' +
                    '<input type="text" class="al-input-account" autocomplete="off">' +
                '</div>' +
                '<div class="admin-login-field">' +
                    '<label class="al-lbl-password"></label>' +
                    '<input type="text" class="al-input-password" autocomplete="off">' +
                '</div>' +
                '<div class="admin-login-field">' +
                    '<label class="al-lbl-question"></label>' +
                    '<input type="text" class="al-input-question" autocomplete="off">' +
                '</div>' +
            '</div>' +
            '<div class="admin-login-error al-error"></div>' +
            '<button class="admin-login-submit al-submit-btn"></button>' +
        '</div>';
    document.body.appendChild(overlay);

    // 注入toast
    var toast = document.createElement('div');
    toast.className = 'admin-toast';
    document.body.appendChild(toast);

    // ===== 更新弹窗文案 =====
    function updateModalText() {
        var q = function (sel) { return overlay.querySelector(sel); };
        q('.al-title-text').textContent = t('modalTitle');
        q('.al-sub-text').textContent = t('modalSub');
        q('.al-lbl-account').textContent = t('labelAccount');
        q('.al-lbl-password').textContent = t('labelPassword');
        q('.al-lbl-question').textContent = t('labelQuestion');
        q('.al-input-account').placeholder = t('placeholderAccount');
        q('.al-input-password').placeholder = t('placeholderPassword');
        q('.al-input-question').placeholder = t('placeholderQuestion');
        var btn = q('.al-submit-btn');
        if (!btn.disabled) btn.textContent = t('submitBtn');
    }

    // ===== 弹窗控制 =====
    function openModal() {
        updateModalText();
        overlay.classList.add('show');
        overlay.querySelector('.al-input-account').focus();
    }
    function closeModal() {
        overlay.classList.remove('show');
        overlay.querySelector('.al-error').textContent = '';
    }
    overlay.querySelector('.admin-login-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('show')) closeModal();
    });

    // ===== 验证答案：12 / 十二 / 拾贰 等任意写法 =====
    function checkAnswer(input) {
        var n = input.trim().toLowerCase();
        return n === '12' || n === '十二' || n === '拾贰' ||
               n === '12点' || n === '十二点' ||
               n === '12时' || n === '十二时' ||
               n === '壹拾贰';
    }

    // ===== 提交验证 =====
    var submitBtn = overlay.querySelector('.al-submit-btn');
    submitBtn.addEventListener('click', function () {
        var acct = overlay.querySelector('.al-input-account').value.trim();
        var pwd = overlay.querySelector('.al-input-password').value.trim();
        var ans = overlay.querySelector('.al-input-question').value.trim();
        var errEl = overlay.querySelector('.al-error');

        if (!acct || !pwd || !ans) {
            errEl.textContent = t('errEmpty');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = t('verifying');
        errEl.textContent = '';

        // 模拟短暂验证延迟，增加仪式感
        setTimeout(function () {
            if (acct === VALID_ACCOUNT && pwd === VALID_PASSWORD && checkAnswer(ans)) {
                localStorage.setItem(STORAGE_KEY, '1');
                closeModal();
                showToast();
                applyAdminState();
            } else {
                errEl.textContent = t('errFail');
                submitBtn.disabled = false;
                submitBtn.textContent = t('submitBtn');
            }
        }, 600);
    });

    // 回车提交
    overlay.querySelectorAll('input').forEach(function (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); submitBtn.click(); }
        });
    });

    // ===== 成功提示 =====
    function showToast() {
        toast.textContent = '\u2713 ' + t('successToast');
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }

    // ===== 管理员状态管理 =====
    function isAdmin() {
        return localStorage.getItem(STORAGE_KEY) === '1';
    }

    function applyAdminState() {
        var link = document.querySelector('[data-i18n="topAccessibility"], .admin-login-link');
        if (!link) return;

        if (isAdmin()) {
            link.innerHTML = '<span class="admin-dot"></span>' + t('adminBadge');
            link.classList.add('admin-badge-link');
            link.removeAttribute('href');
            link.style.cursor = 'pointer';
            // 点击 → 退出确认
            link.onclick = function (e) {
                e.preventDefault();
                if (confirm(t('logoutConfirm'))) {
                    localStorage.removeItem(STORAGE_KEY);
                    location.reload();
                }
            };
        } else {
            link.textContent = t('loginLink');
            link.classList.remove('admin-badge-link');
            link.setAttribute('href', '#');
            link.style.cursor = 'pointer';
            link.onclick = function (e) {
                e.preventDefault();
                openModal();
            };
        }
    }

    // ===== 初始化 =====
    function init() {
        // 1. 找到"无障碍浏览"链接，改造为登录入口
        var link = document.querySelector('[data-i18n="topAccessibility"]');
        if (link) {
            link.classList.add('admin-login-link');
            link.removeAttribute('href');
            link.style.cursor = 'pointer';
        }

        // 2. 补充 i18n 词条（让语言切换时自动更新文案）
        if (typeof i18n !== 'undefined') {
            if (i18n.zh) i18n.zh.topAccessibility = LANG.zh.loginLink;
            if (i18n.en) i18n.en.topAccessibility = LANG.en.loginLink;
        }

        // 3. 应用管理员状态（决定显示"登录入口"还是"管理员"徽章）
        applyAdminState();
    }

    // DOM就绪后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 语言切换时同步更新（拦截 switchLang 调用）
    if (typeof switchLang === 'function') {
        var origSwitchLang = switchLang;
        // 注意：switchLang 在内联脚本中用 function 声明，可通过重新赋值同名全局函数拦截
        // 但 const/let 声明的不可重新赋值，这里用事件监听代替
    }
    // 监听语言按钮点击来同步更新
    document.addEventListener('click', function (e) {
        if (e.target.classList && e.target.classList.contains('lang-switch')) {
            setTimeout(function () { applyAdminState(); }, 50);
        }
    }, true);
})();
