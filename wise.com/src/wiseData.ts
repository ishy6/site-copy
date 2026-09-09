import {
  wiseCountryCurrencies,
  wiseQuoteProfiles,
  wiseSourceCurrencies,
  wiseTargetCurrencies,
} from './wiseCurrencyData'

export type CurrencyCode = string

export interface Currency {
  code: CurrencyCode
  name: string
  toHkd: number
  flag: string
  popular?: boolean
}

export interface Country {
  name: string
  currency: CurrencyCode
  flag: string
}

export interface CoverageCountry {
  text: string
  slug: string
  flag: string
}

function createCurrency(entry: { code: string; name: string; popular: boolean }): Currency {
  const quoteProfile = wiseQuoteProfiles[entry.code]
  if (!quoteProfile) throw new Error(`Missing Wise quote profile for ${entry.code}`)
  return {
    ...entry,
    flag: entry.code.toLowerCase(),
    toHkd: 1 / quoteProfile.rate,
  }
}

export const sourceCurrencies: Currency[] = wiseSourceCurrencies.map(createCurrency)
export const targetCurrencies: Currency[] = wiseTargetCurrencies.map(createCurrency)
export const currencies = targetCurrencies

const destinationSeeds: Array<[string, string]> = [
  ['阿尔巴尼亚', 'al'], ['阿尔及利亚', 'dz'], ['阿根廷', 'ar'], ['阿拉伯联合酋长国', 'ae'],
  ['阿鲁巴', 'aw'], ['阿曼', 'om'], ['阿塞拜疆', 'az'], ['埃及', 'eg'], ['埃塞俄比亚', 'et'],
  ['爱尔兰', 'ie'], ['爱沙尼亚', 'ee'], ['安道尔', 'ad'], ['安哥拉', 'ao'], ['安圭拉', 'ai'],
  ['安提瓜和巴布达', 'ag'], ['奥地利', 'at'], ['奥兰群岛', 'ax'], ['澳大利亚', 'au'], ['澳门特别行政区', 'mo'],
  ['巴巴多斯', 'bb'], ['巴布亚新几内亚', 'pg'], ['巴哈马', 'bs'], ['巴基斯坦', 'pk'],
  ['巴拉圭', 'py'], ['巴勒斯坦', 'ps'], ['巴林', 'bh'], ['巴拿马', 'pa'], ['巴西', 'br'],
  ['百慕大', 'bm'], ['保加利亚', 'bg'], ['北马里亚纳群岛', 'mp'], ['北马其顿', 'mk'],
  ['贝宁', 'bj'], ['比利时', 'be'], ['冰岛', 'is'], ['玻利维亚', 'bo'], ['波多黎各', 'pr'],
  ['波兰', 'pl'], ['波斯尼亚和黑塞哥维那', 'ba'], ['博茨瓦纳', 'bw'],
  ['博奈尔、圣尤斯特歇斯和萨巴', 'bq'], ['不丹', 'bt'], ['布基纳法索', 'bf'], ['布韦岛', 'bv'],
  ['丹麦', 'dk'], ['德国', 'de'], ['东帝汶', 'tl'], ['多米尼加共和国', 'do'], ['多米尼克', 'dm'],
  ['厄瓜多尔', 'ec'], ['法国', 'fr'], ['法罗群岛', 'fo'], ['法属波利尼西亚', 'pf'],
  ['法属圭亚那', 'gf'], ['法属南部领地', 'tf'], ['法属圣马丁', 'mf'], ['菲律宾', 'ph'],
  ['芬兰', 'fi'], ['佛得角', 'cv'], ['福克兰群岛', 'fk'], ['冈比亚', 'gm'], ['哥伦比亚', 'co'],
  ['哥斯达黎加', 'cr'], ['格林纳达', 'gd'], ['格陵兰岛', 'gl'], ['格鲁吉亚', 'ge'],
  ['根西岛', 'gg'], ['瓜德罗普', 'gp'], ['关岛', 'gu'], ['圭亚那', 'gy'], ['哈萨克斯坦', 'kz'],
  ['海地', 'ht'], ['韩国', 'kr'], ['荷兰', 'nl'], ['荷属安的列斯', 'an'],
  ['赫德岛和麦克唐纳群岛', 'hm'], ['黑山', 'me'], ['洪都拉斯', 'hn'], ['基里巴斯', 'ki'],
  ['吉尔吉斯斯坦', 'kg'], ['几内亚', 'gn'], ['几内亚比绍', 'gw'], ['加拿大', 'ca'],
  ['加纳', 'gh'], ['加蓬共和国', 'ga'], ['柬埔寨', 'kh'], ['捷克', 'cz'], ['卡塔尔', 'qa'],
  ['开曼群岛', 'ky'], ['科科斯（基林）群岛', 'cc'], ['科索沃共和国', 'xk'],
  ['科特迪瓦', 'ci'], ['科威特', 'kw'], ['克罗地亚', 'hr'], ['肯尼亚', 'ke'], ['库克群岛', 'ck'],
  ['拉托维亚', 'lv'], ['莱索托', 'ls'], ['老挝', 'la'], ['黎巴嫩', 'lb'], ['利比里亚', 'lr'],
  ['立陶宛', 'lt'], ['列支敦士登', 'li'], ['留尼汪岛', 're'], ['卢森堡', 'lu'], ['卢旺达', 'rw'],
  ['罗马尼亚', 'ro'], ['马恩岛', 'im'], ['马耳他', 'mt'], ['马尔代夫', 'mv'], ['马拉维', 'mw'],
  ['马来西亚', 'my'], ['马里', 'ml'], ['马绍尔群岛', 'mh'], ['马提尼克', 'mq'],
  ['马约特', 'yt'], ['毛里求斯', 'mu'], ['毛里塔尼亚', 'mr'], ['美国', 'us'],
  ['美国本土外小岛屿', 'um'], ['美属萨摩亚', 'as'], ['美属维尔京群岛', 'vi'],
  ['蒙古', 'mn'], ['蒙特塞拉特', 'ms'], ['孟加拉国', 'bd'], ['秘鲁', 'pe'],
  ['密克罗尼西亚联邦', 'fm'], ['摩尔多瓦', 'md'], ['摩洛哥', 'ma'], ['摩纳哥', 'mc'],
  ['莫桑比克', 'mz'], ['墨西哥', 'mx'], ['纳米比亚', 'na'], ['南非', 'za'], ['南极洲', 'aq'],
  ['尼泊尔', 'np'], ['尼加拉瓜', 'ni'], ['尼日尔', 'ne'], ['尼日利亚', 'ng'], ['纽埃', 'nu'],
  ['挪威', 'no'], ['诺福克岛', 'nf'], ['帕劳', 'pw'], ['皮特凯恩群岛', 'pn'],
  ['葡萄牙', 'pt'], ['日本', 'jp'], ['瑞典', 'se'], ['瑞士', 'ch'], ['萨尔瓦多', 'sv'],
  ['萨摩亚', 'ws'], ['塞尔维亚', 'rs'], ['塞拉利昂', 'sl'], ['塞内加尔', 'sn'],
  ['塞浦路斯', 'cy'], ['塞舌尔', 'sc'], ['沙特阿拉伯', 'sa'], ['圣巴泰勒米岛', 'bl'],
  ['圣诞岛', 'cx'], ['圣多美和普林西比', 'st'], ['圣赫勒拿岛', 'sh'],
  ['圣基茨和尼维斯', 'kn'], ['圣卢西亚', 'lc'], ['圣马利诺', 'sm'],
  ['圣皮埃尔和密克隆群岛', 'pm'], ['圣文森特和格林纳丁斯', 'vc'], ['斯里兰卡', 'lk'],
  ['斯洛伐克', 'sk'], ['斯洛文尼亚', 'si'], ['斯瓦尔巴和扬马延', 'sj'], ['苏里南', 'sr'],
  ['所罗门群岛', 'sb'], ['塔吉克斯坦', 'tj'], ['泰国', 'th'], ['坦桑尼亚', 'tz'],
  ['汤加', 'to'], ['特克斯和凯科斯群岛', 'tc'], ['特立尼达和多巴哥', 'tt'],
  ['突尼斯', 'tn'], ['图瓦卢', 'tv'], ['土耳其', 'tr'], ['托克劳群岛', 'tk'],
  ['瓦利斯和富图纳群岛', 'wf'], ['瓦努阿图', 'vu'], ['危地马拉', 'gt'], ['文莱', 'bn'],
  ['乌干达', 'ug'], ['乌克兰', 'ua'], ['乌拉圭', 'uy'], ['乌兹别克斯坦', 'uz'],
  ['西班牙', 'es'], ['西撒哈拉', 'eh'], ['希腊', 'gr'], ['新加坡', 'sg'],
  ['新喀里多尼亚', 'nc'], ['新西兰', 'nz'], ['匈牙利', 'hu'], ['牙买加', 'jm'],
  ['亚美尼亚', 'am'], ['以色列', 'il'], ['意大利', 'it'], ['印度', 'in'], ['印度尼西亚', 'id'],
  ['英国', 'gb'], ['英属维尔京群岛', 'vg'], ['英属印度洋领地', 'io'], ['越南', 'vn'],
  ['赞比亚', 'zm'], ['泽西岛', 'je'], ['直布罗陀', 'gi'], ['智利', 'cl'],
  ['中国大陆', 'cn'], ['中国台湾', 'tw'], ['中国香港', 'hk'], ['瑙鲁', 'nr'],
  ['梵蒂冈', 'va'], ['斐济', 'fj'],
]

export const destinations: Country[] = destinationSeeds.map(([name, flag]) => ({
  name,
  flag,
  currency: wiseCountryCurrencies[flag] ?? '',
}))

const coverageDisplayOrder = [
  '东帝汶', '中国大陆', '中国台湾', '中国香港', '丹麦', '乌克兰', '乌干达', '乌拉圭', '以色列',
  '保加利亚', '克罗地亚', '列支敦士登', '加拿大', '加纳', '匈牙利', '南非', '博茨瓦纳', '卢森堡',
  '印度', '印度尼西亚', '厄瓜多尔', '哥伦比亚', '哥斯达黎加', '土耳其', '圣巴泰勒米',
  '圣皮埃尔和密克隆', '圣马利诺', '坦桑尼亚', '埃及', '塞浦路斯', '奥地利', '孟加拉国', '安道尔',
  '密克罗尼西亚', '尼日利亚', '尼泊尔', '巴基斯坦', '巴拿马', '巴西', '希腊', '帕劳', '德国',
  '意大利', '拉托维亚', '挪威', '捷克共和国', '摩洛哥', '摩纳哥', '斐济', '斯洛伐克', '斯洛文尼亚',
  '斯里兰卡', '新加坡', '新西兰', '日本', '智利', '根西岛', '格鲁吉亚', '梵蒂冈', '欧洲', '比利时',
  '法国', '法属圣马丁', '波兰', '泰国', '泽西岛', '澳大利亚', '爱尔兰', '爱沙尼亚', '瑙鲁', '瑞典',
  '瑞士', '瓜德罗普', '留尼汪', '直布罗陀', '秘鲁', '立陶宛', '罗马尼亚', '美国', '肯尼亚', '芬兰',
  '英国', '英属维尔京群岛', '荷兰', '菲律宾', '萨尔瓦多', '葡萄牙', '西班牙', '赞比亚', '越南',
  '迪拜', '阿拉伯联合酋长国', '阿根廷', '韩国', '马恩岛', '马提尼克', '马来西亚', '马约特岛',
  '马绍尔群岛', '马耳他', '黑山', '墨西哥',
] as const

export const coverage: CoverageCountry[] = [
  { flag: 'ar', slug: 'argentina', text: '阿根廷' },
  { flag: 'ae', slug: 'united-arab-emirates', text: '阿拉伯联合酋长国' },
  { flag: 'eg', slug: 'egypt', text: '埃及' },
  { flag: 'ie', slug: 'ireland', text: '爱尔兰' },
  { flag: 'ee', slug: 'estonia', text: '爱沙尼亚' },
  { flag: 'ad', slug: 'andorra', text: '安道尔' },
  { flag: 'at', slug: 'austria', text: '奥地利' },
  { flag: 'au', slug: 'australia', text: '澳大利亚' },
  { flag: 'pk', slug: 'pakistan', text: '巴基斯坦' },
  { flag: 'pa', slug: 'panama', text: '巴拿马' },
  { flag: 'br', slug: 'brazil', text: '巴西' },
  { flag: 'bg', slug: 'bulgaria', text: '保加利亚' },
  { flag: 'be', slug: 'belgium', text: '比利时' },
  { flag: 'pl', slug: 'poland', text: '波兰' },
  { flag: 'bw', slug: 'botswana', text: '博茨瓦纳' },
  { flag: 'dk', slug: 'denmark', text: '丹麦' },
  { flag: 'de', slug: 'germany', text: '德国' },
  { flag: 'aed', slug: 'dubai', text: '迪拜' },
  { flag: 'tl', slug: 'east-timor', text: '东帝汶' },
  { flag: 'ec', slug: 'ecuador', text: '厄瓜多尔' },
  { flag: 'fr', slug: 'france', text: '法国' },
  { flag: 'mf', slug: 'saint-martin-french-part', text: '法属圣马丁' },
  { flag: 'va', slug: 'vatican', text: '梵蒂冈' },
  { flag: 'ph', slug: 'philippines', text: '菲律宾' },
  { flag: 'fj', slug: 'fiji', text: '斐济' },
  { flag: 'fi', slug: 'finland', text: '芬兰' },
  { flag: 'co', slug: 'colombia', text: '哥伦比亚' },
  { flag: 'cr', slug: 'costa-rica', text: '哥斯达黎加' },
  { flag: 'ge', slug: 'georgia', text: '格鲁吉亚' },
  { flag: 'gg', slug: 'guernsey', text: '根西岛' },
  { flag: 'gp', slug: 'guadeloupe', text: '瓜德罗普' },
  { flag: 'kr', slug: 'south-korea', text: '韩国' },
  { flag: 'nl', slug: 'the-netherlands', text: '荷兰' },
  { flag: 'me', slug: 'montenegro', text: '黑山' },
  { flag: 'ca', slug: 'canada', text: '加拿大' },
  { flag: 'gh', slug: 'ghana', text: '加纳' },
  { flag: 'cz', slug: 'czech-republic', text: '捷克共和国' },
  { flag: 'hr', slug: 'croatia', text: '克罗地亚' },
  { flag: 'ke', slug: 'kenya', text: '肯尼亚' },
  { flag: 'lv', slug: 'latvia', text: '拉托维亚' },
  { flag: 'lt', slug: 'lithuania', text: '立陶宛' },
  { flag: 'li', slug: 'liechtenstein', text: '列支敦士登' },
  { flag: 're', slug: 'reunion', text: '留尼汪' },
  { flag: 'lu', slug: 'luxembourg', text: '卢森堡' },
  { flag: 'ro', slug: 'romania', text: '罗马尼亚' },
  { flag: 'im', slug: 'isle-of-man', text: '马恩岛' },
  { flag: 'mt', slug: 'malta', text: '马耳他' },
  { flag: 'my', slug: 'malaysia', text: '马来西亚' },
  { flag: 'mh', slug: 'marshall-islands', text: '马绍尔群岛' },
  { flag: 'mq', slug: 'martinique', text: '马提尼克' },
  { flag: 'yt', slug: 'mayotte', text: '马约特岛' },
  { flag: 'us', slug: 'the-usa', text: '美国' },
  { flag: 'bd', slug: 'bangladesh', text: '孟加拉国' },
  { flag: 'pe', slug: 'peru', text: '秘鲁' },
  { flag: 'fm', slug: 'micronesia', text: '密克罗尼西亚' },
  { flag: 'ma', slug: 'morocco', text: '摩洛哥' },
  { flag: 'mc', slug: 'monaco', text: '摩纳哥' },
  { flag: 'mx', slug: 'mexico', text: '墨西哥' },
  { flag: 'za', slug: 'south-africa', text: '南非' },
  { flag: 'nr', slug: 'nauru', text: '瑙鲁' },
  { flag: 'np', slug: 'nepal', text: '尼泊尔' },
  { flag: 'ng', slug: 'nigeria', text: '尼日利亚' },
  { flag: 'no', slug: 'norway', text: '挪威' },
  { flag: 'eur', slug: 'europe', text: '欧洲' },
  { flag: 'pw', slug: 'palau', text: '帕劳' },
  { flag: 'pt', slug: 'portugal', text: '葡萄牙' },
  { flag: 'jp', slug: 'japan', text: '日本' },
  { flag: 'se', slug: 'sweden', text: '瑞典' },
  { flag: 'ch', slug: 'switzerland', text: '瑞士' },
  { flag: 'sv', slug: 'el-salvador', text: '萨尔瓦多' },
  { flag: 'cy', slug: 'cyprus', text: '塞浦路斯' },
  { flag: 'bl', slug: 'saint-barthelemy', text: '圣巴泰勒米' },
  { flag: 'sm', slug: 'san-marino', text: '圣马利诺' },
  { flag: 'pm', slug: 'saint-pierre-and-miquelon', text: '圣皮埃尔和密克隆' },
  { flag: 'lk', slug: 'sri-lanka', text: '斯里兰卡' },
  { flag: 'sk', slug: 'slovakia', text: '斯洛伐克' },
  { flag: 'si', slug: 'slovenia', text: '斯洛文尼亚' },
  { flag: 'th', slug: 'thailand', text: '泰国' },
  { flag: 'tz', slug: 'tanzania', text: '坦桑尼亚' },
  { flag: 'tr', slug: 'turkey', text: '土耳其' },
  { flag: 'ug', slug: 'uganda', text: '乌干达' },
  { flag: 'ua', slug: 'ukraine', text: '乌克兰' },
  { flag: 'uy', slug: 'uruguay', text: '乌拉圭' },
  { flag: 'es', slug: 'spain', text: '西班牙' },
  { flag: 'gr', slug: 'greece', text: '希腊' },
  { flag: 'sg', slug: 'singapore', text: '新加坡' },
  { flag: 'nz', slug: 'new-zealand', text: '新西兰' },
  { flag: 'hu', slug: 'hungary', text: '匈牙利' },
  { flag: 'il', slug: 'israel', text: '以色列' },
  { flag: 'it', slug: 'italy', text: '意大利' },
  { flag: 'in', slug: 'india', text: '印度' },
  { flag: 'id', slug: 'indonesia', text: '印度尼西亚' },
  { flag: 'gb', slug: 'the-uk', text: '英国' },
  { flag: 'vg', slug: 'british-virgin-islands', text: '英属维尔京群岛' },
  { flag: 'vn', slug: 'vietnam', text: '越南' },
  { flag: 'zm', slug: 'zambia', text: '赞比亚' },
  { flag: 'je', slug: 'jersey', text: '泽西岛' },
  { flag: 'gi', slug: 'gibraltar', text: '直布罗陀' },
  { flag: 'cl', slug: 'chile', text: '智利' },
  { flag: 'cn', slug: 'china', text: '中国大陆' },
  { flag: 'tw', slug: 'taiwan', text: '中国台湾' },
  { flag: 'hk', slug: 'hong-kong', text: '中国香港' },
].sort((left, right) => coverageDisplayOrder.indexOf(left.text as typeof coverageDisplayOrder[number])
  - coverageDisplayOrder.indexOf(right.text as typeof coverageDisplayOrder[number]))
