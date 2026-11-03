import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import UniTixTicket, { type UniTixTicketProps } from "@/pages/UniTixTicket";

export async function generateTicketPdf(
  ticket: UniTixTicketProps,
): Promise<{ filename: string; content: string }> {
  const container = document.createElement("div");
  container.className = "ticket-pdf-render-root";
  container.setAttribute("aria-hidden", "true");
  container.style.cssText =
    "position:fixed;left:0;top:0;width:768px;pointer-events:none;opacity:0;z-index:-1;";
  document.body.append(container);

  const root = createRoot(container);
  try {
    flushSync(() => root.render(<UniTixTicket {...ticket} />));
    await document.fonts.ready;

    const element = container.querySelector<HTMLElement>(".unitix-ticket");
    if (!element) {
      throw new Error("The ticket design could not be rendered for PDF export.");
    }

    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(images.map(async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolve, reject) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener(
            "error",
            () => reject(new Error("The event image could not be loaded for the ticket PDF.")),
            { once: true },
          );
        });
      }
      if (image.naturalWidth === 0) {
        throw new Error("The event image could not be loaded for the ticket PDF.");
      }
    }));

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 768,
      onclone: (clonedDocument) => {
        const clonedContainer = clonedDocument.querySelector<HTMLElement>(
          ".ticket-pdf-render-root",
        );
        if (clonedContainer) clonedContainer.style.opacity = "1";
        clonedDocument.querySelectorAll<HTMLButtonElement>(".unitix-ticket button").forEach((button) => {
          button.style.display = "none";
        });
      },
    });
    const width = (canvas.width / 2) * 0.75;
    const height = (canvas.height / 2) * 0.75;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [width, height],
      compress: true,
    });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);

    const dataUri = pdf.output("datauristring");
    const content = dataUri.slice(dataUri.indexOf(",") + 1);
    if (!content.startsWith("JVBER")) {
      throw new Error("The ticket PDF could not be generated.");
    }

    return {
      filename: `unitix-ticket-${ticket.ticketId}.pdf`,
      content,
    };
  } finally {
    root.unmount();
    container.remove();
  }
}
