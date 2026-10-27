/**
 * ULEAM EVENTOS - Sistema de Exportación de Documentos Oficiales
 * Generador nativo de Archivos CSV, Certificados PDF de Alta Fidelidad y Credenciales ID
 */

// 1. EXPORTACIÓN ROBUSTA A CSV / EXCEL
// Soluciona el problema de descarga donde el archivo salía con GUID temporal sin extensión
export function exportTableToCSV(filename, headers, rows) {
  // UTF-8 BOM para que Excel en español reconozca tildes y caracteres especiales (ñ, á, é)
  const BOM = '\uFEFF';
  const csvRows = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ];
  const csvContent = BOM + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 2. GENERADOR DE LIENZO DE CERTIFICADO ACADÉMICO (Alta Resolución 2400 x 1700 A4 Landscape)
export function renderCertificateCanvas(certData, authorityConfig) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1700;
    const ctx = canvas.getContext('2d');

    // Fondo marfil académico suave
    const bgGrad = ctx.createLinearGradient(0, 0, 2400, 1700);
    bgGrad.addColorStop(0, '#FAF9F6');
    bgGrad.addColorStop(0.5, '#FFFFFF');
    bgGrad.addColorStop(1, '#F7F5EE');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2400, 1700);

    // Marco exterior Oro y Azul Institucional ULEAM
    // Marco exterior oro
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#C59B27';
    ctx.strokeRect(60, 60, 2400 - 120, 1700 - 120);

    // Espacio intermedio fino
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#D4AF37';
    ctx.strokeRect(74, 74, 2400 - 148, 1700 - 148);

    // Marco interior azul marino profundo ULEAM
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#002F6C';
    ctx.strokeRect(84, 84, 2400 - 168, 1700 - 168);

    // Filigranas esquineras decorativas
    drawCornerFlourish(ctx, 95, 95, 0);
    drawCornerFlourish(ctx, 2400 - 95, 95, Math.PI / 2);
    drawCornerFlourish(ctx, 2400 - 95, 1700 - 95, Math.PI);
    drawCornerFlourish(ctx, 95, 1700 - 95, -Math.PI / 2);

    // Marca de agua central suave del Escudo
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#002F6C';
    ctx.beginPath();
    ctx.arc(1200, 850, 420, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ENCABEZADO INSTITUCIONAL
    ctx.textAlign = 'center';

    // República del Ecuador
    ctx.font = '600 28px "Inter", "Helvetica", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText('REPÚBLICA DEL ECUADOR', 1200, 190);

    // Nombre de la Universidad
    ctx.font = '700 48px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#002F6C';
    ctx.fillText('UNIVERSIDAD LAICA ELOY ALFARO DE MANABÍ', 1200, 255);

    // Facultad
    ctx.font = '600 30px "Inter", "Helvetica", sans-serif';
    ctx.fillStyle = '#C59B27';
    ctx.fillText('FACULTAD DE CIENCIAS DE LA VIDA Y TECNOLOGÍAS', 1200, 310);

    // Línea divisoria ornamental central
    drawOrnamentalDivider(ctx, 1200, 350, 700);

    // Texto de conferimiento
    ctx.font = 'italic 400 32px "Georgia", serif';
    ctx.fillStyle = '#444444';
    ctx.fillText('El Honorable Consejo Directivo y el Decanato de Facultad confieren el presente:', 1200, 420);

    // Título Principal CERTIFICADO
    ctx.font = 'bold 74px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#002F6C';
    ctx.fillText('CERTIFICADO', 1200, 520);

    ctx.font = '600 24px "Inter", sans-serif';
    ctx.fillStyle = '#888888';
    ctx.letterSpacing = '6px';
    ctx.fillText('DE ASISTENCIA Y APROBACIÓN ACADÉMICA', 1200, 570);
    ctx.letterSpacing = '0px';

    // Texto intermedio
    ctx.font = '400 28px "Inter", sans-serif';
    ctx.fillStyle = '#555555';
    ctx.fillText('Otorgado formalmente a:', 1200, 640);

    // Nombre del participante
    ctx.font = 'bold 58px "Georgia", serif';
    ctx.fillStyle = '#C59B27';
    ctx.fillText(certData.participante || 'Karla Jamileth Andrade Mendoza', 1200, 720);

    // Cédula / Identificación
    ctx.font = '500 26px "Inter", sans-serif';
    ctx.fillStyle = '#555555';
    ctx.fillText(`Con Cédula de Ciudadanía: ${certData.identificacion || '1317890123'}`, 1200, 775);

    // Descripción del evento y horas
    const eventName = certData.evento || 'Seminario de Ética Profesional en la Era de la IA';
    ctx.font = '400 30px "Georgia", serif';
    ctx.fillStyle = '#333333';
    ctx.fillText(
      `Por haber asistido y aprobado satisfactoriamente todas las sesiones académicas del:`,
      1200,
      860
    );

    ctx.font = 'bold 36px "Georgia", serif';
    ctx.fillStyle = '#002F6C';
    ctx.fillText(`"${eventName}"`, 1200, 920);

    ctx.font = '400 28px "Inter", sans-serif';
    ctx.fillStyle = '#444444';
    ctx.fillText(
      `Con una duración total de 40 Horas Académicas acreditadas conforme a la normativa vigente.`,
      1200,
      980
    );

    ctx.font = '500 26px "Inter", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(
      `Manta, Manabí — Ecuador, emitido el ${certData.fecha || '12 de Septiembre de 2026'}.`,
      1200,
      1035
    );

    // CAJA DE SEGURIDAD CRIPTOGRÁFICA Y QR
    const qrSize = 160;
    const qrX = 320;
    const qrY = 1260;

    // Código QR de validación oficial
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      `https://eventos.uleam.edu.ec/validar?code=${certData.codigo || 'ULEAM-2026-ETICA-884920'}`
    )}`;
    qrImg.src = qrUrl;

    const finishDrawing = () => {
      // Bloque de verificación y Hash
      ctx.textAlign = 'left';
      ctx.font = 'bold 20px "Inter", monospace';
      ctx.fillStyle = '#002F6C';
      ctx.fillText('VERIFICACIÓN DIGITAL INSTITUCIONAL', qrX + qrSize + 24, qrY + 35);

      ctx.font = '500 19px "Inter", monospace';
      ctx.fillStyle = '#555555';
      ctx.fillText(`Código: ${certData.codigo || 'ULEAM-2026-ETICA-884920'}`, qrX + qrSize + 24, qrY + 70);

      ctx.font = '400 16px "Inter", monospace';
      ctx.fillStyle = '#777777';
      ctx.fillText(`HASH: ${certData.hash || 'SHA256: 8f9b4c09d8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3'}`, qrX + qrSize + 24, qrY + 105);
      ctx.fillText('Validez académica y firma verificable en https://eventos.uleam.edu.ec/validar', qrX + qrSize + 24, qrY + 135);

      // BLOQUES DE FIRMAS OFICIALES
      // 1. Firma Decanato / Rectorado (Con la firma cargada o dibujada del SuperAdmin)
      const sig1X = 1420;
      const sig1Y = 1360;

      // Línea de firma
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#002F6C';
      ctx.beginPath();
      ctx.moveTo(sig1X - 220, sig1Y);
      ctx.lineTo(sig1X + 220, sig1Y);
      ctx.stroke();

      // Nombres y cargos de la autoridad (desde configuración SuperAdmin)
      ctx.textAlign = 'center';
      ctx.font = 'bold 25px "Georgia", serif';
      ctx.fillStyle = '#002F6C';
      ctx.fillText(authorityConfig?.nombre || 'Dr. Marcos Zambrano Zambrano, PhD.', sig1X, sig1Y + 35);

      ctx.font = '600 20px "Inter", sans-serif';
      ctx.fillStyle = '#C59B27';
      ctx.fillText(authorityConfig?.cargo || 'Rector Institucional ULEAM', sig1X, sig1Y + 65);

      ctx.font = '400 17px "Inter", sans-serif';
      ctx.fillStyle = '#777777';
      ctx.fillText(authorityConfig?.resolucion || 'Resolución H.C.U. No. 042-CU-ULEAM-2026', sig1X, sig1Y + 92);

      // 2. Firma Coordinación Académica
      const sig2X = 2020;
      const sig2Y = 1360;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#002F6C';
      ctx.beginPath();
      ctx.moveTo(sig2X - 180, sig2Y);
      ctx.lineTo(sig2X + 180, sig2Y);
      ctx.stroke();

      ctx.font = 'bold 23px "Georgia", serif';
      ctx.fillStyle = '#002F6C';
      ctx.fillText('Dr. Jonny Pérez Véliz, PhD.', sig2X, sig2Y + 35);

      ctx.font = '600 19px "Inter", sans-serif';
      ctx.fillStyle = '#555555';
      ctx.fillText('Director Académico del Evento', sig2X, sig2Y + 65);

      ctx.font = '400 17px "Inter", sans-serif';
      ctx.fillStyle = '#777777';
      ctx.fillText('Facultad Cs. de la Vida y Tecnologías', sig2X, sig2Y + 92);

      // Dibujar Sello Oficial de la Universidad
      if (authorityConfig?.selloActivo !== false) {
        drawOfficialUniversitySeal(ctx, 1160, 1340);
      }

      // Dibujar imagen de la Firma si está disponible
      if (authorityConfig?.firmaUrl) {
        const sigImg = new Image();
        sigImg.onload = () => {
          ctx.drawImage(sigImg, sig1X - 160, sig1Y - 140, 320, 130);
          resolve(canvas);
        };
        sigImg.onerror = () => {
          drawDefaultCalligraphicSignature(ctx, sig1X, sig1Y - 40);
          resolve(canvas);
        };
        sigImg.src = authorityConfig.firmaUrl;
      } else {
        drawDefaultCalligraphicSignature(ctx, sig1X, sig1Y - 40);
        drawDefaultCalligraphicSignature(ctx, sig2X, sig2Y - 40, '#002F6C');
        resolve(canvas);
      }
    };

    qrImg.onload = () => {
      // Dibujar contenedor QR
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#C59B27';
      ctx.lineWidth = 3;
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      finishDrawing();
    };

    qrImg.onerror = () => {
      finishDrawing();
    };
  });
}

// 3. GENERADOR DE LIENZO DE CREDENCIAL ID-CARD (1000 x 1500 Vertical de Acreditación)
export function renderCredentialCanvas(credData, authorityConfig) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');

    // Fondo tarjeta
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1000, 1500);

    // Cabecera Institucional Azul y Oro
    const headerGrad = ctx.createLinearGradient(0, 0, 1000, 360);
    headerGrad.addColorStop(0, '#002F6C');
    headerGrad.addColorStop(1, '#0C2340');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, 1000, 340);

    // Franja dorada
    ctx.fillStyle = '#C59B27';
    ctx.fillRect(0, 340, 1000, 14);

    // Ranura para cinta/lanyard
    ctx.fillStyle = '#E5E7EB';
    ctx.beginPath();
    ctx.roundRect(430, 24, 140, 24, 12);
    ctx.fill();

    // Textos de Cabecera
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 32px "Inter", sans-serif';
    ctx.fillText('UNIVERSIDAD LAICA ELOY ALFARO', 500, 110);
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillStyle = '#D4AF37';
    ctx.fillText('DE MANABÍ — ECUADOR', 500, 145);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 38px "Georgia", serif';
    ctx.fillText('CREDENCIAL OFICIAL', 500, 220);

    ctx.font = '400 22px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(credData.evento || 'I Congreso Internacional de Software 2026', 500, 270);

    // Foto de perfil del participante
    const photoImg = new Image();
    photoImg.crossOrigin = 'anonymous';
    photoImg.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300';

    const drawRestOfCard = () => {
      // Marco de foto
      ctx.save();
      ctx.beginPath();
      ctx.arc(500, 480, 110, 0, Math.PI * 2);
      ctx.strokeStyle = '#002F6C';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.closePath();
      ctx.clip();
      try {
        ctx.drawImage(photoImg, 390, 370, 220, 220);
      } catch {
        ctx.fillStyle = '#002F6C';
        ctx.fillRect(390, 370, 220, 220);
      }
      ctx.restore();

      // Nombre del Participante
      ctx.textAlign = 'center';
      ctx.fillStyle = '#002F6C';
      ctx.font = '700 42px "Georgia", serif';
      ctx.fillText(credData.participante || 'Karla Jamileth Andrade Mendoza', 500, 660);

      // Badge Categoría
      const isFree = (credData.categoria || '').toLowerCase().includes('beca') || (credData.categoria || '').toLowerCase().includes('estudiante');
      ctx.fillStyle = isFree ? '#00875A' : '#C59B27';
      ctx.beginPath();
      ctx.roundRect(250, 690, 500, 50, 25);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 24px "Inter", sans-serif';
      ctx.fillText((credData.categoria || 'ESTUDIANTE BECADO').toUpperCase(), 500, 725);

      // Institución e Identificación
      ctx.fillStyle = '#555555';
      ctx.font = '500 26px "Inter", sans-serif';
      ctx.fillText(`C.I: ${credData.identificacion || '1317890123'}`, 500, 785);
      ctx.font = '400 22px "Inter", sans-serif';
      ctx.fillStyle = '#777777';
      ctx.fillText(credData.institucion || 'ULEAM — Facultad Cs. de la Vida y Tecnologías', 500, 820);

      // CÓDIGO QR DE ACCESO RÁPIDO
      const qrCodeImg = new Image();
      qrCodeImg.crossOrigin = 'anonymous';
      qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
        credData.qr_token || 'ULEAM-QR-ACCESS-0001'
      )}`;

      qrCodeImg.onload = () => {
        // Contenedor QR
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(320, 860, 360, 360, 20);
        ctx.fill();
        ctx.stroke();

        ctx.drawImage(qrCodeImg, 350, 890, 300, 300);

        // Token alfanumérico
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.fillStyle = '#002F6C';
        ctx.fillText(credData.qr_token || 'ULEAM-QR-10000000-2026', 500, 1260);

        // Firma y Sello institucional
        if (authorityConfig?.firmaUrl) {
          const sigImg = new Image();
          sigImg.onload = () => {
            ctx.drawImage(sigImg, 380, 1280, 240, 80);
            drawCardFooter();
          };
          sigImg.onerror = () => {
            drawDefaultCalligraphicSignature(ctx, 500, 1330);
            drawCardFooter();
          };
          sigImg.src = authorityConfig.firmaUrl;
        } else {
          drawDefaultCalligraphicSignature(ctx, 500, 1330);
          drawCardFooter();
        }
      };

      qrCodeImg.onerror = () => {
        drawCardFooter();
      };

      const drawCardFooter = () => {
        // Pie de credencial
        ctx.fillStyle = '#002F6C';
        ctx.fillRect(0, 1420, 1000, 80);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '500 20px "Inter", sans-serif';
        ctx.fillText('VÁLIDO PARA INGRESO Y ACREDITACIÓN UNIVERSITARIA 2026', 500, 1468);
        resolve(canvas);
      };
    };

    photoImg.onload = drawRestOfCard;
    photoImg.onerror = drawRestOfCard;
  });
}

// 4. DESCARGA REAL DE ARCHIVO PDF (Construcción de PDF-1.4 binario válido sin dependencias externas)
export async function downloadCertificatePDF(certData, authorityConfig, filename = 'Certificado_Oficial_ULEAM.pdf') {
  const canvas = await renderCertificateCanvas(certData, authorityConfig);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  downloadDataUrlAsPdf(imgData, 2400, 1700, filename);
}

export async function downloadCredentialPDF(credData, authorityConfig, filename = 'Credencial_ULEAM.pdf') {
  const canvas = await renderCredentialCanvas(credData, authorityConfig);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  downloadDataUrlAsPdf(imgData, 1000, 1500, filename);
}

// Convertidor ligero de Canvas JPEG a archivo PDF binario estándar (RFC 3205 / ISO 32000)
function downloadDataUrlAsPdf(jpegDataUrl, width, height, filename) {
  // Extraer bytes del JPEG base64
  const base64Data = jpegDataUrl.replace(/^data:image\/jpeg;base64,/, '');
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const imageBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    imageBytes[i] = binaryString.charCodeAt(i);
  }

  // Dimensiones en puntos PDF (72 puntos por pulgada)
  // A4 Landscape: 841.89 x 595.28 pt; Vertical: 595.28 x 841.89 pt
  const isLandscape = width >= height;
  const ptWidth = isLandscape ? 842 : 595;
  const ptHeight = isLandscape ? 595 : 842;

  // Encabezados de objetos PDF
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let currentOffset = 0;

  const writeChunk = (chunk) => {
    chunks.push(chunk);
    currentOffset += chunk.length;
  };

  const writeStr = (str) => {
    const b = enc.encode(str);
    writeChunk(b);
  };

  // 1. Cabecera PDF
  writeStr('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Objeto 1: Catalog
  offsets.push(currentOffset);
  writeStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Objeto 2: Pages
  offsets.push(currentOffset);
  writeStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Objeto 3: Page
  offsets.push(currentOffset);
  writeStr(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptWidth} ${ptHeight}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // Objeto 4: XObject Image
  offsets.push(currentOffset);
  const imgHeader = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${len} >>\nstream\n`;
  writeStr(imgHeader);
  writeChunk(imageBytes);
  writeStr('\nendstream\nendobj\n');

  // Objeto 5: Contents (dibuja la imagen a página completa)
  const contentStream = `q\n${ptWidth} 0 0 ${ptHeight} 0 0 cm\n/Im1 Do\nQ\n`;
  const contentLen = enc.encode(contentStream).length;

  offsets.push(currentOffset);
  writeStr(`5 0 obj\n<< /Length ${contentLen} >>\nstream\n${contentStream}endstream\nendobj\n`);

  // Tabla XREF
  const xrefOffset = currentOffset;
  writeStr('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 0; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    writeStr(`${offStr} 00000 n \n`);
  }

  // Trailer
  writeStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  // Ensamblar Blob PDF y descargar
  const blob = new Blob(chunks, { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

// 5. APERTURA DE VENTANA IMPRIMIBLE EN ALTA DEFINICIÓN (Con document.title exacto para "Guardar como PDF")
export function openPrintableCertificateWindow(certData, authorityConfig) {
  const printWin = window.open('', '_blank', 'width=1100,height=800');
  if (!printWin) {
    alert('Por favor permite ventanas emergentes en tu navegador para imprimir.');
    return;
  }

  const cleanFilename = `Certificado_Oficial_ULEAM_${(certData.participante || 'Participante').replace(/\s+/g, '_')}.pdf`;
  printWin.document.title = cleanFilename;

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${cleanFilename}</title>
      <style>
        @page {
          size: landscape A4;
          margin: 0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Georgia', serif;
          background: #FAF9F6;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .cert-card {
          width: 100%;
          max-width: 1050px;
          background: #FFFFFF;
          border: 10px solid #C59B27;
          outline: 4px solid #002F6C;
          outline-offset: -14px;
          padding: 40px 60px;
          text-align: center;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header-sub { font-family: sans-serif; font-size: 14px; color: #666; font-weight: 600; letter-spacing: 2px; }
        .univ-title { font-size: 26px; color: #002F6C; font-weight: bold; margin-top: 6px; }
        .fac-title { font-family: sans-serif; font-size: 16px; color: #C59B27; font-weight: 700; margin-top: 4px; }
        .divider { width: 300px; height: 2px; background: #C59B27; margin: 16px auto; }
        .cert-title { font-size: 42px; color: #002F6C; font-weight: bold; margin: 16px 0 6px; letter-spacing: 1px; }
        .cert-subtitle { font-family: sans-serif; font-size: 13px; color: #888; letter-spacing: 3px; font-weight: 600; }
        .recipient { font-size: 34px; color: #C59B27; font-weight: bold; margin: 20px 0 6px; border-bottom: 2px solid rgba(197,155,39,0.3); display: inline-block; padding-bottom: 4px; }
        .recipient-ci { font-family: sans-serif; font-size: 14px; color: #555; }
        .event-text { font-size: 16px; color: #333; margin: 16px auto; max-width: 800px; line-height: 1.5; }
        .event-name { color: #002F6C; font-weight: bold; font-size: 18px; }
        .security-box { font-family: monospace; font-size: 11px; color: #666; text-align: left; border: 1px solid #E2E8F0; padding: 8px 12px; border-radius: 6px; background: #F8FAFC; display: inline-block; }
        .signatures-row { display: flex; justify-content: space-around; align-items: flex-end; margin-top: 40px; padding-top: 20px; }
        .sig-col { text-align: center; width: 280px; }
        .sig-line { width: 100%; height: 1.5px; background: #002F6C; margin-bottom: 8px; }
        .sig-img { max-height: 70px; margin-bottom: -10px; display: block; margin-left: auto; margin-right: auto; }
        .sig-name { font-weight: bold; font-size: 15px; color: #002F6C; }
        .sig-role { font-family: sans-serif; font-size: 12px; color: #C59B27; font-weight: 600; }
        @media print {
          body { padding: 0; background: none; }
          .cert-card { box-shadow: none; border-width: 8px; width: 100vw; height: 100vh; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="cert-card">
        <div class="header-sub">REPÚBLICA DEL ECUADOR</div>
        <div class="univ-title">UNIVERSIDAD LAICA ELOY ALFARO DE MANABÍ</div>
        <div class="fac-title">FACULTAD DE CIENCIAS DE LA VIDA Y TECNOLOGÍAS</div>
        <div class="divider"></div>
        <p style="font-style: italic; color: #555; font-size: 15px;">El Honorable Consejo Directivo y el Decanato de Facultad otorgan el presente:</p>
        <div class="cert-title">CERTIFICADO</div>
        <div class="cert-subtitle">DE ASISTENCIA Y APROBACIÓN ACADÉMICA</div>
        <div style="font-family: sans-serif; font-size: 14px; color: #666; margin-top: 14px;">Conferido con honor a:</div>
        <div class="recipient">${certData.participante || 'Karla Jamileth Andrade Mendoza'}</div>
        <div class="recipient-ci">Cédula de Identidad: ${certData.identificacion || '1317890123'}</div>
        <div class="event-text">
          Por haber acreditado el cumplimiento satisfactorio de las sesiones correspondientes al
          <div class="event-name">"${certData.evento || 'Seminario de Ética Profesional en la Era de la IA'}"</div>
          con una carga horaria total de <strong>40 Horas Académicas</strong> debidamente avaladas por el H. Consejo Universitario.
        </div>
        <div style="font-family: sans-serif; font-size: 13px; color: #777; margin-bottom: 14px;">
          Manta, Manabí — Ecuador, ${certData.fecha || '12 de Septiembre de 2026'}.
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
          <div class="security-box">
            <div><strong>CÓDIGO:</strong> ${certData.codigo || 'ULEAM-2026-ETICA-884920'}</div>
            <div><strong>HASH:</strong> ${certData.hash || 'SHA256: 8f9b4c09d8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3'}</div>
            <div>Validación oficial en: https://eventos.uleam.edu.ec/validar</div>
          </div>

          <div class="signatures-row" style="margin-top: 0; gap: 40px;">
            <div class="sig-col">
              ${
                authorityConfig?.firmaUrl
                  ? `<img src="${authorityConfig.firmaUrl}" class="sig-img" alt="Firma Autoridad" />`
                  : `<div style="font-family: 'Brush Script MT', cursive; font-size: 28px; color: #002F6C; margin-bottom: 2px;">Marcos Zambrano Z.</div>`
              }
              <div class="sig-line"></div>
              <div class="sig-name">${authorityConfig?.nombre || 'Dr. Marcos Zambrano Zambrano, PhD.'}</div>
              <div class="sig-role">${authorityConfig?.cargo || 'Rector Institucional ULEAM'}</div>
            </div>
            <div class="sig-col">
              <div style="font-family: 'Brush Script MT', cursive; font-size: 28px; color: #002F6C; margin-bottom: 2px;">Jonny Pérez V.</div>
              <div class="sig-line"></div>
              <div class="sig-name">Dr. Jonny Pérez Véliz, PhD.</div>
              <div class="sig-role">Director Académico del Evento</div>
            </div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}

// -------------------------------------------------------------
// FUNCIONES AUXILIARES DE DIBUJO VECTORIAL PARA CANVAS
// -------------------------------------------------------------

function drawCornerFlourish(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#C59B27';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(40, 0);
  ctx.bezierCurveTo(20, 20, 20, 20, 0, 40);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = '#C59B27';
  ctx.beginPath();
  ctx.arc(15, 15, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOrnamentalDivider(ctx, cx, cy, width) {
  ctx.strokeStyle = '#C59B27';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, cy);
  ctx.lineTo(cx - 30, cy);
  ctx.moveTo(cx + 30, cy);
  ctx.lineTo(cx + width / 2, cy);
  ctx.stroke();

  // Rombo central
  ctx.fillStyle = '#002F6C';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 8);
  ctx.lineTo(cx + 8, cy);
  ctx.lineTo(cx, cy + 8);
  ctx.lineTo(cx - 8, cy);
  ctx.closePath();
  ctx.fill();
}

function drawOfficialUniversitySeal(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  // Círculo exterior dentado / de cera institucional
  ctx.strokeStyle = '#C59B27';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#8B0000'; // Rojo institucional ULEAM
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.stroke();

  // Texto circular del sello
  ctx.fillStyle = '#8B0000';
  ctx.font = 'bold 9px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UNIVERSIDAD LAICA ELOY ALFARO', 0, -42);
  ctx.fillText('★ MANTA - ECUADOR ★', 0, 48);

  // Escudo central simplificado
  ctx.font = 'bold 18px "Georgia", serif';
  ctx.fillStyle = '#002F6C';
  ctx.fillText('ULEAM', 0, -4);
  ctx.font = '600 8px "Inter", sans-serif';
  ctx.fillStyle = '#C59B27';
  ctx.fillText('ACREDITADA', 0, 10);
  ctx.fillText('RESOLUCIÓN C.U.', 0, 20);

  ctx.restore();
}

function drawDefaultCalligraphicSignature(ctx, x, y, color = '#002F6C') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 90, y);
  ctx.bezierCurveTo(x - 70, y - 50, x - 30, y - 60, x - 10, y - 20);
  ctx.bezierCurveTo(x + 10, y + 20, x + 30, y - 40, x + 50, y - 10);
  ctx.bezierCurveTo(x + 60, y + 10, x + 80, y - 15, x + 95, y);
  // Trazo de rúbrica inferior
  ctx.moveTo(x - 80, y + 12);
  ctx.bezierCurveTo(x - 20, y + 20, x + 40, y + 8, x + 85, y + 14);
  ctx.stroke();
  ctx.restore();
}
