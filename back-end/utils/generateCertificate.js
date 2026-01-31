import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateCertificatePDF(data, templateName) {
  let browser;

  try {
    // Load HTML template
    const templatePath = path.join(__dirname, "../templates", `${templateName}.html`);
    let template = fs.readFileSync(templatePath, "utf-8");

    const signaturePath = data.signatureUrl
      ? `http://localhost:5000${data.signatureUrl}`
      : "";

    const qrSrc = data.qrCode
      ? data.qrCode.startsWith("data:image")
        ? data.qrCode
        : `data:image/png;base64,${data.qrCode}`
      : "";

    template = template
      .replace(/{{name}}/g, data.studentName)
      .replace(/{{course}}/g, data.courseName)
      .replace(/{{date}}/g, data.completionDate)
      .replace(/{{signature}}/g, signaturePath)
      .replace(/{{qr}}/g, qrSrc);

browser = await puppeteer.launch({
  headless: "new",
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--disable-default-apps"
  ],
});


    const page = await browser.newPage();

    await page.setContent(template, { waitUntil: "networkidle0" });

    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              })
        )
      );
    });

    const element = await page.$(".certificate-container");
    if (!element) throw new Error("Container '.certificate-container' not found");

    const boundingBox = await element.boundingBox();

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: `${Math.ceil(boundingBox.width)}px`,
      height: `${Math.ceil(boundingBox.height)}px`,
      pageRanges: "1",
    });

    // Save PDF
    const outputDir = path.join(__dirname, "../outputs");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `certificate-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log("✅ PDF saved at:", outputPath);
    return pdfBuffer;

  } catch (err) {
    console.error("❌ Error generating certificate:", err);
    throw err;

  } finally {
    // 🔴 ALWAYS CLOSE BROWSER
    if (browser) {
      await browser.close();
    }
  }
}
