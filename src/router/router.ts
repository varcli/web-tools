//对外暴露配置路由(常量路由)
export const constantRoute = [
  //首页
  {
    path: '/',
    component: () => import('@/components/Home/Home.vue'),
    name: 'home',
    meta: {
      keywords: 'web-tools,在线工具,开发人员工具,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
      description: 'web-tools,在线工具,在线工具大全,开发人员工具,日常生活工具,办公助手,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
    }
  },
  //工具
  {
    path: '/timetran',
    component: () => import('@/components/Tools/TimeTran/index.vue'),
    name: 'timetran',
    meta: {
      title: "时间工具箱",
      keywords: '时间戳转换,日期差值,日期加减,时区转换,Unix时间戳',
      description: '转换 Unix 时间戳，计算日期差值与日期加减，并按指定时区转换时间。',
    }
  },
  {
    path: '/md5',
    component: () => import('@/components/Tools/MD5/index.vue'),
    name: 'MD5',
    meta: {
      title: "MD5在线加密",
      keywords: 'md5加密，md5在线加密，md5',
      description: '在线md5加密，一键生成md5加密字符串，可生成16位或32位md5加密字符串，md5双重加密',
    }
  },
  {
    path: '/json',
    component: () => import('@/components/Tools/JsonTran/index.vue'),
    name: 'json',
    meta: {
      title: 'JSON 格式化',
      keywords: 'JSON 格式化,JSON 校验,JSON 压缩,JSON 转义,JSON 去转义',
      description: '在线校验、格式化和压缩 JSON，支持转义、去转义与复制。',
    }
  },
  {
    path: '/json-extract',
    component: () => import('@/components/Tools/JsonExtract/index.vue'),
    name: 'json-extract',
    meta: {
      title: 'JSON 提取',
      keywords: 'JSONPath,JSON 提取,字段提取,键值提取',
      description: '通过 JSONPath、字段选择和键值提取筛选 JSON 数据',
    }
  },
  {
    path: '/format-converter',
    component: () => import('@/components/Tools/FormatConverter/index.vue'),
    name: 'format-converter',
    meta: {
      title: 'JSON 格式转换',
      keywords: 'JSON,YAML,XML,CSV,Excel,SQL,格式转换',
      description: '在 JSON、YAML、XML、CSV、Excel 和 SQL 等格式之间转换',
    }
  },
  {
    path: '/code-formatter',
    component: () => import('@/components/Tools/CodeFormatter/index.vue'),
    name: 'code-formatter',
    meta: {
      title: '代码格式化',
      keywords: 'JavaScript,TypeScript,HTML,CSS,JSON,YAML,SQL,代码格式化',
      description: '格式化 JavaScript、TypeScript、HTML、CSS、JSON、YAML、SQL 等代码',
    }
  },
  {
    path: '/websocket',
    component: () => import('@/components/Tools/WebSocketDebug/index.vue'),
    name: 'websocket',
    meta: { title: 'WebSocket 调试', keywords: 'WebSocket,WS,WSS,消息调试', description: '连接 WebSocket 服务并收发消息' }
  },
  {
    path: '/cron-generator',
    component: () => import('@/components/Tools/CronGenerator/index.vue'),
    name: 'cron-generator',
    meta: { title: 'Cron 表达式生成', keywords: 'Cron,定时任务,表达式', description: '生成 Cron 表达式并计算执行时间' }
  },
  {
    path: '/subnet-calculator',
    component: () => import('@/components/Tools/SubnetCalculator/index.vue'),
    name: 'subnet-calculator',
    meta: { title: '子网计算器', keywords: 'IPv4,CIDR,子网,掩码', description: '计算 IPv4 子网地址、掩码和主机范围' }
  },
  {
    path: '/mock-data-generator',
    component: () => import('@/components/Tools/MockDataGenerator/index.vue'),
    name: 'mock-data-generator',
    meta: { title: 'Mock 数据生成器', keywords: 'Mock,测试数据,姓名,手机号,身份证号', description: '批量生成开发测试数据并导出' }
  },
  {
    path: '/keyboard-tester',
    component: () => import('@/components/Tools/KeyboardTester/index.vue'),
    name: 'keyboard-tester',
    meta: { title: '键盘按键测试', keywords: '键盘,按键,key,code,keyCode', description: '可视化测试键盘按键和事件信息' }
  },
  {
    path: '/totp-generator',
    component: () => import('@/components/Tools/TotpGenerator/index.vue'),
    name: 'totp-generator',
    meta: { title: 'TOTP 动态口令生成器', keywords: 'TOTP,OTP,双重验证,动态口令', description: '本地生成 TOTP 动态口令' }
  },
  {
    path: '/string-generator',
    component: () => import('@/components/Tools/StringGenerator/index.vue'),
    name: 'string-generator',
    meta: { title: '字符串生成器', keywords: 'ULID,UUID,随机字符串', description: '生成 ULID、UUID 和随机字符串' }
  },
  {
    path: '/compound-interest-calculator',
    component: () => import('@/components/Tools/CompoundInterestCalculator/index.vue'),
    name: 'compound-interest-calculator',
    meta: { title: '复利计算器', keywords: '复利,定投,收益', description: '计算月复利和定投金额' }
  },
  {
    path: '/mortgage-calculator',
    component: () => import('@/components/Tools/MortgageCalculator/index.vue'),
    name: 'mortgage-calculator',
    meta: { title: '房贷计算器', keywords: '房贷,贷款,等额本息,等额本金', description: '计算月供、利息和还款计划' }
  },
  {
    path: '/prepayment-calculator',
    component: () => import('@/components/Tools/PrepaymentCalculator/index.vue'),
    name: 'prepayment-calculator',
    meta: { title: '提前还款计算器', keywords: '房贷,提前还款,节省利息', description: '比较提前还款前后的利息和期数' }
  },
  {
    path: '/calorie-calculator',
    component: () => import('@/components/Tools/CalorieCalculator/index.vue'),
    name: 'calorie-calculator',
    meta: { title: '每日热量计算器', keywords: '热量,基础代谢,卡路里', description: '估算基础代谢与每日热量消耗' }
  },
  {
    path: '/body-fat-calculator',
    component: () => import('@/components/Tools/BodyFatCalculator/index.vue'),
    name: 'body-fat-calculator',
    meta: { title: '体脂率计算器', keywords: '体脂率,BMI,围度', description: '通过 BMI 或围度估算体脂率' }
  },
  {
    path: '/income-tax-calculator',
    component: () => import('@/components/Tools/IncomeTaxCalculator/index.vue'),
    name: 'income-tax-calculator',
    meta: { title: '个人所得税计算器', keywords: '个税,工资,年终奖,预扣', description: '计算工资累计预扣税额及年终奖税额' }
  },
  {
    path: '/chinese-convert',
    component: () => import('@/components/Tools/ChineseConvert/index.vue'),
    name: 'chinese-convert',
    meta: { title: '简繁转换', keywords: '简体,繁体,台湾,香港', description: '简体中文与台湾、香港繁体互转' }
  },
  {
    path: '/barcode',
    component: () => import('@/components/Tools/Barcode/index.vue'),
    name: 'barcode',
    meta: { title: '条码生成器', keywords: '条形码,Code128,EAN,UPC,Data Matrix', description: '生成和批量下载常用条码' }
  },
  {
    path: '/image-to-svg',
    component: () => import('@/components/Tools/ImageToSvg/index.vue'),
    name: 'image-to-svg',
    meta: { title: '图片转 SVG', keywords: '图片,SVG,矢量化,描摹', description: '将位图描摹为 SVG 路径' }
  },
  {
    path: '/image-to-gif',
    component: () => import('@/components/Tools/ImageToGif/index.vue'),
    name: 'image-to-gif',
    meta: { title: '图片转 GIF', keywords: '图片,GIF,动画', description: '多张图片生成 GIF 动画' }
  },
  {
    path: '/gif-editor',
    component: () => import('@/components/Tools/GifEditor/index.vue'),
    name: 'gif-editor',
    meta: { title: 'GIF 编辑器', keywords: 'GIF,裁剪,速度,反向', description: '调整 GIF 帧、速度和尺寸' }
  },
  {
    path: '/video-to-gif',
    component: () => import('@/components/Tools/VideoToGif/index.vue'),
    name: 'video-to-gif',
    meta: { title: '视频转 GIF', keywords: '视频,GIF,动画', description: '将视频片段转换为 GIF' }
  },
  {
    path: '/video-image-converter',
    component: () => import('@/components/Tools/VideoImageConverter/index.vue'),
    name: 'video-image-converter',
    meta: { title: '视频 / 图片互转', keywords: '视频,图片,截帧,WebM', description: '视频截帧与图片生成 WebM' }
  },
  {
    path: '/live-photo',
    component: () => import('@/components/Tools/LivePhoto/index.vue'),
    name: 'live-photo',
    meta: { title: '动态照片制作与拆解', keywords: '动态照片,JPEG,MP4', description: '制作或拆解 JPEG 加 MP4 动态照片' }
  },
  {
    path: '/audio-studio',
    component: () => import('@/components/Tools/AudioStudio/index.vue'),
    name: 'audio-studio',
    meta: { title: '音频工作台', keywords: '音频,录音,裁剪,WAV,MP3', description: '音频录制、裁剪、增益与格式转换' }
  },
  {
    path: '/wechat-chat',
    component: () => import('@/components/Tools/WechatChat/index.vue'),
    name: 'wechat-chat',
    meta: { title: '聊天记录模拟器', keywords: '聊天,微信,截图,模拟', description: '制作并导出聊天记录示意图' }
  },
  {
    path: '/placeholder-image',
    component: () => import('@/components/Tools/PlaceholderImage/index.vue'),
    name: 'placeholder-image',
    meta: { title: '占位图生成器', keywords: '占位图,SVG,PNG,前端', description: '自定义尺寸与颜色并生成占位图' }
  },
  {
    path: '/color-contrast-checker',
    component: () => import('@/components/Tools/ColorContrastChecker/index.vue'),
    name: 'color-contrast-checker',
    meta: { title: '颜色对比度检查器', keywords: '颜色,对比度,WCAG,AA,AAA', description: '计算颜色对比度并检查 WCAG 阈值' }
  },
  {
    path: '/base64-image',
    component: () => import('@/components/Tools/Base64Image/index.vue'),
    name: 'base64-image',
    meta: { title: 'Base64 图片转换', keywords: '图片,Base64,Data URI', description: '图片与 Base64 Data URI 双向转换' }
  },
  {
    path: '/image-compressor',
    component: () => import('@/components/Tools/ImageCompressor/index.vue'),
    name: 'image-compressor',
    meta: { title: '图片压缩', keywords: '图片,压缩,WebP,JPEG,PNG', description: '批量压缩图片并调整尺寸与格式' }
  },
  {
    path: '/favicon-generator',
    component: () => import('@/components/Tools/FaviconGenerator/index.vue'),
    name: 'favicon-generator',
    meta: { title: 'Favicon 生成', keywords: 'Favicon,ICO,图标,PNG', description: '将图片生成多尺寸网站图标' }
  },
  {
    path: '/avatar-generator',
    component: () => import('@/components/Tools/AvatarGenerator/index.vue'),
    name: 'avatar-generator',
    meta: { title: '随机头像生成器', keywords: '随机头像,SVG,PNG,种子', description: '通过文字种子生成可复现的头像' }
  },
  {
    path: '/image-list-processor',
    component: () => import('@/components/Tools/ImageListProcessor/index.vue'),
    name: 'image-list-processor',
    meta: { title: '图片列表处理', keywords: '图片,URL,批量下载,ZIP', description: '预览、去重并批量下载图片地址' }
  },
  {
    path: '/file-renamer',
    component: () => import('@/components/Tools/FileRenamer/index.vue'),
    name: 'file-renamer',
    meta: { title: '批量文件重命名', keywords: '文件,批量重命名,ZIP', description: '批量预览新文件名并打包下载' }
  },
  {
    path: '/whitespace-cleaner',
    component: () => import('@/components/Tools/WhitespaceCleaner/index.vue'),
    name: 'whitespace-cleaner',
    meta: { title: '空格清理', keywords: '空格,空行,文本清理', description: '组合清理文本空白字符、空行和换行符' }
  },
  {
    path: '/html-extractor',
    component: () => import('@/components/Tools/HtmlExtractor/index.vue'),
    name: 'html-extractor',
    meta: { title: 'HTML 提取', keywords: 'HTML,图片,链接,资源提取', description: '从 HTML 中提取图片、链接、脚本等资源' }
  },
  {
    path: '/html-markdown-converter',
    component: () => import('@/components/Tools/HtmlMarkdownConverter/index.vue'),
    name: 'html-markdown-converter',
    meta: { title: 'HTML / Markdown 互转', keywords: 'HTML,Markdown,格式转换', description: 'HTML 与 Markdown 双向转换' }
  },
  {
    path: '/markdown-word-converter',
    component: () => import('@/components/Tools/MarkdownWordConverter/index.vue'),
    name: 'markdown-word-converter',
    meta: { title: 'Markdown / Word 互转', keywords: 'Markdown,Word,DOCX,文档', description: 'Markdown 与 DOCX 双向转换' }
  },
  {
    path: '/markdown-pdf-converter',
    component: () => import('@/components/Tools/MarkdownPdfConverter/index.vue'),
    name: 'markdown-pdf-converter',
    meta: { title: 'Markdown / PDF 互转', keywords: 'Markdown,PDF,打印,提取', description: 'Markdown 打印为 PDF 或从 PDF 提取 Markdown' }
  },
  {
    path: '/yml-properties-converter',
    component: () => import('@/components/Tools/YmlPropertiesConverter/index.vue'),
    name: 'yml-properties-converter',
    meta: { title: 'YML / Properties 互转', keywords: 'YAML,YML,Properties,Spring', description: 'YAML 与 Properties 双向转换' }
  },
  {
    path: '/css-gradient-generator',
    component: () => import('@/components/Tools/CssGradientGenerator/index.vue'),
    name: 'css-gradient-generator',
    meta: { title: 'CSS 渐变生成', keywords: 'CSS,渐变,linear-gradient,radial-gradient', description: '可视化生成线性与径向 CSS 渐变' }
  },
  {
    path: '/reg',
    component: () => import('@/components/Tools/RegTest/index.vue'),
    name: 'reg',
    meta: {
      title: "正则表达式测试",
      keywords: '正则表达式测试工具,常用正则表达式,在线正则表达式',
      description: '正则表达式测试工具,常用正则表达式,在线正则表达式',
    }
  },
  {
    path: '/unicode',
    component: () => import('@/components/Tools/Unicode/index.vue'),
    name: 'unicode',
    meta: {
      title: "Unicode转中文",
      keywords: '在线Unicode编码转换，中文转Unicode，Unicode转中文',
      description: '在线Unicode编码转换，中文转Unicode，Unicode转中文，在文本框里输入要转换的内容，然后点击要转换的类型按钮，转换完成后即可看到对应的内容。..',
    }
  },
  {
    path: '/wordcount',
    component: () => import('@/components/Tools/WordCount/index.vue'),
    name: 'wordcount',
    meta: {
      title: "在线字数统计",
      keywords: '在线字数计算器,计算字数,在线字数统计器,字数计数器',
      description: '在线字数计数器,主要是方便计算字数，以控制文字数量的小工具(小说作者、论文、文案文档、文字编辑必备工具)。',
    }
  },
  {
    path: '/scaletran',
    component: () => import('@/components/Tools/ScaleTran/index.vue'),
    name: 'scaletran',
    meta: {
      title: "常用进制转换",
      keywords: '进制转换,进制转换工具,10进制转2进制,2进制转10进制,10进制转62进制,62进制转10进制',
      description: '常用进制转换工具，支持32进制以上进制转换',
    }
  },
  {
    path: '/signimage',
    component: () => import('@/components/Tools/SignImage/index.vue'),
    name: 'signimage',
    meta: {
      title: "在线编辑图片",
      keywords: '在线图片裁剪，图片标注，图片滤镜，图片画笔、图片旋转、图片文字，图片美,图片尺寸调整化',
      description: '在线图片裁剪，图片标注，图片滤镜，图片画笔、图片旋转、图片文字,图片尺寸调整等操作',
    }
  },
  {
    path: '/randompassword',
    component: () => import('@/components/Tools/RandomPassword/index.vue'),
    name: 'random_password',
    meta: {
      title: "随机密码生成",
      keywords: '在线生成随机密码，批量生成随机密码，密码生成',
      description: '在线随机密码生成',
    }
  },
  {
    path: '/urlencode',
    component: () => import('@/components/Tools/UrlEncode/index.vue'),
    name: 'urlencode',
    meta: {
      title: "URL编码/解码",
      keywords: 'url编码，url解码，url加密，url解密',
      description: '在线url编码，在线url解码工具',
    }
  },
  {
    path: '/ascii',
    component: () => import('@/components/Tools/ASCII/index.vue'),
    name: 'ascii',
    meta: {
      title: "ASCII码表",
      keywords: 'ascii，ascii码表,ascii对照表，ascii控制字符，ascii打印字符，ascii扩展码',
      description: 'ascii全面对照表，包含控制字符，打印字符，扩展码',
    }
  },
  {
    path: '/uuid',
    component: () => import('@/components/Tools/UUID/index.vue'),
    name: 'uuid',
    meta: {
      title: "UUID生成器",
      keywords: 'UUID生成器',
      description: 'uuid生成器，批量uuid生成',
    }
  },
  {
    path: '/barrage',
    component: () => import('@/components/Tools/Barrage/index.vue'),
    name: 'barrage',
    meta: {
      title: "手持弹幕",
      keywords: '手持弹幕，弹幕工具',
      description: '手持弹幕是一种新型的互动沟通工具，可以方便地为各种户外活动、演出嘉年华等活动增加趣味性和互动性。手持弹幕具有轻便、易携带、易操作等优点，可以让每个参与者都变成活动的一部分。同时，手持弹幕还可以通过预先编写的文本、表情等形式，表达参与者的情感和想法，实现沟通互动。在社交媒体时代，手持弹幕的使用也带来了更广泛的社交效应，增加了活动的互动性和传播度。无论是举办方还是参与者，手持弹幕都是一个非常有价值的互动工具。',
    }
  },
  {
    path: '/unit',
    component: () => import('@/components/Tools/Unit/index.vue'),
    name: 'unit',
    meta: {
      title: "单位转换",
      keywords: '在线单位换算,长度单位换算,面积单位换算,时间单位换算,重量单位换算,温度单位换算,压力单位换算,热量单位换算,功率单位换算。',
      description: '在线单位换算,长度单位换算,面积单位换算,时间单位换算,重量单位换算,温度单位换算,压力单位换算,热量单位换算,功率单位换算。',
    }
  },
  {
    path: '/qrcode',
    component: () => import('@/components/Tools/Qrcode/index.vue'),
    name: 'qrcode',
    meta: {
      title: "二维码生成",
      keywords: '二维码,qrcode,二维码制作,二维码生成,微信二维码',
      description: '在线生成二维码,logo二维码',
    }
  },
  {
    path: '/decision',
    component: () => import('@/components/Tools/Decision/index.vue'),
    name: 'decision',
    meta: {
      title: "帮我决定",
      keywords: '选择困难，难以决定，今天吃什么，现在做什么，自定义选项都给你安排的明明白白',
      description: '选择困难症，自定义选择内容',
    }
  },
  {
    path: '/morse',
    component: () => import('@/components/Tools/Morse/index.vue'),
    name: 'morse',
    meta: {
      title: "摩斯电码",
      keywords: 'morse电码,摩斯电码',
      description: '摩斯电码编码解码',
    }
  },
  {
    path: '/random',
    component: () => import('@/components/Tools/Random/index.vue'),
    name: 'random',
    meta: {
      title: "生成随机数",
      keywords: '随机数生成,随机数',
      description: '可定制范围内进行随机数字，可用于抽奖、点名等用途',
    }
  },
  {
    path: '/numbertochinese',
    component: () => import('@/components/Tools/NumberToChinese/index.vue'),
    name: 'numberToChinese',
    meta: {
      title: "数字转金额大写",
      keywords: '数字转中文,数字转大写,中文转数字,大写转数字,数字中文互转',
      description: '在线数字一键转换成人民币大写，中文大写金额数字应用正楷或行书填写',
    }
  },
  {
    path: '/diff',
    component: () => import('@/components/Tools/Diff/index.vue'),
    name: 'diff',
    meta: {
      title: "文本对比",
      keywords: '中文比对,代码比对，代码对比，文本比对，英文比对',
      description: '文本差异比对支持中文、英文、代码比对',
    }
  },
  {
    path: '/markdown',
    component: () => import('@/components/Tools/Markdown/index.vue'),
    name: 'markdown',
    meta: {
      title: "markdown编辑器",
      keywords: '在线创建或编辑markdown, 实时预览，导出markdown',
      description: '在线markdown编辑器',
    }
  },
  {
    path: '/texttoimg',
    component: () => import('@/components/Tools/TextToImg/index.vue'),
    name: 'textToImg',
    meta: {
      title: "文本转图片",
      keywords: '文本生成图片，文本生成长图，推广长图',
      description: '把文本转换成图片，生成长图，具有超多个性文字排版',
    }
  },
  {
    path: '/bar',
    component: () => import('@/components/Tools/Chart/Bar/index.vue'),
    name: 'bar',
    meta: {
      title: "柱状图",
      keywords: '柱状图',
      description: '在线制作柱状图，像做表格一样制作可视化图表，支持导出静态或动态图表',
    }
  },
  {
    path: '/line',
    component: () => import('@/components/Tools/Chart/Line/index.vue'),
    name: 'line',
    meta: {
      title: "折线图",
      keywords: '折线图',
      description: '在线制作折线图，像做表格一样制作可视化图表，支持导出静态或动态图表',
    }
  },
  {
    path: '/pie',
    component: () => import('@/components/Tools/Chart/Pie/index.vue'),
    name: 'pie',
    meta: {
      title: "饼图",
      keywords: '饼图',
      description: '在线制作饼图，像做表格一样制作可视化图表，支持导出静态或动态图表',
    }
  },
  {
    path: '/scatter',
    component: () => import('@/components/Tools/Chart/Scatter/index.vue'),
    name: 'scatter',
    meta: {
      title: "散点图",
      keywords: '散点图',
      description: '在线制作散点图，像做表格一样制作可视化图表，支持导出静态或动态图表',
    }
  },
  {
    path: '/coin',
    component: () => import('@/components/Tools/Coin/index.vue'),
    name: 'coin',
    meta: {
      title: "抛硬币",
      keywords: '抛硬币,硬币',
      description: '在线抛硬币，选择困难那么交给硬币来帮你选择吧',
    }
  },
  {
    path: '/dice',
    component: () => import('@/components/Tools/Dice/index.vue'),
    name: 'dice',
    meta: {
      title: "投骰子",
      keywords: '投骰子,骰子,自定义骰子',
      description: '在线投骰子，可自定义骰子数量，简单好用的骰子工具',
    }
  },
  {
    path: '/textremoveduplicate',
    component: () => import('@/components/Tools/TextRemoveDuplicate/index.vue'),
    name: 'textRemoveDuplicate',
    meta: {
      title: "文本去重",
      keywords: '文本去重,文本排重，文本去除重复',
      description: '可以删除或去除文本或字符串中的重复行',
    }
  },
  {
    path: '/imgcut',
    component: () => import('@/components/Tools/ImgCut/index.vue'),
    name: 'imgCut',
    meta: {
      title: "图片切割",
      keywords: '图片分割,图片切割,四宫格,九宫格,十六宫格',
      description: '将图片分割成四宫格、九宫格、十六宫格，支持自定义行与列',
    }
  },
  {
    path: '/httpstatuscode',
    component: () => import('@/components/Tools/HttpStatusCode/index.vue'),
    name: 'HttpStatusCode',
    meta: {
      title: "HTTP状态码",
      keywords: 'http状态码',
      description: '所有http状态对应的名称和含义解释',
    }
  },
  {
    path: '/jwt',
    component: () => import('@/components/Tools/JWT/index.vue'),
    name: 'jwt',
    meta: {
      title: "JWT解析",
      keywords: 'jwt解析,jwt解码，JSON Web Token解析',
      description: '解析和解码JSON Web Token（jwt）',
    }
  },
  {
    path: '/htmlentity',
    component: () => import('@/components/Tools/HtmlEntity/index.vue'),
    name: 'HtmlEntity',
    meta: {
      title: "html实体转义",
      keywords: 'html实体转义',
      description: 'html实体转义，实体转义成html',
    }
  },
  {
    path: '/colorpicker',
    component: () => import('@/components/Tools/ColorPicker/index.vue'),
    name: 'ColorPicker',
    meta: {
      title: "Color选择器",
      keywords: '颜色选择器,Color选择器',
      description: '颜色选择器、在各种颜色空间如十六进制、rgb、hsl、css等等之间转换颜色',
    }
  },
  {
    path: '/asciiwordpic',
    component: () => import('@/components/Tools/ASCIIWordPic/index.vue'),
    name: 'asciiWordPic',
    meta: {
      title: "ASCII字形生成器",
      keywords: 'ASCII画,字形画,字形生成器',
      description: '在线生成字形ASCII画',
    }
  },
  {
    path: '/jsforamt',
    component: () => import('@/components/Tools/JSFormat/index.vue'),
    name: 'JSForamt',
    meta: {
      title: "js代码格式化/压缩",
      keywords: 'js代码格式化,js格式化,js压缩,javascript格式化',
      description: 'JS格式化/压缩工具,提供在线JS格式化、JS压缩、JS混淆、JS解密',
    }
  },
  {
    path: '/htmlformat',
    component: () => import('@/components/Tools/HtmlFormat/index.vue'),
    name: 'HtmlFormat',
    meta: {
      title: "html代码格式化",
      keywords: 'html格式化,xml格式化',
      description: '提供在线html、xml格式化',
    }
  },
  {
    path: '/cssformat',
    component: () => import('@/components/Tools/CssFormat/index.vue'),
    name: 'CssFormat',
    meta: {
      title: "css代码格式化/压缩",
      keywords: 'css格式化,css压缩',
      description: '提供在线css格式化,在线css压缩工具',
    }
  },
  {
    path: '/textedit',
    component: () => import('@/components/Tools/TextEdit/index.vue'),
    name: 'TextEdit',
    meta: {
      title: "在线文本编辑/HTML获取",
      keywords: '文本编辑，富文本预览，在线编辑文本，文本编辑获取html',
      description: '在线富文本编辑, html实时预览，在线编辑文本，文本编辑获取html',
    }
  },
  {
    path: '/base64',
    component: () => import('@/components/Tools/Base64/index.vue'),
    name: 'Base64',
    meta: {
      title: "Base64加解密",
      keywords: 'Base64,base64加密,base64解密,base64编码,base64解码',
      description: '在线Base64加解密工具，支持文本的Base64编码和解码',
    }
  },
  {
    path: '/baseconverter',
    component: () => import('@/components/Tools/BaseConverter/index.vue'),
    name: 'baseconverter',
    meta: {
      title: "进制转换计算器",
      keywords: '进制转换,二进制,八进制,十进制,十六进制,进制计算器',
      description: '在线进制转换计算器，支持二进制、八进制、十进制、十六进制等多种进制之间的相互转换',
    }
  },
  {
    path: '/storageconverter',
    component: () => import('@/components/Tools/StorageConverter/index.vue'),
    name: 'storageconverter',
    meta: {
      title: "数据存储单位换算",
      keywords: '存储单位换算,字节,KB,MB,GB,TB,PB,EB',
      description: '在线数据存储单位换算工具，支持字节、KB、MB、GB、TB、PB、EB等存储单位之间的相互转换',
    }
  },

  {
    path: '/hashcalculator',
    component: () => import('@/components/Tools/HashCalculator/index.vue'),
    name: 'hashcalculator',
    meta: {
      title: "Hash计算器",
      keywords: 'Hash计算器,MD5,SHA-1,SHA-256,SHA-384,SHA-512',
      description: '在线Hash计算器，支持MD5、SHA-1、SHA-256、SHA-384、SHA-512等多种哈希算法',
    }
  },
  {
    path: '/xmlformat',
    component: () => import('@/components/Tools/XmlFormat/index.vue'),
    name: 'xmlformat',
    meta: {
      title: "XML格式化",
      keywords: 'XML格式化,XML压缩,XML美化',
      description: '在线XML格式化工具，用于美化和压缩XML代码，支持自定义缩进大小',
    }
  },
  {
    path: '/sqlformat',
    component: () => import('@/components/Tools/SqlFormat/index.vue'),
    name: 'sqlformat',
    meta: {
      title: "SQL格式化",
      keywords: 'SQL格式化,SQL压缩,SQL美化',
      description: '在线SQL格式化工具，用于美化和压缩SQL代码，支持自定义缩进大小',
    }
  },
  {
    path: '/textreplace',
    component: () => import('@/components/Tools/TextReplace/index.vue'),
    name: 'textreplace',
    meta: {
      title: "文本替换",
      keywords: '文本替换,正则表达式替换,批量替换',
      description: '在线文本替换工具，支持普通文本和正则表达式替换，可用于批量修改文本内容',
    }
  },
  {
    path: '/textworkflow',
    component: () => import('@/components/Tools/TextWorkflow/index.vue'),
    name: 'textworkflow',
    meta: {
      title: "文本处理工作流",
      keywords: '文本处理,工作流,批量处理',
      description: '在线文本处理工作流工具，允许用户定义一系列文本处理步骤并按顺序执行',
    }
  },
  {
    path: '/emoji',
    component: () => import('@/components/Tools/Emoji/index.vue'),
    name: 'emoji',
    meta: {
      title: "Emoji表情大全",
      keywords: 'Emoji,表情符号,表情大全',
      description: '在线Emoji表情大全，提供各种分类的Emoji表情，点击即可复制到剪贴板',
    }
  },
  {
    path: '/wordfrequency',
    component: () => import('@/components/Tools/WordFrequency/index.vue'),
    name: 'wordfrequency',
    meta: {
      title: "词频统计",
      keywords: '词频统计,文本分析,关键词提取',
      description: '在线词频统计工具，用于统计文本中单词出现的频率，可用于文本分析、关键词提取等场景',
    }
  },
  {
    path: '/wordcloud',
    component: () => import('@/components/Tools/WordCloud/index.vue'),
    name: 'wordcloud',
    meta: {
      title: "词云生成",
      keywords: '词云,文本可视化,词频分析',
      description: '根据输入文本生成词云图，支持自定义词云形状和颜色',
    }
  },
  {
    path: '/lottery',
    component: () => import('@/components/Tools/Lottery/index.vue'),
    name: 'lottery',
    meta: {
      title: "抽签工具",
      keywords: '抽签,随机选择,抽奖',
      description: '输入多个选项，随机抽取一个或多个结果',
    }
  },
  {
    path: '/rockpaperscissors',
    component: () => import('@/components/Tools/RockPaperScissors/index.vue'),
    name: 'rockpaperscissors',
    meta: {
      title: "剪刀石头布",
      keywords: '剪刀石头布,游戏,对战',
      description: '与电脑对战的剪刀石头布游戏',
    }
  },
  {
    path: '/wheel',
    component: () => import('@/components/Tools/Wheel/index.vue'),
    name: 'wheel',
    meta: {
      title: "转盘工具",
      keywords: '转盘,随机选择,抽奖',
      description: '自定义选项，旋转转盘随机选择结果',
    }
  },
  {
    path: '/imagecolorpicker',
    component: () => import('@/components/Tools/ImageColorPicker/index.vue'),
    name: 'imagecolorpicker',
    meta: {
      title: "传图取色",
      keywords: '图片取色,颜色提取,色彩分析',
      description: '上传图片并点击图片获取颜色值',
    }
  },
  {
    path: '/pomodoro',
    component: () => import('@/components/Tools/Pomodoro/index.vue'),
    name: 'pomodoro',
    meta: {
      title: "番茄时钟",
      keywords: '番茄工作法,时间管理,专注',
      description: '专注工作和休息的时间管理工具',
    }
  },
  {
    path: '/calculator',
    component: () => import('@/components/Tools/Calculator/index.vue'),
    name: 'calculator',
    meta: {
      title: "简易计算器",
      keywords: '计算器,加减乘除,数学计算',
      description: '基本的加减乘除计算工具',
    }
  },

  {
    path: '/reactiontest',
    component: () => import('@/components/Tools/ReactionTest/index.vue'),
    name: 'reactiontest',
    meta: {
      title: "反应速度测试",
      keywords: '反应速度,测试,游戏',
      description: '测试你的反应速度，点击变色的方块',
    }
  },
  {
    path: '/m3u8player',
    component: () => import('@/components/Tools/M3U8Player/index.vue'),
    name: 'm3u8player',
    meta: {
      title: "m3u8在线播放",
      keywords: 'm3u8,视频播放,流媒体',
      description: '播放m3u8格式的视频流',
    }
  },
  {
    path: '/imagewatermark',
    component: () => import('@/components/Tools/ImageWatermark/index.vue'),
    name: 'imagewatermark',
    meta: {
      title: "图片水印添加",
      keywords: '图片水印,水印添加,图片处理',
      description: '上传图片并添加文字水印',
    }
  },
  {
    path: '/colorpalette',
    component: () => import('@/components/Tools/ColorPalette/index.vue'),
    name: 'colorpalette',
    meta: {
      title: "色板工具",
      keywords: '色板,颜色,渐变色,Material Design',
      description: '提供各种颜色的色板，点击颜色可复制颜色值',
    }
  },
  // 关于
  {
    path: '/about',
    component: () => import('@/components/Home/About.vue'),
    name: 'about',
    meta: {
      title: "关于",
      keywords: '关于工具站',
      description: '',
    }
  },
  //其他路由
  {
    path: '/404',
    component: () => import('@/components/404/404.vue'),
    name: '404',
    meta: {
      title: "404"
    }
  },
  {
    //重定向
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'Any',
  },
]
