import { createClient } from './client';

export async function uploadFabricImage(file: File, userId: string) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('fabrics')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('fabrics')
    .getPublicUrl(data.path);

  return publicUrl;
}