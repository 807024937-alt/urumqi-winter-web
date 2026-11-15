import {useState} from 'react';
import {ArrowLeft,ArrowUpRight,CalendarDays,Clock,MapPin,Wallet,ShieldCheck,Plane,Snowflake,CheckCircle2,ExternalLink} from 'lucide-react';

type EventItem={time:string;activity:string;note:string;cost?:string};
const itinerary:{name:string;route:string;tip:string;events:EventItem[]}[]=[
 {name:'晚间抵达',route:'桃仙机场 → 市区酒店',tip:'抵达22:00，优先提前确认酒店可晚到，机场地铁末班可能赶不上。',events:[
 {time:'22:00',activity:'抵达沈阳桃仙国际机场',note:'下机、领取行李，预留30—60分钟'},
 {time:'22:40—23:15',activity:'叫车前往酒店',note:'推荐青年大街或中街附近，同一家酒店连住4晚',cost:'夜间车费预留¥70—110/车'},
 {time:'23:30左右',activity:'入住、休息',note:'提前告知晚到，附近有营业餐馆可简单夜宵'}
 ]},
 {name:'棋盘山玩雪',route:'市区 → 棋盘山冰雪大世界 → 铁锅炖',tip:'真正的大面积雪地体验放在这天；滑雪与戏雪票可能分开，出发前确认新雪季项目。',events:[
 {time:'07:30—08:00',activity:'早餐、防寒准备',note:'防滑雪地靴、手套、围脖、备用暖宝宝'},
 {time:'08:00—09:30',activity:'打车前往棋盘山',note:'路况及雪天气候影响时间；往返车费预算约¥120—200/车'},
 {time:'09:30—12:00',activity:'初级滑雪',note:'现场核对雪票是否含雪鞋/雪板/雪杖及头盔、教练',cost:'滑雪预留¥150—300/人；非最新报价'},
 {time:'12:00—13:00',activity:'雪场午餐与取暖',note:'补充热量，室外活动适时休息'},
 {time:'13:00—15:30',activity:'雪圈、冰雪滑道与拍摄森林雪景',note:'具体开放设施以2026—27雪季公告为准',cost:'戏雪预留¥50—150/人'},
 {time:'15:30—17:00',activity:'返程市区',note:'雪天提前叫车，避免回程打车难'},
 {time:'18:00—20:00',activity:'东北铁锅炖晚餐',note:'排骨豆角/大鹅/笨鸡，小份锅适合2人',cost:'¥120—220/2人'}
 ]},
 {name:'盛京古城',route:'沈阳故宫 → 张氏帅府 → 中街 → 老北市',tip:'若D3恰逢周一，整天古迹与D4的北陵/西塔互换，避免故宫和帅府闭馆。',events:[
 {time:'08:00—08:50',activity:'早餐及前往故宫',note:'抻面、鸡架或包子'},
 {time:'09:00—11:00',activity:'沈阳故宫',note:'需实名预约，身份证原件入院；冬季09:00—16:30，15:45停止售票，周一通常闭馆',cost:'¥50/成人'},
 {time:'11:00—11:20',activity:'步行前往张氏帅府',note:'市中心相距较近'},
 {time:'11:20—12:50',activity:'张学良旧居／张氏帅府',note:'冬季09:00—16:30，16:00停止入馆，周一通常闭馆',cost:'通票参考¥48/成人'},
 {time:'13:00—14:00',activity:'东北菜午餐',note:'锅包肉、溜肉段、地三鲜'},
 {time:'14:00—17:15',activity:'怀远门、方城与中街逛吃',note:'中街大果、饺子、熏肉大饼、伴手礼'},
 {time:'17:30—18:15',activity:'晚餐／前往老北市',note:'打车前往更灵活'},
 {time:'18:30—20:30',activity:'老北市夜景与《凤舞九天》',note:'现行参考场次18:30、20:00；1月及恶劣天气是否演出待确认',cost:'街区参考免费'}
 ]},
 {name:'东北风情',route:'小河沿早市 → 北陵公园 → 西塔 → 东北洗浴',tip:'最后一个游玩日晚上尽早返回，第二天凌晨约04:00出发去机场。',events:[
 {time:'07:30—09:00',activity:'小河沿早市',note:'豆腐脑、油条、东北早餐，具体摊位时间待核实'},
 {time:'09:00—11:30',activity:'北陵公园、清昭陵外围',note:'有自然积雪时重点拍冬景；若无雪可缩短停留',cost:'公园与陵寝分区收费，以当日公示为准'},
 {time:'11:30—13:30',activity:'午饭及市区活动',note:'李连贵熏肉大饼、老边饺子或马家烧麦'},
 {time:'14:00—16:30',activity:'西塔风情街',note:'朝鲜族超市、打糕、拌明太鱼、特色伴手礼'},
 {time:'16:30—17:45',activity:'西塔泥炉烤肉',note:'烤牛肉、冷面、小菜',cost:'¥120—220/2人'},
 {time:'18:00—20:30',activity:'东北洗浴',note:'先核对门票、搓澡、餐食与是否需要预约',cost:'预留¥100—225/人'},
 {time:'20:30—21:30',activity:'回酒店、收拾行李、休息',note:'提前预约次日凌晨车辆'}
 ]},
 {name:'凌晨返程',route:'酒店 → 桃仙机场',tip:'06:50起飞，应预留值机、托运行李、安检时间；严寒下提前叫车。',events:[
 {time:'03:30',activity:'起床、退房',note:'前一晚完成打包'},
 {time:'03:50—04:00',activity:'出发去机场',note:'推荐提前一天预约网约车'},
 {time:'04:40—05:00',activity:'抵达桃仙机场',note:'机场当前地铁首班约06:00，无法满足早班机'},
 {time:'05:00—06:20',activity:'值机、安检、候机',note:'航司柜台截止以订单通知为准'},
 {time:'06:50',activity:'起飞',note:'回潮汕，核对是否经停、行李托运和具体抵达时间'}
 ]}
];
const reservations=[
 {title:'往返机票｜潮汕 ↔ 沈阳',time:'D1抵达22:00；D5起飞06:50',price:'双人往返预算¥2,000—3,600',rule:'出发日期、航班号、经停与实际票价未确认；要核对行李额。',status:'待订票',url:'https://www.csair.com/cn/'},
 {title:'酒店｜4晚同住',time:'D1深夜入住，D5凌晨退房',price:'¥200—350/间/晚；4晚¥800—1,400',rule:'优先青年大街／中街，确认24小时前台、供暖与凌晨退房。',status:'待预订',url:'https://www.ctrip.com/'},
 {title:'沈阳故宫',time:'冬季09:00—16:30，15:45停售；周一通常闭馆',price:'成人¥50/人（官方公布）',rule:'所有游客（含优惠票）实名预约；携带预约证件原件。官网、官方公众号或同程官方授权渠道。',status:'已核实规则',url:'https://www.sypm.org.cn/daolan_1/19.html'},
 {title:'张学良旧居／张氏帅府',time:'2026.10.10—2027.4.9，09:00—16:30，16:00停止入馆；周一通常闭馆',price:'成人通票参考¥48/人（2026年政府文旅消息）',rule:'具体订票入口和可订提前天数需查当日官方售票渠道，建议提前1—3天核对。',status:'时间已核实',url:'https://wlgd.shenyang.gov.cn/xxfb/ywbb/202605/t20260513_5025835.html'},
 {title:'棋盘山冰雪大世界',time:'D2建议09:30—15:30；2026—27雪季具体营业时间待公布',price:'预算滑雪¥150—300/人＋戏雪¥50—150/人；不是现行票价',rule:'确认雪场是否开放、门票与租具的包含范围、雪圈是否单售、退改规则及返程交通。',status:'雪季待核实',url:'https://sight.qunar.com/13007'},
 {title:'老北市《凤舞九天》',time:'2026年10月公布18:30、20:00两场',price:'街区参考免费；特殊活动以公告为准',rule:'2027年1月是否沿用及天气停演情况需临近核对；提前30分钟到场较稳妥。',status:'演出待复核',url:'https://weibo.com/2/detail/5352460956731016'},
 {title:'北陵公园／清昭陵',time:'D4约09:40—11:30；冬季当日开放时间待核对',price:'公园及陵寝分别可能收费；当前官方价格未核实',rule:'公园散步与进入清昭陵为不同项目，现场或官方渠道核实票种。',status:'价格待核实',url:'https://www.shenyang.gov.cn/'},
 {title:'东北洗浴',time:'D4建议18:00—20:30',price:'预算¥100—225/人（含可能的附加服务）',rule:'查具体门店的浴资、搓澡、餐饮收费；周末建议提前订位。',status:'门店未确定',url:'https://www.meituan.com/'}
];
const budget=[['往返机票',2000,3600],['酒店4晚',800,1400],['餐饮小吃',800,1200],['市内交通',350,550],['棋盘山及冰雪项目',450,850],['故宫帅府等门票',150,250],['东北洗浴',200,450]] as const;
const sourceLinks=[['沈阳故宫2026—27冬季开放','https://www.sypm.org.cn/xinwen_1/689.html'],['沈阳故宫实名预约规定','https://www.sypm.org.cn/daolan_1/19.html'],['沈阳故宫官方票价','https://www.sypm.org.cn/daolan_1/17.html'],['张学良旧居冬季开放','https://finance.sina.com.cn/jjxw/2026-10-13/doc-iniuzkks0355077.shtml'],['帅府门票政府参考','https://wlgd.shenyang.gov.cn/xxfb/ywbb/202605/t20260513_5025835.html'],['老北市2026年演出公告','https://weibo.com/2/detail/5352460956731016'],['沈阳机场官方交通说明','https://www.csair.com/tw/zh/tourguide/airport_service/airports_info/domestic/18h96rcahn1di.shtml']];
const places=[['桃仙机场','辽宁省沈阳市浑南区桃仙国际机场'],['棋盘山冰雪大世界','辽宁省沈阳市棋盘山风景区'],['沈阳故宫','辽宁省沈阳市沈河区沈阳路171号'],['张氏帅府','辽宁省沈阳市沈河区少帅府巷46号'],['中街','辽宁省沈阳市沈河区中街路'],['老北市','辽宁省沈阳市和平区皇寺路99号'],['小河沿早市','辽宁省沈阳市沈河区小河沿'],['北陵公园','辽宁省沈阳市皇姑区泰山路12号'],['西塔风情街','辽宁省沈阳市和平区西塔街']];
const tabs=[['overview','旅行总览'],['days','逐日时间表'],['book','预约与票价'],['budget','预算与交通'],['map','地点导航']];
export default function Shenyang({onBack}:{onBack:()=>void}){
 const [tab,setTab]=useState('overview'),[day,setDay]=useState(0),[comfort,setComfort]=useState(false),[checks,setChecks]=useState<string[]>([]);
 const sum=budget.reduce((n,b)=>n+b[comfort?2:1],0);
 const go=(t:string)=>{setTab(t);window.scrollTo({top:0,behavior:'smooth'})};
 const link=(url:string,label:string)=><a href={url} target="_blank" rel="noopener noreferrer" className="btn small">{label}<ArrowUpRight size={14}/></a>;
 const allTasks=['确认出行日期、航班是否经停及行李额','确认可深夜入住、凌晨退房的4晚酒店','在官方渠道预约沈阳故宫','确认张氏帅府票价与预约','确认棋盘山2026—27雪季开放及租具项目','确定D4洗浴门店与项目报价','出发前查看自然积雪、降雪与交通天气','提前预约D5凌晨04:00送机车辆'];
 return <div className="app-shell wz-page"><aside className="sidebar"><a className="brand" href="/" onClick={e=>{e.preventDefault();onBack()}}><span className="brand-symbol"><Snowflake size={26}/></span><span>冬日出走<small>WINTER JOURNAL</small></span></a><button className="catalog-return" onClick={onBack}><ArrowLeft size={16}/>所有旅游计划</button><div className="trip-label">我的旅行 / 03</div><div className="trip-name">沈阳 · 5天4晚</div><nav aria-label="沈阳计划导航">{tabs.map(([id,label])=><button key={id} className={tab===id?'selected':''} onClick={()=>go(id)}>{label}</button>)}</nav><div className="sidebar-bottom"><div className="private"><ShieldCheck size={17}/><div>审核稿 v1 · 2026-11-14<small>官方核实与预算估算清晰区分</small></div></div></div></aside>
 <div className="workspace"><header className="topbar"><div className="breadcrumbs"><button onClick={onBack}>旅游计划</button><span> › </span><strong>沈阳5天4晚</strong></div><div className="top-actions"><button className="btn primary small" onClick={()=>{navigator.clipboard?.writeText(location.href).then(()=>alert('沈阳专属链接已复制')).catch(()=>prompt('复制以下链接',location.href))}}>复制分享链接 <ExternalLink size={14}/></button></div></header>
 <main><div className="page-heading"><div><div className="eyebrow">SHENYANG · 2027 JANUARY · 5 DAYS / 4 NIGHTS</div><h1>{tabs.find(x=>x[0]===tab)?.[1]}</h1><p>潮汕出发 · 双人出行 · 东北冰雪、盛京古城、特色美食与洗浴。</p></div></div>
 <div className="notice wz-warning"><ShieldCheck size={20}/><div><strong>此为行程审核稿，不是实时售票系统</strong><p>计划于2027年1月初出行，具体日期待定。官方已公布信息标注来源；雪场2026—27新雪季价格、酒店航班及天气都需临近核对。所有时间为北京时间。</p></div></div>
 {tab==='overview'&&<><section className="wz-hero" style={{background:'linear-gradient(120deg,#1b405c,#37758d 55%,#b4d7df)',color:'#fff'}}><div><span className="eyebrow" style={{color:'#c8f0fb'}}>LIAONING · WINTER ESCAPE</span><h2>去盛京，<br/>拥抱一场东北的雪。</h2><p>滑雪、红墙、热腾腾的铁锅炖，一次玩足五天四晚。</p><div className="destination-tags"><span>D1 22:00抵达</span><span>D5 06:50起飞</span><span>2人4晚</span></div></div><div style={{fontSize:84,alignSelf:'center'}} aria-hidden="true">❄️</div></section>
 <section className="wz-summary-grid"><div className="card"><Plane size={22}/><div><small>航班节奏</small><strong>22:00 到 · 06:50 走</strong><span>3个完整游玩日</span></div></div><div className="card"><Wallet size={22}/><div><small>双人预算</small><strong>¥4,750—8,300</strong><span>规划估算，非即时报价</span></div></div><div className="card"><MapPin size={22}/><div><small>建议住宿</small><strong>青年大街／中街</strong><span>4晚同住，凌晨叫车</span></div></div></section>
 <section className="card wz-overview-days"><div className="section-head"><h2><CalendarDays size={18}/>五天行程</h2><button className="link-btn" onClick={()=>go('days')}>详细时间安排 →</button></div>{itinerary.map((d,i)=><button className="wz-day-preview" key={i} onClick={()=>{setDay(i);go('days')}}><span className="wz-day-number">DAY {i+1}</span><div><strong>{d.name}</strong><p>{d.route}</p></div><span>›</span></button>)}</section>
 <div className="notice"><Snowflake size={20}/><div><strong>看雪把握提醒</strong><p>棋盘山雪场有人工造雪，但沈阳市区和北陵的天然厚积雪并不保证。D2与D4可按1月天气调整；不把景区宣传雪照视为实时雪况。</p></div></div>
 <section className="card wz-content-card"><h2>出发前任务清单</h2>{allTasks.map((task,i)=><label key={i} style={{display:'flex',gap:12,padding:'10px 0',alignItems:'flex-start',borderBottom:'1px solid #e4e8e8'}}><input type="checkbox" checked={checks.includes(task)} onChange={e=>setChecks(v=>e.target.checked?[...v,task]:v.filter(x=>x!==task))}/><span style={{textDecoration:checks.includes(task)?'line-through':'none'}}>{task}</span></label>)}<p className="footnote">本页面任务勾选仅临时显示，不代表已完成预订或同步至服务器。</p></section></>}
 {tab==='days'&&<><div className="wz-day-tabs">{itinerary.map((d,i)=><button key={i} className={i===day?'active':''} onClick={()=>setDay(i)}><span>DAY {i+1}</span><strong>{d.name}</strong></button>)}</div><article className="card wz-day-card"><div className="wz-day-heading"><span className="eyebrow">DAY {day+1} · 2027年1月初 · 具体日期待定</span><h2>{itinerary[day].name}</h2><p className="wz-route"><MapPin size={15}/>{itinerary[day].route}</p></div><div className="wz-schedule">{itinerary[day].events.map((e,i)=><div className="wz-event" key={i}><time><Clock size={13}/>{e.time}</time><div className="wz-event-content"><strong>{e.activity}</strong><p style={{margin:'5px 0'}}>{e.note}</p>{e.cost&&<div className="wz-cost">{e.cost}</div>}</div></div>)}</div><div className="notice wz-warning"><Snowflake size={17}/><div>{itinerary[day].tip}</div></div></article></>}
 {tab==='book'&&<><section className="card wz-content-card"><h2>预约要求、开放时间与票价</h2><p className="footnote">数据核对：2026年11月14日。已核实与待确认两类严格区分，价格为成人参考或规划预算。</p>{reservations.map((r,i)=><article key={i} style={{padding:'17px 0',borderBottom:'1px solid #dce4e4'}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><h3 style={{margin:'0 0 7px'}}>{r.title}</h3><span style={{fontSize:12,color:'#406c75'}}>{r.status}</span></div><p><strong>时间：</strong>{r.time}</p><p><strong>价格：</strong>{r.price}</p><p><strong>预约：</strong>{r.rule}</p>{link(r.url,'查看来源／预约渠道')}</article>)}</section><section className="card wz-content-card"><h2>官方依据与核查链接</h2>{sourceLinks.map(([name,url])=><p key={url}>{link(url,name)}</p>)}</section></>}
 {tab==='budget'&&<><section className="card wz-content-card"><h2>两位成人预算测算</h2><div style={{display:'flex',gap:9,marginBottom:14}}><button className={'btn '+(!comfort?'primary':'')} onClick={()=>setComfort(false)}>经济方案</button><button className={'btn '+(comfort?'primary':'')} onClick={()=>setComfort(true)}>舒适方案</button></div><h2 style={{fontSize:30}}>¥{sum.toLocaleString('zh-CN')} / 2人</h2><div className="wz-table-wrap"><table className="wz-table"><thead><tr><th>项目</th><th>经济估算</th><th>舒适估算</th></tr></thead><tbody>{budget.map(([name,l,h])=><tr key={name}><td>{name}</td><td>¥{l}</td><td>¥{h}</td></tr>)}</tbody></table></div><p className="footnote">均非实时成交价；购物、滑雪教练另算。双人全程区间约¥4,750—8,300。</p></section><section className="card wz-content-card"><h2>交通与住宿决策</h2><p><strong>去程：</strong>22:00抵达桃仙，通常优先打车；地铁末班附近，无法保证顺利赶上。</p><p><strong>平日：</strong>市内故宫、帅府、中街适合步行+地铁；棋盘山以打车往返更灵活，雪天适当多留路程时间。</p><p><strong>返程：</strong>06:50起飞，03:50—04:00从市区出发，04:40—05:00抵达机场；不要依赖地铁首班。</p><p><strong>住宿：</strong>青年大街地铁换乘方便；中街夜间逛吃方便；建议4晚同住、提前核对24小时接待和凌晨退房。</p></section></>}
 {tab==='map'&&<section className="card wz-content-card"><h2>景点一键导航</h2><p className="footnote">使用高德地图的地点搜索链接，实际路线和车程在手机端实时查看。</p><div className="wz-table-wrap"><table className="wz-table"><thead><tr><th>地点</th><th>位置</th><th>导航</th></tr></thead><tbody>{places.map(([name,address])=><tr key={name}><td>{name}</td><td>{address}</td><td>{link('https://uri.amap.com/search?keyword='+encodeURIComponent(name+' 沈阳'),'打开高德')}</td></tr>)}</tbody></table></div><p className="footnote">顺序：D2棋盘山；D3故宫→帅府→中街→老北市；D4早市→北陵→西塔。</p></section>}
 <footer><Snowflake size={14}/><span>沈阳 · 5天4晚旅行审核稿</span><span>2026-11-14核对 · 北京时间 UTC+8</span></footer></main></div></div>
}
