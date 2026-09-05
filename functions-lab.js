(()=>{
  const $=id=>document.getElementById(id);
  const canvas=$('graph'),ctx=canvas.getContext('2d');
  const X=10,Y=10,BLUE='#2563eb',ORANGE='#f97316';
  const configs={
    linear:{label:'一次函数',params:{k:{name:'斜率 k',v:1,min:-5,max:5,step:.1},b:{name:'截距 b',v:0,min:-8,max:8,step:.1}}},
    quadratic:{label:'二次函数',params:{a:{name:'二次项系数 a',v:1,min:-3,max:3,step:.1},b:{name:'一次项系数 b',v:0,min:-8,max:8,step:.1},c:{name:'常数项 c',v:0,min:-8,max:8,step:.1},h:{name:'水平平移 h',v:0,min:-7,max:7,step:.1},k:{name:'垂直平移 k',v:0,min:-8,max:8,step:.1}}},
    inverse:{label:'反比例函数',params:{k:{name:'比例系数 k',v:4,min:-10,max:10,step:.1}}},
    abs:{label:'绝对值函数',params:{a:{name:'方向与伸缩 a',v:1,min:-4,max:4,step:.1},h:{name:'水平平移 h',v:0,min:-6,max:6,step:.1},k:{name:'垂直平移 k',v:0,min:-6,max:6,step:.1}}},
    exp:{label:'指数函数',params:{a:{name:'倍数 a',v:1,min:-4,max:4,step:.1},b:{name:'底数 b',v:2,min:.2,max:4,step:.1},c:{name:'垂直平移 c',v:0,min:-6,max:6,step:.1}}},
    log:{label:'对数函数',params:{a:{name:'倍数 a',v:1,min:-4,max:4,step:.1},b:{name:'底数 b',v:2,min:.2,max:5,step:.1},h:{name:'水平平移 h',v:0,min:-5,max:5,step:.1},k:{name:'垂直平移 k',v:0,min:-6,max:6,step:.1}}}
  };

  function fresh(type){
    const values={};
    for(const [key,p] of Object.entries(configs[type].params))values[key]=p.v;
    return{type,values};
  }
  let primary=fresh('quadratic'),secondary=fresh('linear'),showSecond=true;

  function fmt(v){
    if(!Number.isFinite(v))return'—';
    if(Math.abs(v)<1e-9)return'0';
    return(+v.toFixed(2)).toString();
  }
  function sx(x){return canvas.width/2+x*canvas.width/(2*X)}
  function sy(y){return canvas.height/2-y*canvas.height/(2*Y)}
  function signed(value){return`${value>=0?'+':'−'} ${fmt(Math.abs(value))}`}

  function evaluate(state,x){
    const v=state.values;
    if(state.type==='linear')return v.k*x+v.b;
    if(state.type==='quadratic'){const u=x-v.h;return v.a*u*u+v.b*u+v.c+v.k}
    if(state.type==='inverse')return Math.abs(x)<1e-8?NaN:v.k/x;
    if(state.type==='abs')return v.a*Math.abs(x-v.h)+v.k;
    if(state.type==='exp')return v.a*Math.pow(v.b,x)+v.c;
    if(state.type==='log')return x>v.h&&v.b>0&&Math.abs(v.b-1)>.03?v.a*(Math.log(x-v.h)/Math.log(v.b))+v.k:NaN;
    return NaN;
  }

  function formulaFor(state,index){
    const v=state.values,y=index===1?'y₁':'y₂';
    if(state.type==='linear')return`${y} = ${fmt(v.k)}x ${signed(v.b)}`;
    if(state.type==='quadratic')return`${y} = ${fmt(v.a)}(x ${v.h>=0?'−':'+'} ${fmt(Math.abs(v.h))})² ${signed(v.b)}(x ${v.h>=0?'−':'+'} ${fmt(Math.abs(v.h))}) ${signed(v.c)} ${signed(v.k)}`;
    if(state.type==='inverse')return`${y} = ${fmt(v.k)} / x`;
    if(state.type==='abs')return`${y} = ${fmt(v.a)}|x ${v.h>=0?'−':'+'} ${fmt(Math.abs(v.h))}| ${signed(v.k)}`;
    if(state.type==='exp')return`${y} = ${fmt(v.a)}·${fmt(v.b)}ˣ ${signed(v.c)}`;
    return`${y} = ${fmt(v.a)}·log₍${fmt(v.b)}₎(x ${v.h>=0?'−':'+'} ${fmt(Math.abs(v.h))}) ${signed(v.k)}`;
  }

  function buildParams(containerId,state,prefix){
    const box=$(containerId);box.innerHTML='';
    for(const [key,p] of Object.entries(configs[state.type].params)){
      const row=document.createElement('div');row.className='param';
      row.innerHTML=`<div class="ph"><b>${p.name}</b><span id="${prefix}${key}Text">${fmt(state.values[key])}</span></div><div class="pair"><input id="${prefix}${key}Range" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${state.values[key]}"><input id="${prefix}${key}Num" type="number" min="${p.min}" max="${p.max}" step="${p.step}" value="${state.values[key]}"></div>`;
      box.appendChild(row);
      const range=row.querySelector('input[type=range]'),number=row.querySelector('input[type=number]');
      range.addEventListener('input',()=>{state.values[key]=+range.value;number.value=range.value;draw()});
      number.addEventListener('input',()=>{
        let value=+number.value;if(!Number.isFinite(value))return;
        value=Math.max(p.min,Math.min(p.max,value));state.values[key]=value;range.value=value;draw();
      });
    }
  }

  function setStats(items,note){
    for(let i=0;i<4;i++){
      const item=items[i]||['—',''];$('p'+(i+1)).textContent=item[0];$('l'+(i+1)).textContent=item[1];
    }
    $('note').textContent=note;
  }

  function properties(){
    const v=primary.values;
    if(primary.type==='linear'){
      setStats([[v.k>0?'递增':v.k<0?'递减':'常量','单调性'],[`(0, ${fmt(v.b)})`,'与 y 轴交点'],[Math.abs(v.k)>1e-9?`(${fmt(-v.b/v.k)}, 0)`:'—','与 x 轴交点'],[fmt(v.k),'斜率 k']],'改变 k 观察倾斜方向；改变 b 观察图像沿 y 轴平移。');
    }else if(primary.type==='quadratic'){
      if(Math.abs(v.a)<1e-8){
        setStats([[`y = ${fmt(v.k)}`,'已退化为常量函数'],['—','最低点 / 最高点'],['—','对称轴'],['a 不能为 0','恢复二次函数']],'将 a 调整为非零数值即可恢复抛物线。h 控制左右平移，k 控制上下平移。');return;
      }
      const vertexX=v.h-v.b/(2*v.a),vertexY=v.c+v.k-v.b*v.b/(4*v.a);
      const expandedB=v.b-2*v.a*v.h,expandedC=v.a*v.h*v.h-v.b*v.h+v.c+v.k;
      setStats([[
        `(${fmt(vertexX)}, ${fmt(vertexY)})`,v.a>0?'最低点（顶点）':'最高点（顶点）'
      ],[`x = h − b/(2a) = ${fmt(vertexX)}`,'对称轴公式与位置'],[v.a>0?'向上':'向下','开口方向'],[`B=${fmt(expandedB)}，C=${fmt(expandedC)}`,'展开后 ax²+Bx+C']],'保留 a、b、c，并用 h、k 将原二次函数整体水平、垂直平移；图中虚线为对称轴。');
    }else if(primary.type==='inverse'){
      setStats([[v.k>0?'Ⅰ、Ⅲ象限':v.k<0?'Ⅱ、Ⅳ象限':'x 轴','主要分布'],['x = 0','竖直渐近线'],['y = 0','水平渐近线'],[fmt(v.k),'比例系数 k']],'反比例函数在 x=0 处没有定义，图像分成两支曲线。');
    }else if(primary.type==='abs'){
      setStats([[`(${fmt(v.h)}, ${fmt(v.k)})`,'顶点'],[v.a>0?'开口向上':v.a<0?'开口向下':'水平','方向'],[`x = ${fmt(v.h)}`,'对称轴'],[fmt(Math.abs(v.a)),'陡峭程度']],'绝对值函数呈 V 形；h、k 控制顶点平移，a 控制方向和陡峭程度。');
    }else if(primary.type==='exp'){
      setStats([[v.b>1?'随 x 增大而放大':v.b<1?'随 x 增大而衰减':'退化','底数作用'],[`y = ${fmt(v.c)}`,'水平渐近线'],[`(0, ${fmt(v.a+v.c)})`,'与 y 轴交点'],[fmt(v.b),'底数 b']],'指数函数要求 b>0 且 b≠1。');
    }else{
      setStats([[`x > ${fmt(v.h)}`,'定义域'],[`x = ${fmt(v.h)}`,'竖直渐近线'],[v.b>1?'递增趋势':'递减趋势','底数作用'],[fmt(v.b),'底数 b']],'对数函数要求 b>0 且 b≠1，并且真数 x−h 必须大于0。');
    }
  }

  function axes(){
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fbfdff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#e4eaf2';ctx.lineWidth=1;
    for(let x=-X;x<=X;x++){ctx.beginPath();ctx.moveTo(sx(x),0);ctx.lineTo(sx(x),canvas.height);ctx.stroke()}
    for(let y=-Y;y<=Y;y++){ctx.beginPath();ctx.moveTo(0,sy(y));ctx.lineTo(canvas.width,sy(y));ctx.stroke()}
    const ox=sx(0),oy=sy(0);ctx.strokeStyle='#334155';ctx.fillStyle='#334155';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(12,oy);ctx.lineTo(canvas.width-15,oy);ctx.moveTo(ox,canvas.height-12);ctx.lineTo(ox,15);ctx.stroke();
    ctx.beginPath();ctx.moveTo(canvas.width-15,oy);ctx.lineTo(canvas.width-29,oy-7);ctx.lineTo(canvas.width-29,oy+7);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(ox,15);ctx.lineTo(ox-7,29);ctx.lineTo(ox+7,29);ctx.closePath();ctx.fill();
    ctx.font='600 18px system-ui';ctx.fillText('x',canvas.width-36,oy-13);ctx.fillText('y',ox+14,31);ctx.fillText('O',ox+8,oy+22);
    ctx.fillStyle='#64748b';ctx.font='15px system-ui';ctx.textAlign='left';
    for(let x=-8;x<=8;x+=2)if(x)ctx.fillText(String(x),sx(x)+4,oy+20);
    for(let y=-8;y<=8;y+=2)if(y)ctx.fillText(String(y),ox+7,sy(y)-5);
  }

  function drawCurve(state,color,width=4){
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.beginPath();let open=false,lastY=null;
    for(let px=0;px<=canvas.width;px+=2){
      const x=(px-canvas.width/2)*2*X/canvas.width,y=evaluate(state,x),py=sy(y);
      const valid=Number.isFinite(y)&&Math.abs(y)<Y*3&&py>-canvas.height*2&&py<canvas.height*3;
      const jump=lastY!==null&&Math.abs(y-lastY)>Y*1.2;
      if(valid&&!jump){if(!open){ctx.moveTo(px,py);open=true}else ctx.lineTo(px,py)}else open=false;
      lastY=valid?y:null;
    }
    ctx.stroke();
  }

  function labelPoint(x,y,text,color,offsetY=-18){
    if(Math.abs(x)>X||Math.abs(y)>Y)return;
    const px=sx(x),py=sy(y);ctx.fillStyle=color;ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fill();
    ctx.font='600 16px system-ui';const width=ctx.measureText(text).width+14;
    let lx=Math.min(canvas.width-width-6,Math.max(6,px+10)),ly=Math.min(canvas.height-25,Math.max(6,py+offsetY-18));
    ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillRect(lx,ly,width,24);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.strokeRect(lx,ly,width,24);
    ctx.fillStyle=color;ctx.textAlign='left';ctx.fillText(text,lx+7,ly+17);
  }

  function drawQuadraticGuide(){
    if(primary.type!=='quadratic'||Math.abs(primary.values.a)<1e-8)return;
    const {a,b,c,h,k}=primary.values,vertexX=h-b/(2*a),vertexY=c+k-b*b/(4*a);if(Math.abs(vertexX)<=X){
      ctx.save();ctx.setLineDash([10,8]);ctx.strokeStyle='rgba(37,99,235,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx(vertexX),0);ctx.lineTo(sx(vertexX),canvas.height);ctx.stroke();ctx.restore();
      ctx.fillStyle='#1d4ed8';ctx.font='600 15px system-ui';ctx.textAlign='left';ctx.fillText(`对称轴 x = ${fmt(vertexX)}`,Math.min(canvas.width-150,sx(vertexX)+8),42);
    }
    labelPoint(vertexX,vertexY,`${a>0?'最低点':'最高点'} (${fmt(vertexX)}, ${fmt(vertexY)})`,BLUE,-22);
  }

  function difference(x){return evaluate(primary,x)-evaluate(secondary,x)}
  function refineSignRoot(a,b){
    let fa=difference(a),fb=difference(b);if(!Number.isFinite(fa)||!Number.isFinite(fb))return NaN;
    for(let i=0;i<45;i++){
      const m=(a+b)/2,fm=difference(m);if(!Number.isFinite(fm))return NaN;
      if(Math.abs(fm)<1e-9)return m;
      if(fa*fm<=0){b=m;fb=fm}else{a=m;fa=fm}
    }
    return(a+b)/2;
  }
  function refineTouchRoot(a,b){
    for(let i=0;i<30;i++){
      const m1=a+(b-a)/3,m2=b-(b-a)/3;
      if(Math.abs(difference(m1))<Math.abs(difference(m2)))b=m2;else a=m1;
    }
    return(a+b)/2;
  }
  function findIntersections(){
    if(!showSecond)return{hidden:true,points:[]};
    let coincident=0,validCount=0;
    for(let i=0;i<=40;i++){
      const x=-X+2*X*i/40,d=difference(x);if(Number.isFinite(d)){validCount++;if(Math.abs(d)<1e-7)coincident++}
    }
    if(validCount>10&&coincident/validCount>.9)return{infinite:true,points:[]};
    const steps=2400,samples=[];
    for(let i=0;i<=steps;i++){const x=-X+2*X*i/steps;samples.push({x,d:difference(x)})}
    const candidates=[];
    for(let i=1;i<samples.length;i++){
      const a=samples[i-1],b=samples[i];
      if(Number.isFinite(a.d)&&Number.isFinite(b.d)&&a.d*b.d<0)candidates.push(refineSignRoot(a.x,b.x));
    }
    for(let i=1;i<samples.length-1;i++){
      const p=samples[i-1],q=samples[i],n=samples[i+1];
      if(Number.isFinite(q.d)&&Math.abs(q.d)<.03&&Math.abs(q.d)<=Math.abs(p.d)&&Math.abs(q.d)<=Math.abs(n.d))candidates.push(refineTouchRoot(p.x,n.x));
    }
    const points=[];
    for(const x of candidates){
      const y1=evaluate(primary,x),y2=evaluate(secondary,x),d=y1-y2;
      if(!Number.isFinite(x)||!Number.isFinite(y1)||!Number.isFinite(y2)||Math.abs(d)>.025||Math.abs(y1)>Y*1.15)continue;
      if(points.some(p=>Math.abs(p.x-x)<.06))continue;
      points.push({x,y:(y1+y2)/2});
    }
    points.sort((a,b)=>a.x-b.x);return{points:points.slice(0,10)};
  }

  function showIntersections(info){
    const box=$('intersectionList');
    if(info.hidden){box.textContent='函数 2 已隐藏。';return}
    if(info.infinite){box.textContent='两条函数在可见范围内重合，交点有无数个。';return}
    if(!info.points.length){box.textContent='当前可见范围 −10 ≤ x ≤ 10 内没有交点。';return}
    box.textContent=`共 ${info.points.length} 个：`+info.points.map(p=>`(${fmt(p.x)}, ${fmt(p.y)})`).join('，');
  }

  function legend(){
    ctx.font='600 16px system-ui';ctx.textAlign='left';ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(18,16,showSecond?260:126,34);
    ctx.fillStyle=BLUE;ctx.fillRect(30,30,24,4);ctx.fillText('函数 1',62,36);
    if(showSecond){ctx.fillStyle=ORANGE;ctx.fillRect(150,30,24,4);ctx.fillText('函数 2',182,36)}
  }

  function draw(){
    $('formula1').textContent=formulaFor(primary,1);$('formula2').textContent=formulaFor(secondary,2);
    axes();drawCurve(primary,BLUE,5);if(showSecond)drawCurve(secondary,ORANGE,4);drawQuadraticGuide();
    const intersections=findIntersections();
    if(!intersections.hidden&&!intersections.infinite)intersections.points.forEach((p,i)=>labelPoint(p.x,p.y,`交点 ${i+1}  (${fmt(p.x)}, ${fmt(p.y)})`,'#dc2626',i%2?-42:-16));
    legend();properties();showIntersections(intersections);
  }

  function rebuildPrimary(){
    buildParams('params1',primary,'f1');document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.type===primary.type));draw();
  }
  function rebuildSecondary(){buildParams('params2',secondary,'f2');$('secondType').value=secondary.type;draw()}
  document.querySelectorAll('#tabs button').forEach(button=>button.addEventListener('click',()=>{primary=fresh(button.dataset.type);rebuildPrimary()}));
  $('secondType').addEventListener('change',event=>{secondary=fresh(event.target.value);rebuildSecondary()});
  $('showSecond').addEventListener('change',event=>{showSecond=event.target.checked;$('secondBody').hidden=!showSecond;draw()});
  $('reset').addEventListener('click',()=>{primary=fresh(primary.type);secondary=fresh(secondary.type);rebuildPrimary();rebuildSecondary()});
  $('random').addEventListener('click',()=>{
    for(const state of [primary,secondary])for(const [key,p] of Object.entries(configs[state.type].params)){
      let value=p.min+Math.random()*(p.max-p.min);
      if((state.type==='exp'||state.type==='log')&&key==='b'&&Math.abs(value-1)<.3)value=2;
      if((state.type==='quadratic'&&key==='a'||state.type==='inverse'&&key==='k')&&Math.abs(value)<.25)value=1;
      state.values[key]=Math.round(value/p.step)*p.step;
    }
    rebuildPrimary();rebuildSecondary();
  });
  rebuildPrimary();rebuildSecondary();
})();
