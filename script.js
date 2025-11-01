// Load from localStorage
let images = JSON.parse(localStorage.getItem('galleryImages')) || [
  {id:1011, title:'Forest path', category:'nature'},
  {id:1025, title:'Mountain lake', category:'nature'},
  {id:1003, title:'Downtown skyline', category:'city'}
];

const gallery = document.getElementById('gallery');
const tpl = document.getElementById('card-template');

function renderGallery() {
  gallery.innerHTML = '';
  images.forEach((img, idx) => createCard(img, idx));
}
function createCard(img, idx) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  const thumb = node.querySelector('.thumb');
  const title = node.querySelector('.title');
  const cat = node.querySelector('.cat');
  thumb.src = img.localSrc || `https://picsum.photos/id/${img.id}/800/520`;
  thumb.alt = img.title;
  node.dataset.large = img.localSrc || `https://picsum.photos/id/${img.id}/1600/1000`;
  node.dataset.cat = img.category;
  title.textContent = img.title;
  cat.textContent = img.category;
  node.addEventListener('click', () => openLightbox(idx));
  gallery.appendChild(node);
}
renderGallery();

// Lightbox
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const caption = document.getElementById('caption');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const closeBtn = document.getElementById('close');
let current = 0;

function openLightbox(index) {
  current = index;
  const item = images[current];
  lbImg.src = item.localSrc || `https://picsum.photos/id/${item.id}/1600/1000`;
  lbImg.alt = item.title;
  caption.textContent = `${item.title} — ${item.category}`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lbImg.src = '';
}
function showNext(){ current = (current+1)%images.length; openLightbox(current); }
function showPrev(){ current = (current-1+images.length)%images.length; openLightbox(current); }

nextBtn.onclick = e => { e.stopPropagation(); showNext(); };
prevBtn.onclick = e => { e.stopPropagation(); showPrev(); };
closeBtn.onclick = closeLightbox;
lightbox.onclick = e => { if (e.target === lightbox) closeLightbox(); };
window.onkeydown = e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'Escape') closeLightbox();
};

// Filtering
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const cat = btn.dataset.cat;
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
  });
}));

// Filters
const blurRange = document.getElementById('filter-blur');
const satRange = document.getElementById('filter-sat');
function applyFilters(){
  const blur = blurRange.value;
  const sat = satRange.value;
  document.querySelectorAll('.thumb').forEach(img => img.style.filter = `blur(${blur}px) saturate(${sat})`);
  lbImg.style.filter = `blur(${blur}px) saturate(${sat})`;
}
blurRange.addEventListener('input', applyFilters);
satRange.addEventListener('input', applyFilters);

// Upload logic
const addBtn = document.getElementById('add-image-btn');
const inputFile = document.getElementById('image-input');
const uploadModal = document.getElementById('upload-modal');
const uploadPreview = document.getElementById('upload-preview');
const uploadSave = document.getElementById('upload-save');
const uploadCancel = document.getElementById('upload-cancel');
let pendingImage = null;

addBtn.onclick = () => inputFile.click();
inputFile.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    uploadPreview.src = ev.target.result;
    pendingImage = { id: Date.now(), title: file.name.replace(/\.[^/.]+$/, ""), category: 'custom', localSrc: ev.target.result };
    uploadModal.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
};

// Save image
uploadSave.onclick = () => {
  if (pendingImage) {
    images.push(pendingImage);
    localStorage.setItem('galleryImages', JSON.stringify(images));
    renderGallery();
    applyFilters();
    pendingImage = null;
  }
  uploadModal.classList.add('hidden');
};

// Cancel upload
uploadCancel.onclick = () => {
  pendingImage = null;
  uploadModal.classList.add('hidden');
};

document.querySelector('.no-js-warning').style.display = 'none';
applyFilters();
