/* Connects features: recap, programme next step, pulse due, partner status. window.KA_FOCUS.build(base) -> Promise<{recap,items}> */
(function(){
  var LS=function(k,d){try{var v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}};
  function weekStart(){var x=new Date();x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.getTime()}
  function recap(){
    var ws=weekStart(),h=LS('ka_hist',[]).filter(function(e){return e.t>=ws}),j=LS('ka_journal',[]);
    var sess=h.filter(function(e){return e.y==='session'}).length,tasks=h.filter(function(e){return e.y==='task'}).length;
    var moods={};h.filter(function(e){return e.y==='session'}).forEach(function(e){var m=(e.b||'').split(' · ')[0];if(m)moods[m]=(moods[m]||0)+1});
    var top=Object.keys(moods).sort(function(a,b){return moods[b]-moods[a]})[0];
    var act=0;h.forEach(function(e){if(e.y!=='play')act++});
    return {sessions:sess,tasks:tasks,top:top,acts:act,total:h.length};
  }
  function build(base){
    var out={recap:recap(),items:[]};
    return fetch(base+'data/programs.json').then(function(r){return r.json()}).catch(function(){return[]}).then(function(P){
      var prog=LS('ka_prog',{});
      for(var i=0;i<P.length;i++){var st=prog[P[i].id];if(!st)continue;
        for(var w=0;w<P[i].weeks.length;w++)for(var k=0;k<P[i].weeks[w].ex.length;k++)if(!(st.done||{})[w+'-'+k]&&!(window.KA_FILTER&&!KA_FILTER.ok(P[i].weeks[w].ex[k].t+' '+P[i].weeks[w].ex[k].d))&&!(P[i].id==='kink'&&window.KA_FILTER&&KA_FILTER.topicOff('bdsm'))){out.items.push({icon:P[i].icon,label:'Week '+(w+1)+' · '+P[i].title,title:P[i].weeks[w].ex[k].t,href:base+'games/kamaagni-experts.html'});w=99;break}
        if(out.items.length)break}
      try{var jl=LS('ka_journal',[]).filter(function(e){return e.r>=4&&e.d&&(Date.now()-new Date(e.d).getTime())>14*864e5}).sort(function(a,b){return b.r-a.r||(a.d<b.d?1:-1)});
        if(jl.length){var m=jl[Math.floor(new Date().getDate()%jl.length)];out.items.push({icon:'📖',label:'Remember this',title:new Date(m.d).toLocaleDateString(undefined,{day:'numeric',month:'short'})+' · '+((m.n||'').slice(0,50)||(m.g||[]).slice(0,2).join(' · ')||'a great night'),href:base+'games/kamaagni-journal.html'})}
        if(!LS('ka_datenight',null))out.items.push({icon:'📅',label:'Make it a ritual',title:'Pick a regular night: a plan beats willpower',href:base+'games/kamaagni-tonight.html'})}catch(e){}
      var pu=LS('ka_pulse',[]),lp=pu[pu.length-1];
      if(!lp||Date.now()-lp.t>6*864e5)out.items.push({icon:'📊',label:'Weekly Pulse',title:lp?'Time for this week\'s check-in':'Take your first Pulse (30 seconds)',href:base+'games/kamaagni-experts.html?t=pulse'});
      var jr=LS('ka_journey',{done:{}}),jn=Object.keys(jr.done||{}).length;
      if(!(window.KA_FILTER&&KA_FILTER.pageHidden('kamaagni-journey')))out.items.push({icon:'⛓️',label:'BDSM Journey',title:jn?jn+' steps done · next step':'Start your first step',href:base+'games/kamaagni-journey.html'});
      var ch=LS('ka_chal',{done:{}}),cn=Object.keys(ch.done||{}).length;
      out.items.push({icon:'🏆',label:'Challenges',title:cn?cn+' done · continue':'Pick a challenge',href:base+'games/kamaagni-challenges.html'});
      try{var l=LS('ka_couple_link',null);if(l)out.items.push({icon:'💞',label:'Partner',title:'Open Together',href:base+'games/kamaagni-together.html'})}catch(e){}
      return out;
    });
  }
  window.KA_FOCUS={build:build,recap:recap};
})();
