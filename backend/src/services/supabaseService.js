const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Sube un logotipo a Supabase Storage y retorna su URL pública
 * @param {Buffer} fileBuffer - Buffer del archivo en memoria (gracias a Multer)
 * @param {string} fileName - Nombre único del archivo (ej: emisor_id.png)
 * @param {string} mimeType - 'image/png' o 'image/svg+xml'
 */
async function uploadLogoToSupabase(fileBuffer, fileName, mimeType) {
    const { data, error } = await supabase.storage
        .from('logos-emisores')
        .upload(fileName, fileBuffer, {
            contentType: mimeType,
            upsert: true // Sobrescribe si ya existe un logo previo para ese emisor
        });

    if (error) {
        throw new Error(`Error al subir imagen a Supabase: ${error.message}`);
    }

    // Obtener la URL pública permanente
    const { data: publicUrlData } = supabase.storage
        .from('logos-emisores')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

module.exports = { uploadLogoToSupabase };