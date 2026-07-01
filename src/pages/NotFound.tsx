import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SEO from "@/seo/SEO";
import logoGlyph from "@/assets/logo-glyph-160.png";

const NotFound = () => {
  const location = useLocation();
  const canonicalUrl = `https://unitix.ng${location.pathname}`;

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        page="home"
        title="Event not found | UniTix"
        description="This event may have ended, been removed, or the link is incorrect."
        robots="noindex, nofollow"
        url={canonicalUrl}
      />

      <div className="not-found-page">
        <style>{`
          .not-found-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          }

          .not-found-card {
            width: 100%;
            max-width: 1200px;
            border-radius: 16px;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 30px rgba(15, 23, 42, 0.05);
            padding: 72px 24px 80px;
            text-align: center;
          }

          .not-found-icon {
            width: 56px;
            height: 56px;
            margin: 0 auto 20px;
            border-radius: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 0, 72, 0.08);
            overflow: hidden;
            padding: 8px;
          }

          .not-found-icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          .not-found-card h1 {
            font-family: 'Bricolage Grotesque', 'DM Sans', sans-serif;
            font-size: clamp(30px, 4vw, 44px);
            line-height: 1.1;
            letter-spacing: -0.05em;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 14px;
          }

          .not-found-card p {
            max-width: 640px;
            margin: 0 auto;
            color: #64748b;
            font-size: 18px;
            line-height: 1.7;
          }

          .not-found-actions {
            display: flex;
            justify-content: center;
            gap: 14px;
            flex-wrap: wrap;
            margin-top: 28px;
          }

          .not-found-btn,
          .not-found-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-width: 152px;
            height: 50px;
            padding: 0 22px;
            border-radius: 999px;
            text-decoration: none;
            font-size: 16px;
            font-weight: 900;
            transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            border: 1px solid transparent;
          }

          .not-found-btn:hover,
          .not-found-secondary:hover {
            transform: translateY(-1px);
          }

          .not-found-btn {
            background: #1f1f3d;
            color: #ffffff;
            box-shadow: 0 12px 26px rgba(31, 31, 61, 0.14);
          }

          .not-found-secondary {
            background: #ffffff;
            color: #ff0048;
            border-color: #d1d5db;
          }

          .not-found-footnote {
            margin-top: 34px;
            color: #94a3b8;
            font-size: 15px;
          }

          @media (max-width: 640px) {
            .not-found-page {
              padding: 12px;
            }

            .not-found-card {
              padding: 56px 18px 64px;
              border-radius: 14px;
            }

            .not-found-icon {
              width: 52px;
              height: 52px;
              margin-bottom: 18px;
            }

            .not-found-card p {
              font-size: 16px;
              line-height: 1.7;
            }

            .not-found-btn,
            .not-found-secondary {
              width: 100%;
              min-width: 0;
            }
          }
        `}</style>

        <div className="not-found-card">
          <div className="not-found-icon" aria-hidden="true">
            <img src={logoGlyph} alt="UniTix" />
          </div>

          <h1>Oops! Page Not Found</h1>
          <p>
            The page you&apos;re looking for seems to have gone off-track.
            It may have ended, been removed, or the link may be incorrect.
          </p>

          <div className="not-found-actions">
            <Link to="/events" className="not-found-btn">
              Browse events
            </Link>

            <Link to="/" className="not-found-secondary">
              Back to home
            </Link>
          </div>

          <div className="not-found-footnote">If you believe this is an error, please contact support.</div>
        </div>
      </div>
    </>
  );
};

export default NotFound;