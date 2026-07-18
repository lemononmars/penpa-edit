// Passive text catalog extracted from translate.js. The translation initializer is intentionally not loaded.
const PenpaText = {
    get(key, variable) {
        const entry = this.dictionary[key] || {};
        let returnText = entry[UserSettings.app_language] || entry.EN || '';

        if (!variable) {
            return returnText;
        }

        return returnText.replace('$v', variable);
    },
    _innerText: [
        'constraints',
        'page_help',
        'nb_gridtype8_lb',
        'nb_gridtype9_lb',
        'nb_gridtype10_lb',
        'nb_gridtype11_lb',
        'nb_gridtype12_lb',
        'nb_gridtype13_lb',
        'nb_gridtype14_lb',
        'nb_rules_lb',
        'nb_title_lb',
        'settings_modal_header',
        'lb_settings_app_display',
        'lb_settings_display_theme',
        'lb_settings_display_theme_light',
        'lb_settings_display_theme_dark',
        'lb_settings_display_layout',
        'lb_settings_display_layout_classic',
        'lb_settings_display_layout_flex_left',
        'lb_settings_display_layout_flex_right',
        'lb_settings_display_layout_streaming1',
        'lb_settings_timer',
        'lb_settings_timer_show',
        'lb_settings_timer_hide',
        'lb_settings_puzzle_display',
        'lb_settings_sudoku_marks',
        'lb_settings_sudoku_marks_dynamic',
        'lb_settings_sudoku_marks_large',
        'lb_settings_sudoku_marks_small',
        'lb_settings_sudoku_normal',
        'lb_settings_sudoku_normal_centered',
        'lb_settings_sudoku_normal_bottom',
        'lb_settings_starbattle_dots',
        'lb_settings_starbattle_dots_high_range',
        'lb_settings_starbattle_dots_low_range',
        'lb_settings_starbattle_dots_disable',
        'lb_settings_surface_second',
        'lb_settings_surface_second_dark',
        'lb_settings_surface_second_grey',
        'lb_settings_surface_second_light',
        'lb_settings_surface_second_black',
        'lb_settings_surface_second_green',
        'lb_settings_surface_second_blue',
        'lb_settings_surface_second_red',
        'lb_settings_surface_second_yellow',
        'lb_settings_surface_second_pink',
        'lb_settings_surface_second_orange',
        'lb_settings_surface_second_purple',
        'lb_settings_surface_second_brown',
        'lb_settings_tools',
        'lb_settings_custom_colors',
        'lb_settings_floating_panel',
        'lb_settings_quick_panel',
        'lb_settings_export',
        'lb_settings_auto_shorten',
        'lb_settings_input_options',
        'lb_settings_mouse_middle',
        'lb_settings_reload',
        'lb_settings_conflict',
        'lb_settings_conflict_off_this',
        'lb_settings_conflict_off_all',
        'lb_settings_sudoku_keys',
        'lb_settings_textoutline',
        'lb_settings_pencil_marks',
        'lb_settings_lineanycolor',
        'lb_settings_auto_save_history',
        'lb_settings_storage',
        'lb_settings_saved_settings',
        'clear_settings',
        'lb_settings_local_storage',
        'clear_storage_one',
        'clear_storage_all',
        'local_storage_browser_message'
    ],
    _placeholder: [
        'saveimagename',
        'iostring',
        'urlstring'
    ],
    dictionary: {
        // Modes
        contest_mode: {EN: 'Contest Mode', JP: 'コンテストモード', ZH: '竞赛模式'},
        replay_mode: {EN: 'Replay Mode', JP: 'リプレイモード', ZH: '回放模式'},
        setter_mode: {EN: 'Setter Mode', JP: '編集モード', ZH: '编辑模式'},
        setter_mode_while_solving: {
            EN: 'Setter Mode (while Solving)',
            JP: '編集モード（解答中）',
            ZH: '编辑模式（解答中）'
        },
        solver_mode: {EN: 'Solver Mode', JP: '解答モード', ZH: '解答模式'},
        solver_mode_answer: {
            EN: 'Solver Mode (Answer Checking Enabled)',
            JP: '解答モード（正解判定あり）',
            ZH: '解答模式（含答案检测）'
        },

        // Grid Setup
        columns: {JP: "ヨコ：", EN: "Columns:", ZH: '列：'},
        rows: {JP: "タテ：", EN: "Rows:", ZH: '行'},
        side: {EN: "Side:", JP: '幅：', ZH: '尺寸'},
        sides: {EN: "Sides:", JP: '横：', ZH: '尺寸'},
        over: {EN: "Over:", JP: '上：', ZH: '超过'},
        under: {EN: "Under:", JP: '下：', ZH: '在下面：'},
        border: {EN: "Border:", JP: '境界：', ZH: '边界'},
        order: {EN: "Order:", JP: '注文', ZH: '阶数'},
        cut_corners: {EN: "Cut corners:", JP: '手抜きをする', ZH: '偷工减料'},

        nb_gridtype8_lb: {EN: 'Tetrakis square', JP: 'テトラキス正方形', ZH: '四分正方形'},
        nb_gridtype9_lb: {EN: 'Truncated square', JP: '切頂四角形', ZH: '截角正方形'},
        nb_gridtype10_lb: {EN: 'Snub square', JP: 'スナブ正方形', ZH: '扭方体'},
        nb_gridtype11_lb: {EN: 'Cairo pentagonal', JP: 'カイロ五角形', ZH: '开罗五边形'},
        nb_gridtype12_lb: {EN: 'Rhombitrihexagonal', JP: '菱三六角形', ZH: '菱三六边形'},
        nb_gridtype13_lb: {EN: 'Deltoidal trihexagonal', JP: '凧形三六角形', ZH: '三角六角形'},
        nb_gridtype14_lb: {EN: 'Penrose P3', JP: 'ペンローズ P3', ZH: '彭罗斯 P3'},

        // Generic Terms
        on: {EN: "ON", JP: "オン", ZH: '开'},
        off: {EN: "OFF", JP: "オフ", ZH: '关'},
        yes: {EN: "Yes", JP: 'はい', ZH: '是'},
        no: {EN: "No", JP: 'いいえ', ZH: '否'},
        rules_generic: {EN: "Rules:", JP: 'ルール：', ZH: '规则：'},
        close: {EN: 'Close', JP: '閉じる', ZH: '关闭'},
        show: {EN: 'Show', JP: '表示', ZH: '显示'},
        hide: {EN: 'Hide', JP: '隠す', ZH: '隐藏'},
        ok: {EN: 'OK', JP: '', ZH: '确认'},
        cancel: {EN: 'Cancel', JP: 'キャンセル', ZH: '取消'},
        pause_message: {
            JP: "ポーズ中\n\"スタート\"をクリック\nまたは\"F4\"",
            EN: "Paused\nClick on \"Start\"\nor \"F4\"",
            ZH: "已暂停\n点击\"开始\"\n或按\"F4\""
        },

        // Export Image
        nb_rules_lb: {JP: "ルール：", EN: "Rules:", ZH: '规则：'},
        nb_title_lb: {EN: "Title & Author:", JP: 'タイトルと作者：', ZH: '标题、作者：'},
        nb_title1_lb: {EN: "Yes", JP: 'はい', ZH: '有'},
        nb_title2_lb: {EN: "No", JP: 'いいえ', ZH: '无'},
        nb_rules1_lb: {EN: "Yes", JP: 'はい', ZH: '有'},
        nb_rules2_lb: {EN: "No", JP: 'いいえ', ZH: '无'},
        saveimagename: {EN: 'sample_name', JP: '', ZH: '未命名'},

        // Main UI
        page_help: {EN: 'Help', JP: 'ヘルプ', ZH: '帮助'},
        constraints: {EN: 'Constraints (Beta)', JP: '専用モード', ZH: '专用模式'},

        disable_penpa_lite: {
            JP: 'Penpa Liteを無効化',
            EN: 'Disable Penpa Lite',
            ZH: '关闭类别筛选'
        },
        enable_penpa_lite: {
            JP: 'Penpa Liteを有効化',
            EN: 'Enable Penpa Lite',
            ZH: '开启类别筛选'
        },

        search_area: {EN: 'Search Area', JP: '検索範囲', ZH: '搜索范围'},
        live_replay_na: {EN: 'Live Replay N/A', JP: '解答履歴(Live Replay) N/A', ZH: '实时回放不适用'},
        live_replay: {EN: 'Live Replay', JP: '解答履歴(Live Replay)', ZH: '实时回放'},
        solve_path: {EN: 'Solve Path', JP: '想定解法(Solve Path)', ZH: '解题步骤'},

        feedback_modal: {
            EN: 'Any suggestions or improvements, send an email to <b> penpaplus@gmail.com </b> <br> or <br> Create an issue on github <a href="https://github.com/swaroopg92/penpa-edit/issues" target="_blank">here</a> <br> or <br> Join discussions in #penpa-plus channel in the Discord Server <a href="https://discord.com/channels/709370620642852885/1253382126435569665" target="_blank">here</a>.',
            JP: '修正やご提案は以下からご連絡ください。 <b> penpaplus@gmail.com </b> <br> / <br> Create an issue on github <a href=https://github.com/swaroopg92/penpa-edit/issues" target="_blank">Github</a> <br> / <br> Join discussions in #penpa-plus channel in the Discord Server <a href="https://discord.com/channels/709370620642852885/1253382126435569665" target="_blank">here</a>."',
            ZH: '若您有任何改进意见和建议，可以发送邮件至 <b> penpaplus@gmail.com </b> <br> 或 <br> 在 <a href=https://github.com/swaroopg92/penpa-edit/issues" target="_blank">Github</a> 上创建issue <br> 或 <br> 在 <a href="https://discord.com/channels/709370620642852885/1253382126435569665" target="_blank">Discord 服务器</a> 的 #penpa-plus 频道进行讨论。'
        },

        contest_answer: {
            EN: '*Note the Solution Code, go back to <a href="$v" target="_blank">Source</a> and enter in the Submissions Box*',
            JP: 'アンサーキーの入力は、<a href=$v" target="_blank">Source</a> に戻り、Submissions Boxから行ってください*"',
            ZH: '*回到<a href="$v" target="_blank">原地址</a>并在提交框输入答案提交码*'
        },

        answer_check_empty: {
            EN: 'No specific option selected by Author. Answer check looks for all the elements with appropriate accepted colors. Check <a href="https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">this</a> for reference.',
            JP: 'この問題には解答チェックのオプションが選択されていません。解答チェックをするためには、配置する物体の種類や色が全て正しい必要があります。 <a href=https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">こちら</a> もご参照ください。"',
            ZH: '作者未设置答案检测选项，答案检测将匹配所有可接受的对应颜色元素。详情请参考<a href=https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">此处</a>。'
        },

        puzzlink_row_column: {
            EN: 'Penpa+ does not support grid size greater than $v rows or columns',
            JP: 'Penpa+は $v 行を超えるサイズに対応していません。',
            ZH: 'Penpa+ 不支持大于 $v 行/列的盘面尺寸。'
        },
        puzzlink_not_supported: {
            EN: 'It currently does not support puzzle type: $v',
            JP: 'パズル種 $v には現在対応していません。',
            ZH: '谜题类型 $v 目前暂不支持。'
        },

        // Settings
        settings_modal_header: {EN: 'General Settings', JP: '一般設定', ZH: '常规设置'},
        lb_settings_app_display: {EN: 'App Display', JP: '画面表示', ZH: '画面显示'},
        lb_settings_display_theme: {EN: 'Display Theme:', JP: '明るさ', ZH: '界面主题'},
        lb_settings_display_theme_light: {EN: 'Light', JP: 'ライト', ZH: '亮色'},
        lb_settings_display_theme_dark: {EN: 'Dark', JP: 'ダーク', ZH: '暗色'},
        lb_settings_display_layout: {EN: 'Display Layout:', JP: 'レイアウト', ZH: '界面排布'},
        lb_settings_display_layout_classic: {EN: 'Classic', JP: '通常', ZH: '经典'},
        lb_settings_display_layout_flex_left: {
            EN: 'Flex (Tools Left)',
            JP: '可動（ツールバー左）',
            ZH: '可动（左侧工具栏）'
        },
        lb_settings_display_layout_flex_right: {
            EN: 'Flex (Tools Right)',
            JP: '可動（ツールバー右）',
            ZH: '可动（右侧工具栏）'
        },
        lb_settings_display_layout_streaming1: {EN: 'Streaming 1 (beta)', JP: '配信（ベータ版）', ZH: '直播（测试版）'},
        lb_settings_timer: {EN: 'Timer:', JP: 'タイマー', ZH: '计时器'},
        lb_settings_timer_show: {EN: 'Show', JP: '表示', ZH: '显示'},
        lb_settings_timer_hide: {EN: 'Hide', JP: '隠す', ZH: '隐藏'},
        lb_settings_puzzle_display: {EN: 'Puzzle Display', JP: '盤面表示', ZH: '盘面显示'},
        lb_settings_sudoku_marks: {EN: 'Sudoku Pencil Marks:', JP: '[数独]補助数字', ZH: '数独辅助标记'},
        lb_settings_sudoku_marks_dynamic: {EN: 'Dynamic', JP: '縦幅可変', ZH: '动态高度'},
        lb_settings_sudoku_marks_large: {EN: 'Large', JP: '縦幅大', ZH: '较大高度'},
        lb_settings_sudoku_marks_small: {EN: 'Small', JP: '縦幅小', ZH: '较小高度'},
        lb_settings_sudoku_normal: {EN: 'Sudoku Normal:', JP: '[数独]通常', ZH: '数独常规数字'},
        lb_settings_sudoku_normal_centered: {EN: 'Centered', JP: '中央', ZH: '居中'},
        lb_settings_sudoku_normal_bottom: {EN: 'Bottom', JP: '下', ZH: '靠下'},
        lb_settings_starbattle_dots: {EN: 'Star Battle Dots:', JP: 'スターバトルの点記号', ZH: '星战点记号'},
        lb_settings_starbattle_dots_high_range: {EN: 'High Range', JP: '入力しやすい', ZH: '输入范围较大'},
        lb_settings_starbattle_dots_low_range: {EN: 'Low Range', JP: '入力しにくい', ZH: '输入范围较小'},
        lb_settings_starbattle_dots_disable: {EN: 'Disable', JP: 'オフ', ZH: '关闭输入'},
        lb_settings_surface_second: {EN: 'Surface Second Color:', JP: 'マスの補助色', ZH: '涂色副选色'},
        lb_settings_surface_second_dark: {EN: 'Dark Grey', JP: '濃灰', ZH: '深灰'},
        lb_settings_surface_second_grey: {EN: 'Grey', JP: '灰', ZH: '浅灰'},
        lb_settings_surface_second_light: {EN: 'Light Grey', JP: '薄灰', ZH: '亮灰'},
        lb_settings_surface_second_black: {EN: 'Black', JP: '黒', ZH: '黑'},
        lb_settings_surface_second_green: {EN: 'Green', JP: '緑', ZH: '绿'},
        lb_settings_surface_second_blue: {EN: 'Blue', JP: '青', ZH: '蓝'},
        lb_settings_surface_second_red: {EN: 'Red', JP: '赤', ZH: '红'},
        lb_settings_surface_second_yellow: {EN: 'Yellow', JP: '黄', ZH: '黄'},
        lb_settings_surface_second_pink: {EN: 'Pink', JP: '桃', ZH: '粉'},
        lb_settings_surface_second_orange: {EN: 'Orange', JP: '橙', ZH: '橙'},
        lb_settings_surface_second_purple: {EN: 'Purple', JP: '紫', ZH: '紫'},
        lb_settings_surface_second_brown: {EN: 'Brown', JP: '茶', ZH: '棕'},
        lb_settings_tools: {EN: 'Tools', JP: '機能', ZH: '工具'},
        lb_settings_custom_colors: {EN: 'Custom Colors (Beta):', JP: '色の設定', ZH: '自定义颜色'},
        lb_settings_floating_panel: {EN: 'Floating Panel:', JP: 'パネル', ZH: '浮窗面板'},
        lb_settings_quick_panel: {EN: 'Quick Panel Button', JP: 'パネル切り替えボタン', ZH: '浮窗面板启用按钮'},
        lb_settings_export: {EN: 'Export', JP: '出力', ZH: '导出'},
        lb_settings_auto_shorten: {EN: 'Auto-Shorten Links', JP: '自動でURLを短縮する', ZH: '自动使用短链接'},
        lb_settings_input_options: {EN: 'Input Options', JP: '入力設定', ZH: '输入选项'},
        lb_settings_mouse_middle: {EN: 'Mouse Middle Button:', JP: 'マウスホイール', ZH: '鼠标中键'},
        lb_settings_reload: {EN: 'Reload Protection:', JP: 'リロード時に警告', ZH: '刷新警告'},
        lb_settings_conflict: {EN: 'Conflict Detection:', JP: '不一致の検出', ZH: '冲突检测'},
        lb_settings_conflict_off_this: {EN: 'OFF (this puzzle)', JP: 'OFF（このパズル）', ZH: '关闭（仅该谜题）'},
        lb_settings_conflict_off_all: {EN: 'OFF (all puzzles)', JP: 'OFF（全てのパズル）', ZH: '关闭（全部谜题）'},
        lb_settings_sudoku_keys: {
            EN: 'Sudoku Z/Y & XCV Keys:',
            JP: '数独のショートカットキ (Z/Y & XCV)',
            ZH: '数独快捷键（Z/Y & XCV）'
        },
        lb_settings_textoutline: {EN: 'Outline on Text:', JP: 'テキストのアウトライン', ZH: '文字描边：'},
        lb_settings_pencil_marks: {EN: 'Check pencil marks:', JP: '候補数字をチェック', ZH: '检测候选数字：'},
        lb_settings_lineanycolor: {
            EN: 'Any color can match green line/edge in solution:',
            JP: 'どの色も解答の緑線/辺と一致する',
            ZH: '任意颜色可与解答中绿色线/边匹配：'
        },
        lb_settings_auto_save_history: {
            EN: 'Auto-save puzzle in browser history:',
            JP: 'ブラウザの履歴にパズルを自動保存',
            ZH: '在浏览器历史中自动保存谜题：'
        },
        lb_settings_storage: {EN: 'Saving/Storage', JP: '保存', ZH: '存储'},
        lb_settings_saved_settings: {EN: 'Saved Settings:', JP: '保存した設定', ZH: '保存设置'},
        clear_settings: {EN: 'Clear cookies', JP: 'クッキーをクリアする', ZH: '清除缓存'},
        lb_settings_local_storage: {EN: 'Local Storage:', JP: 'ローカルストレージ', ZH: '本地存储'},
        clear_storage_one: {EN: 'Clear this puzzle', JP: 'この盤面の履歴を消去する', ZH: '清除该谜题'},
        clear_storage_all: {EN: 'Clear all', JP: '全ての履歴を消去する', ZH: '清除所有'},
        local_storage_browser_message: {
            EN: "Your browser has disabled or doesn't support local storage.",
            JP: "このブラウザはローカルストレージが無効になっているか、対応していません。",
            ZH: '您的浏览器不支持本地存储。'
        },
        local_storage_cleared: {
            EN: 'Local Storage is Cleared',
            JP: 'ローカルストレージが消去されました。',
            ZH: '本地存储已清除。'
        },
        clear_settings_message: {
            EN: 'You must reload the page for the default settings to take effect.',
            JP: '初期設定を有効にするには、ページを再読み込みしてください。',
            ZH: '已重置至初始设置，刷新界面以生效。'
        },
        display_size_max: {
            EN: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to max value.',
            JP: '表示サイズは以下の範囲です <h2 class=warn">12-90</h2>" 上限に設定されました。',
            ZH: '显示大小必须介于 <h2 class="warn">12-90</h2> 之间，已设置为最大值。'
        },
        display_size_min: {
            EN: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to min value.',
            JP: '表示サイズは以下の範囲です <h2 class=warn">12-90</h2>" 下限に設定されました。',
            ZH: '显示大小必须介于 <h2 class="warn">12-90</h2> 之间，已设置为最小值。'
        },

        copied_success: {
            EN: 'URL is copied to clipboard',
            JP: 'URLがクリップボードにコピーされました。',
            ZH: '已复制链接至剪贴板'
        },
        sudoku_size_unsupported: {
            EN: 'Sorry, sudoku grids of size: $v are not supported',
            JP: '数独サイズ: $vには対応していません。',
            ZH: '不支持大小为 $v 的数独盘面'
        },

        // Modals
        f2_title: {
            EN: 'Are you sure to switch to Editing Mode?',
            JP: '編集モードに切り替えますか？',
            ZH: '确定切换到编辑模式？'
        },
        f2_body: {
            EN: 'You have pressed F2. You can either Cancel or later press F3 to switch back to Solving Mode.',
            JP: 'F2キーが入力されました。キャンセルするかF3キーを押すことで解答モードに切り替えることができます。',
            ZH: '您摁下了F2。您可以取消本次操作或在稍后摁下F3返回解答模式。'
        },
        f2_confirm: {
            EN: 'Yes, switch',
            JP: 'はい、切り替えます。',
            ZH: '确定切换'
        },
        f3_title: {
            EN: 'Are you sure to switch to Solving Mode?',
            JP: '解答モードに切り替えますか？',
            ZH: '确定切换到解答模式？'
        },
        solution_incorrect_title: {
            EN: 'Your solution is incorrect.',
            JP: '解答が誤っています。',
            ZH: '您的解答有误'
        },
        solution_incorrect_main: {
            EN: Identity.incorrectMessage
        },

        preparing_download: {EN: "Preparing your download", JP: 'ダウンロード準備中', ZH: '下载准备中'},

        border_setting_help: {
            EN: 'To place clues on grid border/edges and corners:<br> Turn "Draw on Edges": ON',
            JP: '文字などをマスの線上や角に配置する<br> "Draw on Edges:"→"ON"',
            ZH: '在格子边/角上放置线索：<br>将"沿格线放置"设置为"开"'
        },

        display_size_warning: {
            EN: 'Display size must be in the range <h2 class="warn">12-90</h2>',
            JP: '表示サイズは以下の範囲です <h2 class="warn">12-90</h2>',
            ZH: '显示大小必须处于以下范围内 <h2 class="warn">12-90</h2>'
        },

        create_check_warning_title: {
            EN: 'Are you sure want to reset the current board? To only change display size and grid lines use "Update display" button',
            JP: '現在の盤面をリセットしますか？ 表示サイズやグリッドを変えるには、枠変更を押してください。',
            ZH: '确定要重置现有盘面吗？仅改变显示大小和格线请点击“更新盘面”按钮'
        },
        create_check_warning_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません',
            ZH: '你将无法撤销恢复！'
        },
        create_check_warning_confirm: {
            EN: 'Yes, Reset it!',
            JP: 'はい、リセットします。',
            ZH: '确定重置'
        },
        reset_check_title_helper: {
            EN: 'Erase/Clear all Helper (x) - Crosses in Line Mode?',
            JP: '全ての補助xを消去しますか?',
            ZH: '消除线类别所有×标记？'
        },
        reset_check_title_line: {
            EN: 'Erase/Clear all LINE mode elements?',
            JP: '全ての線を消去しますか?',
            ZH: '消除线类别所有元素？'
        },
        reset_check_title_edge_helper: {
            EN: 'Erase/Clear all Helper (x) - Crosses in Edge Mode?',
            JP: '全ての補助xを消去しますか?',
            ZH: '消除边类别所有×标记？'
        },
        reset_check_title_edge_erased: {
            EN: 'Reset Erased Edges in Edge Mode?',
            JP: '全ての枠消を消去しますか?',
            ZH: '重置边类别所有消除？'
        },
        reset_check_title_edge: {
            EN: 'Erase/Clear all EDGE mode elements?',
            JP: '全ての辺を消去しますか?',
            ZH: '消除边类别所有元素？'
        },
        reset_check_title_shape: {
            EN: 'Erase/Clear all SHAPE mode elements?',
            JP: '全ての記号を消去しますか?',
            ZH: '消除形状类别所有元素？'
        },
        reset_check_title_frame: {
            EN: 'Erase/Clear all FRAME mode elements?',
            JP: '全ての枠を消去しますか?',
            ZH: '消除笼框类别所有元素？'
        },
        reset_check_title_generic: {
            EN: 'Erase/Clear all $v mode elements?',
            JP: '全ての$vを消去しますか？',
            ZH: '消除$v类别所有元素？'
        },
        reset_check_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません',
            ZH: '你将无法撤销恢复！'
        },
        reset_check_confirm: {
            EN: 'Yes, Erase it!',
            JP: 'はい、消去します',
            ZH: '确定消除'
        },
        delete_check_problem: {
            EN: 'Erase/Clear all the elements in PROBLEM mode?',
            JP: '全ての問題を消去しますか？',
            ZH: '消除谜题模式所有元素？'
        },
        delete_check_solution: {
            EN: 'Erase/Clear all the elements in SOLUTION mode?',
            JP: '全ての解答を消去しますか？',
            ZH: '消除解答模式所有元素？'
        },
        delete_check_main: {
            EN: 'You won\'t be able to revert this!',
            JP: 'やり直しできません',
            ZH: '你将无法撤销恢复！'
        },
        delete_check_confirm: {
            EN: 'Yes, Erase it!',
            JP: 'はい、消去します',
            ZH: '确定消除'
        },

        unsupported_browser_title: {
            EN: 'Unsupported Browser',
            JP: 'サポートされていないブラウザ',
            ZH: '不支持的浏览器'
        },
        unsupported_browser_main: {
            EN: 'Your browser does not appear to support the needed functionality for a file to be made.',
            JP: 'あなたのブラウザはSVGに対応していません。', // JP text needs update
            ZH: '您的浏览器不支持创建文件所需功能'
        },
        unsupported_filename: {
            EN: 'The characters <h2 class="warn">\\ / : * ? \" < > |</h2> cannot be used in filename.',
            JP: '<h2 class="warn">\\ / : * ? \" < > |</h2>は使用できません。',
            ZH: '文件名不能使用字符<h2 class="warn">\\ / : * ? \" < > |</h2>'
        },

        file_save_no_contents: {
            EN: 'There is nothing to save to the file.',
            JP: 'ファイルに保存するものがありません。',
            ZH: '没有内容可保存到文件中。'
        },
        file_save_filename_title: {
            EN: 'The characters \\ / : * ? \" < > | cannot be used in filename.',
            JP: '\\ / : * ? \" < > |は使用できません。',
            ZH: '文件名中不能使用字符 \\ / : * ? " < > |。'
        },

        sudoku_input_minmax_error: {
            EN: 'Error: Min/Max Sudoku Size allowed is 1x1 to 9x9 (Default is 9x9). Update the input parameters below.',
            JP: 'エラー：数独の盤面サイズは1x1〜9x9です（初期設定は9x9）。入力し直してください。',
            ZH: '错误：数独盘面尺寸应在1x1~9x9之间（默认为9x9）。在下方更新参数。'
        },
        sudoku_input_size_error: {
            EN: 'Error: Grid size is smaller than the specified Sudoku size (Default is 9x9). Update the input parameters below.',
            JP: 'エラー：数独の盤面サイズが小さすぎます（初期設定は9x9）。入力し直してください。',
            ZH: '错误：盘面尺寸小于设定的数独大小（默认为9x9）。在下方更新参数。'
        },
        sudoku_input_square_error: {
            EN: 'Error: The canvas area should be a sudoku grid or square grid',
            JP: 'エラー：描画範囲は数独の盤面か正方形盤面である必要があります。',
            ZH: '错误：数独盘面应使用正方形网格'
        },

        invalid_url: {
            EN: "Error: Invalid URL",
            JP: 'エラー：不正なURLです',
            ZH: '错误：无效的链接'
        },

        nb_sudoku3_lb_square: {
            EN: '*White space is subtracted from the row/column size',
            JP: '余白はタテ・ヨコのサイズから引かれます。',
            ZH: '留白将从盘面尺寸中减去。'
        },
        nb_sudoku3_lb_hex: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。',
            ZH: '留白将从盘面尺寸中减去。'
        },
        nb_sudoku3_lb_tri: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。',
            ZH: '留白将从盘面尺寸中减去。'
        },
        nb_sudoku3_lb_pyramid: {
            EN: '*White space is subtracted from the Side size',
            JP: '余白は盤面サイズから引かれます。',
            ZH: '留白将从盘面尺寸中减去。'
        },
        nb_sudoku3_lb_sudoku: {
            EN: 'Outside clues (top/left)',
            JP: '外周ヒント(上左)',
            ZH: '外提示数（左上）'
        },
        nb_sudoku7_lb_sudoku: {
            EN: '*Default size is 9x9',
            JP: '標準サイズは9x9です。',
            ZH: '默认大小为9x9'
        },

        size_warning_square: {
            EN: 'Rows/Columns Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: 'タテヨコの大きさは以下の範囲です <h2 class="warn">1-$v</h2>',
            ZH: '盘面尺寸取值必须在<h2 class="warn">1-$v</h2>范围内'
        },
        size_warning_kakuro: {
            EN: 'Rows/Columns Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: 'タテヨコの大きさは以下の範囲です <h2 class="warn">1-$v</h2>',
            ZH: '盘面尺寸取值必须在<h2 class="warn">1-$v</h2>范围内'
        },
        size_warning_generic: {
            EN: 'Side Size must be in the range <h2 class="warn">1-$v</h2>',
            JP: '一辺の大きさは以下の範囲です <h2 class="warn">1-$v</h2>',
            ZH: '盘面尺寸取值必须在<h2 class="warn">1-$v</h2>范围内'
        },
        order_warning_generic: {
            EN: 'Order must be in the range <h2 class="warn">3-$v</h2>',
            JP: '注文は範囲内でなければなりません <h2 class="warn">3-$v</h2>',
            ZH: '盘面阶数取值必须在<h2 class="warn">3-$v</h2>范围内'
        },
        rotational_asymmetry_warning_generic: {
            EN: 'Rotational asymmetry must be in the range <h2 class="warn">0-$v</h2> for this order',
            JP: '回転非対称性は範囲内でなければならない <h2 class="warn">0-$v</h2> この注文について',
            ZH: '旋转不对称性取值必须在<h2 class="warn">0-$v</h2>范围内'
        },

        alpha_warning: {
            EN: "**Alpha Version - It's under development and currently has limited functionality",
            JP: 'これはアルファ版です。開発は初期段階で、機能は制限されています。',
            ZH: '**Alpha版本：该内容正在开发中，目前功能有限。'
        },

        iostring: {
            EN: 'Enter digits (0-9, 0 or . for an empty cell, no spaces). The number of digits entered should be a perfect square. Default expected length is 81 digits (9x9 sudoku)',
            JP: '数字を入力（0〜9、空白マスは「0」「.」、スペース不可）。文字数は平方数（初期設定では81文字）にしてください。',
            ZH: '输入数字（0~9,不可输入空格，空白格使用0或.表示）。数字长度应为平方数（默认长度为81位）。'
        },
        urlstring: {
            EN: 'In case of \"URL too long Error\". Type/Paste Penpa-edit URL here and click on Load button. You can also load puzz.link puzzles here',
            JP: "URLが長すぎるエラーの時はここに入力。puzz.linkの一部のリンクにも対応。",
            ZH: '如果出现“链接过长”错误，可在此处输入/粘贴Penpa-edit链接并点击加载按钮。也可以在此处加载puzz.link谜题。'
        },

        "answer_check_shading exact color": {
            EN: "Match exact shading colors",
            JP: 'シェーディングカラーを正確に一致させる',
            ZH: '匹配颜色的涂色'
        },
        "answer_check_shading": {
            EN: "Shade cells in Dark Grey (DG) or Grey (GR) or Light Grey (LG) or Black (BL)",
            JP: '黒マスは濃灰（DG）、灰（GR）、薄灰（LG）、黒（BL）',
            ZH: '深灰、浅灰、亮灰或黑色的涂色'
        },
        "answer_check_number": {
            EN: "Numbers must be in Green, Blue or Red color",
            JP: '数字は緑か青か赤',
            ZH: '绿色、蓝色或红色的数字'
        },
        "answer_check_cell loop exact": {
            EN: "Line must be in Green Color",
            JP: '色とスタイルが一致する線',
            ZH: '匹配颜色的线'
        },
        "answer_check_cell loop": {EN: "Line must be in Green Color", JP: '線は緑', ZH: '绿色的线'},
        "answer_check_edge loop exact": {
            EN: "Edges in matching color/style",
            JP: '色とスタイルがマッチしたエッジ',
            ZH: '匹配颜色的边'
        },
        "answer_check_edge loop": {EN: "Edge must be in Green Color", JP: '辺は緑', ZH: '绿色的边'},
        "answer_check_wall": {EN: "Walls must be in Green Color", JP: '壁は緑', ZH: '绿色的墙'},
        "answer_check_square": {EN: "Black Squares", JP: '黒正方形', ZH: '黑色正方形'},
        "answer_check_circle": {
            EN: "White and Black circles of medium (M) size",
            JP: '中サイズ（M）の白マルまたは黒マル',
            ZH: '大小为中（M）的黑白圆'
        },
        "answer_check_shakashaka": {EN: "Half triangles", JP: '直角三角形', ZH: '直角三角形'},
        "answer_check_arrow": {EN: "Small arrows", JP: '小矢印', ZH: '小箭头'},
        "answer_check_magnets": {EN: "+ and - in black or green color", JP: '＋またはー、黒または緑', ZH: '绿色的+-'},
        "answer_check_battleship": {EN: "Battleship fleet", JP: '艦隊', ZH: '战舰'},
        "answer_check_tents": {EN: "Tents", JP: 'テント', ZH: '帐篷'},
        "answer_check_star battle": {EN: "Stars", JP: '星', ZH: '星'},
        "answer_check_akari": {EN: "Light bulbs", JP: '明かり', ZH: '灯泡'},
        "answer_check_minesweeper": {EN: "Mines", JP: '地雷', ZH: '地雷'},

        "solution_checker_all": {
            EN: 'Solution checker looks for ALL of the following:',
            JP: '以下の全てを正解判定する',
            ZH: '答案检测以下所有元素：'
        },
        "solution_checker_one": {
            EN: 'Solution checker looks for ONE of the following:',
            JP: '以下のうち一つを正解判定する',
            ZH: '答案检测以下任一元素：'
        },

        "gmp_unsupported": {
            EN: 'Error - It doesnt support puzzle type $v\n' +
                'Please see instructions (Help) for supported puzzle types\n' +
                'For additional genre support please submit your request to penpaplus@gmail.com',
            JP: 'エラー：対応していないパズル種です。$v\n 対応パズル種についてはヘルプを参照してください。',
            ZH: '错误：不支持的谜题类型 $v 。请查看帮助确认支持的谜题类型。'
        },
        "gmp_enter_type": {
            EN: 'Error - Enter the Puzzle type in Header area\n' +
                'Please see instructions (Help) for supported puzzle types\n',
            JP: 'エラー：ヘッダーにパズル種を入力してください。\n 対応パズル種についてはヘルプを参照してください。\n',
            ZH: '错误：需在头文件区域输入谜题类型。请查看帮助确认支持的谜题类型。'
        },

        "box_mode_warning": {
            EN: '<h3 class="info">Last cell cannot be removed using the "Box" mode. For a blank grid use the following approach:</h3><ol><li>Click on "New Grid / Update"</li><li>Set "Gridlines" to "None"</li><li>Set "Gridpoints" to "No"</li><li>Set "Outside frame" to "No"</li><li>Click on "Update display"</li></ol>',
            JP: '<h3 class=info">"マス"モードでは盤面全てのマスの削除はできません。マスの無い盤面は以下のように作成してください。</h3><ol><li>"New Grid / Update"を選択</li><li>"Gridlines"→"None"</li><li>"Gridpoints"→"No"</li><li>"Outside frame"→"No"</li><li>"Update display"を選択</li></ol>"',
            ZH: '<h3 class="info">无法使用“格子”模式删去全部格子。如果需要空盘面请按照以下步骤操作：</h3><ol><li>点击“新建/更新”</li><li>设置“格线”为“无”</li><li>设置“格点”为“无”</li><li>设置“外框”为“无”</li><li>点击“更新盘面”</li></ol>'
        },

        _todo: {}
    },

    modes: {
        EN: ["Surface", "Multicolor",
            "Line Normal", "Line Diagonal", "Line Free", "Line Middle", "Line Helper",
            "Edge Normal", "Edge Diagonal", "Edge Free", "Edge Helper", "Edge Erase",
            "Wall",
            "Move All",
            "Number Normal", "Number L", "Number M", "Number S", "Candidates", "Number 1/4", "Number Side",
            "Sudoku Normal", "Sudoku Corner", "Sudoku Centre",
            "Shape",
            "Special", "Thermo", "Sudoku Arrow",
            "Composite"
        ],
        JP: ["黒マス", "多色",
            "線 通常", "線 対角線", "線 自由線", "線 中線", "線 補助x",
            "辺 通常", "辺 対角線", "辺 自由線", "辺 補助x", "辺 枠消",
            "壁",
            "移動 全",
            "数字 通常", "数字 大", "数字 中", "数字 小", "数字 候補", "数字 1/4", "数字 辺",
            "数独 通常", "数独 角", "数独 中央",
            "記号",
            "特殊", "サーモ", "数独 アロー",
            "複合"
        ],
        ZH: ["涂色", "多色",
            "线 常规", "线 对角线", "线 自由绘制", "线 中心线", "线 x标记",
            "边 常规", "边 对角线", "边 自由绘制", "边 x标记", "边 清除",
            "墙",
            "移动 全部",
            "数字 常规", "数字 大", "数字 中", "数字 小", "数字 候选数", "数字 1/4", "数字 边缘",
            "数独 常规", "数独 角", "数独 中央",
            "形状",
            "特殊", "温度计", "数独箭头",
            "复合"],
        mapping: ["surface", "multicolor",
            "sub_line1", "sub_line2", "sub_line3", "sub_line5", "sub_line4",
            "sub_lineE1", "sub_lineE2", "sub_lineE3", "sub_lineE4", "sub_lineE5",
            "wall",
            "sub_move1",
            "sub_number1", "sub_number10", "sub_number6", "sub_number5", "sub_number7", "sub_number3", "sub_number9",
            "sub_sudoku1", "sub_sudoku2", "sub_sudoku3",
            "symbol",
            "special", "sub_specialthermo", "sub_specialarrows",
            "combi"
        ]
    },

    vanillaSelect: {
        EN: {"all": "All", "items": "items", "selectAll": "Check All", "clearAll": "Clear All"},
        JP: {"all": "全", "items": "項目", "selectAll": "全てチェック", "clearAll": "全てチェックを外す"},
        ZH: {"all": "全部", "items": "项目", "selectAll": "全部选择", "clearAll": "全部清除"}
    }

};
