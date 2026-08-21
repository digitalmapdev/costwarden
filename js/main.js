(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt=function(n){return '€'+Math.round(n).toLocaleString('en-US');};

  function countUp(el){
    var target=parseFloat(el.dataset.count),prefix=el.dataset.prefix||'';
    if(reduce){el.textContent=prefix+target.toLocaleString('en-US');return;}
    var dur=1600,start=null;
    function step(ts){if(!start)start=ts;var p=Math.min((ts-start)/dur,1);var e=1-Math.pow(1-p,3);
      el.textContent=prefix+Math.floor(e*target).toLocaleString('en-US');if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;var t=e.target;
      if(t.dataset.count){countUp(t);}
      else if(t.id==='anoms'){t.querySelectorAll('.anom').forEach(function(r,i){setTimeout(function(){r.classList.add('in');},i*160);});}
      else if(t.id==='steps'){t.querySelectorAll('.step').forEach(function(r,i){setTimeout(function(){r.classList.add('in');},i*110);});}
      else{t.classList.add('in');}
      io.unobserve(t);
    });
  },{threshold:.3});
  document.querySelectorAll('[data-count], #anoms, #steps, .reveal').forEach(function(el){io.observe(el);});

  // theme switcher
  var btns=document.querySelectorAll('.switcher button');
  btns.forEach(function(b){b.addEventListener('click',function(){
    document.documentElement.setAttribute('data-theme', b.dataset.theme);
    btns.forEach(function(x){x.setAttribute('aria-pressed', x===b?'true':'false');});
  });});

  // savings calculator
  var slider=document.getElementById('spend'),
      spendVal=document.getElementById('spendVal'),
      saveVal=document.getElementById('saveVal'),
      saveRange=document.getElementById('saveRange'),
      saveBar=document.getElementById('saveBar');
  function paintTrack(){
    var pct=(slider.value-slider.min)/(slider.max-slider.min)*100;
    slider.style.background='linear-gradient(90deg,#8B6DFF,#2FD9C4 '+pct+'%,rgba(255,255,255,.09) '+pct+'%)';
  }
  var curMid=0, animId=null;
  function setSavings(animate){
    var spend=+slider.value;
    spendVal.textContent=(spend>=20000000?'€20,000,000+':fmt(spend));
    var mid=spend*0.055, low=spend*0.03, high=spend*0.08;
    saveRange.textContent='Estimated range: '+fmt(low)+' – '+fmt(high);
    saveBar.style.width=(38+(spend/slider.max)*54)+'%';
    if(!animate||reduce){curMid=mid;saveVal.textContent=fmt(mid);return;}
    var from=curMid,to=mid,st=null,dur=450;
    if(animId)cancelAnimationFrame(animId);
    function step(ts){if(!st)st=ts;var p=Math.min((ts-st)/dur,1);var e=1-Math.pow(1-p,3);
      saveVal.textContent=fmt(from+(to-from)*e);if(p<1)animId=requestAnimationFrame(step);else curMid=to;}
    animId=requestAnimationFrame(step);
  }
  if(slider){
    paintTrack(); setSavings(false);
    slider.addEventListener('input',function(){paintTrack();setSavings(true);});
  }
})();

// nav dropdown ("Company") — click/keyboard toggle, closes on outside click or Escape
(function(){
  document.querySelectorAll('.nav-drop').forEach(function(drop){
    var btn = drop.querySelector('.nav-drop-btn');
    if(!btn) return;
    function close(){ drop.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
    function toggle(e){
      e.stopPropagation();
      var willOpen = !drop.classList.contains('open');
      document.querySelectorAll('.nav-drop.open').forEach(function(d){ if(d!==drop) d.classList.remove('open'); });
      drop.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }
    btn.addEventListener('click', toggle);
    document.addEventListener('click', function(e){ if(!drop.contains(e.target)) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
  });
})();

// book-a-demo form: AJAX submit to Formspree, no page reload
(function(){
  var form = document.getElementById('demoForm');
  if(!form) return;
  var status = document.getElementById('ffStatus');
  var btn = form.querySelector('button[type="submit"]');
  var btnLabel = form.querySelector('.ff-btn-label');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(form.action.indexOf('YOUR_FORM_ID') !== -1){
      status.textContent = 'Form not connected yet — replace YOUR_FORM_ID in index.html with your Formspree form ID.';
      status.className = 'ff-status err';
      return;
    }
    btn.disabled = true;
    btnLabel.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'ff-status';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function(res){
      if(res.ok){
        form.reset();
        status.textContent = "Thanks — we'll be in touch within one business day.";
        status.className = 'ff-status ok';
        btnLabel.textContent = 'Request sent';
      } else {
        return res.json().then(function(data){
          var msg = (data && data.errors && data.errors.map(function(x){return x.message;}).join(', ')) || 'Something went wrong — please try again or email us directly.';
          status.textContent = msg;
          status.className = 'ff-status err';
          btn.disabled = false;
          btnLabel.textContent = 'Send request';
        });
      }
    }).catch(function(){
      status.textContent = 'Network error — please try again or email us directly.';
      status.className = 'ff-status err';
      btn.disabled = false;
      btnLabel.textContent = 'Send request';
    });
  });
})();
