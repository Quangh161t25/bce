// Trích xuất link ảnh chính, ảnh phân loại, ảnh trong mô tả và video từ product_info (get_product_info).

const CDN = 'https://cf.shopee.vn/file/';

function hashOf(val) {
  if (!val) return '';
  if (typeof val === 'object') val = val.image_id || val.id || val.url || '';
  const s = String(val).trim();
  if (!s) return '';
  if (/^https?:\/\//.test(s)) {
    const m = s.match(/\/file\/([^/?#]+?)(?:_tn)?(?:[?#].*)?$/);
    return m ? m[1] : s;
  }
  return s.replace(/_tn$/, '');
}

function toImage(val) {
  const h = hashOf(val);
  if (!h) return null;
  const full = /^https?:\/\//.test(h) ? h : CDN + h;
  return { hash: h, url: full, thumb: /^https?:\/\//.test(h) ? h : full + '_tn' };
}

const VIDEO_CDN = 'https://mms.vod.susercontent.com/file/';

// Shopee trả đường dẫn video dạng "api/v4/11110105/mms/vn-....mp4" -> ghép thêm tên miền video.
export function fullVideoUrl(path) {
  if (!path) return '';
  const s = String(path).trim();
  if (/^https?:\/\//.test(s)) return s;
  if (s.startsWith('//')) return 'https:' + s;
  return VIDEO_CDN + s.replace(/^\/+/, '').replace(/^file\//, '');
}

function videoUrlOf(v) {
  const f = v.default_format || (Array.isArray(v.formats) && v.formats[0]) || {};
  return fullVideoUrl(v.url || v.video_url || f.url || f.path || v.path || '');
}

export function extractMedia(info) {
  const media = { images: [], variations: [], modelImages: {}, descImages: [], videos: [] };
  if (!info) return media;

  // Ảnh chính
  const seen = new Set();
  for (const h of [info.cover_image, ...(info.images || [])]) {
    const img = toImage(h);
    if (img && !seen.has(img.hash)) {
      seen.add(img.hash);
      media.images.push(img);
    }
  }
  for (const h of info.long_images || []) {
    const img = toImage(h);
    if (img && !seen.has(img.hash)) {
      seen.add(img.hash);
      media.images.push({ ...img, note: 'Ảnh dài (3:4)' });
    }
  }

  // Ảnh phân loại
  if (Array.isArray(info.tier_variation) && info.tier_variation.some((t) => (t.images || []).some(Boolean))) {
    for (const t of info.tier_variation) {
      (t.options || []).forEach((opt, i) => {
        const img = toImage((t.images || [])[i]);
        if (img) media.variations.push({ group: t.name || '', option: opt, ...img });
      });
    }
  } else if (Array.isArray(info.std_tier_variation_list)) {
    for (const t of info.std_tier_variation_list) {
      for (const v of t.value_list || []) {
        const img = toImage(v.image_id || v.image);
        if (img) {
          media.variations.push({
            group: t.custom_value || t.name || '',
            option: v.custom_value || v.value_name || v.name || '',
            ...img
          });
        }
      }
    }
  }

  // Ảnh của từng phân loại (model) theo tier_index: lấy ảnh của nhóm phân loại đầu tiên có ảnh
  media.modelImages = {};
  const tiers = Array.isArray(info.tier_variation) ? info.tier_variation : [];
  for (const m of info.model_list || []) {
    const idx = m.tier_index || (m.extinfo && m.extinfo.tier_index) || [];
    for (let g = 0; g < tiers.length; g++) {
      const img = toImage((tiers[g].images || [])[idx[g]]);
      if (img) {
        media.modelImages[Number(m.id ?? m.model_id ?? 0)] = img;
        break;
      }
    }
  }

  // Ảnh và văn bản trong mô tả
  media.description = '';
  const d = info.description_info;
  if (d) {
    // 1. JSON description (Shopee format cũ)
    if (d.description_type === 'json' && d.description) {
      try {
        const obj = typeof d.description === 'string' ? JSON.parse(d.description) : d.description;
        const textParts = [];
        for (const f of (obj.field_list || [])) {
          if ((Number(f.type) === 0 || f.field_type === 'text') && (f.value || f.text)) {
            textParts.push(f.value || f.text);
          } else if (Number(f.type) === 1 || f.field_type === 'image') {
            const img = toImage(f.value || f.img_id || f.image_id || f.image_info?.image_id);
            if (img && !media.descImages.some((x) => x.url === img.url)) media.descImages.push(img);
          }
        }
        if (textParts.length) media.description = textParts.join('\n');
      } catch (e) { /* mô tả không đọc được */ }
    }

    // 2. Extended description (Shopee API v3 mới: extended_description.field_list)
    const extFields = d.extended_description?.field_list || d.field_list || [];
    if (Array.isArray(extFields) && extFields.length) {
      const extTextParts = [];
      for (const f of extFields) {
        const fType = String(f.field_type || f.type || '').toLowerCase();
        if (fType === 'text' || f.text || f.text_info) {
          const t = f.text || f.text_info?.text || f.value || '';
          if (t) extTextParts.push(t);
        } else if (fType === 'image' || f.image_info || f.info || f.img_id) {
          const hash = f.image_info?.image_id || f.info?.image_id || f.img_id || f.image_id || (typeof f.text === 'string' && !f.text.includes('\n') ? f.text : '');
          const img = toImage(hash);
          if (img && !media.descImages.some((x) => x.url === img.url)) media.descImages.push(img);
        }
      }
      if (extTextParts.length && !media.description) {
        media.description = extTextParts.join('\n\n');
      }
    }

    // 3. image_info trực tiếp
    if (Array.isArray(d.image_info)) {
      d.image_info.forEach((imgObj) => {
        const img = toImage(imgObj?.image_id || imgObj?.id || imgObj);
        if (img && !media.descImages.some((x) => x.url === img.url)) media.descImages.push(img);
      });
    }

    // 4. Fallback string trong d.description
    if (!media.description && typeof d.description === 'string' && d.description.trim()) {
      media.description = d.description.trim();
    }
  }

  // 5. Fallback trực tiếp info.description hoặc info.desc
  if (!media.description && (info.description || info.desc)) {
    media.description = String(info.description || info.desc).trim();
  }

  // 6. Quét regex link ảnh trong nội dung mô tả nếu chưa có ảnh mô tả
  if (!media.descImages.length && media.description) {
    const urls = media.description.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi) || [];
    urls.forEach((u) => {
      const img = toImage(u);
      if (img && !media.descImages.some((x) => x.url === img.url)) media.descImages.push(img);
    });
  }

  // Video
  const videos = [...(info.video_list || []), ...(info.video_info_list || [])].filter(Boolean);
  const seenVideo = new Set();
  for (const v of videos) {
    const id = v.video_id || v.vid || v.id || '';
    let url = videoUrlOf(v);
    // Có shop trả đường dẫn file video ngay trong video_id (vd: "api/v4/.../mms/vn-....mp4")
    if (!url && /\.(mp4|m3u8)(\?|$)|\/mms\//i.test(String(id))) url = fullVideoUrl(id);
    const key = id || url;
    if (!key || seenVideo.has(key)) continue;
    seenVideo.add(key);
    const thumb = toImage(v.thumb_url || v.cover_image || v.thumbnail || v.cover);
    media.videos.push({
      id: String(id),
      url,
      thumb: thumb ? thumb.thumb : '',
      duration: Number(v.duration || v.duration_seconds || 0)
    });
  }

  return media;
}
