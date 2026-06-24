import PDFDocument from "pdfkit";
import type { ReportHtmlInput } from "@/lib/ai/build-report-html";
import { getSearchTypeLabel } from "@/lib/ai/search-types";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-*]\s+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** PDFKit Helvetica = WinAnsi — retirer les caractères hors Latin-1 */
function sanitizePdfText(text: string): string {
  return stripMarkdown(text)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022\u2023\u2043]/g, "-")
    .replace(/[\u00AB\u00BB]/g, '"')
    .replace(/[^\n\r\t\x20-\x7E\xA0-\xFF]/g, "");
}

function writeParagraph(
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  options?: { bold?: boolean; size?: number }
) {
  doc
    .font(options?.bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(options?.size ?? 10)
    .text(sanitizePdfText(text), { align: "justify", lineGap: 2 });
}

function pdfLine(value: string): string {
  return sanitizePdfText(value);
}

export function buildAiReportPdfBuffer(input: ReportHtmlInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      info: {
        Title: pdfLine(`Rapport IA — ${input.projectTitle}`),
        Author: "PatentIQ / I2PA",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text("Rapport d'analyse IA");
    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica");
    doc.text(pdfLine(`Projet : ${input.projectTitle}`));
    if (input.referenceCode) doc.text(pdfLine(`Reference : ${input.referenceCode}`));
    if (input.categoryName) doc.text(pdfLine(`Categorie : ${input.categoryName}`));
    doc.text(pdfLine(`Type : ${getSearchTypeLabel(input.searchType)}`));
    doc.text(pdfLine(`Genere le : ${new Date(input.generatedAt).toLocaleString("fr-FR")}`));

    if (input.query?.trim()) {
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Requete");
      doc.font("Helvetica").text(pdfLine(input.query.trim()), { align: "justify" });
    }

    doc.moveDown();
    doc.font("Helvetica-Bold").fontSize(13).text("Synthese");
    doc.moveDown(0.3);
    writeParagraph(doc, input.summary || "Synthese non disponible.");

    doc.moveDown();
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(pdfLine(`Documents identifies (${input.results.length})`));
    doc.moveDown(0.5);

    if (!input.results.length) {
      doc.font("Helvetica").fontSize(10).text("Aucun document enregistre pour cette analyse.");
    } else {
      for (let index = 0; index < input.results.length; index++) {
        const result = input.results[index];
        if (doc.y > 700) doc.addPage();

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(pdfLine(`${index + 1}. ${result.title ?? result.source_ref ?? "Sans titre"}`));

        doc.font("Helvetica").fontSize(9);
        if (result.source_ref) doc.text(pdfLine(`Ref. : ${result.source_ref}`));
        if (result.score != null) {
          doc.text(pdfLine(`Score de similarite : ${Math.round(Number(result.score) * 100)} %`));
        }
        if (result.summary) {
          writeParagraph(doc, result.summary.slice(0, 1200), { size: 9 });
        }
        doc.moveDown(0.5);
      }
    }

    doc.moveDown();
    doc
      .fontSize(8)
      .fillColor("#666666")
      .text(
        "PatentIQ — document genere automatiquement. Ne constitue pas un avis juridique.",
        { align: "center" }
      );

    doc.end();
  });
}
