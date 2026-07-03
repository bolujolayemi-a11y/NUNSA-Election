const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service role key (not anon key)
);

const BUCKET = 'candidate-photos';

// Multer — store in memory, then push to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only jpg, jpeg, png, webp allowed'));
  },
});

// Upload a file buffer to Supabase Storage, return public URL
const uploadPhoto = async (file) => {
  if (!file) return null;
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
};

// Delete a photo from Supabase Storage by its public URL
const deletePhoto = async (publicUrl) => {
  if (!publicUrl) return;
  try {
    // Extract filename from URL
    // URL looks like: https://xxx.supabase.co/storage/v1/object/public/candidate-photos/filename.jpg
    const parts = publicUrl.split(`/${BUCKET}/`);
    if (parts.length < 2) return;
    const filename = parts[1];
    await supabase.storage.from(BUCKET).remove([filename]);
  } catch (err) {
    console.error('Storage delete error:', err.message);
  }
};

module.exports = { upload, uploadPhoto, deletePhoto };
