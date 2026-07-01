import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";

type ShareSheetProps = {
  title: string;
  text?: string;
  url: string;
  label?: string;
  className?: string;
};

type ShareTarget = {
  label: string;
  href: string;
  color: string;
  icon: () => JSX.Element;
};

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.051 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.04 15.57 8.88 19.2c.46 0 .66-.2.9-.43l2.16-2.07 4.47 3.27c.82.45 1.4.21 1.61-.76l2.94-13.79h.01c.26-1.24-.45-1.73-1.25-1.43L2.5 9.1c-1.18.46-1.17 1.13-.2 1.43l4.78 1.49L18.22 4.2c.54-.36 1.04-.16.64.2" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8.2h2.74l.41-3.2H13.5V8.55c0-.92.25-1.55 1.57-1.55h1.68V4.11c-.29-.04-1.3-.11-2.47-.11-2.45 0-4.13 1.5-4.13 4.24v2.36H7.5v3.2h2.65V22h3.35z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75zm2.75-.25a.25.25 0 0 0-.25.25v.54l5.5 3.44 5.5-3.44v-.54a.25.25 0 0 0-.25-.25H6.75zm11.75 2.59-5.8 3.63a1 1 0 0 1-1.06 0L5.5 9.09v8.16c0 .14.11.25.25.25h12.5a.25.25 0 0 0 .25-.25V9.09z" />
    </svg>
  );
}

export function ShareSheet({ title, text, url, label = "Share", className }: ShareSheetProps) {
  const [open, setOpen] = useState(false);

  const shareText = text ?? `Check out ${title} on UniTix`;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);


function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5Zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4Zm8.75 1a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
    </svg>
  );
}
  const targets: ShareTarget[] = [
    {
      label: "WhatsApp",
      color: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      icon: WhatsAppIcon,
    },
    {
      label: "Instagram",
      color: "#E1306C",
      href: `https://www.instagram.com/`,
      icon: InstagramIcon,
    },
    {
      label: "X (Twitter)",
      color: "#000000",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      icon: XIcon,
    },
    {
      label: "Telegram",
      color: "#4A90F8",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      icon: TelegramIcon,
    },
    {
      label: "Facebook",
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: FacebookIcon,
    },
    {
      label: "Email",
      color: "#586174",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`,
      icon: MailIcon,
    },
  ];

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Event link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const modal = open
    ? createPortal(
        <div className="share-sheet-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div className="share-sheet-modal" role="dialog" aria-modal="true" aria-label="Share Event" onClick={(e) => e.stopPropagation()}>
            <div className="share-sheet-head">
              <div className="share-sheet-title">
                <Share2 size={18} />
                <span>Share Event</span>
              </div>

              <button type="button" className="share-sheet-close" onClick={() => setOpen(false)} aria-label="Close share sheet">
                <X size={18} />
              </button>
            </div>

            <div className="share-sheet-grid">
              {targets.map((target) => {
                const Icon = target.icon;
                return (
                  <a key={target.label} href={target.href} target="_blank" rel="noopener noreferrer" className="share-sheet-target" style={{ background: target.color }}>
                    <Icon />
                    <span>{target.label}</span>
                  </a>
                );
              })}
            </div>

            <div className="share-sheet-divider" />

            <button type="button" className="share-sheet-copy" onClick={handleCopyLink}>
              Copy Link
            </button>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Share2 size={18} />
        {label}
      </button>

      {modal}

      <style>{`
        .share-sheet-backdrop {
          position: fixed;
          inset: 0;
          z-index: 12000;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .share-sheet-modal {
          width: min(100%, 640px);
          background: #ffffff;
          border-radius: 18px;
          padding: 20px 18px 18px;
        }

        .share-sheet-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .share-sheet-title {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #111827;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .share-sheet-close {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #6b7280;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .share-sheet-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .share-sheet-target {
          min-height: 54px;
          padding: 0 14px;
          border-radius: 14px;
          color: #ffffff;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          font-weight: 900;
          box-shadow: none; /* Removed box shadow */
        }

        .share-sheet-target svg {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }

        .share-sheet-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 18px 0;
        }

        .share-sheet-copy {
          width: 100%;
          height: 54px;
          border-radius: 16px;
          border: 2px solid #ff0048;
          background: #ffffff;
          color: #ff0048;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .share-sheet-copy:hover {
          background: rgba(255, 0, 72, 0.03); /* Reduced hover background */
        }

        @media (max-width: 640px) {
          .share-sheet-backdrop {
            padding: 10px;
          }

          .share-sheet-modal {
            width: calc(100vw - 20px);
            max-width: none;
            padding: 18px 16px 16px;
            border-radius: 16px;
          }

          .share-sheet-grid {
            gap: 10px;
          }

          .share-sheet-target {
            min-height: 54px;
            border-radius: 14px;
            font-size: 15px;
          }
        }
      `}</style>
    </>
  );
}