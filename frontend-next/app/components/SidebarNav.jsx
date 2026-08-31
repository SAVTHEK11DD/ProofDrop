"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/create",
    label: "Create proof",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5z" />
        <path d="M12 2v5h5" />
        <line x1="10" y1="10" x2="10" y2="15" />
        <line x1="7.5" y1="12.5" x2="12.5" y2="12.5" />
      </svg>
    ),
  },
  {
    href: "/verify",
    label: "Verify file",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L3 5v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V5l-7-3z" />
        <path d="M7.5 10l2 2 3.5-3.5" />
      </svg>
    ),
  },
];

import SocialLinks from "./SocialLinks";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="sideNav" aria-label="Sidebar navigation">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              className={isActive ? "active" : ""}
              href={href}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="sideNavIcon" aria-hidden="true">
                {icon}
              </span>
              <span className="sideNavLabel">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebarFooter">
        <SocialLinks className="sidebarSocials" size={17} />
      </div>
    </>
  );
}
