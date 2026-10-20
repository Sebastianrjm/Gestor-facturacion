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
    try {
        const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        const filesToRemove = [`${baseName}.png`, `${baseName}.svg`];
        // Elimina el logo con otra extension
        await supabase.storage
            .from('logos-emisores')
            .remove(filesToRemove);

        // Guarda el nuevo logo
        const { data, error } = await supabase.storage
            .from('logos-emisores')
            .upload(fileName, fileBuffer, {
                contentType: mimeType,
                upsert: true
            });

        if (error) {
            throw new Error(`Error al subir imagen a Supabase: ${error.message}`);
        }

        // 5. Obtener y retornar la URL pública permanente
        const { data: publicUrlData } = supabase.storage
            .from('logos-emisores')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;

    } catch (err) {
        throw new Error(err.message || 'Error en el servicio de Supabase Storage');
    }
}

module.exports = { uploadLogoToSupabase };