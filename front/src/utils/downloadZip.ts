import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateBarcodeDataURL } from './generateBarcode';
import type { Ticket } from '../store/useAppStore';

export const downloadTicketsAsZip = async (
  tickets: Ticket[],
  batchName: string
): Promise<void> => {
  const zip = new JSZip();
  const folder = zip.folder(`${batchName}-tickets`);

  if (!folder) return;

  for (const ticket of tickets) {
    const dataURL = await generateBarcodeDataURL(ticket.barcode_code);

    const base64Data = dataURL.split(',')[1];
    folder.file(`${ticket.barcode_code}.png`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${batchName}-tickets.zip`);
};
