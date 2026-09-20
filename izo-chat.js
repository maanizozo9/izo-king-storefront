(function(){
  if (window.__izoChatLoaded) return;
  window.__izoChatLoaded = true;

  var PRODUCTS = window.PRODUCTS || [];

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/izo-widgets.css';
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'izo-chat-root';
  root.innerHTML =
    '<a class="izo-insights-bar" href="/blog/">Insights · tips & trends</a>'+
    '<button class="izo-fab" id="izoFab" aria-label="Open chat" title="Ask IZO">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>'+
    '</button>'+
    '<div class="izo-panel" id="izoPanel">'+
      '<div class="izo-panel-hd">'+
        '<img src="/1-3-1000061052.jpg" alt="IZO"/>'+
        '<div><strong>IZO Concierge</strong><span>Product help · global · English</span></div>'+
        '<button id="izoClose" aria-label="Close">×</button>'+
      '</div>'+
      '<div class="izo-msgs" id="izoMsgs"></div>'+
      '<div class="izo-quick" id="izoQuick"></div>'+
      '<div class="izo-input"><input id="izoIn" placeholder="Ask about products, ADHD, freelancing..."/><button id="izoSend">Send</button></div>'+
    '</div>';
  document.body.appendChild(root);

  var msgs = document.getElementById('izoMsgs');
  var panel = document.getElementById('izoPanel');
  var input = document.getElementById('izoIn');

  function add(text, who){
    var d = document.createElement('div');
    d.className = 'izo-msg ' + (who || 'bot');
    d.innerHTML = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function findProducts(q){
    q = (q||'').toLowerCase();
    var keys = [];
    if (/adhd|focus|planner|routine|study|exam|revision|morning|reset|home/.test(q)) keys.push('ADHD','Study','planner','routine');
    if (/invoice|crm|client|freelance|proposal|scope/.test(q)) keys.push('CRM','Invoice','Freelance','Proposal','Scope');
    if (/finance|cash|debt|money|expense|profit|ledger/.test(q)) keys.push('Finance','Cash','Debt','Ledger');
    if (/offer|validate|outreach|signal|test/.test(q)) keys.push('Offer','Signal','Test');
    if (/b2b|deal|nextstep|enterprise/.test(q)) keys.push('B2B','NextStep','Deal');
    if (/automation|agency|saas|roi/.test(q)) keys.push('Automation','Agency','SaaS','ROI');
    if (!keys.length) return PRODUCTS.slice(0,3);
    return PRODUCTS.filter(function(p){
      var blob = (p.name+' '+p.vp+' '+p.cat+' '+p.type).toLowerCase();
      return keys.some(function(k){ return blob.indexOf(k.toLowerCase()) !== -1; });
    }).slice(0,4);
  }

  function formatProducts(list){
    if (!list.length) return 'I could not match a product. Email <a href="mailto:maanizozo9@gmail.com">maanizozo9@gmail.com</a> and we will help.';
    return list.map(function(p){
      return '<strong>'+p.name+'</strong> — '+p.price+'<br/>'+p.vp+'<br/><a href="'+p.url+'" target="_blank" rel="noopener">View product →</a>';
    }).join('<br/><br/>');
  }

  function reply(q){
    q = (q||'').trim();
    if (!q) return;
    add(q.replace(/</g,'<'), 'user');
    var lower = q.toLowerCase();
    var out = '';
    if (/^(hi|hello|hey|salam)/.test(lower)) {
      out = 'Hello — welcome to <strong>IZO-KING</strong>. I help you pick practical digital tools (Excel, planners, offer kits, B2B). What are you working on: freelancing, ADHD/study, finance, or offers?';
    } else if (/price|cost|how much/.test(lower)) {
      out = 'Prices are one-time digital downloads unless marked as monthly. Tell me your goal and I will show matching products with real prices.';
      out += '<br/><br/>'+formatProducts(findProducts(lower));
    } else if (/refund|return|policy/.test(lower)) {
      out = 'Digital products: see <a href="/privacy.html">Privacy</a> and <a href="/terms.html">Terms</a>. For order issues write <a href="mailto:maanizozo9@gmail.com">maanizozo9@gmail.com</a>.';
    } else if (/contact|email|support|human/.test(lower)) {
      out = 'Email: <a href="mailto:maanizozo9@gmail.com">maanizozo9@gmail.com</a><br/>Instagram: <a href="https://www.instagram.com/izo_king_studio" target="_blank" rel="noopener">@izo_king_studio</a>';
    } else if (/blog|article|insight|trend|news/.test(lower)) {
      out = 'Read practical guides on the <a href="/blog/">Insights</a> page — tips for freelancers, ADHD systems, and offer validation. New posts are added regularly.';
    } else {
      var hits = findProducts(lower);
      out = 'Here are tools that match what you described:<br/><br/>'+formatProducts(hits);
      out += '<br/><br/>Need a human? <a href="mailto:maanizozo9@gmail.com">maanizozo9@gmail.com</a>';
    }
    setTimeout(function(){ add(out, 'bot'); }, 280);
  }

  var quick = [
    ['ADHD planner', 'I need an ADHD-friendly planner'],
    ['Freelancer CRM', 'I need freelancer CRM and invoices'],
    ['Validate offer', 'How do I validate an offer before building?'],
    ['Finance', 'Small business finance tracker'],
    ['Insights', 'Show me blog and tips']
  ];
  var qbox = document.getElementById('izoQuick');
  quick.forEach(function(pair){
    var b = document.createElement('button');
    b.textContent = pair[0];
    b.onclick = function(){ reply(pair[1]); };
    qbox.appendChild(b);
  });

  document.getElementById('izoFab').onclick = function(){
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !msgs.childNodes.length) {
      add('Hi — I am the <strong>IZO Concierge</strong>. Ask in English about products, pricing, or which tool fits freelancers, students, ADHD, finance, or B2B deals.','bot');
    }
  };
  document.getElementById('izoClose').onclick = function(){ panel.classList.remove('open'); };
  document.getElementById('izoSend').onclick = function(){ var v=input.value; input.value=''; reply(v); };
  input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ var v=input.value; input.value=''; reply(v);} });
})();
