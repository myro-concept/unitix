import { toast } from "sonner";

type SharePayload = {
  title: string;
  text?: string;
  url: string;
};

export async function shareLink({ title, text, url }: SharePayload) {
  const shareText = text ?? `Check out ${title} on UniTix`;
  const nav = typeof window !== "undefined" ? window.navigator : undefined;

  const copyWithFallback = () => {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  try {
    if (nav && typeof nav.share === "function") {
      await nav.share({
        title,
        text: shareText,
        url,
      });
      return true;
    }

    if (nav) {
      if (nav.clipboard?.writeText && window.isSecureContext) {
        await nav.clipboard.writeText(url);
      } else {
        copyWithFallback();
      }

      toast.success("Event link copied", {
        className: "copy-link-toast",
      });
      return false;
    }
  } catch {
    try {
      if (nav) {
        copyWithFallback();
        toast.success("Event link copied", {
          className: "copy-link-toast",
        });
        return false;
      }
    } catch {
      toast.error("Could not copy link");
    }
  }

  return false;
}