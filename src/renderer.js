const pages = {
  overview: ["Genel Bakış", "Fikirden yayına, tüm video üretim sürecin tek yerde."],
  projects: ["Projeler", "Belgesel ve Shorts çalışmalarını yönet."],
  research: ["Araştırma", "Kaynaklarını, notlarını ve tarihsel doğrulamaları kaydet."],
  scripts: ["Senaryo Atölyesi", "Türkçe ve İngilizce anlatım metinlerini hazırla."],
  media: ["Medya Kütüphanesi", "Projelerin için medya dosyalarını düzenle."],
  production: ["Video Üretimi", "Meta Muse sahne promptlarını hazırla ve dışa aktar."],
  youtube: ["YouTube", "Video paketini hazırla ve yayın öncesi kontrol et."]
};
const KEY = "nova.workspace.v1";
const defaults = { projects: [], research: [], scripts: [], prompts: [], media: [] };
let state = loadState();
function loadState() { try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return structuredClone(defaults); } }
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function activeProject() { return state.projects[0]; }
function projectOptions() { return state.projects.map(p => '<option value="'+esc(p.id)+'">'+esc(p.title)+'</option>').join(""); }
function go(key) {
  document.querySelectorAll(".nav").forEach(b => b.classList.toggle("active", b.dataset.page === key));
  document.querySelector("#page-title").textContent = pages[key][0];
  document.querySelector("#page-subtitle").textContent = pages[key][1];
  render(key);
}
function card(title, desc, action, label="Aç") {
  return '<article class="tile" data-go="'+action+'"><div class="tile-icon">✦</div><h4>'+title+'</h4><p>'+desc+'</p><span>'+label+' ↗</span></article>';
}
function render(key) {
  const root = document.querySelector("#content");
  if (key === "overview") {
    root.innerHTML = '<div class="welcome"><div><span class="eyebrow light">YARATICI ÜRETİM MERKEZİ</span><h2>Yeni bir hikâye<br>başlat.</h2><p>Belgesel ve kısa video projelerini planla, üret ve yönet.</p><button class="primary" id="new-project">＋ Yeni Proje Oluştur</button></div><div class="orb"><div class="orb-core">N</div></div></div><div class="section-head"><div><h3>Üretim alanları</h3><p>NOVA’nın araçlarına hızlı erişim</p></div></div><div class="cards">'+card("Araştırma","Kaynak, not ve tarihsel doğrulama.","research")+card("Senaryo Atölyesi","Türkçe ve İngilizce metinler.","scripts")+card("Video Üretimi","Meta Muse promptları ve sahne planı.","production")+card("YouTube","Yayın paketi ve onay kontrolü.","youtube")+'</div><div class="notice"><div class="notice-mark">✦</div><div><b>Kontrol sende</b><p>YouTube yayınları otomatik olarak herkese açık yapılmaz. Yayın öncesi onayın zorunludur.</p></div></div>';
    return;
  }
  if (key === "projects") {
    root.innerHTML = '<div class="section-head"><div><h3>Projelerin</h3><p>'+state.projects.length+' kayıtlı proje</p></div><button class="primary" id="show-project-form">＋ Proje Oluştur</button></div><div id="project-form-wrap"></div><div class="project-list">'+(state.projects.length ? state.projects.map(p => '<article class="project-row"><div class="tile-icon">▤</div><div class="project-info"><b>'+esc(p.title)+'</b><small>'+esc(p.kind)+' · '+esc(p.language)+' · '+new Date(p.created).toLocaleDateString("tr-TR")+'</small></div><button class="ghost" data-delete-project="'+p.id+'">Sil</button></article>').join("") : '<div class="empty"><div class="empty-icon">▤</div><h2>Henüz proje yok</h2><p>İlk belgeselini veya Shorts çalışmanı oluştur.</p><button class="primary" id="empty-create">＋ İlk Projeyi Oluştur</button></div>')+'</div>';
    document.querySelector("#show-project-form").onclick = showProjectForm;
    document.querySelector("#empty-create")?.addEventListener("click", showProjectForm);
    root.querySelectorAll("[data-delete-project]").forEach(b => b.onclick = () => { state.projects=state.projects.filter(p=>p.id!==b.dataset.deleteProject); save(); render(key); });
    return;
  }
  if (key === "research") {
    root.innerHTML = '<div class="panel"><h3>Araştırma notu ekle</h3><form id="research-form" class="stack"><label>Başlık<input name="title" required placeholder="Örn. Konstantinopolis’in Fethi 1453"></label><label>Kaynak bağlantısı<input name="url" type="url" placeholder="https://..."></label><label>Notlar<textarea name="body" rows="5" placeholder="Bulgu, kaynak özeti ve doğrulama notları..."></textarea></label><button class="primary">Notu Kaydet</button></form></div><div class="section-head"><div><h3>Kayıtlı notlar</h3></div></div>'+ (state.research.length?state.research.map(n=>'<article class="note"><b>'+esc(n.title)+'</b><p>'+esc(n.body)+'</p>'+(n.url?'<a href="#" data-external="'+esc(n.url)+'">'+esc(n.url)+'</a>':'')+'<button class="ghost" data-delete-note="'+n.id+'">Sil</button></article>').join(""):'<div class="empty compact"><p>Henüz araştırma notu eklenmedi.</p></div>');
    document.querySelector("#research-form").onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);state.research.unshift({id:id(),title:d.get("title"),url:d.get("url"),body:d.get("body")});save();render(key);};
    root.querySelectorAll("[data-delete-note]").forEach(b=>b.onclick=()=>{state.research=state.research.filter(n=>n.id!==b.dataset.deleteNote);save();render(key);});
    bindExternal(root); return;
  }
  if (key === "scripts") {
    root.innerHTML = '<div class="panel"><h3>Senaryo taslağı</h3><form id="script-form" class="stack"><label>Proje<select name="project" required>'+projectOptions()+'</select></label><label>Senaryo başlığı<input name="title" required placeholder="Belgesel / Shorts başlığı"></label><label>Dil<select name="language"><option>Türkçe</option><option>English</option></select></label><label>Metin<textarea name="body" rows="12" placeholder="Anlatım metnini veya sahne taslağını yaz..."></textarea></label><button class="primary" '+(!state.projects.length?'disabled':'')+'>Taslağı Kaydet</button></form>'+(state.projects.length?'':'<p class="hint">Senaryo kaydetmek için önce bir proje oluştur.</p>')+'</div><div class="section-head"><div><h3>Kaydedilen senaryolar</h3></div></div>'+(state.scripts.length?state.scripts.map(s=>'<article class="note"><b>'+esc(s.title)+'</b><small>'+esc(s.language)+'</small><p>'+esc(s.body.slice(0,400))+'</p><button class="ghost" data-delete-script="'+s.id+'">Sil</button></article>').join(""):'<div class="empty compact"><p>Henüz senaryo yok.</p></div>');
    document.querySelector("#script-form").onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);state.scripts.unshift({id:id(),project:d.get("project"),title:d.get("title"),language:d.get("language"),body:d.get("body")});save();render(key);};
    root.querySelectorAll("[data-delete-script]").forEach(b=>b.onclick=()=>{state.scripts=state.scripts.filter(s=>s.id!==b.dataset.deleteScript);save();render(key);}); return;
  }
  if (key === "media") {
    root.innerHTML = '<div class="panel"><h3>Medya dosyalarını kaydet</h3><p class="hint">Bu sürüm dosya adlarını ve proje bağlantısını kaydeder; dosyaların kendisini henüz NOVA içine kopyalamaz.</p><form id="media-form" class="stack"><label>Proje<select name="project">'+projectOptions()+'</select></label><label>Dosya seç<input name="files" type="file" multiple></label><button class="primary" '+(!state.projects.length?'disabled':'')+'>Seçilenleri listeye ekle</button></form></div><div class="section-head"><div><h3>Medya listesi</h3></div></div>'+(state.media.length?state.media.map(m=>'<article class="project-row"><div class="tile-icon">▧</div><div class="project-info"><b>'+esc(m.name)+'</b><small>'+esc(m.type)+' · '+esc(m.projectTitle)+'</small></div></article>').join(""):'<div class="empty compact"><p>Henüz medya kaydı yok.</p></div>');
    document.querySelector("#media-form").onsubmit=e=>{e.preventDefault();const d=new FormData(e.target), p=state.projects.find(x=>x.id===d.get("project"));[...(e.target.elements.files.files||[])].forEach(f=>state.media.unshift({id:id(),name:f.name,type:f.type||"Dosya",projectTitle:p?.title||"Proje"}));save();render(key);};return;
  }
  if (key === "production") {
    root.innerHTML = '<div class="panel"><h3>Meta Muse sahne promptu</h3><p class="hint">NOVA, Meta Muse için prompt hazırlar. Video üretimini Meta’nın kendi arayüzünde yapıp çıkan klipleri Medya Kütüphanesi’ne ekleyebilirsin.</p><form id="prompt-form" class="stack"><label>Proje<select name="project">'+projectOptions()+'</select></label><label>Sahne konusu<input name="subject" required placeholder="Örn. 1453 kuşatmasında surların önündeki Osmanlı ordusu"></label><div class="two"><label>Format<select name="format"><option>16:9 sinematik belgesel</option><option>9:16 dikey Shorts</option></select></label><label>Görsel stil<select name="style"><option>Gerçekçi tarihî belgesel, sinematik</option><option>Doğal ışık, gerçekçi kamera</option><option>Animasyon, stilize 3D</option></select></label></div><label>Sahne ayrıntıları<textarea name="details" rows="4" placeholder="Dönem, mekân, kamera hareketi, ışık, atmosfer, aksiyon..."></textarea></label><button class="primary">Prompt Oluştur</button></form></div><div class="section-head"><div><h3>Oluşturulan promptlar</h3></div></div><div id="prompt-list">'+(state.prompts.length?state.prompts.map(p=>'<article class="note"><b>'+esc(p.subject)+'</b><p>'+esc(p.text)+'</p><button class="ghost" data-copy="'+esc(p.id)+'">Promptu Kopyala</button></article>').join(""):'<div class="empty compact"><p>Henüz prompt oluşturulmadı.</p></div>')+'</div>';
    document.querySelector("#prompt-form").onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const textPrompt=d.get("subject")+'. '+d.get("details")+'. '+d.get("style")+'. '+d.get("format")+'. Tarihsel ve görsel tutarlılığı koru. Fotogerçekçi, yüksek detaylı, sinematik kompozisyon; sahne içinde yazı, altyazı veya filigran olmasın.';state.prompts.unshift({id:id(),subject:d.get("subject"),text:textPrompt});save();render(key);};
    root.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{const p=state.prompts.find(x=>x.id===b.dataset.copy);navigator.clipboard.writeText(p.text).then(()=>{b.textContent="Kopyalandı";}).catch(()=>{b.textContent="Kopyalama başarısız";});});return;
  }
  if (key === "youtube") {
    root.innerHTML = '<div class="panel"><h3>YouTube yayın kontrol listesi</h3><p class="hint">YouTube hesabı henüz bağlanmadı. Bu sürüm yayın paketini hazırlamak ve onay kontrolünü göstermek içindir.</p><form id="youtube-form" class="stack"><label>Video başlığı<input name="title" placeholder="Video başlığı"></label><label>Açıklama<textarea name="description" rows="5" placeholder="Video açıklaması, kaynaklar ve bölümler..."></textarea></label><label>Etiketler<input name="tags" placeholder="tarih, belgesel, 1453"></label><label class="check"><input type="checkbox" required> Video içeriğini ve yayın ayarlarını kontrol ettim.</label><p class="hint">Bu onay yalnızca kontrol listesini tamamlar. NOVA şu anda YouTube'a yükleme veya yayınlama yapmaz.</p><button class="primary">Yayın paketini kaydet</button></form><div id="youtube-saved"></div></div>';
    document.querySelector("#youtube-form").onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);document.querySelector("#youtube-saved").innerHTML='<div class="notice"><div class="notice-mark">✓</div><div><b>Paket hazırlandı</b><p>'+esc(d.get("title"))+' · Yayınlanmadı. Herkese açık yayın için ayrıca açık onay gerekecek.</p></div></div>';};return;
  }
}
function showProjectForm() {
  const wrap=document.querySelector("#project-form-wrap");
  wrap.innerHTML='<div class="panel"><h3>Yeni proje</h3><form id="create-project-form" class="stack"><label>Proje adı<input name="title" required placeholder="Örn. Konstantinopolis 1453"></label><div class="two"><label>Tür<select name="kind"><option>Uzun Belgesel</option><option>YouTube Shorts</option><option>İkisi</option></select></label><label>Dil<select name="language"><option>Türkçe + English</option><option>Türkçe</option><option>English</option></select></label></div><button class="primary">Projeyi Kaydet</button></form></div>';
  document.querySelector("#create-project-form").onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);state.projects.unshift({id:id(),title:d.get("title"),kind:d.get("kind"),language:d.get("language"),created:new Date().toISOString()});save();render("projects");};
}
function bindExternal(root) { root.querySelectorAll("[data-external]").forEach(a=>a.onclick=e=>{e.preventDefault();window.nova?.openExternal(a.dataset.external);}); }
// Delegated handlers keep navigation working after every screen is re-rendered.
document.addEventListener("click", (event) => {
  const nav = event.target.closest(".nav[data-page]");
  if (nav) { event.preventDefault(); go(nav.dataset.page); return; }
  const tile = event.target.closest("[data-go]");
  if (tile) { event.preventDefault(); go(tile.dataset.go); return; }
  const create = event.target.closest("#new-project, #empty-create, #show-project-form");
  if (create) {
    event.preventDefault();
    if (create.id === "new-project") go("projects");
    if (create.id === "empty-create" || create.id === "show-project-form" || create.id === "new-project") showProjectForm();
  }
});
window.addEventListener("error", (event) => {
  const root = document.querySelector("#content");
  if (root) root.insertAdjacentHTML("afterbegin", '<div class="notice"><div class="notice-mark">!</div><div><b>NOVA bir arayüz hatası yakaladı</b><p>'+esc(event.message || "Bilinmeyen hata")+'</p></div></div>');
});
