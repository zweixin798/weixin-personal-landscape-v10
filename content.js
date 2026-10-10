// 本地照片来自用户指定的 Downloads 目录；未确认地点不填，日期仅来自原图 EXIF。
window.SITE_CONTENT = {
  projectUrl: null,
  portrait: { src: 'assets/photos/portrait.jpg', alt: '草原山丘前微笑的个人肖像', position: 'center' },
  photos: [
    { id:'station', collection:'places', src: 'assets/photos/station.jpg', thumb: 'assets/photos/station-thumb.jpg', place: 'New York', date: '2024.09', alt: '纽约中央车站的拱窗、星空天花板与大厅' },
    { id:'dusk', collection:'places', src: 'assets/photos/dusk.jpg', thumb: 'assets/photos/dusk-thumb.jpg', place: '', date: '', alt: '暮色天空下的木屋与沙地' },
    { id:'green', collection:'places', src: 'assets/photos/green.jpg', thumb: 'assets/photos/green-thumb.jpg', place: '', date: '2024.09', alt: '树荫、路灯与午后公园的红砖步道' },
    { id:'street', collection:'places', src: 'assets/photos/street.jpg', thumb: 'assets/photos/street-thumb.jpg', place: 'Boston', date: '2024.09', alt: '波士顿 Downtown Crossing 街景与建筑立面' },
    { id:'departure', collection:'places', src: 'assets/photos/departure.jpg', thumb: 'assets/photos/departure-thumb.jpg', place: '', date: '', alt: '航站楼窗边的候机座椅' },
    { id:'sunset', collection:'places', src: 'assets/photos/sunset.jpg', thumb: 'assets/photos/sunset-thumb.jpg', place: '', date: '2024.09', alt: '夕阳照亮的砖石建筑与树梢' },
    { id:'campus', collection:'places', src: 'assets/photos/campus.jpg', thumb: 'assets/photos/campus-thumb.jpg', place: '', date: '', alt: '蓝天下石砌拱门与校园绿植' },
    { id:'arrival', collection:'places', src: 'assets/photos/arrival.jpg', thumb: 'assets/photos/arrival-thumb.jpg', place: '', date: '', alt: '从车窗看向机场到达区与出租车' },
    { id:'place-01', collection:'places', src: 'assets/photos/place-01.jpg', thumb: 'assets/photos/place-01-thumb.jpg', place: 'Hong Kong', date: '', alt: '香港维多利亚港的邮轮与火烧云' },
    { id:'place-02', collection:'places', src: 'assets/photos/place-02.jpg', thumb: 'assets/photos/place-02-thumb.jpg', place: 'Shanghai', date: '', alt: '上海黄浦江畔的暮色高楼与滨江步道' },
    { id:'place-03', collection:'places', src: 'assets/photos/place-03.jpg', thumb: 'assets/photos/place-03-thumb.jpg', place: '', date: '', alt: '蓝调时分仰拍城市玻璃幕墙高楼' },
    { id:'place-04', collection:'places', src: 'assets/photos/place-04.jpg', thumb: 'assets/photos/place-04-thumb.jpg', place: '', date: '', alt: '红砖教堂前的白色雕像与蓝天绿树' },
    { id:'place-05', collection:'places', src: 'assets/photos/place-05.jpg', thumb: 'assets/photos/place-05-thumb.jpg', place: '', date: '', alt: '树影间被夕阳照亮的哥特式石塔' },
    { id:'place-06', collection:'places', src: 'assets/photos/place-06.jpg', thumb: 'assets/photos/place-06-thumb.jpg', place: 'Boston', date: '', alt: '波士顿 Downtown Crossing 街景与历史建筑' },
    { id:'place-07', collection:'places', src: 'assets/photos/place-07.jpg', thumb: 'assets/photos/place-07-thumb.jpg', place: '', date: '', alt: '新古典建筑的科林斯柱廊与庭院' },
    { id:'place-08', collection:'places', src: 'assets/photos/place-08.jpg', thumb: 'assets/photos/place-08-thumb.jpg', place: '', date: '', alt: '海滨小镇黄昏的街道、旗帜与人群' },
    { id:'place-09', collection:'places', src: 'assets/photos/place-09.jpg', thumb: 'assets/photos/place-09-thumb.jpg', place: '', date: '', alt: '长曝光下的海浪、沙滩与远岸' }
  ],
  contact: { email: 'zweixin798@gmail.com', resume: null, github: 'https://github.com/zweixin798', x: null }
};

// Personal reading notes stay null until supplied by the owner.
window.SITE_CONTENT.books = [
  {id:'moby-dick',title:'Moby-Dick',author:'Herman Melville',category:'小说',year:'1851',color:'#AFC7CF',featured:true,intro:'以实玛利登上捕鲸船，见证亚哈船长对白鲸的执念。航海叙事穿插捕鲸知识、宗教象征与哲学追问，在海洋的广阔背景中讨论人的意志、命运，以及认识世界的限度。',notes:null,source:'https://penguinrandomhousehighereducation.com/book/?isbn=9780142437247'},
  {id:'ulysses',title:'Ulysses',author:'James Joyce',category:'小说',year:'1922',color:'#9BAA8A',featured:true,intro:'小说将都柏林一天的街道、谈话与意识活动写成漫长的精神旅行。乔伊斯不断变换叙述方式，将日常经验与史诗结构并置，让记忆、身体、语言与城市互相交织。',notes:null,source:'https://www.penguinrandomhouse.com/books/88933/ulysses-by-james-joyce-introduction-by-craig-raine/'},
  {id:'dostoevsky',title:'陀思妥耶夫斯基作品',author:'陀思妥耶夫斯基',category:'小说 / 作者作品',year:null,color:'#C96E4A',featured:true,intro:'陀思妥耶夫斯基的小说常将人物置于信仰、自由与责任的冲突之中，通过对话和内心辩论呈现彼此对立的思想。此处保留作者作品入口，具体书目与阅读心得待补充。',notes:null},
  {id:'you-wu',title:'有无之境',author:'陈来',category:'哲学',year:null,color:'#7A5433',featured:true,intro:'这部研究王阳明哲学的著作结合思想分析与文献考察，讨论心学的基本问题及其发展。它从有我、无我等境界概念出发，探寻阳明哲学的精神结构及其整体面貌。',notes:null,source:'https://opac.hnu.edu.cn/opac/book/635083'},
  {id:'feynman',title:'费曼讲物理',author:'Richard P. Feynman / Robert B. Leighton / Matthew Sands',category:'科学',year:'1963–1965',color:'#AFC7CF',featured:true,intro:'源自费曼在加州理工学院的物理课程，讲义以力学、电磁学和量子物理等主题展开。它用物理直觉连接实验、概念与数学推导，强调基本原理之间的联系，而不只是公式的使用。',notes:null,source:'https://www.feynmanlectures.caltech.edu/handouts.html'},
  {id:'llm-scratch',title:'Build a Large Language Model From Scratch',author:'Sebastian Raschka',category:'技术',year:'2024',color:'#9BAA8A',featured:true,intro:'从文本处理和注意力机制出发，逐步实现一个 GPT 风格语言模型，并继续介绍预训练与微调。书中通过可运行代码拆解模型组件，使读者能在动手实现中理解大模型的内部工作过程。',notes:null,source:'https://www.manning.com/books/build-a-large-language-model-from-scratch'},
  {id:'social-animal',title:'社会性动物',author:'Elliot Aronson',category:'社科',year:null,color:'#AFC7CF',intro:null,notes:null},
  {id:'first-philosophy',title:'第一哲学的支点',author:'王路',category:'哲学',year:null,color:'#C96E4A',intro:null,notes:null},
  {id:'rational-optimist',title:'理性乐观派',author:'Matt Ridley',category:'社科',year:null,color:'#B67B45',intro:null,notes:null},
  {id:'calculus',title:'微积分的力量',author:'Steven Strogatz',category:'科学',year:null,color:'#9BAA8A',intro:null,notes:null},
  {id:'worlds-i-see',title:'我看见的世界',author:'李飞飞',category:'传记',year:null,color:'#C96E4A',intro:null,notes:null},
  {id:'munger',title:'芒格之道',author:'查理·芒格',category:'人物',year:null,color:'#7A5433',intro:null,notes:null}
];
window.SITE_CONTENT.notebook = ['因果','理解','系统','产品','Agents'];
