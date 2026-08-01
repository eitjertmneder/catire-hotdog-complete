import { Alert, Linking } from 'react-native';

const COLORS = {
  primary: '#EC3137',
  purple: '#7C3AED',
  blue: '#2563EB',
  green: '#10B981',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
};

function baseHTML(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1F2937; }
  .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid ${COLORS.primary}; }
  .header h1 { font-size: 22px; color: ${COLORS.primary}; }
  .header p { font-size: 12px; color: ${COLORS.gray}; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: ${COLORS.primary}; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
  td { padding: 10px 12px; border-bottom: 1px solid ${COLORS.border}; font-size: 13px; }
  tr:nth-child(even) { background: ${COLORS.lightGray}; }
  .stat { display: inline-block; text-align: center; padding: 16px 24px; margin: 6px; background: ${COLORS.lightGray}; border-radius: 8px; min-width: 140px; }
  .stat .value { font-size: 24px; font-weight: 800; }
  .stat .label { font-size: 11px; color: ${COLORS.gray}; margin-top: 4px; }
  .green { color: ${COLORS.green}; }
  .blue { color: ${COLORS.blue}; }
  .purple { color: ${COLORS.purple}; }
  .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid ${COLORS.border}; font-size: 11px; color: ${COLORS.gray}; }
</style>
</head>
<body>
<div class="header">
  <h1>${title}</h1>
  <p>Catire Hot Dog | Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
</div>
${content}
<div class="footer">Reporte generado por Catire Hot Dog App</div>
</body>
</html>`;
}

export async function generateAndSharePDF(title: string, htmlContent: string): Promise<boolean> {
  try {
    const fullHTML = baseHTML(title, htmlContent);
    
    // Try to use expo-print (only works in dev client/APK, not Expo Go)
    try {
      const Print = require('expo-print');
      const Sharing = require('expo-sharing');
      
      if (Print && Print.printToFileAsync) {
        const { uri } = await Print.printToFileAsync({ html: fullHTML, base64: false });
        
        if (Sharing && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { 
            mimeType: 'application/pdf', 
            dialogTitle: title,
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert('PDF generado', 'El PDF se guardo correctamente.');
        }
        return true;
      }
    } catch (printError) {
      // expo-print not available in Expo Go, continue with fallback
    }
    
    // Fallback for Expo Go: Open HTML in browser for printing
    Alert.alert(
      'Generar PDF',
      'Para generar PDF necesitas la app instalada. Mientras tanto, puedes compartir el reporte por WhatsApp.',
      [
        { 
          text: 'WhatsApp', 
          onPress: () => {
            const phoneNumber = '584127995855';
            const text = `*${title}*\n\nReporte generado el ${new Date().toLocaleDateString('es-ES')}\n\nVer documento adjunto para mas detalles.`;
            const encodedText = encodeURIComponent(text);
            const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', 'No se pudo abrir WhatsApp');
            });
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
    return false;
  } catch (error: any) {
    console.error('PDF generation error:', error);
    Alert.alert('Error', 'No se pudo generar el reporte');
    return false;
  }
}

export function buildCajeroReportHTML(report: { branch: string; cajero: string; date: string; orders: number; revenue: number }): string {
  return `
    <div style="text-align:center; margin-bottom:20px;">
      <div class="stat"><div class="value blue">${report.orders}</div><div class="label">Ordenes</div></div>
      <div class="stat"><div class="value green">$${report.revenue.toFixed(2)}</div><div class="label">Ingresos</div></div>
    </div>
    <table>
      <tr><th>Campo</th><th>Detalle</th></tr>
      <tr><td>Sucursal</td><td>${report.branch}</td></tr>
      <tr><td>Cajero</td><td>${report.cajero}</td></tr>
      <tr><td>Fecha</td><td>${report.date}</td></tr>
      <tr><td>Total Ordenes</td><td>${report.orders}</td></tr>
      <tr><td>Ingresos Totales</td><td class="green">$${report.revenue.toFixed(2)}</td></tr>
      <tr><td>Promedio por Orden</td><td>$${report.orders > 0 ? (report.revenue / report.orders).toFixed(2) : '0.00'}</td></tr>
    </table>`;
}

export function buildAdminReportHTML(report: { title: string; type: string; generated_at: Date | string }): string {
  const typeLabels: Record<string, string> = {
    sales: 'Ventas', inventory: 'Inventario', orders: 'Pedidos',
    products: 'Productos', employees: 'Empleados',
  };
  return `
    <table>
      <tr><th>Campo</th><th>Detalle</th></tr>
      <tr><td>Reporte</td><td>${report.title}</td></tr>
      <tr><td>Tipo</td><td>${typeLabels[report.type] || report.type}</td></tr>
      <tr><td>Periodo</td><td>Todas las sucursales</td></tr>
      <tr><td>Generado</td><td>${new Date(report.generated_at).toLocaleDateString('es-ES')}</td></tr>
    </table>`;
}

export function buildDailyReportHTML(data: {
  branchName: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrder: number;
  ordersByStatus: Record<string, number>;
  statusLabels: Record<string, string>;
}): string {
  const statusRows = Object.entries(data.ordersByStatus)
    .map(([status, count]) => `<tr><td>${data.statusLabels[status] || status}</td><td>${count}</td></tr>`)
    .join('');
  return `
    <div style="text-align:center; margin-bottom:20px;">
      <div class="stat"><div class="value blue">${data.totalOrders}</div><div class="label">Ordenes</div></div>
      <div class="stat"><div class="value green">$${data.totalRevenue.toFixed(2)}</div><div class="label">Ingresos</div></div>
      <div class="stat"><div class="value purple">$${data.averageOrder.toFixed(2)}</div><div class="label">Promedio</div></div>
    </div>
    <h3 style="margin:16px 0 8px; font-size:15px;">Sucursal: ${data.branchName}</h3>
    <table>
      <tr><th>Estado</th><th>Cantidad</th></tr>
      ${statusRows || '<tr><td colspan="2" style="text-align:center;">Sin ordenes</td></tr>'}
    </table>`;
}

export function buildSummaryReportHTML(data: {
  totalOrders: number;
  totalRevenue: number;
  averageOrder: number;
  periodLabel: string;
}): string {
  return `
    <div style="text-align:center; margin-bottom:20px;">
      <div class="stat"><div class="value blue">${data.totalOrders}</div><div class="label">Total Ordenes</div></div>
      <div class="stat"><div class="value green">$${data.totalRevenue.toFixed(2)}</div><div class="label">Ingresos Totales</div></div>
      <div class="stat"><div class="value purple">$${data.averageOrder.toFixed(2)}</div><div class="label">Orden Promedio</div></div>
    </div>
    <table>
      <tr><th>Metrica</th><th>Valor</th></tr>
      <tr><td>Periodo</td><td>${data.periodLabel}</td></tr>
      <tr><td>Total Ordenes</td><td>${data.totalOrders}</td></tr>
      <tr><td>Ingresos Totales</td><td class="green">$${data.totalRevenue.toFixed(2)}</td></tr>
      <tr><td>Orden Promedio</td><td>$${data.averageOrder.toFixed(2)}</td></tr>
    </table>`;
}

export function buildInvoiceHTML(invoice: {
  orderId: string;
  branchName: string;
  clientName: string;
  orderDate: string;
  items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
  total: number;
  paymentMethod: string;
}): string {
  const itemRows = invoice.items
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">$${item.price.toFixed(2)}</td>
          <td style="text-align:right;">$${item.subtotal.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="display:flex; justify-content:space-between; margin-bottom:24px; padding:16px; background:${COLORS.lightGray}; border-radius:8px;">
      <div>
        <h2 style="color:${COLORS.primary}; font-size:20px; margin-bottom:4px;">CATIRE HOT DOG</h2>
        <p style="color:${COLORS.gray}; font-size:12px;">Factura de Venta</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:12px; color:${COLORS.gray};">Nro. Factura</p>
        <p style="font-size:16px; font-weight:700; color:${COLORS.primary};">#${invoice.orderId.substring(0, 8).toUpperCase()}</p>
      </div>
    </div>

    <div style="display:flex; gap:24px; margin-bottom:20px;">
      <div style="flex:1; padding:12px; background:${COLORS.lightGray}; border-radius:8px;">
        <p style="font-size:11px; color:${COLORS.gray}; margin-bottom:4px;">Sucursal</p>
        <p style="font-size:14px; font-weight:600;">${invoice.branchName}</p>
      </div>
      <div style="flex:1; padding:12px; background:${COLORS.lightGray}; border-radius:8px;">
        <p style="font-size:11px; color:${COLORS.gray}; margin-bottom:4px;">Cliente</p>
        <p style="font-size:14px; font-weight:600;">${invoice.clientName}</p>
      </div>
      <div style="flex:1; padding:12px; background:${COLORS.lightGray}; border-radius:8px;">
        <p style="font-size:11px; color:${COLORS.gray}; margin-bottom:4px;">Fecha</p>
        <p style="font-size:14px; font-weight:600;">${invoice.orderDate}</p>
      </div>
    </div>

    <table>
      <tr>
        <th style="text-align:left;">Producto</th>
        <th style="text-align:center;">Cant.</th>
        <th style="text-align:right;">Precio</th>
        <th style="text-align:right;">Subtotal</th>
      </tr>
      ${itemRows || '<tr><td colspan="4" style="text-align:center;">Sin productos</td></tr>'}
    </table>

    <div style="display:flex; justify-content:flex-end; margin-top:16px;">
      <div style="min-width:220px;">
        <table>
          <tr>
            <td style="font-weight:600; padding:8px 12px;">Subtotal</td>
            <td style="text-align:right; padding:8px 12px;">$${invoice.total.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-weight:600; padding:8px 12px;">IVA (0%)</td>
            <td style="text-align:right; padding:8px 12px;">$0.00</td>
          </tr>
          <tr>
            <td style="font-weight:800; font-size:16px; padding:12px; border-top:2px solid ${COLORS.primary}; color:${COLORS.primary};">TOTAL</td>
            <td style="font-weight:800; font-size:16px; padding:12px; text-align:right; border-top:2px solid ${COLORS.primary}; color:${COLORS.primary};">$${invoice.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    </div>

    <div style="margin-top:24px; padding:16px; background:${COLORS.lightGray}; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <p style="font-size:11px; color:${COLORS.gray};">Metodo de Pago</p>
        <p style="font-size:14px; font-weight:600;">${invoice.paymentMethod}</p>
      </div>
      <div style="background:${COLORS.green}; color:white; padding:8px 20px; border-radius:8px;">
        <p style="font-size:14px; font-weight:700;">PAGADO</p>
      </div>
    </div>`;
}
