(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el){
    var target=parseFloat(el.dataset.count),prefix=el.dataset.prefix||'';
    if(reduce){
      el.textContent=prefix+target.toLocaleString('en-US');
      return;
    }

    var dur=1600,start=null;

    function step(ts){
      if(!start) start=ts;

      var p=Math.min((ts-start)/dur,1);
      var e=1-Math.pow(1-p,3);

      el.textContent=prefix+Math.floor(e*target).toLocaleString('en-US');

      if(p<1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;

      var t=e.target;

      if(t.dataset.count){
        countUp(t);
      }
      else if(t.id==='anoms'){
        t.querySelectorAll('.anom').forEach(function(r,i){
          setTimeout(function(){
            r.classList.add('in');
          },i*160);
        });
      }
      else if(t.id==='steps'){
        t.querySelectorAll('.step').forEach(function(r,i){
          setTimeout(function(){
            r.classList.add('in');
          },i*110);
        });
      }
      else{
        t.classList.add('in');
      }

      io.unobserve(t);
    });
  },{threshold:.3});

  document.querySelectorAll(
    '[data-count], #anoms, #steps, .reveal'
  ).forEach(function(el){
    io.observe(el);
  });
})();


// BOOK A DEMO FORM
// AJAX submit to Formspree without page reload
(function(){
  var form=document.getElementById('demoForm');

  if(!form) return;

  var status=document.getElementById('ffStatus');
  var btn=form.querySelector('button[type="submit"]');
  var btnLabel=form.querySelector('.ff-btn-label');

  form.addEventListener('submit',function(e){
    e.preventDefault();

    if(form.action.indexOf('YOUR_FORM_ID')!==-1){
      status.textContent=
        'Form not connected yet — replace YOUR_FORM_ID in index.html with your Formspree form ID.';
      status.className='ff-status err';
      return;
    }

    btn.disabled=true;
    btnLabel.textContent='Sending…';
    status.textContent='';
    status.className='ff-status';

    fetch(form.action,{
      method:'POST',
      body:new FormData(form),
      headers:{
        'Accept':'application/json'
      }
    })
    .then(function(res){
      if(res.ok){
        form.reset();

        status.textContent=
          "Thanks — we'll be in touch within one business day.";

        status.className='ff-status ok';
        btnLabel.textContent='Request sent';
      }
      else{
        return res.json().then(function(data){
          var msg=
            (
              data &&
              data.errors &&
              data.errors.map(function(x){
                return x.message;
              }).join(', ')
            )
            ||
            'Something went wrong — please try again or email us directly.';

          status.textContent=msg;
          status.className='ff-status err';
          btn.disabled=false;
          btnLabel.textContent='Send request';
        });
      }
    })
    .catch(function(){
      status.textContent=
        'Network error — please try again or email us directly.';

      status.className='ff-status err';
      btn.disabled=false;
      btnLabel.textContent='Send request';
    });
  });
})();


// HERO V2
// Interactive illustrative spend analysis
(function(){
  var root=document.getElementById('spendDemo');

  if(!root) return;

  var reduce=
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var replay=document.getElementById('heroReplay');
  var amount=document.getElementById('scanAmount');
  var percent=document.getElementById('scanPercent');
  var progress=document.getElementById('scanProgress');
  var status=document.getElementById('demoStatus');
  var finding=document.getElementById('demoFinding');
  var action=document.getElementById('findingAction');
  var pop=document.getElementById('evidencePopover');
  var close=document.getElementById('evidenceClose');

  var sources=[].slice.call(
    root.querySelectorAll('.demo-source')
  );

  var timers=[];
  var raf=null;

  var data={
    software:{
      title:'Overlapping software licences',
      text:'Similar tools appear across teams while some licences show little recent activity.',
      items:'12',
      value:'€8,420',
      source:'Subscription export',
      confidence:'High signal'
    },

    suppliers:{
      title:'Supplier category overlap',
      text:'Multiple suppliers appear to provide similar services across separate teams or cost centres.',
      items:'7',
      value:'€14,680',
      source:'Invoice export',
      confidence:'Review'
    },

    telecom:{
      title:'Recurring service increase',
      text:'A recurring service cost increased across recent periods without a matching volume change.',
      items:'4',
      value:'€5,260',
      source:'GL + invoice data',
      confidence:'Review'
    }
  };


  function later(fn,ms){
    var id=setTimeout(
      fn,
      reduce ? 0 : ms
    );

    timers.push(id);

    return id;
  }


  function setFinding(key){
    var d=data[key];

    document.getElementById('findingTitle').textContent=
      d.title;

    document.getElementById('findingText').textContent=
      d.text;

    document.getElementById('findingItems').textContent=
      d.items;

    document.getElementById('findingValue').textContent=
      d.value;

    document.getElementById('findingSource').textContent=
      d.source;

    document.getElementById('findingConfidence').textContent=
      d.confidence;

    finding.classList.add('is-visible');

    sources.forEach(function(b){
      var on=b.dataset.key===key;

      b.classList.toggle(
        'is-active',
        on
      );

      b.setAttribute(
        'aria-pressed',
        on ? 'true' : 'false'
      );
    });
  }


  function sourceState(index,state,label){
    var b=sources[index];

    if(!b) return;

    b.classList.remove(
      'is-scanning',
      'is-done'
    );

    if(state){
      b.classList.add(state);
    }

    var t=
      b.querySelector('.source-state span');

    if(t){
      t.textContent=label;
    }
  }


  function animateNumber(target,duration){
    if(raf){
      cancelAnimationFrame(raf);
    }

    var start=null;

    function frame(ts){
      if(!start){
        start=ts;
      }

      var p=
        Math.min(
          (ts-start)/(reduce ? 1 : duration),
          1
        );

      var e=
        1-Math.pow(1-p,3);

      var val=
        Math.floor(target*e);

      amount.textContent=
        val.toLocaleString('en-US');

      percent.textContent=
        Math.floor(100*e);

      progress.style.width=
        (100*e)+'%';

      if(p<1){
        raf=requestAnimationFrame(frame);
      }
    }

    raf=requestAnimationFrame(frame);
  }


  function reset(){
    timers.forEach(clearTimeout);
    timers=[];

    if(raf){
      cancelAnimationFrame(raf);
    }

    root.classList.remove('is-running');

    finding.classList.remove('is-visible');

    pop.hidden=true;

    amount.textContent='0';

    percent.textContent='0';

    progress.style.width='0%';

    status.textContent='Analyzing';

    sources.forEach(function(b,i){
      b.classList.remove(
        'is-active',
        'is-scanning',
        'is-done'
      );

      b.setAttribute(
        'aria-pressed',
        i===0 ? 'true' : 'false'
      );

      b.querySelector(
        '.source-state span'
      ).textContent=
        i===0 ? 'Scanning' : 'Queued';
    });

    sources[0].classList.add(
      'is-active',
      'is-scanning'
    );
  }


  function run(){
    reset();

    root.classList.add('is-running');

    animateNumber(
      284520,
      3200
    );

    later(function(){
      sourceState(
        0,
        'is-done',
        'Reviewed'
      );

      sourceState(
        1,
        'is-scanning',
        'Scanning'
      );
    },900);

    later(function(){
      sourceState(
        1,
        'is-done',
        'Reviewed'
      );

      sourceState(
        2,
        'is-scanning',
        'Scanning'
      );
    },1750);

    later(function(){
      sourceState(
        2,
        'is-done',
        'Reviewed'
      );

      status.textContent=
        'Finding ready';

      setFinding('software');
    },2700);

    later(function(){
      root.classList.remove(
        'is-running'
      );
    },3800);
  }


  sources.forEach(function(b){
    b.addEventListener(
      'click',
      function(){
        setFinding(
          b.dataset.key
        );

        pop.hidden=true;
      }
    );
  });


  if(replay){
    replay.addEventListener(
      'click',
      run
    );
  }


  if(action){
    action.addEventListener(
      'click',
      function(){
        pop.hidden=
          !pop.hidden;
      }
    );
  }


  if(close){
    close.addEventListener(
      'click',
      function(){
        pop.hidden=true;
      }
    );
  }


  document.addEventListener(
    'keydown',
    function(e){
      if(
        e.key==='Escape' &&
        !pop.hidden
      ){
        pop.hidden=true;
      }
    }
  );


  var seen=false;

  var io=
    new IntersectionObserver(
      function(entries){
        entries.forEach(function(e){
          if(
            e.isIntersecting &&
            !seen
          ){
            seen=true;

            run();

            io.disconnect();
          }
        });
      },
      {
        threshold:.35
      }
    );

  io.observe(root);
})();
