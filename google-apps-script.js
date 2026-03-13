/**
 * =====================================================
 * GOOGLE APPS SCRIPT — Dashboard Grados ESUMER
 * =====================================================
 *
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet
 * 2. Ve a Extensiones → Apps Script
 * 3. Borra todo el código existente y pega este script
 * 4. Guarda (Ctrl+S)
 * 5. Click en "Implementar" → "Nueva implementación"
 * 6. Tipo: "Aplicación web"
 * 7. Ejecutar como: "Yo" (tu cuenta)
 * 8. Quién tiene acceso: "Cualquier persona"
 * 9. Click en "Implementar" y copia la URL
 * 10. Pega la URL como VITE_API_URL en tu archivo .env
 *
 * IMPORTANTE: Cada vez que modifiques este script,
 * debes crear una NUEVA implementación (no editar la existente).
 *
 * Este script INCLUYE la lectura de colores de fondo de las filas,
 * que el dashboard usa para determinar el estado del estudiante:
 *   - Naranja → Listo para grado
 *   - Verde   → Ya pagó
 *   - Sin color → Pendiente
 */

function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var range = sheet.getDataRange();
    var values = range.getValues();
    var backgrounds = range.getBackgrounds();

    if (values.length === 0) {
      return jsonResponse({ success: false, error: "La hoja está vacía." });
    }

    var headers = values[0].map(function (h) {
      return String(h).trim();
    });

    var rows = [];
    for (var i = 1; i < values.length; i++) {
      // Saltar filas completamente vacías
      var hasData = values[i].some(function (cell) {
        return cell !== "" && cell !== null && cell !== undefined;
      });
      if (!hasData) continue;

      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = values[i][j];
      }

      // Agregar color de fondo de la primera celda de la fila
      // Este color se usa en el dashboard para determinar el estado
      row["_backgroundColor"] = backgrounds[i][0];

      rows.push(row);
    }

    return jsonResponse({
      success: true,
      headers: headers,
      rows: rows,
      totalRows: rows.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    return jsonResponse({
      success: false,
      error: e.message,
    });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
