import { toast } from "sonner";

type SharePayload = {
  title: string;
  text?: string;
  url: string;
};

export async function shareLink({ title, text, url }: SharePayload) {
  const shareText = text ?? `Check out ${title} on UniTix`;

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
    if (typeof navigator !== "undefined" && "share" in navigator) {
      await navigator.share({
        title,
        text: shareText,
        url,
      });
      return true;
    }

    if (typeof navigator !== "undefined") {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        copyWithFallback();
      }

      toast.success("Event link copied");
      return false;
    }
  } catch {
    try {
      if (typeof navigator !== "undefined") {
        copyWithFallback();
        toast.success("Event link copied");
        return false;
      }
    } catch {
      toast.error("Could not copy link");
    }
  }

  return false;
}