export const plans = [
  {id:'urumqi', city:'乌鲁木齐', english:'URUMQI', region:'新疆 · 中国', theme:'雪山与城市烟火', description:'看博格达雪峰，逛大巴扎，吃抓饭与烧烤。保留原行程、核对事项和变更记录。', days:'5天计划', transport:'飞机往返', status:'在线同步', tags:['南山玩雪','民族风情','新疆美食'], tone:'snow'},
  {id:'wenzhou', city:'温州', english:'WENZHOU', region:'浙江 · 中国', theme:'瓯越风味与江南水乡', description:'从老城小吃到江心屿，再去楠溪江看古村与江岸。预留一天户外玩雪。', days:'5天4夜', transport:'汕头动车往返', status:'审核稿 v1', tags:['老城逛吃','江心屿坐船','楠溪江'], tone:'river'}
] as const;

// Add new destination metadata here, then register its page in App.tsx.
// Existing destination IDs are stable and remain valid in shared URLs.
