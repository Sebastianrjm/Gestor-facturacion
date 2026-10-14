const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const db = require('../config/db');

const getDashboardData = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const userId = req.user.userId || req.user.id;

        // 1. Obtener emisor del usuario
        const userRes = await client.query('SELECT emisor_id FROM usuarios WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Usuario no encontrado' });
        }
        const emisorId = userRes.rows[0].emisor_id;

        // 2. Calcular métricas usando los valores reales del ENUM de la base de datos
        const metricsQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN estado::text = 'APROBADO' AND EXTRACT(MONTH FROM fecha_emision) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM fecha_emision) = EXTRACT(YEAR FROM CURRENT_DATE) THEN total ELSE 0 END), 0) AS cobrado_mes,
                COALESCE(SUM(CASE WHEN estado::text = 'ENVIADO' THEN total ELSE 0 END), 0) AS pendiente_pago,
                COUNT(*) AS facturas_emitidas
            FROM presupuestos
            WHERE emisor_id = $1 AND estado::text != 'RECHAZADO'
        `;
        const metricsRes = await client.query(metricsQuery, [emisorId]);
        const metrics = metricsRes.rows[0];

        // 3. Obtener el listado de facturas optimizado
        const invoicesQuery = `
            SELECT 
                p.id,
                p.folio,
                p.estado,
                p.total,
                p.moneda_codigo,
                c.nombre_comercial AS cliente_nombre
            FROM presupuestos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE p.emisor_id = $1
            ORDER BY p.created_at DESC;
        `;
        const invoicesRes = await client.query(invoicesQuery, [emisorId]);

        res.status(200).json({
            status: 'SUCCESS',
            data: {
                metrics: {
                    cobradoMes: Number(metrics.cobrado_mes),
                    pendientePago: Number(metrics.pendiente_pago),
                    facturasEmitidas: Number(metrics.facturas_emitidas)
                },
                invoices: invoicesRes.rows
            }
        });

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error al cargar los datos del dashboard', error: error.message });
    } finally {
        client.release();
    }
};

// Actualizar estado de la factura (Pendiente, Pagada, Anulada)
const updateInvoiceStatus = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const userId = req.user.userId || req.user.id;

        const userRes = await client.query('SELECT emisor_id FROM usuarios WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Usuario no encontrado' });
        }
        const emisorId = userRes.rows[0].emisor_id;

        // 1. Actualizar el estado de la factura
        const updateRes = await client.query(
            `UPDATE presupuestos SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND emisor_id = $3 RETURNING id, folio, estado`,
            [estado.toUpperCase(), id, emisorId]
        );

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Factura no encontrada' });
        }

        // 2. Recalcular las métricas actualizadas del emisor inmediatamente
        const metricsQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN estado::text = 'APROBADO' AND EXTRACT(MONTH FROM fecha_emision) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM fecha_emision) = EXTRACT(YEAR FROM CURRENT_DATE) THEN total ELSE 0 END), 0) AS cobrado_mes,
                COALESCE(SUM(CASE WHEN estado::text = 'ENVIADO' THEN total ELSE 0 END), 0) AS pendiente_pago,
                COUNT(*) AS facturas_emitidas
            FROM presupuestos
            WHERE emisor_id = $1 AND estado::text != 'RECHAZADO'
        `;
        const metricsRes = await client.query(metricsQuery, [emisorId]);
        const metrics = metricsRes.rows[0];

        // 3. Responder con la factura actualizada y las nuevas métricas
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Estado y métricas actualizados correctamente',
            data: {
                updatedInvoice: updateRes.rows[0],
                metrics: {
                    cobradoMes: Number(metrics.cobrado_mes),
                    pendientePago: Number(metrics.pendiente_pago),
                    facturasEmitidas: Number(metrics.facturas_emitidas)
                }
            }
        });

    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error al actualizar el estado', error: error.message });
    } finally {
        client.release();
    }
};

const getNewBillInitialization = async (req, res) => {
  try {
    // El middleware verifyToken inyecta el usuario decodificado en req.user
    // (Asegúrate de que tu verifyToken guarde el id del usuario, ej: req.user.userId o req.user.id)
    const userId = req.user.userId || req.user.id;

    // 1. Obtener datos del usuario y del emisor (razón social y logo)
    const userQuery = `
      SELECT u.id AS usuario_id, u.nombre AS nombre_usuario, u.emisor_id, e.razon_social AS emisor, e.logo_url 
      FROM usuarios u 
      JOIN emisores e ON u.emisor_id = e.id 
      WHERE u.id = $1
    `;
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Usuario no encontrado' });
    }

    const { nombre_usuario, emisor_id, emisor, logo_url } = userResult.rows[0];

    // 2. Generar el nuevo código de factura (Folio automático basado en el año actual y conteo)
    const currentYear = new Date().getFullYear();
    
    const countQuery = `SELECT COUNT(*) FROM presupuestos WHERE emisor_id = $1`;
    const countResult = await db.query(countQuery, [emisor_id]);
    
    // El siguiente número será el total + 1 (con formato de 3 dígitos, ej: 025)
    const nextNumber = parseInt(countResult.rows[0].count, 10) + 1;
    const numeroFactura = `FAC-${currentYear}-${String(nextNumber).padStart(3, '0')}`;

    // 3. Retornar la estructura lista para tu formulario
    res.json({
      status: 'SUCCESS',
      data: {
        numeroFactura: numeroFactura,
        estadoFactura: 'BORRADOR',
        emisor: emisor || '',
        nombreUsuario: nombre_usuario || '',
        profileImage: logo_url 
      }
    });

  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error al inicializar los datos de la factura', 
      error: error.message 
    });
  }
};

getCurrencies = async (req, res) => {
    try{
        const query = `
        SELECT codigo, nombre, simbolo, activa
        FROM monedas
        WHERE activa = true
        `;
        const result = await db.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Divisa no encontrada' });
        }

        res.json({
            status: 'SUCCESS',
            data: result.rows 
        });
    } catch (error) {
        res.status(500).json({ 
        status: 'ERROR', 
        message: 'No se encontraron las divisas', 
        error: error.message 
        });
    }
}

const saveBill = async (req, res) => {
    const client = await db.pool.connect(); 
    try {
        await client.query('BEGIN');

        const userId = req.user.userId || req.user.id;
        const { 
            clienteNombre,      
            clienteCorreo,      
            clienteFiscal,      
            clienteDireccion,   
            clienteTelefono,    
            folio,              
            monedaCodigo,       
            tasaCambioAplicada, 
            subtotal, 
            total, 
            plantillaId,        
            fechaEmision, 
            fechaVencimiento, 
            notasComerciales,
            aplicaImpuesto,
            impuestoPorcentaje,
            monedaReferencia,
            items               
        } = req.body;

        // 1. Obtener el emisor_id asociado al usuario logueado
        const userRes = await client.query('SELECT emisor_id FROM usuarios WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ status: 'ERROR', message: 'Usuario no encontrado' });
        }
        const emisorId = userRes.rows[0].emisor_id;

       // 2. Gestionar cliente automáticamente (Buscar por correo o nombre, y actualizar si cambió algo)
        let clienteId = null;
        if (clienteNombre) {
            let clienteCheck = { rows: [] };

            //  Criterio principal: Buscar por correo (si fue provisto, es el más seguro)
            if (clienteCorreo) {
                clienteCheck = await client.query(
                    'SELECT id FROM clientes WHERE emisor_id = $1 AND email = $2',
                    [emisorId, clienteCorreo]
                );
            }

            //  Criterio secundario: Si no se encontró por correo (o no vino correo), buscar por nombre comercial
            if (clienteCheck.rows.length === 0) {
                clienteCheck = await client.query(
                    'SELECT id FROM clientes WHERE emisor_id = $1 AND nombre_comercial = $2',
                    [emisorId, clienteNombre]
                );
            }

            if (clienteCheck.rows.length > 0) {
                // Cliente encontrado: actualizamos sus datos por si variaron (nombre, dirección, teléfono, RIF)
                clienteId = clienteCheck.rows[0].id;
                await client.query(
                    `UPDATE clientes 
                     SET nombre_comercial = $1, email = $2, identificacion_fiscal = $3, direccion = $4, telefono = $5 
                     WHERE id = $6`,
                    [
                        clienteNombre, 
                        clienteCorreo || null, 
                        clienteFiscal || null, 
                        clienteDireccion || null, 
                        clienteTelefono || null, 
                        clienteId
                    ]
                );
            } else {
                // Si no existe de ninguna forma, lo creamos nuevo
                const nuevoClienteRes = await client.query(
                    `INSERT INTO clientes (emisor_id, nombre_comercial, email, identificacion_fiscal, direccion, telefono) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [
                        emisorId, 
                        clienteNombre, 
                        clienteCorreo || null, 
                        clienteFiscal || null, 
                        clienteDireccion || null, 
                        clienteTelefono || null
                    ]
                );
                clienteId = nuevoClienteRes.rows[0].id;
            }
        }

        // Cálculos de impuestos seguros en backend
        const subNum = Number(subtotal) || 0;
        const aplicaImp = Boolean(aplicaImpuesto);
        const porcImp = aplicaImp ? (Number(impuestoPorcentaje) || 0) : 0;
        const montoImpuesto = (subNum * porcImp) / 100;
        const totalCalculado = subNum + montoImpuesto;

        // 3. Insertar o Actualizar la cabecera (UPSERT usando ON CONFLICT)
        const presupuestoQuery = `
            INSERT INTO presupuestos (
                emisor_id, cliente_id, folio, estado, moneda_codigo, 
                tasa_cambio_aplicada, subtotal, monto_impuesto, total, plantilla_id, 
                fecha_emision, fecha_vencimiento, notas_comerciales,
                aplica_impuesto, impuesto_porcentaje, moneda_referencia
            ) VALUES ($1, $2, $3, 'BORRADOR', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (folio) DO UPDATE SET
                cliente_id = EXCLUDED.cliente_id,
                moneda_codigo = EXCLUDED.moneda_codigo,
                tasa_cambio_aplicada = EXCLUDED.tasa_cambio_aplicada,
                subtotal = EXCLUDED.subtotal,
                monto_impuesto = EXCLUDED.monto_impuesto,
                total = EXCLUDED.total,
                plantilla_id = EXCLUDED.plantilla_id,
                fecha_emision = EXCLUDED.fecha_emision,
                fecha_vencimiento = EXCLUDED.fecha_vencimiento,
                notas_comerciales = EXCLUDED.notas_comerciales,
                aplica_impuesto = EXCLUDED.aplica_impuesto,
                impuesto_porcentaje = EXCLUDED.impuesto_porcentaje,
                moneda_referencia = EXCLUDED.moneda_referencia,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, folio;
        `;
        
        const presupuestoValues = [
            emisorId, 
            clienteId, 
            folio, 
            monedaCodigo, 
            tasaCambioAplicada || 1.0000, 
            subNum, 
            montoImpuesto, 
            totalCalculado, 
            plantillaId, 
            fechaEmision, 
            fechaVencimiento, 
            notasComerciales,
            aplicaImp, 
            porcImp, 
            monedaReferencia || 'VES'
        ];

        const presupuestoResult = await client.query(presupuestoQuery, presupuestoValues);
        const presupuestoId = presupuestoResult.rows[0].id;

        // 4. Limpiar los ítems antiguos de este presupuesto para evitar duplicados al actualizar
        await client.query('DELETE FROM presupuesto_detalles WHERE presupuesto_id = $1', [presupuestoId]);

        // 5. Insertar los nuevos ítems actualizados
        if (items && items.length > 0) {
            for (const item of items) {
                const subtotalLinea = (item.cantidad || 0) * (item.precioUnitario || 0);
                const detalleQuery = `
                    INSERT INTO presupuesto_detalles (
                        presupuesto_id, descripcion, cantidad, precio_unitario, subtotal_linea
                    ) VALUES ($1, $2, $3, $4, $5)
                `;
                await client.query(detalleQuery, [
                    presupuestoId, item.descripcion, item.cantidad, item.precioUnitario, subtotalLinea
                ]);
            }
        }

        await client.query('COMMIT');
        
        res.status(201).json({
            status: 'SUCCESS',
            message: 'Factura guardada o actualizada correctamente',
            data: { id: presupuestoId, folio }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al guardar presupuesto:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al procesar y guardar la factura',
            error: error.message
        });
    } finally {
        client.release();
    }
};

const generateBillPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener cabecera de presupuesto incluyendo todos los datos del cliente
        const presupuestoQuery = `
            SELECT p.*, e.razon_social AS emisor_nombre, e.identificacion_fiscal AS emisor_rif, 
                   e.telefono AS emisor_telefono, e.email AS emisor_email, e.direccion AS emisor_direccion, e.logo_url,
                   c.nombre_comercial AS cliente_nombre, c.identificacion_fiscal AS cliente_rif, 
                   c.email AS cliente_email, c.direccion AS cliente_direccion, c.telefono AS cliente_telefono,
                   u.nombre AS nombre_usuario
            FROM presupuestos p
            JOIN emisores e ON p.emisor_id = e.id
            LEFT JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN usuarios u ON u.emisor_id = e.id
            WHERE p.id = $1
        `;
        const presupuestoRes = await db.query(presupuestoQuery, [id]);

        if (presupuestoRes.rows.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Presupuesto no encontrado' });
        }

        const factura = presupuestoRes.rows[0];

        // 2. Obtener los ítems y formatear a 2 decimales
        const detallesQuery = `
            SELECT descripcion, cantidad, precio_unitario, subtotal_linea 
            FROM presupuesto_detalles 
            WHERE presupuesto_id = $1
        `;
        const detallesRes = await db.query(detallesQuery, [id]);
        
        const items = detallesRes.rows.map(item => ({
            ...item,
            precio_unitario: Number(item.precio_unitario).toFixed(2),
            subtotal_linea: Number(item.subtotal_linea).toFixed(2)
        }));

        // 3. Cálculos de montos y tasa referencial
        const subtotalNum = Number(factura.subtotal) || 0;
        const totalNum = Number(factura.total) || 0;
        const montoImpuestoNum = Number(factura.monto_impuesto) || 0;
        const tasaNumerica = Number(factura.tasa_cambio_aplicada) || 0;
        const totalReferencial = tasaNumerica > 0 ? totalNum * tasaNumerica : 0;

        // 4. Leer estilos CSS y plantilla Handlebars del disco
        const cssPath = path.join(__dirname, '../../../frontend/src/assets/InvoicePreview.css');
        const customCss = fs.readFileSync(cssPath, 'utf8');

        const templatePath = path.join(__dirname, '../templates/invoiceTemplate.hbs');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
        const compiledTemplate = handlebars.compile(htmlTemplate);

        // 5. Inyectar datos preparados para la plantilla HBS
        const htmlContent = compiledTemplate({
            ...factura,
            emisor_nombre: factura.emisor_nombre || 'Emisor',
            nombre_usuario: factura.nombre_usuario || 'Nombre usuario',
            cliente_nombre: factura.cliente_nombre || 'Nombre del Cliente',
            cliente_email: factura.cliente_email || 'correo@empresa.com',
            cliente_rif: factura.cliente_rif || '',
            cliente_direccion: factura.cliente_direccion || '',
            cliente_telefono: factura.cliente_telefono || '',
            items,
            subtotal: subtotalNum.toFixed(2),
            monto_impuesto: montoImpuestoNum > 0 ? montoImpuestoNum.toFixed(2) : null,
            porcentaje_impuesto: factura.impuesto_porcentaje || 0,
            aplica_impuesto: factura.aplica_impuesto,
            total: totalNum.toFixed(2),
            tasa_aplicada: tasaNumerica,
            moneda_referencia: factura.moneda_referencia || 'VES',
            total_referencial: totalReferencial > 0 ? totalReferencial.toLocaleString('es-VE', { minimumFractionDigits: 2 }) : null,
            plantillaClass: `template-${(factura.plantilla_id || 'moderno').toLowerCase()}`,
            customCss,
            fechaEmisionFormateada: new Date(factura.fecha_emision).toISOString().split('T')[0],
            fechaVencimientoFormateada: new Date(factura.fecha_vencimiento).toISOString().split('T')[0]
        });

        // 6. Renderizar con Puppeteer en modo headless
        const browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        // 7. Enviar PDF binario con cabecera de descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${factura.folio}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error al generar el PDF', error: error.message });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id;

        const userRes = await db.query('SELECT emisor_id FROM usuarios WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Usuario no encontrado' });
        }
        const emisorId = userRes.rows[0].emisor_id;

        // Consulta unificada incluyendo datos del cliente, emisor y usuario
        const invoiceQuery = `
            SELECT 
                p.*, 
                c.nombre_comercial AS cliente_nombre, 
                c.email AS cliente_correo,
                c.identificacion_fiscal AS cliente_rif,
                c.direccion AS cliente_direccion,
                c.telefono AS cliente_telefono,
                e.razon_social AS emisor,
                e.logo_url AS "profileImage",
                u.nombre AS "nombreUsuario"
            FROM presupuestos p
            JOIN emisores e ON p.emisor_id = e.id
            LEFT JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN usuarios u ON u.emisor_id = e.id
            WHERE p.id = $1 AND p.emisor_id = $2
        `;
        const invoiceRes = await db.query(invoiceQuery, [id, emisorId]);

        if (invoiceRes.rows.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Factura no encontrada' });
        }

        const itemsQuery = `
            SELECT id, descripcion, cantidad, precio_unitario AS "precioUnitario", subtotal_linea AS "subtotalLinea"
            FROM presupuesto_detalles
            WHERE presupuesto_id = $1
        `;
        const itemsRes = await db.query(itemsQuery, [id]);

        res.status(200).json({
            status: 'SUCCESS',
            data: {
                invoice: invoiceRes.rows[0],
                items: itemsRes.rows
            }
        });

    } catch (error) {
        console.error('Error al obtener factura por ID:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error al obtener la factura', error: error.message });
    }
};

module.exports = {
  getNewBillInitialization,
  getCurrencies,
  saveBill,
  generateBillPDF,
  getDashboardData,
  updateInvoiceStatus,
  getInvoiceById
};