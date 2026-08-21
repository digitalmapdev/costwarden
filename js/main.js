(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
