const pages = {
  overview: ["Genel Bakış", "Fikirden yayına, tüm video üretim sürecin tek yerde."],
  projects: ["Projeler", "Belgesel ve Shorts çalışmalarını yönet."],
  research: ["Araştırma", "Konu araştırması ve kaynak doğrulama alanı."],
  scripts: ["Senaryo Atölyesi", "Sahne sahne belgesel ve kısa video senaryoları."],
  media: ["Medya Kütüphanesi", "Görsellerini, videolarını ve ses dosyalarını düzenle."],
  production: ["Video Üretimi", "Meta Muse promptları, sahneler ve kurgu hazırlığı."],
  youtube: ["YouTube", "Paketle, yükle ve yayın öncesi onayla."]
};
function navigate(key) {
  document.querySelectorAll(".nav").forEach(b => b.classList.toggle("active", b.dataset.page === key));
  document.querySelector("#page-title").textContent = pages[key][0];
  document.querySelector("#page-subtitle").textContent = pages[key][1];
  const content = document.querySelector("#content");
  if (key === "overview") location.reload();
  const descriptions = {
    projects: ["Proje alanı hazırlanıyor", "Yeni belgesel veya Shorts projesi oluşturma, taslakları ve üretim durumunu takip etme."],
    research: ["Araştırma merkezi", "Konu başlıkları, kaynak bağlantıları, notlar ve doğrulama kayıtları burada yönetilecek."],
    scripts: ["Senaryo atölyesi", "Türkçe ve İngilizce anlatım metinleri, bölüm planı ve sahne yönergeleri."],
    media: ["Medya kütüphanesi", "Video, görsel, ses ve altyazı dosyalarını proje bazında düzenleme."],
    production: ["Üretim masası", "Meta Muse için sahne promptlarını dışa aktar. Muse videolarını oluşturduktan sonra buraya aktar."],
    youtube: ["Yayın kontrolü", "YouTube bağlantısı ve yükleme iş akışı sonraki aşamada eklenecek. Açık yayın için her zaman ayrıca onay gerekir."]
  };
  content.innerHTML = '<div class="empty"><div class="empty-icon">✦</div><h2>'+descriptions[key][0]+'</h2><p>'+descriptions[key][1]+'</p><span class="tag">İLK SÜRÜM · MODÜL GELİŞTİRİLİYOR</span></div>';
}
document.querySelectorAll(".nav").forEach(b => b.addEventListener("click", () => navigate(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => navigate(b.dataset.go)));
document.querySelector("#new-project")?.addEventListener("click", () => navigate("projects"));