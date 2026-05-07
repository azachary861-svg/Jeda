import { supabase } from '@/lib/supabase';

type UploadMediaParams = {
  uri: string;
  bookingId?: string;
  caption?: string;
};

function extFromUri(uri: string) {
  const ext = uri.split('.').pop();
  return ext ? ext.toLowerCase() : 'jpg';
}

export async function uploadTripMedia({ uri, bookingId, caption }: UploadMediaParams) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Anda harus login sebagai driver.');
  }

  const fileExt = extFromUri(uri);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: storageError } = await supabase.storage
    .from('trip-media')
    .upload(filePath, blob, {
      contentType: fileExt === 'mp4' ? 'video/mp4' : 'image/jpeg',
      upsert: false,
    });

  if (storageError) {
    throw new Error(storageError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('trip-media').getPublicUrl(filePath);

  await supabase.from('trip_media').insert({
    booking_id: bookingId ?? null,
    driver_id: user.id,
    media_type: fileExt === 'mp4' ? 'video' : 'photo',
    file_path: filePath,
    public_url: publicUrl,
    caption: caption ?? null,
  });

  return publicUrl;
}
