// Recordatorios diarios (ejecuta 8am)
exports.sendDailyReminders = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    // Recordatorios de citas del día
    // Seguimiento de cotizaciones sin respuesta
    // Alertas de pagos pendientes
    // Resumen diario para admin
  });

// Backup semanal (domingo 2am)
exports.weeklyBackup = functions.pubsub
  .schedule('0 2 * * 0')
  .onRun(async (context) => {
    // Exportar todas las colecciones
    // Subir a Cloud Storage
    // Enviar confirmación
  });

// Limpieza de archivos temporales (diario 3am)
exports.cleanupTempFiles = functions.pubsub
  .schedule('0 3 * * *')
  .onRun(async (context) => {
    // Eliminar archivos en /temp mayores a 24h
    // Eliminar archivos huérfanos
  });

// Generar PDF de cotización
exports.generateQuotePDF = functions.https.onCall(async (data, context) => {
  // Autenticar usuario
  // Obtener datos de work order
  // Generar PDF con puppeteer
  // Subir a Storage
  // Retornar URL
});

// Enviar WhatsApp
exports.sendWhatsApp = functions.https.onCall(async (data, context) => {
  // Integración con WhatsApp Business API
  // Enviar mensaje
  // Registrar en communications
});

// Procesar pago con Stripe
exports.processPayment = functions.https.onCall(async (data, context) => {
  // Crear payment intent
  // Procesar pago
  // Actualizar orden
  // Enviar recibo
});

// Extraer datos de mensaje
exports.extractDataFromMessage = functions.https.onCall(async (data, context) => {
  const { message } = data;
  
  const prompt = `
    Extrae la siguiente información del mensaje del cliente:
    - Nombre del cliente
    - Tipo de servicio requerido
    - Dirección
    - Fecha/hora preferida
    - Urgencia
    - Descripción del problema
    
    Mensaje: "${message}"
    
    Retorna un JSON con la estructura:
    {
      "clientName": "",
      "serviceType": "",
      "address": "",
      "preferredDate": "",
      "isUrgent": boolean,
      "description": ""
    }
  `;
  
  const result = await gemini.generate(prompt);
  return JSON.parse(result);
});

// Mejorar descripción
exports.improveDescription = functions.https.onCall(async (data, context) => {
  const { description, serviceType } = data;
  
  const prompt = `
    Mejora la siguiente descripción de un trabajo de ${serviceType}:
    "${description}"
    
    Hazla más profesional, clara y detallada. Incluye:
    - Alcance del trabajo
    - Materiales necesarios (si aplica)
    - Tiempo estimado
    - Consideraciones especiales
    
    Retorna solo el texto mejorado, sin explicaciones.
  `;
  
  const result = await gemini.generate(prompt);
  return result;
});

// Sugerir precio
exports.suggestPricing = functions.https.onCall(async (data, context) => {
  const { serviceType, description, items } = data;
  
  // Obtener trabajos similares históricos
  const similarWorks = await getSimilarWorkOrders(serviceType, description);
  
  const prompt = `
    Basándote en estos trabajos similares:
    ${JSON.stringify(similarWorks, null, 2)}
    
    Y considerando estos ítems:
    ${JSON.stringify(items, null, 2)}
    
    Sugiere un precio competitivo para este trabajo de ${serviceType}:
    "${description}"
    
    Retorna un JSON con:
    {
      "suggestedPrice": number,
      "confidence": number (0-100),
      "reasoning": "explicación breve",
      "priceRange": { "min": number, "max": number }
    }
  `;
  
  const result = await gemini.generate(prompt);
  return JSON.parse(result);
});

// Análisis de imagen de trabajo
exports.analyzeWorkImage = functions.https.onCall(async (data, context) => {
  const { imageUrl, context: workContext } = data;
  
  const prompt = `
    Analiza esta imagen de un trabajo de ${workContext.serviceType}.
    
    Identifica:
    1. Problemas o defectos visibles
    2. Calidad del trabajo
    3. Elementos de seguridad presentes/faltantes
    4. Materiales utilizados
    5. Progreso estimado (%)
    6. Recomendaciones
    
    Retorna un JSON estructurado.
  `;
  
  const result = await gemini.generateWithImage(prompt, imageUrl);
  return JSON.parse(result);
});

// Predicción de probabilidad de aprobación
exports.predictApprovalProbability = functions.https.onCall(async (data, context) => {
  const { workOrderData } = data;
  
  // Obtener histórico del cliente
  // Obtener estadísticas de conversión por tipo de servicio
  // Considerar precio vs promedio
  // Considerar tiempo de respuesta
  
  const prompt = `
    Basándote en estos datos históricos y contexto:
    ${JSON.stringify(historicalData, null, 2)}
    
    Predice la probabilidad de aprobación de esta cotización:
    ${JSON.stringify(workOrderData, null, 2)}
    
    Retorna un JSON con:
    {
      "probability": number (0-100),
      "factors": [
        { "factor": "nombre", "impact": "positive/negative", "weight": number }
      ],
      "suggestions": ["sugerencia 1", "sugerencia 2"]
    }
  `;
  
  const result = await gemini.generate(prompt);
  return JSON.parse(result);
});