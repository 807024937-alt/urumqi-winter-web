
(function(){
  const root=document.getElementById('wenzhou-trip-map');
  const data=JSON.parse(root.querySelector('#wz-map-data').textContent);
  const by=Object.fromEntries(data.pois.map(p=>[p.id,p]));
  const svg=d3.select(root.querySelector('#wz-map-svg'));
  const sel=root.querySelector('#wz-day-select');
  const focusButton=root.querySelector('#wz-city-focus');
  const dayTitle=root.querySelector('#wz-day-title');
  const dayNote=root.querySelector('#wz-day-note');
  const pointDetail=root.querySelector('#wz-point-detail');
  const stops=root.querySelector('#wz-stops');
  const legend=root.querySelector('#wz-legend');
  const colors={1:'var(--viz-series-1)',2:'var(--viz-series-2)',3:'var(--viz-series-3)',4:'var(--viz-series-4)',5:'var(--viz-series-5)'};
  const labels={1:'D1 老城',2:'D2 坐船',3:'D3 玩雪',4:'D4 楠溪江',5:'D5 返程'};
  const plans={
    all:{title:'四晚同住老城 · 两天郊外往返',note:'D3去文成，D4去永嘉楠溪江，方向不同；每天都回温州市区。点地点可查看定位。',ids:['hotel','baili','station','ski','cangpo','lishui','shizi','furong'],view:'region'},
    1:{title:'D1 · 温州南 → 住宿区 → 墨池坊 → 公园路 → 五马街 → 纱帽河 → 住宿区',note:'13:07到站，车站接送约35—50分钟；老城段步行。酒店位置未定，图中起点为推荐区域示意。',ids:['station','hotel','mochi','gongyuan','wuma','shamao','huntun','baili'],view:'city'},
    2:{title:'D2 · 住宿区 → 南码头 ⇄ 江心屿 → 博物馆 → 南塘／塘河夜画 → 住宿区',note:'09:30前后登岛，14:00博物馆，晚间选配游船。轮渡虚线只表示往返方向；实际靠泊以公告为准。',ids:['hotel','pierSouth','pierWest','temple','museum','nantang','nightPier'],view:'city'},
    3:{title:'D3 · 住宿区 ⇄ 文成绿水尖户外雪场',note:'08:00出发，单程先按2—2.5小时；约17:00回市区。开园、娱雪票与停车入口待确认。',ids:['hotel','ski'],view:'region'},
    4:{title:'D4 · 住宿区 → 苍坡 → 岩头／丽水街 → 狮子岩岸边 → 住宿区',note:'09:00出发，约17:00返回；苍坡替代尚待确认复开的芙蓉古村，芙蓉仅标位置，不计入必到路线。',ids:['hotel','cangpo','lishui','shizi','furong'],view:'nanxi'},
    5:{title:'D5 · 老城补吃 → 住宿区取行李 → 温州南 → 汕头',note:'15:00左右离开住宿区，参考17:39动车返程，23:10到汕头；实际日期车次以12306为准。',ids:['hotel','wuma','huntun','shamao','station'],view:'city'},
    rail:{title:'汕头 ↔ 温州南 · 沿海动车往返',note:'去程参考D3114 07:49—13:07；返程参考D3113 17:39—23:10。线条连接参考去程停站，不是实测轨道；返程停站另核对。',ids:[],view:'rail'}
  };
  let state='all',oldFocus=false,transform=d3.zoomIdentity,selected='hotel',width=736,height=510,projection;
  let baseScale=1,baseTranslate=[0,0];
  const defs=svg.append('defs');
  defs.append('clipPath').attr('id','wz-map-clip').append('rect');
  const map=svg.append('g').attr('clip-path','url(#wz-map-clip)');
  const tileG=map.append('g');
  const areaG=map.append('g');
  const geoG=map.append('g');
  const routeG=map.append('g');
  const arrowG=map.append('g');
  const pointG=map.append('g');
  const textG=map.append('g');
  const scaleG=svg.append('g');
  svg.append('title').text('温州五天旅行路线、住宿区域、轮渡和夜游候船位置');
  svg.append('desc').text('可按天查看真实地理位置，路线为参考走向；点位下方有同名按钮用于键盘选择。');
  const zoom=d3.zoom().scaleExtent([1,6]).filter(e=>e.type!=='wheel'||e.ctrlKey).on('zoom',event=>{transform=event.transform;draw();});
  svg.call(zoom).on('dblclick.zoom',null);
  function escape(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
  function theme(){root.style.setProperty('--wz-map-filter',matchMedia('(prefers-color-scheme: dark)').matches?'invert(.88) hue-rotate(180deg) saturate(.55) brightness(.85)':'saturate(.65)');}
  theme();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',theme);
  function gcj(lon,lat){
    if(lon<72||lon>138||lat<.8||lat>56)return [lon,lat];
    let x=lon-105,y=lat-35,a=6378245,ee=.006693421622965943;
    let dl=-100+2*x+3*y+.2*y*y+.1*x*y+.2*Math.sqrt(Math.abs(x));
    dl+=(20*Math.sin(6*x*Math.PI)+20*Math.sin(2*x*Math.PI))*2/3;
    dl+=(20*Math.sin(y*Math.PI)+40*Math.sin(y/3*Math.PI))*2/3;
    dl+=(160*Math.sin(y/12*Math.PI)+320*Math.sin(y*Math.PI/30))*2/3;
    let dn=300+x+2*y+.1*x*x+.1*x*y+.1*Math.sqrt(Math.abs(x));
    dn+=(20*Math.sin(6*x*Math.PI)+20*Math.sin(2*x*Math.PI))*2/3;
    dn+=(20*Math.sin(x*Math.PI)+40*Math.sin(x/3*Math.PI))*2/3;
    dn+=(150*Math.sin(x/12*Math.PI)+300*Math.sin(x/30*Math.PI))*2/3;
    let r=lat/180*Math.PI,m=1-ee*Math.sin(r)**2,s=Math.sqrt(m);
    return [lon+dn*180/(a/s*Math.cos(r)*Math.PI),lat+dl*180/((a*(1-ee))/(m*s)*Math.PI)];
  }
  function link(p){
    const keyword=p.id==='hotel'?'温州 五马街 酒店':p.id==='baili'?'温州 百里坊 酒店':p.id==='nightPier'?'温州 塘河夜画':p.id==='ski'?'文成 绿水尖滑雪场':p.name;
    return 'https://uri.amap.com/search?'+new URLSearchParams({keyword,city:'温州',view:'map',src:'travel-review'}).toString();
  }
  function selectPoint(id){
    selected=id;const p=by[id];
    if(!p)return;
    let links='<a href="'+escape(link(p))+'" target="_blank" rel="noopener noreferrer">高德搜索此地点 ↗</a>';
    if(!['pier','stay','pending'].includes(p.kind)&&p.id!=='ski'){
      const a=gcj(...by.hotel.coords),b=gcj(...p.coords);
      const url='https://uri.amap.com/navigation?'+new URLSearchParams({from:a.join(',')+',住宿示意点',to:b.join(',')+','+p.name,mode:state==='1'&&p.id!=='station'?'walk':'car',src:'travel-review',callnative:'0'}).toString();
      links+='<a href="'+escape(url)+'" target="_blank" rel="noopener noreferrer">从住宿示意点查路线 ↗</a>';
    }
    pointDetail.innerHTML='<div class="trip-point-title">'+escape(p.name)+(p.approx?' · 位置示意':'')+'</div><div class="text-small">'+escape(p.detail)+'</div><div class="trip-point-links text-small">'+links+'</div>';
    for(const b of stops.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.poi===id));
    draw();
  }
  function selectStation(s){
    pointDetail.innerHTML='<div class="trip-point-title">'+escape(s.name)+'站</div><div class="text-small">参考去程停站；动车是否停靠及发到时刻以实际日期12306为准。</div>';
  }
  function viewKey(){return oldFocus?'old':plans[state].view;}
  function resetCamera(){
    width=Math.max(300,Math.round(root.querySelector('.trip-map-wrap').clientWidth));height=width<480?480:510;
    svg.attr('viewBox','0 0 '+width+' '+height).attr('height',height);
    defs.select('clipPath rect').attr('width',width).attr('height',height);
    const v=data.views[viewKey()],corners=v.bounds;
    projection=d3.geoMercator().fitExtent([[24,24],[width-24,height-24]],{type:'MultiPoint',coordinates:[corners[0],corners[1]]});
    baseScale=projection.scale();baseTranslate=projection.translate();transform=d3.zoomIdentity;
    zoom.extent([[0,0],[width,height]]).translateExtent([[-width,-height],[width*2,height*2]]);
    svg.call(zoom.transform,d3.zoomIdentity);draw();
  }
  function update(){
    const p=plans[state];dayTitle.textContent=p.title;dayNote.textContent=p.note;
    focusButton.hidden=!['1','5'].includes(state);focusButton.textContent=oldFocus?'含车站全览':'放大老城';
    legend.innerHTML='';
    const keys=state==='all'?['1','2','3','4','5']:state==='rail'?['1','5']:[state];
    for(const k of keys){const a=document.createElement('span');a.className='trip-legend-item text-small';a.innerHTML='<span class="trip-swatch" style="background:'+colors[k]+'"></span>'+escape(state==='rail'?(k==='1'?'去程':'返程方向'):labels[k]);legend.appendChild(a);}
    const type=document.createElement('span');type.className='text-small text-muted';type.textContent=state==='rail'?'站点连线示意':'实线：驾车参考　点线：步行／船行示意';legend.appendChild(type);
    stops.innerHTML='';
    if(state==='rail'){
      data.stations.forEach((s,i)=>{const b=document.createElement('button');b.className='btn btn-ghost';b.type='button';b.textContent=(i+1)+' '+s.name;b.addEventListener('click',()=>selectStation(s));stops.appendChild(b);});
      pointDetail.innerHTML='<div class="text-small">去程在温州南下车；市区接送、住宿和船码头请切回对应天数查看。</div>';
    }else{
      p.ids.forEach((id,i)=>{const b=document.createElement('button');b.className='btn btn-ghost';b.type='button';b.dataset.poi=id;b.textContent=(i+1)+' '+by[id].name;b.setAttribute('aria-pressed',String(id===selected));b.addEventListener('click',()=>selectPoint(id));stops.appendChild(b);});
      if(!p.ids.includes(selected))selected=p.ids[0];selectPoint(selected);
    }
    resetCamera();
  }
  function collides(a,b){return !(a.x+a.w+6<b.x||b.x+b.w+6<a.x||a.y+a.h+4<b.y||b.y+b.h+4<a.y);}
  function draw(){
    if(!projection)return;
    projection.scale(baseScale*transform.k).translate([baseTranslate[0]*transform.k+transform.x,baseTranslate[1]*transform.k+transform.y]);
    const path=d3.geoPath(projection),view=data.views[viewKey()];
    tileG.selectAll('image').data(data.tiles.filter(t=>t.z===view.z),t=>[t.z,t.x,t.y].join('/')).join('image').attr('class','trip-tile').attr('href',t=>t.src).attr('x',t=>projection(t.nw)[0]).attr('y',t=>projection(t.nw)[1]).attr('width',t=>projection(t.se)[0]-projection(t.nw)[0]+.4).attr('height',t=>projection(t.se)[1]-projection(t.nw)[1]+.4);
    geoG.selectAll('path').data(state==='rail'?data.provinces.features:data.admin.features).join('path').attr('d',path).attr('fill','none').attr('stroke','var(--border)').attr('stroke-width',.65).attr('opacity',.55);
    areaG.selectAll('*').remove();
    if(state!=='rail'){
      for(const a of [{id:'hotel',r:.0062},{id:'baili',r:.0043}]){
        const pt=by[a.id].coords,poly=d3.geoCircle().center(pt).radius(a.r)();
        areaG.append('path').attr('d',path(poly)).attr('fill','var(--viz-series-1)').attr('fill-opacity',.13).attr('stroke','var(--foreground)').attr('stroke-opacity',.45).attr('stroke-width',1).attr('stroke-dasharray','4 4');
      }
    }
    routeG.selectAll('*').remove();arrowG.selectAll('*').remove();pointG.selectAll('*').remove();textG.selectAll('*').remove();
    const occupied=[];
    function label(x,y,text,priority=false){
      const w=Math.min(width-16,Array.from(text).length*11.8+10),h=19;
      const candidates=[[12,-24],[12,5],[-w-12,-24],[-w-12,6],[-w/2,-33],[-w/2,16],[12,-45],[-w-12,25]];
      for(const [dx,dy] of candidates){
        const r={x:x+dx,y:y+dy,w,h};if(r.x<6||r.y<6||r.x+r.w>width-6||r.y+h>height-22)continue;
        if(occupied.some(b=>collides(r,b)))continue;
        occupied.push(r);textG.append('text').attr('class','trip-map-label').attr('x',r.x+3).attr('y',r.y+14).text(text);return;
      }
    }
    function routeDraw(r,color,offset=0){
      const geom={type:'LineString',coordinates:r.coords};
      const dash=r.mode==='walk'?'3 4':['boat','island','direction','rail'].includes(r.mode)?'7 5':null;
      const el=routeG.append('path').attr('d',path(geom)).attr('fill','none').attr('stroke',color).attr('stroke-width',r.mode==='walk'?3:3.5).attr('stroke-linecap','round').attr('stroke-linejoin','round').attr('stroke-dasharray',dash).attr('opacity',state==='all'?.8:1);
      if(offset)el.attr('transform','translate('+offset+',0)');
      const node=el.node(),len=node.getTotalLength();
      if(Number.isFinite(len)&&len>60){for(const fraction of [0.27,.73]){const q=node.getPointAtLength(len*fraction),q2=node.getPointAtLength(Math.min(len,len*fraction+2));if(q.x<0||q.x>width||q.y<0||q.y>height)continue;arrowG.append('path').attr('d','M-5,-4 L3,0 L-5,4').attr('transform','translate('+(q.x+offset)+','+q.y+') rotate('+(Math.atan2(q2.y-q.y,q2.x-q.x)*180/Math.PI)+')').attr('fill','none').attr('stroke',color).attr('stroke-width',2.3);}}
    }
    if(state==='rail'){
      const c=data.stations.map(s=>s.coords);routeDraw({mode:'rail',coords:c},colors[1],-3);routeDraw({mode:'rail',coords:c.slice().reverse()},colors[5],3);
      data.stations.forEach((s,i)=>{const [x,y]=projection(s.coords);pointG.append('circle').attr('cx',x).attr('cy',y).attr('r',5).attr('fill','var(--foreground)').attr('stroke','var(--background)').attr('stroke-width',2);label(x,y,s.name);pointG.append('circle').attr('cx',x).attr('cy',y).attr('r',15).attr('fill','transparent').attr('class','cursor-interaction').attr('data-tooltip',s.name+'站').on('click',()=>selectStation(s));});
    }else{
      const routes=data.routes.filter(r=>state==='all'||String(r.day)===state);
      for(const r of routes)routeDraw(r,colors[r.day]);
      let ids=plans[state].ids.slice();
      if(state==='all')ids=['hotel','station','ski','cangpo','lishui','shizi','furong'];
      const pts=ids.map(id=>by[id]);
      pts.sort((a,b)=>(a.id===selected?-1:b.id===selected?1:0));
      for(const p of pts){
        const [x,y]=projection(p.coords);if(x<-20||x>width+20||y<-20||y>height+20)continue;
        const index=plans[state].ids.indexOf(p.id)+1,col=state==='all'?p.id==='ski'?colors[3]:['cangpo','lishui','shizi','furong'].includes(p.id)?colors[4]:colors[1]:colors[state];
        const fill=p.kind==='pending'?'var(--muted-foreground)':col;
        if(p.id===selected)pointG.append('circle').attr('cx',x).attr('cy',y).attr('r',16).attr('fill','var(--background)').attr('opacity',.95);
        pointG.append('circle').attr('cx',x).attr('cy',y).attr('r',10).attr('fill',fill).attr('stroke','var(--background)').attr('stroke-width',2).attr('stroke-dasharray',p.kind==='pending'?'3 2':null);
        pointG.append('text').attr('class','trip-number').attr('x',x).attr('y',y+.5).text(p.kind==='stay'?'住':p.kind==='pier'?'船':p.kind==='pending'?'?':index);
        const display=state==='all'?(p.id==='hotel'?'老城住宿区 · D1/D2':p.name):p.name;
        label(x,y,display,p.id===selected);
        pointG.append('circle').attr('cx',x).attr('cy',y).attr('r',17).attr('fill','transparent').attr('class','cursor-interaction').attr('data-tooltip',p.name).on('click',()=>selectPoint(p.id));
      }
    }
    scaleG.selectAll('*').remove();
    const mid=projection.invert([width/2,height/2]);
    let km=state==='rail'?100:viewKey()==='old'?0.5:viewKey()==='city'?2:10;
    const dd=km/111.32/Math.cos(mid[1]*Math.PI/180),s0=projection(mid),s1=projection([mid[0]+dd,mid[1]]),len=Math.abs(s1[0]-s0[0]);
    if(len<width*.7){scaleG.append('path').attr('d','M14,'+(height-22)+'v5h'+len+'v-5').attr('fill','none').attr('stroke','var(--foreground)').attr('stroke-width',2);scaleG.append('text').attr('class','trip-map-scale').attr('x',14).attr('y',height-29).text(km+' km');}
    textG.append('text').attr('class','trip-map-label').attr('x',width-30).attr('y',24).text('北');
  }
  sel.addEventListener('change',()=>{state=sel.value;oldFocus=false;update();});
  focusButton.addEventListener('click',()=>{oldFocus=!oldFocus;focusButton.textContent=oldFocus?'含车站全览':'放大老城';resetCamera();});
  root.querySelector('#wz-zoom-in').addEventListener('click',()=>svg.call(zoom.scaleBy,1.5));
  root.querySelector('#wz-zoom-out').addEventListener('click',()=>svg.call(zoom.scaleBy,1/1.5));
  new ResizeObserver(()=>resetCamera()).observe(root.querySelector('.trip-map-wrap'));
  update();
})();

new ResizeObserver(()=>{if(parent!==window)parent.postMessage({type:"wenzhou-map-height",height:Math.ceil(document.body.getBoundingClientRect().height)+32},location.origin)}).observe(document.body);
