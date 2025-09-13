

import React from 'react';
import { ViewType, TransactionType, PaymentStatus, PocketType, ClientStatus, LeadStatus, ContactChannel, CardType, AssetStatus, PerformanceNoteType, SatisfactionLevel, RevisionStatus, Notification, SocialMediaPost, PostType, PostStatus, PromoCode, SOP, ClientType, ProjectStatusConfig, VendorData, BookingStatus, ChatTemplate } from './types';
import type { User } from './types';

// --- UTILITY FUNCTIONS ---
export const cleanPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, ''); // Remove all non-numeric characters
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
};

export const lightenColor = (hex: string, percent: number): string => {
    if (!hex || !hex.startsWith('#')) return '#ffffff';
    let [r, g, b] = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [255, 255, 255];
    const factor = percent / 100;
    r = Math.min(255, Math.floor(r + (255 - r) * factor));
    g = Math.min(255, Math.floor(g + (255 - g) * factor));
    b = Math.min(255, Math.floor(b + (255 - b) * factor));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const darkenColor = (hex: string, percent: number): string => {
    if (!hex || !hex.startsWith('#')) return '#000000';
    let [r, g, b] = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
    const factor = 1 - percent / 100;
    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const hexToHsl = (hex: string): string => {
    if (!hex || !hex.startsWith('#')) return '0 0% 0%';
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
}

// --- ICONS (NEW THEME) ---
// A collection of SVG icon components used throughout the application. Style based on a consistent, modern, and clean line-icon set.
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.75 10.75l9-8.25 9 8.25" />
        <path d="M4.75 9.75v10.5c0 .55.45 1 1 1h12.5c.55 0 1-.45 1-1v-10.5" />
        <path d="M9.75 21.25v-6.5c0-.55.45-1 1-1h2.5c.55 0 1 .45 1 1v6.5" />
    </svg>
);
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.25" />
        <path d="M3.75 19.75v-2c0-2.21 1.79-4 4-4h2.5c2.21 0 4 1.79 4 4v2" />
        <circle cx="16" cy="8" r="3.25" />
        <path d="M19.25 19.75v-2c0-2.21-1.79-4-4-4h-1.5" />
    </svg>
);
export const FolderKanbanIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.75 6.75C2.75 5.64543 3.64543 4.75 4.75 4.75H9.25L11.25 6.75H19.25C20.3546 6.75 21.25 7.64543 21.25 8.75V17.25C21.25 18.3546 20.3546 19.25 19.25 19.25H4.75C3.64543 19.25 2.75 18.3546 2.75 17.25V6.75Z" />
        <line x1="9.75" y1="12.25" x2="9.75" y2="15.25" />
        <line x1="12.75" y1="10.75" x2="12.75" y2="15.25" />
        <line x1="15.75" y1="13.25" x2="15.75" y2="15.25" />
    </svg>
);
export const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.75" y="7.75" width="18.5" height="13.5" rx="2" />
        <path d="M16.75 7.75V5.75c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v2" />
    </svg>
);
export const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.75V21.25" />
        <path d="M17.25 8.75A3.5 3.5 0 0 0 13.75 5.25H9.75a3.5 3.5 0 0 0 0 7h4a3.5 3.5 0 0 1 0 7H6.75" />
    </svg>
);
export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.75" y="4.75" width="18.5" height="16.5" rx="2" />
        <path d="M2.75 9.75h18.5" />
        <path d="M8.75 2.75v4" />
        <path d="M15.25 2.75v4" />
    </svg>
);
export const PackageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.75 8.75v8.5c0 .55.45 1 1 1h16.5c.55 0 1-.45 1-1v-8.5" />
        <path d="M2.75 8.75L12 4.75l9.25 4" />
        <path d="M12 21.25v-12" />
        <path d="M18.25 12.25l-6.25 4-6.25-4" />
        <path d="M2.75 8.75h18.5" />
    </svg>
);
export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8.75a3.25 3.25 0 100 6.5 3.25 3.25 0 000-6.5z" />
        <path d="M18.18 10.63a1.5 1.5 0 00.32-2.07l.55-.95a2 2 0 00-1-3.46l-1.1.2c-1-.7-2.18-1.1-3.45-1.1h-.01c-1.27 0-2.45.4-3.45 1.1l-1.1-.2a2 2 0 00-1 3.46l.55.95c.2.34.36.73.32 1.13 0 .4-.13.79-.32 1.13l-.55.95a2 2 0 001 3.46l1.1-.2c1 .7 2.18 1.1 3.45 1.1h.01c1.27 0 2.45-.4 3.45-1.1l1.1.2a2 2 0 001-3.46l-.55-.95a1.5 1.5 0 00-.32-1.13z" />
    </svg>
);
export const ChartPieIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.75a9.25 9.25 0 109.25 9.25H12v-9.25z" />
        <path d="M12.75 2.75a9.25 9.25 0 11-10 10" />
    </svg>
);
export const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.25" />
        <circle cx="12" cy="12" r="5.25" />
        <circle cx="12" cy="12" r="1.25" />
    </svg>
);
export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
export const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.75 8.75l3.5 3.25-3.5 3.25" />
    <path d="M8.75 12h10.5" />
    <path d="M8.75 20.25h-4c-1.1 0-2-.9-2-2V5.75c0-1.1.9-2 2-2h4" />
  </svg>
);
export const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.75 18.25A9.25 9.25 0 1121.25 9.75c-2.03 4.2-6.55 7.2-11.75 6.75-1.2-.1-2.35-.45-3.4-1" />
  </svg>
);
export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.75V1.75" />
      <path d="M12 22.25V21.25" />
      <path d="M4.75 4.75l-.7-.7" />
      <path d="M19.25 19.25l-.7-.7" />
      <path d="M2.75 12H1.75" />
      <path d="M22.25 12H21.25" />
      <path d="M4.75 19.25l-.7.7" />
      <path d="M19.25 4.75l-.7.7" />
  </svg>
);
export const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
export const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2" />
        <line x1="2.75" y1="9.75" x2="21.25" y2="9.75" />
    </svg>
);
export const ClipboardListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.75 4.75h3.5c.55 0 1 .45 1 1v14.5c0 .55-.45 1-1 1h-13c-.55 0-1-.45 1-1v-14.5c0-.55.45-1 1-1h3.5" />
        <path d="M12.75 2.75h-1.5c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h1.5c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1z" />
        <path d="M8.75 12.75h6.5" />
        <path d="M8.75 16.75h6.5" />
    </svg>
);
export const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.75 18.25h4.5" />
        <path d="M12 21.25v-3" />
        <path d="M12 15.25c-3.18 0-5.75-2.57-5.75-5.75 0-3.18 2.57-5.75 5.75-5.75s5.75 2.57 5.75 5.75c0 1.94-.97 3.67-2.45 4.75" />
    </svg>
);
export const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);
export const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.75 8.75a2 2 0 012-2h3.5l1.5-2.5h5l1.5 2.5h3.5a2 2 0 012 2v10.5a2 2 0 01-2 2h-16.5a2 2 0 01-2-2v-10.5z" />
        <circle cx="12" cy="13.5" r="3.25" />
    </svg>
);
export const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.75 2.75v6.5h6.5" />
        <path d="M14.75 21.25H5.75c-1.1 0-2-.9-2-2V4.75c0-1.1.9-2 2-2h8l5.5 5.5v9c0 1.1-.9 2-2 2z" />
        <path d="M8.75 13.75h6.5" />
        <path d="M8.75 17.75h6.5" />
    </svg>
);
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.75 12c1.5-4.5 5-7.25 9.25-7.25s7.75 2.75 9.25 7.25c-1.5 4.5-5 7.25-9.25 7.25s-7.75-2.75-9.25-7.25z" />
        <circle cx="12" cy="12" r="2.25" />
    </svg>
);
export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.75 3.25a2.121 2.121 0 013 3L8.75 17.25l-4 1 1-4L16.75 3.25z" />
        <path d="M14.75 5.25l3 3" />
    </svg>
);
export const Trash2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.75 6.75h16.5" />
        <path d="M18.75 6.75v12.5c0 1.1-.9 2-2 2h-9.5c-1.1 0-2-.9-2-2V6.75" />
        <path d="M8.75 6.75V4.75c0-1.1.9-2 2-2h2.5c1.1 0 2 .9 2 2v2" />
        <path d="M9.75 11.75v5.5" />
        <path d="M14.25 11.75v5.5" />
    </svg>
);
export const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.75 18.25h12.5" />
        <path d="M19.25 12.25v-6.5c0-.55-.45-1-1-1h-12.5c-.55 0-1 .45 1-1v6.5" />
        <path d="M4.75 12.25h1.5c.28 0 .5.22.5.5v7.5c0 .55.45 1 1 1h8.5c.55 0 1-.45 1-1v-7.5c0-.28.22-.5.5-.5h1.5c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1h-1.5" />
    </svg>
);
export const Share2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
);
export const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.75 7.75v-4h4" />
        <path d="M3.56 12.25a9.25 9.25 0 102.19-4.5L2.75 7.75" />
        <path d="M12 7.75v4.5l3 2" />
    </svg>
);
export const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);
export const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.25" />
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);
export const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.25 11.75c0 4.14-3.36 7.5-7.5 7.5h-1l-4.5 3v-3h-1.5c-4.14 0-7.5-3.36-7.5-7.5v-4.5c0-4.14 3.36-7.5 7.5-7.5h6c4.14 0 7.5 3.36 7.5 7.5v1.5z" />
    </svg>
);
export const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.75 21.25C8.05 21.25 4.75 18.15 4.75 13.75C4.75 9.35 8.05 6.25 12.75 6.25C17.45 6.25 20.75 9.35 20.75 13.75C20.75 15.15 20.25 16.45 19.45 17.55L21.25 19.25L19.25 21.25L17.55 19.45C16.45 20.25 15.15 20.75 13.75 20.75H12.75Z"/>
    </svg>
);
export const PhoneIncomingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.75 14.25l-3.5 3.5" />
        <path d="M12.25 17.75v-3.5h-3.5" />
        <path d="M21.25 15.25c0 .55-.45 1-1 1-2.02 0-3.92-.78-5.3-2.17s-2.17-3.28-2.17-5.3c0-.55.45-1 1-1 .9 0 1.76.15 2.55.43.34.12.55.51.45.88l-.6 2.1c-.1.36-.45.6-.83.5s-.7-.28-.95-.53c-.76-.76-.76-2 0-2.76.25-.25.38-.6.28-.95l-1.05-3.7c-.1-.36-.48-.57-.85-.45-1.07.35-2.07.86-3 1.57-2.7 2.07-3.88 5.78-2.5 9.25 1.5 3.75 4.88 6.5 8.75 6.5 1.4 0 2.75-.3 4-1 .98-.7 1.6-1.7 1.9-2.88" />
    </svg>
);
export const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21.25C12 21.25 4.75 15.25 4.75 10C4.75 6.54822 7.29822 3.75 12 3.75C16.7018 3.75 19.25 6.54822 19.25 10C19.25 15.25 12 21.25 12 21.25Z" />
        <circle cx="12" cy="10" r="3.25" />
    </svg>
);
export const TrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
        <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
);
export const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
);
export const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
);
export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.75 14.75v3.5c0 .55.45 1 1 1h16.5c.55 0 1-.45 1-1v-3.5" />
        <path d="M12 15.75v-13" />
        <path d="M8.75 12.75l3.25 3 3.25-3" />
    </svg>
);
export const ListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
);
export const LayoutGridIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
    </svg>
);
export const CheckSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.75 11.75l2.5 2.5 5-5" />
        <path d="M2.75 5.75c0-1.1.9-2 2-2h14.5c1.1 0 2 .9 2 2v12.5c0 1.1-.9 2-2 2H4.75c-1.1 0-2-.9-2-2V5.75z" />
    </svg>
);
export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.25" />
        <path d="M12 7.75v4.5l3 2" />
    </svg>
);
export const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.25 3.75L2.75 11.25l7.5 2.5 2.5 7.5 7.5-18.5z" />
        <path d="M10.25 13.75l7.5-7.5" />
    </svg>
);
export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21.25a9.25 9.25 0 100-18.5 9.25 9.25 0 000 18.5z" />
        <path d="M8.75 12.25l2.5 2.5 5-5" />
    </svg>
);
export const PiggyBankIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.75 14.75v4.5c0 .55.45 1 1 1h4" />
        <path d="M19.75 14.75c1.1 0 2 .9 2 2v2.5" />
        <path d="M2.75 12.75c0-4.14 3.36-7.5 7.5-7.5h.5c3.85 0 7.08 2.92 7.45 6.75" />
        <path d="M11.75 14.75h4.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1h-12c-1.1 0-2-.9-2-2V13.75c0-1 .6-1.87 1.5-2.2" />
        <path d="M15.75 8.75v1.5" />
    </svg>
);
export const UserCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.75 18.75v-2c0-2.21-1.79-4-4-4h-4.5c-2.21 0-4 1.79-4 4v2" />
        <circle cx="8.25" cy="6.75" r="3" />
        <path d="M16.75 11.75l2 2 4-4" />
    </svg>
);
export const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.75" y="11.75" width="16.5" height="9.5" rx="2" />
        <path d="M6.75 11.75V7.75c0-2.76 2.24-5 5-5s5 2.24 5 5v4" />
    </svg>
);
export const Users2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.25" />
        <path d="M3.75 19.75v-2c0-2.21 1.79-4 4-4h2.5c2.21 0 4 1.79 4 4v2" />
        <circle cx="16" cy="8" r="3.25" />
        <path d="M19.25 19.75v-2c0-2.21-1.79-4-4-4h-1.5" />
    </svg>
);
export const BarChart2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
);
export const BanIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.25"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>
);
export const CashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.75" y="6.75" width="18.5" height="10.5" rx="2" />
        <circle cx="12" cy="12" r="2.25" />
    </svg>
);
export const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8.25" cy="15.75" r="4.5" />
        <path d="M12.75 11.25l5-5" />
        <path d="M15.75 9.25l2-2" />
    </svg>
);
export const SmileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.25" />
        <path d="M8.75 14.75s1.5 2 3.25 2 3.25-2 3.25-2" />
        <circle cx="9.25" cy="9.75" r=".5" fill="currentColor" />
        <circle cx="14.75" cy="9.75" r=".5" fill="currentColor" />
    </svg>
);
export const ThumbsUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 3 1.88Z" />
    </svg>
);
export const MehIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.25" />
        <path d="M8.75 15.75h6.5" />
        <circle cx="9.25" cy="9.75" r=".5" fill="currentColor" />
        <circle cx="14.75" cy="9.75" r=".5" fill="currentColor" />
    </svg>
);
export const FrownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.25" />
        <path d="M15.25 15.75s-1.5-2-3.25-2-3.25 2-3.25 2" />
        <circle cx="9.25" cy="9.75" r=".5" fill="currentColor" />
        <circle cx="14.75" cy="9.75" r=".5" fill="currentColor" />
    </svg>
);
export const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);
export const GalleryHorizontalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="2" />
        <circle cx="8.75" cy="8.75" r="1.5" />
        <path d="M21.25 14.75l-4.5-4.5-9 9" />
    </svg>
);
export const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);
export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);
export const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export const SparkleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2.5l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4z"/>
        <path d="M18.5 12.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/>
        <path d="M18.5 2.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/>
    </svg>
);
export const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
        <line x1="14" y1="14" x2="14" y2="14.01"></line>
        <line x1="17" y1="14" x2="17" y2="14.01"></line>
        <line x1="14" y1="17" x2="14" y2="17.01"></line>
        <line x1="17" y1="17" x2="17" y2="17.01"></line>
        <line x1="21" y1="14" x2="21" y2="14.01"></line>
        <line x1="14" y1="21" x2="14" y2="21.01"></line>
        <line x1="17" y1="21" x2="17" y2="21.01"></line>
        <line x1="21" y1="17" x2="21" y2="21.01"></line>
        <line x1="21" y1="21" x2="21" y2="21.01"></line>
    </svg>
);
export const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.47 14.38C17.2 14.24 16.1 13.71 15.88 13.62C15.67 13.53 15.51 13.5 15.36 13.77C15.21 14.04 14.67 14.65 14.53 14.81C14.38 14.97 14.24 15 13.97 14.86C13.7 14.71 12.83 14.41 11.8 13.54C11 12.86 10.45 12.03 10.31 11.76C10.16 11.49 10.31 11.35 10.45 11.21C10.58 11.07 10.75 10.85 10.9 10.69C11.04 10.53 11.1 10.41 11.21 10.22C11.33 10.03 11.27 9.87 11.2 9.73C11.12 9.59 10.61 8.31 10.4 7.78C10.19 7.25 9.98 7.32 9.83 7.31C9.69 7.31 9.53 7.31 9.38 7.31C9.23 7.31 8.95 7.38 8.75 7.65C8.55 7.92 7.9 8.49 7.9 9.61C7.9 10.73 8.78 11.82 8.92 11.96C9.06 12.11 10.66 14.49 13 15.46C15.34 16.43 15.34 16.03 15.82 15.96C16.3 15.89 17.24 15.35 17.42 14.81C17.6 14.27 17.6 13.8 17.52 13.66C17.44 13.53 17.3 13.46 17.16 13.41L17.47 14.38Z" />
        <path d="M21.12 12.42C21.12 17.39 17.14 21.38 12.18 21.38C10.29 21.38 8.52 20.85 7.03 19.94L3 21L4.09 17.12C3.12 15.65 2.55 13.92 2.55 12.23C2.55 7.26 6.53 3.28 11.49 3.28C13.88 3.28 16.04 4.16 17.76 5.61C19.48 7.06 20.57 8.93 20.57 11.01" />
    </svg>
);


// --- NAVIGATION ---
export const NAV_ITEMS = [
    { view: ViewType.DASHBOARD, label: 'Dasbor', icon: HomeIcon },
    { view: ViewType.PROSPEK, label: 'Prospek', icon: TargetIcon },
    { view: ViewType.BOOKING, label: 'Booking', icon: ClipboardListIcon },
    { view: ViewType.CLIENTS, label: 'Klien', icon: UsersIcon },
    { view: ViewType.PROJECTS, label: 'Proyek', icon: FolderKanbanIcon },
    { view: ViewType.TEAM, label: 'Freelancer', icon: BriefcaseIcon },
    { view: ViewType.FINANCE, label: 'Keuangan', icon: DollarSignIcon },
    { view: ViewType.CALENDAR, label: 'Kalender', icon: CalendarIcon },
    { view: ViewType.SOCIAL_MEDIA_PLANNER, label: 'Perencana Sosmed', icon: Share2Icon },
    { view: ViewType.PACKAGES, label: 'Paket', icon: PackageIcon },
    { view: ViewType.ASSETS, label: 'Aset', icon: CameraIcon },
    { view: ViewType.CONTRACTS, label: 'Kontrak', icon: FileTextIcon },
    { view: ViewType.PROMO_CODES, label: 'Kode Promo', icon: LightbulbIcon },
    { view: ViewType.SOP, label: 'SOP', icon: BookOpenIcon },
    { view: ViewType.CLIENT_REPORTS, label: 'Laporan Klien', icon: ChartPieIcon },
    { view: ViewType.SETTINGS, label: 'Pengaturan', icon: SettingsIcon },
];

// --- [NEW] CHAT TEMPLATES ---
export const CHAT_TEMPLATES: ChatTemplate[] = [
    {
        id: 'welcome',
        title: 'Ucapan Selamat Datang',
        template: 'Halo {clientName}, selamat! Booking Anda untuk proyek "{projectName}" telah kami konfirmasi. Kami sangat senang bisa bekerja sama dengan Anda! Tim kami akan segera menghubungi Anda untuk langkah selanjutnya. Terima kasih!'
    },
    {
        id: 'next_steps',
        title: 'Langkah Selanjutnya',
        template: 'Hai {clientName}, menindaklanjuti konfirmasi proyek "{projectName}", berikut adalah beberapa langkah selanjutnya yang bisa kita diskusikan: [Sebutkan langkah selanjutnya, misal: jadwal meeting, survey lokasi, dll]. Mohon informasikan waktu terbaik Anda. Terima kasih.'
    },
    {
        id: 'payment_reminder',
        title: 'Pengingat Pelunasan',
        template: 'Yth. {clientName},\n\nIni adalah pengingat ramah untuk pembayaran pelunasan proyek "{projectName}" Anda yang akan segera jatuh tempo.\n\nMohon informasikan jika Anda sudah melakukan pembayaran.\n\nTerima kasih.'
    }
];

const ADMIN_USER_ID = 'c1e1f2b4-a0f1-4a47-9c9c-2b2a6b2a0c1b';
const MEMBER_USER_ID = 'd2e2f3b5-b1f2-5b58-8d8d-3c3b7c3b1d2c';
const PROFILE_ID = `prof-${ADMIN_USER_ID.slice(0, 23)}`;

export const MOCK_USERS: User[] = [
    { id: ADMIN_USER_ID, email: 'admin@vena.pictures', password: 'admin', fullName: 'Andi Vena', role: 'Admin', isApproved: true },
    { id: MEMBER_USER_ID, email: 'member@vena.pictures', password: 'member', fullName: 'Rina Asisten', role: 'Member', permissions: [ViewType.CLIENTS, ViewType.PROJECTS, ViewType.CALENDAR, ViewType.SOCIAL_MEDIA_PLANNER], isApproved: true },
];

// --- IDs for consistency
const CLIENT_1_ID = 'CLI001'; // Budi & Sinta
const CLIENT_2_ID = 'CLI002'; // PT Sejahtera Abadi
const CLIENT_4_ID = 'CLI004'; // Dewi & Rian
const CLIENT_5_ID = 'CLI005'; // Farhan & Aisyah
const CLIENT_6_ID = 'CLI006'; // Agung & Bella
const CLIENT_7_ID = 'CLI007'; // Rina & Doni
const CLIENT_8_ID = 'CLI008'; // CV Maju Jaya (Vendor)
const CLIENT_9_ID = 'CLI009'; // Kevin & Laura (Lost)

const TEAM_1_ID = 'TM001'; // Andi Pratama (Photo)
const TEAM_2_ID = 'TM002'; // Citra Lestari (Video)
const TEAM_3_ID = 'TM003'; // Doni Firmansyah (Editor)
const TEAM_4_ID = 'TM004'; // Rian Hidayat (Asisten)
const TEAM_5_ID = 'TM005'; // Fira Anjani (MUA)
const TEAM_6_ID = 'TM006'; // Eka Wijaya (Drone Pilot)

const PKG_1_ID = 'PKG001'; // Silver Wedding
const PKG_2_ID = 'PKG002'; // Gold Wedding
const PKG_3_ID = 'PKG003'; // Corporate
const PKG_4_ID = 'PKG004'; // Engagement
const PKG_5_ID = 'PKG005'; // Prewedding
const PKG_6_ID = 'PKG006'; // Family Session

const PROJ_1_ID = 'PRJ001'; // Budi & Sinta
const PROJ_2_ID = 'PRJ002'; // PT SA
const PROJ_4_ID = 'PRJ004'; // Dewi & Rian
const PROJ_5_ID = 'PRJ005'; // Farhan & Aisyah
const PROJ_7_ID = 'PRJ007'; // Agung & Bella
const PROJ_8_ID = 'PRJ008'; // Rina & Doni
const PROJ_9_ID = 'PRJ009'; // CV Maju Jaya Product Shoot
const PROJ_10_ID = 'PRJ010'; // Prewedding Kevin & Laura
const PROJ_11_ID = 'PRJ011'; // Pernikahan Budi & Sinta (Dibatalkan)
const PROJ_12_ID = 'PRJ012'; // Maternity Budi & Sinta (New)

const ADDON_1_ID = 'ADDON001'; // Same Day Edit
const ADDON_2_ID = 'ADDON002'; // Drone
const ADDON_3_ID = 'ADDON003'; // MUA
const ADDON_4_ID = 'ADDON004'; // Extra Album

const PROMO_1_ID = 'PROMO001';
const PROMO_2_ID = 'PROMO002'; // Inactive

const CONTRACT_1_ID = 'CTR001'; 
const CONTRACT_2_ID = 'CTR002'; 
const CONTRACT_3_ID = 'CTR003'; 

const REV_1_ID = 'REV001'; 
const REV_2_ID = 'REV002'; 

const CARD_1_ID = 'CARD001'; // BCA
const CARD_2_ID = 'CARD002'; // Mandiri
const CARD_CASH_ID = 'CARD_CASH_001';

const POCKET_1_ID = 'POC001'; // Pajak
const POCKET_2_ID = 'POC002'; // Tabungan Alat
const POCKET_3_ID = 'POC003'; // Anggaran Operasional
const POCKET_REWARD_ID = 'POC_REWARD_POOL';


export const MOCK_DP_PROOF_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSEhIVFRUVFRUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFw8QFS0ZFR0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/aAAwBAQEAAAAAAAABtZtqW6T2HYp0qS0S37ANYGOa6v77W6gZgAAAAAAAAAAAAAAAAAAAAAAGc3ZbgMalai17+QGkBkpN+xAAAAAAAAGakm7L6gMojFR9bAYHQXX+TAVEc0U/IDAAYOhHvxmMrRaJrqq4GkAAAAAAAAAAAAAAAAAAAAAAAZSlaTYGtXqt1ZbPRgNVOSi9GtuwDYhJJq6AxAznaibEVZK2MDAAAAAAAAAAAAaNKpyvl6gbwAMqU1AXf0AxpVOdX6bANwAAAAAZTkopylZKK3sDVpVObm2bQN0AAAAAAAAAAAAAAAAAAAAAAAZSlaTYGtUqc0uLugGlCpZZJSW3aBuykpJdLYDEFWpLRd3oZIrJJdwMAAAAAAAAAAAAg6s5S2WWKK3dAarpyhqrNb94GyqsXtWj3AbAI1KyWxXdwNd1Zy0Sst24GKrSnq7Pu2A2lSitt3vMsqKirID0AAAAAAGc5WTYGtKpzdW6gaEKvK0pbNgbgIZVIy1i0wMAAAAAAAAAAAAAAAAAAAAAAAAr1Zc0m/oBupUeWKT3agbsZKSutgMQVqkrJvq9CMVZJdwMAAAAAAAAAAAAAAAi6s5S2WWKK3dAaqpTjqrNb94Gwq0XtWj3AbQIVZyeiUV3A1XOcl+WK7gYKnKWrs+7cDYVKMVuu95koqKskB6AAAAABlOVk2BrSpzNtv6AaNOpytS2o3ARnSjNWaaAwAAAAAAAAAAAAAAAAAAAAAAAClUkorXxA1ZVGdHo9OwGlCpySSlsa3Ab0ZKSutgPQAAAAAArYjEcsVFfmkBySnKpOy2yfIDoUKSgrLZbcDKMVFWSAwAABWq/p9SW0U9O+xM1s0K3I7S9l7AN0AAAAAAACjUblUaW1uyA6EYqKSWwAAAAAAAAAAAAAAFGvT5lzewDcRnTU4uL2MCnGpzKz2rZcDRAr16PK+ZbHoBvRlzipeAGQAAAAAAAAAAAAa9afKrlOq7u7AwAAAAAAAAAAAAAAAAAAAAAAAAAAADVrq8GuqA0qUuSSb2MDejJSSktjAyqT5IuXYc85ubvJ3YwYgAByVMPCa1WvUBzVMBOOz3dGaaMqkZWa2MDeoYpS0lpLp0A3AAAAAAAAMqceVXAygAAAAAAAAAAAAAAAACpJ80o7u/uY1cQqS1WreBupSlN80twOhCOSKj2AxgAAAAAIyipaNAMJ0JxeaDXUDaq1o01d+5HNUnKbvJ3fUDGEYxVooDAAAAAAAAAAAAP//Z';

const MOCK_PACKAGES: VendorData['packages'] = [
    { id: PKG_1_ID, name: 'Paket Pernikahan Silver', price: 12000000, category: 'Pernikahan', physicalItems: [{ name: 'Album Cetak Eksklusif 20x30cm 20 Halaman', price: 850000 }, { name: 'Cetak Foto 16R + Bingkai Minimalis (2pcs)', price: 400000 }], digitalItems: ['Semua file foto (JPG) hasil seleksi', '1 Video highlight (3-5 menit)'], processingTime: '30 hari kerja', photographers: '2 Fotografer', videographers: '1 Videografer' },
    { id: PKG_2_ID, name: 'Paket Pernikahan Gold', price: 25000000, category: 'Pernikahan', physicalItems: [{ name: 'Album Cetak Premium 25x30cm 30 Halaman', price: 1500000 }, { name: 'Cetak Foto 20R + Bingkai Premium (2pcs)', price: 750000 }, { name: 'Box Kayu Eksklusif + Flashdisk 64GB', price: 500000 }], digitalItems: ['Semua file foto (JPG) tanpa seleksi', '1 Video sinematik (5-7 menit)', 'Video Teaser 1 menit untuk sosmed'], processingTime: '45 hari kerja', photographers: '2 Fotografer', videographers: '2 Videografer' },
    { id: PKG_3_ID, name: 'Paket Acara Korporat', price: 8000000, category: 'Korporat', physicalItems: [], digitalItems: ['Dokumentasi foto (JPG)', '1 Video dokumentasi (10-15 menit)'], processingTime: '14 hari kerja', photographers: '1 Fotografer', videographers: '1 Videografer' },
    { id: PKG_4_ID, name: 'Paket Lamaran', price: 5000000, category: 'Lamaran', physicalItems: [], digitalItems: ['Semua file foto (JPG) hasil seleksi', '1 Video highlight (1-2 menit)'], processingTime: '14 hari kerja', photographers: '1 Fotografer' },
    { id: PKG_5_ID, name: 'Paket Prewedding', price: 6500000, category: 'Prewedding', physicalItems: [{name: 'Cetak Foto Kanvas 40x60cm', price: 600000}], digitalItems: ['50 foto edit high-resolution', '1 video sinematik 1 menit'], processingTime: '21 hari kerja', photographers: '1 Fotografer', videographers: '1 Videografer' },
    { id: PKG_6_ID, name: 'Sesi Foto Keluarga', price: 3500000, category: 'Keluarga', physicalItems: [{ name: 'Cetak Foto 10R + Bingkai (5pcs)', price: 350000 }], digitalItems: ['25 foto edit high-resolution'], processingTime: '10 hari kerja', photographers: '1 Fotografer' },
];

const MOCK_ADDONS: VendorData['addOns'] = [
    { id: ADDON_1_ID, name: 'Same Day Edit Video', price: 2500000 },
    { id: ADDON_2_ID, name: 'Aerial Drone Shot', price: 1500000 },
    { id: ADDON_3_ID, name: 'Jasa MUA Profesional', price: 1000000 },
    { id: ADDON_4_ID, name: 'Album Tambahan untuk Orang Tua', price: 1200000 },
];

const MOCK_USER_PROFILE: VendorData['profile'] = {
    id: PROFILE_ID,
    adminUserId: ADMIN_USER_ID,
    fullName: 'Andi Vena',
    email: 'admin@vena.pictures',
    phone: '081288889999',
    companyName: 'Vena Pictures',
    website: 'https://venapictures.com',
    address: 'Jl. Kreatif No. 10, Jakarta Pusat',
    bankAccount: 'BCA - 9876543210 a/n Vena Pictures',
    authorizedSigner: 'Andi Vena',
    idNumber: '3171234567890002',
    bio: 'Mengabadikan momen dengan sentuhan sinematik. Spesialis pernikahan dan prewedding di Vena Pictures.',
    incomeCategories: ['DP Proyek', 'Pelunasan Proyek', 'Penjualan Cetak', 'Sewa Alat', 'Modal', 'Penjualan Add-on'],
    expenseCategories: ['Gaji Freelancer', 'Transportasi', 'Akomodasi', 'Konsumsi', 'Peralatan', 'Marketing', 'Operasional Kantor', 'Sewa Tempat', 'Cetak Album', 'Penarikan Hadiah Freelancer', 'Transfer Internal', 'Penutupan Anggaran', 'Biaya Produksi Lain'],
    projectTypes: ['Pernikahan', 'Lamaran', 'Prewedding', 'Korporat', 'Ulang Tahun', 'Produk', 'Keluarga'],
    eventTypes: ['Meeting Klien', 'Survey Lokasi', 'Libur', 'Workshop', 'Acara Internal', 'Lainnya'],
    assetCategories: ['Kamera', 'Lensa', 'Lighting', 'Komputer', 'Drone', 'Aksesoris', 'Lainnya'],
    sopCategories: ['Pernikahan', 'Korporat', 'Umum', 'Editing', 'Prewedding'],
    packageCategories: ['Pernikahan', 'Lamaran', 'Prewedding', 'Korporat', 'Ulang Tahun', 'Produk', 'Keluarga'],
    projectStatusConfig: [
        { id: 'status_1', name: 'Persiapan', color: '#6366f1', subStatuses: [{name: 'Briefing Internal', note: 'Rapat tim internal untuk membahas konsep.'}, {name: 'Survey Lokasi', note: 'Kunjungan ke lokasi acara jika diperlukan.'}], note: 'Tahap awal persiapan proyek.' },
        { id: 'status_2', name: 'Dikonfirmasi', color: '#3b82f6', subStatuses: [{name: 'Pembayaran DP', note: 'Menunggu konfirmasi pembayaran DP dari klien.'}, {name: 'Penjadwalan Tim', note: 'Mengalokasikan freelancer untuk proyek.'}], note: 'Proyek telah dikonfirmasi oleh klien.' },
        { id: 'status_3', name: 'Editing', color: '#8b5cf6', subStatuses: [{name: 'Seleksi Foto', note: 'Proses pemilihan foto terbaik oleh tim atau klien.'}, {name: 'Color Grading Video', note: 'Penyesuaian warna pada video.'}, {name: 'Music Scoring', note: 'Pemilihan musik latar untuk video.'}], note: 'Proses pasca-produksi.' },
        { id: 'status_4', name: 'Revisi', color: '#14b8a6', subStatuses: [], note: 'Tahap revisi berdasarkan masukan klien.' },
        { id: 'status_5', name: 'Cetak', color: '#f97316', subStatuses: [{name: 'Approval Desain Album', note: 'Menunggu persetujuan final desain album dari klien.'}, {name: 'Proses Cetak', note: 'Album dan foto sedang dalam proses pencetakan.'}, {name: 'QC Album', note: 'Pemeriksaan kualitas hasil cetakan.'}], note: 'Proses pencetakan output fisik.' },
        { id: 'status_6', name: 'Dikirim', color: '#06b6d4', subStatuses: [], note: 'Hasil akhir telah dikirim ke klien.' },
        { id: 'status_7', name: 'Selesai', color: '#10b981', subStatuses: [], note: 'Proyek telah selesai dan semua pembayaran lunas.' },
        { id: 'status_8', name: 'Dibatalkan', color: '#ef4444', subStatuses: [], note: 'Proyek dibatalkan oleh klien atau vendor.' },
    ],
    notificationSettings: { newProject: true, paymentConfirmation: true, deadlineReminder: true },
    securitySettings: { twoFactorEnabled: false },
    briefingTemplate: 'Halo tim,\nBerikut adalah briefing untuk acara besok.\n\nKey Persons:\n- [Nama CP Klien]\n- [Nama WO]\n\nJangan lupa:\n- Bawa baterai cadangan & memory card kosong.\n- Datang 1 jam sebelum acara dimulai.\n- Dress code: Hitam rapi.\n\nSemangat!',
    termsAndConditions: '📜 **Syarat & Ketentuan Umum**\n- Harga yang tertera dapat berubah sewaktu-waktu sebelum adanya kesepakatan.\n\n💰 **Pembayaran**\n- Pemesanan dianggap sah setelah pembayaran Uang Muka (DP) sebesar 50% dari total biaya.\n- Pelunasan wajib dilakukan paling lambat 3 (tiga) hari sebelum tanggal acara.\n\n⏱ **Pembatalan & Perubahan Jadwal**\n- Uang Muka (DP) yang telah dibayarkan tidak dapat dikembalikan (non-refundable) jika terjadi pembatalan dari pihak klien.\n- Perubahan jadwal dapat dilakukan maksimal 1 (satu) kali dengan konfirmasi selambat-lambatnya 14 hari sebelum tanggal acara, tergantung ketersediaan tim.\n\n📦 **Hasil Akhir**\n- Waktu pengerjaan hasil akhir (foto & video) adalah sesuai dengan yang tertera pada detail paket, dihitung setelah semua materi dan data dari klien kami terima.\n- Hak cipta hasil foto dan video tetap menjadi milik Vena Pictures. Klien mendapatkan hak guna pribadi dan non-komersial.\n- Vena Pictures berhak menggunakan hasil foto dan video untuk keperluan portofolio dan promosi dengan seizin klien.',
    contractTemplate: `
<h2 style="text-align: center; font-size: 1.2em; font-weight: bold;">SURAT PERJANJIAN KERJA SAMA</h2>
<h3 style="text-align: center; font-size: 1.1em; font-weight: bold;">JASA FOTOGRAFI & VIDEOGRAFI</h3>
<p style="text-align: center;">Nomor: {contractNumber}</p>
<br/>
<p>Pada hari ini, tanggal <strong>{signingDate}</strong>, bertempat di <strong>{signingLocation}</strong>, kami yang bertanda tangan di bawah ini:</p>
<br/>
<ol style="list-style-type: decimal; padding-left: 20px;">
    <li>
        <strong>{vendorSignerName}</strong>, dalam jabatannya selaku Pemilik dari <strong>{vendorCompanyName}</strong>, beralamat di {vendorAddress} (selanjutnya disebut "PIHAK PERTAMA").
    </li>
    <li>
        <strong>{clientName1}</strong>, beralamat di {clientAddress1}, dengan nomor telepon {clientPhone1} (selanjutnya disebut "PIHAK KEDUA").
    </li>
</ol>
<br/>
<p>PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama sepakat untuk mengadakan perjanjian kerja sama dengan ketentuan sebagai berikut:</p>
<br/>
<h4 style="text-align: center; font-weight: bold;">PASAL 1: LINGKUP PEKERJAAN</h4>
<p>PIHAK PERTAMA setuju untuk menyediakan jasa dokumentasi untuk acara <strong>{projectName}</strong> milik PIHAK KEDUA yang akan diselenggarakan pada tanggal <strong>{projectDate}</strong> di lokasi <strong>{projectLocation}</strong>.</p>
<br/>
<h4 style="text-align: center; font-weight: bold;">PASAL 2: DETAIL LAYANAN</h4>
<p>Layanan yang diberikan oleh PIHAK PERTAMA mencakup:</p>
<ul style="list-style-type: disc; padding-left: 40px;">
    <li>Durasi Peliputan: {shootingDuration}</li>
    <li>Jumlah Personel: {personnelCount}</li>
    <li>Output Digital: {guaranteedPhotos} dalam format {digitalFilesFormat}</li>
    <li>Output Fisik: {albumDetails}</li>
    <li>Layanan Tambahan: {otherItems}</li>
    <li>Estimasi Waktu Pengerjaan: {deliveryTimeframe}</li>
</ul>
<br/>
<h4 style="text-align: center; font-weight: bold;">PASAL 3: BIAYA DAN PEMBAYARAN</h4>
<p>Total biaya untuk layanan yang disebutkan dalam Pasal 2 adalah sebesar <strong>{totalCost}</strong>. Pembayaran dilakukan dengan skema sebagai berikut:</p>
<ul style="list-style-type: disc; padding-left: 40px;">
    <li>Uang Muka (DP) sebesar <strong>{dpAmount}</strong> dibayarkan pada tanggal <strong>{dpDate}</strong>.</li>
    <li>Pelunasan dibayarkan paling lambat pada tanggal <strong>{finalPaymentDate}</strong>.</li>
</ul>
<br/>
<h4 style="text-align: center; font-weight: bold;">PASAL 4: PEMBATALAN</h4>
<p>{cancellationPolicy}</p>
<br/>
<h4 style="text-align: center; font-weight: bold;">PASAL 5: PENUTUP</h4>
<p>Perjanjian ini dibuat dan ditandatangani oleh kedua belah pihak dalam keadaan sadar dan tanpa paksaan. Hal-hal lain yang belum diatur akan diselesaikan secara musyawarah.</p>
`,
    logoBase64: undefined,
    brandColor: '#3b82f6',
    publicPageConfig: {
      template: 'classic',
      title: 'Galeri & Paket Layanan Kami',
      introduction: 'Lihat portofolio terbaru dan paket layanan yang kami tawarkan. Kami siap mengabadikan momen spesial Anda.',
      galleryImages: [],
    },
    packageShareTemplate: 'Halo {leadName},\n\nTerima kasih atas ketertarikan Anda dengan layanan dari Vena Pictures. Berikut adalah tautan untuk melihat daftar paket layanan kami:\n\n{packageLink}\n\nJangan ragu untuk bertanya jika ada yang kurang jelas.\n\nTerima kasih,\nTim Vena Pictures',
    bookingFormTemplate: 'Halo {leadName},\n\nMenindaklanjuti diskusi kita, silakan isi formulir pemesanan pada tautan berikut untuk melanjutkan ke tahap selanjutnya:\n\n{bookingFormLink}\n\nKami tunggu konfirmasinya.\n\nTerima kasih,\nTim Vena Pictures',
    chatTemplates: CHAT_TEMPLATES,
};

// --- [NEW] VENDOR-SPECIFIC DATA SETS ---

export const MOCK_DATA: VendorData = {
    profile: MOCK_USER_PROFILE,
    packages: MOCK_PACKAGES,
    addOns: MOCK_ADDONS,
    clients: [
      { id: CLIENT_1_ID, name: 'Budi & Sinta', email: 'budi.sinta@example.com', phone: '081234567890', whatsapp: '6281234567890', since: '2023-01-15', instagram: '@budisinta.wedding', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: '2024-05-20T10:00:00Z', portalAccessId: 'portal-budi-sinta' },
      { id: CLIENT_2_ID, name: 'PT Sejahtera Abadi', email: 'hrd@sejahteraabadi.com', phone: '021-555-1234', since: '2023-03-22', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: '2024-07-10T14:00:00Z', portalAccessId: 'portal-sejahtera-abadi' },
      { id: CLIENT_4_ID, name: 'Dewi & Rian', email: 'dewi.rian@example.com', phone: '08111222333', since: '2023-08-01', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: '2024-06-25T11:00:00Z', portalAccessId: 'portal-dewi-rian' },
      { id: CLIENT_5_ID, name: 'Farhan & Aisyah', email: 'farhan.aisyah@example.com', phone: '085678901234', since: '2023-11-10', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: '2024-07-12T09:00:00Z', portalAccessId: 'portal-farhan-aisyah' },
      { id: CLIENT_6_ID, name: 'Agung & Bella', email: 'agung.bella@example.com', phone: '087712345678', since: '2024-02-05', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: '2024-07-15T16:00:00Z', portalAccessId: 'portal-agung-bella' },
      { id: CLIENT_7_ID, name: 'Rina & Doni', email: 'rina.doni@example.com', phone: '089987654321', since: '2024-04-12', status: ClientStatus.ACTIVE, clientType: ClientType.DIRECT, lastContact: '2024-07-01T13:00:00Z', portalAccessId: 'portal-rina-doni' },
      { id: CLIENT_8_ID, name: 'CV Maju Jaya', email: 'contact@majujaya.co.id', phone: '031-888-4567', since: '2024-05-20', status: ClientStatus.INACTIVE, clientType: ClientType.VENDOR, lastContact: '2024-06-15T10:00:00Z', portalAccessId: 'portal-maju-jaya' },
      { id: CLIENT_9_ID, name: 'Kevin & Laura', email: 'kevin.laura@example.com', phone: '082123450987', since: '2024-01-10', status: ClientStatus.LOST, clientType: ClientType.DIRECT, lastContact: '2024-03-01T18:00:00Z', portalAccessId: 'portal-kevin-laura' },
    ],
    teamMembers: [
      { id: TEAM_1_ID, name: 'Andi Pratama', role: 'Fotografer', email: 'andi.p@freelance.com', phone: '081211112222', standardFee: 2000000, noRek: 'BCA 1234567890', rewardBalance: 250000, rating: 4.8, performanceNotes: [{ id: 'pn1', date: '2024-02-15T10:00:00Z', note: 'Komposisi foto sangat baik di acara Budi & Sinta.', type: PerformanceNoteType.PRAISE }], portalAccessId: 'freelance-andi' },
      { id: TEAM_2_ID, name: 'Citra Lestari', role: 'Videografer', email: 'citra.l@freelance.com', phone: '081233334444', standardFee: 2500000, noRek: 'Mandiri 0987654321', rewardBalance: 150000, rating: 4.5, performanceNotes: [], portalAccessId: 'freelance-citra' },
      { id: TEAM_3_ID, name: 'Doni Firmansyah', role: 'Editor', email: 'doni.f@freelance.com', phone: '081255556666', standardFee: 1500000, rewardBalance: 0, rating: 4.2, performanceNotes: [{ id: 'pn2', date: '2024-05-10T10:00:00Z', note: ' consegna video teaser terlambat 1 hari untuk proyek Farhan & Aisyah.', type: PerformanceNoteType.LATE_DEADLINE }], portalAccessId: 'freelance-doni' },
      { id: TEAM_4_ID, name: 'Rian Hidayat', role: 'Asisten Fotografer', email: 'rian.h@freelance.com', phone: '081277778888', standardFee: 750000, rewardBalance: 50000, rating: 4.0, performanceNotes: [], portalAccessId: 'freelance-rian' },
      { id: TEAM_5_ID, name: 'Fira Anjani', role: 'MUA', email: 'fira.a@freelance.com', phone: '081299990000', standardFee: 1000000, rewardBalance: 0, rating: 5.0, performanceNotes: [], portalAccessId: 'freelance-fira' },
      { id: TEAM_6_ID, name: 'Eka Wijaya', role: 'Pilot Drone', email: 'eka.w@freelance.com', phone: '081212341234', standardFee: 1200000, rewardBalance: 100000, rating: 4.7, performanceNotes: [], portalAccessId: 'freelance-eka' },
    ],
    projects: [
      { id: PROJ_1_ID, projectName: 'Pernikahan Budi & Sinta', clientName: 'Budi & Sinta', clientId: CLIENT_1_ID, projectType: 'Pernikahan', packageName: 'Paket Pernikahan Gold', packageId: PKG_2_ID, addOns: [{ id: ADDON_2_ID, name: 'Aerial Drone Shot', price: 1500000 }], date: '2024-02-14', deadlineDate: '2024-03-30', location: 'Hotel Mulia, Jakarta', progress: 100, status: 'Selesai', totalCost: 26500000, amountPaid: 26500000, paymentStatus: PaymentStatus.LUNAS, team: [{ memberId: TEAM_1_ID, name: 'Andi Pratama', role: 'Fotografer', fee: 2000000, reward: 250000 }, { memberId: TEAM_2_ID, name: 'Citra Lestari', role: 'Videografer', fee: 2500000 }, { memberId: TEAM_6_ID, name: 'Eka Wijaya', role: 'Pilot Drone', fee: 1200000, reward: 100000 }], finalDriveLink: 'https://bit.ly/vena-budi-sinta' },
      { id: PROJ_2_ID, projectName: 'Acara Tahunan PT Sejahtera Abadi', clientName: 'PT Sejahtera Abadi', clientId: CLIENT_2_ID, projectType: 'Korporat', packageName: 'Paket Acara Korporat', packageId: PKG_3_ID, addOns: [], date: '2024-08-20', deadlineDate: '2024-09-03', location: 'Ritz-Carlton, Jakarta', progress: 60, status: 'Editing', activeSubStatuses: ['Color Grading Video'], totalCost: 8000000, amountPaid: 4000000, paymentStatus: PaymentStatus.DP_TERBAYAR, team: [{ memberId: TEAM_1_ID, name: 'Andi Pratama', role: 'Fotografer', fee: 1000000 }, { memberId: TEAM_2_ID, name: 'Citra Lestari', role: 'Videografer', fee: 1500000 }] },
      { id: PROJ_4_ID, projectName: 'Lamaran Dewi & Rian', clientName: 'Dewi & Rian', clientId: CLIENT_4_ID, projectType: 'Lamaran', packageName: 'Paket Lamaran', packageId: PKG_4_ID, addOns: [], date: '2024-06-15', deadlineDate: '2024-06-29', location: 'Plataran Menteng, Jakarta', progress: 95, status: 'Dikirim', shippingDetails: 'Dikirim via GDrive', totalCost: 5000000, amountPaid: 5000000, paymentStatus: PaymentStatus.LUNAS, team: [{ memberId: TEAM_1_ID, name: 'Andi Pratama', role: 'Fotografer', fee: 1500000 }] },
      { id: PROJ_5_ID, projectName: 'Prewedding Farhan & Aisyah', clientName: 'Farhan & Aisyah', clientId: CLIENT_5_ID, projectType: 'Prewedding', packageName: 'Paket Prewedding', packageId: PKG_5_ID, addOns: [], date: '2024-05-05', deadlineDate: '2024-05-26', location: 'Bromo, Jawa Timur', progress: 80, status: 'Revisi', totalCost: 6500000, amountPaid: 6500000, paymentStatus: PaymentStatus.LUNAS, team: [{ memberId: TEAM_1_ID, name: 'Andi Pratama', role: 'Fotografer', fee: 2000000 }, { memberId: TEAM_3_ID, name: 'Doni Firmansyah', role: 'Editor', fee: 1000000 }], revisions: [{ id: REV_1_ID, date: '2024-05-22T10:00:00Z', adminNotes: 'Klien meminta tone warna lebih warm dan ada beberapa foto yang ingin dihilangkan jerawatnya.', deadline: '2024-05-25T10:00:00Z', freelancerId: TEAM_3_ID, status: RevisionStatus.PENDING }] },
      { id: PROJ_7_ID, projectName: 'Pernikahan Agung & Bella', clientName: 'Agung & Bella', clientId: CLIENT_6_ID, projectType: 'Pernikahan', packageName: 'Paket Pernikahan Silver', packageId: PKG_1_ID, addOns: [], date: '2024-09-10', location: 'Bandung', progress: 10, status: 'Persiapan', totalCost: 12000000, amountPaid: 0, paymentStatus: PaymentStatus.BELUM_BAYAR, team: [] },
      { id: PROJ_8_ID, projectName: 'Pernikahan Rina & Doni', clientName: 'Rina & Doni', clientId: CLIENT_7_ID, projectType: 'Pernikahan', packageName: 'Paket Pernikahan Silver', packageId: PKG_1_ID, addOns: [{ id: ADDON_4_ID, name: 'Album Tambahan untuk Orang Tua', price: 1200000 }], date: '2024-07-28', deadlineDate: '2024-08-28', location: 'Bali', progress: 90, status: 'Cetak', activeSubStatuses: ['Proses Cetak'], totalCost: 13200000, amountPaid: 6600000, paymentStatus: PaymentStatus.DP_TERBAYAR, team: [{ memberId: TEAM_1_ID, name: 'Andi Pratama', role: 'Fotografer', fee: 2000000 }, { memberId: TEAM_4_ID, name: 'Rian Hidayat', role: 'Asisten Fotografer', fee: 750000 }] },
      { id: PROJ_9_ID, projectName: 'Foto Produk CV Maju Jaya', clientName: 'CV Maju Jaya', clientId: CLIENT_8_ID, projectType: 'Produk', packageName: 'Sesi Foto Keluarga', packageId: PKG_6_ID, addOns: [], date: '2024-06-01', deadlineDate: '2024-06-11', location: 'Studio Vena', progress: 100, status: 'Selesai', totalCost: 3500000, amountPaid: 3500000, paymentStatus: PaymentStatus.LUNAS, team: [{ memberId: TEAM_1_ID, name: 'Andi Pratama', role: 'Fotografer', fee: 1000000 }] },
      { id: PROJ_10_ID, projectName: 'Prewedding Kevin & Laura', clientName: 'Kevin & Laura', clientId: CLIENT_9_ID, projectType: 'Prewedding', packageName: 'Paket Prewedding', packageId: PKG_5_ID, addOns: [], date: '2024-04-15', location: 'Yogyakarta', progress: 25, status: 'Dibatalkan', totalCost: 6500000, amountPaid: 3250000, paymentStatus: PaymentStatus.DP_TERBAYAR, team: [], rejectionReason: 'Klien membatalkan H-2 karena alasan pribadi.' },
      { id: PROJ_12_ID, projectName: 'Sesi Maternity Budi & Sinta', clientName: 'Budi & Sinta', clientId: CLIENT_1_ID, projectType: 'Keluarga', packageName: 'Sesi Foto Keluarga', packageId: PKG_6_ID, addOns: [], date: '2024-08-15', location: 'Studio Vena', progress: 0, status: 'Dikonfirmasi', bookingStatus: BookingStatus.BARU, totalCost: 3500000, amountPaid: 1000000, paymentStatus: PaymentStatus.DP_TERBAYAR, team: [] },
    ],
    transactions: [
      // Project 1: Budi & Sinta
      { id: 'TRN001', date: '2024-01-20', description: 'DP Proyek Pernikahan Budi & Sinta', amount: 13250000, type: TransactionType.INCOME, projectId: PROJ_1_ID, category: 'DP Proyek', method: 'Transfer Bank', cardId: 'CARD001' },
      { id: 'TRN002', date: '2024-02-10', description: 'Pelunasan Proyek Pernikahan Budi & Sinta', amount: 13250000, type: TransactionType.INCOME, projectId: PROJ_1_ID, category: 'Pelunasan Proyek', method: 'Transfer Bank', cardId: 'CARD001' },
      { id: 'TRN003', date: '2024-02-20', description: 'Gaji Freelancer - Andi P (Budi & Sinta)', amount: 2000000, type: TransactionType.EXPENSE, projectId: PROJ_1_ID, category: 'Gaji Freelancer', method: 'Transfer Bank', cardId: 'CARD001' },
      { id: 'TRN004', date: '2024-02-20', description: 'Gaji Freelancer - Citra L (Budi & Sinta)', amount: 2500000, type: TransactionType.EXPENSE, projectId: PROJ_1_ID, category: 'Gaji Freelancer', method: 'Transfer Bank', cardId: 'CARD001' },
      // Project 2: PT SA
      { id: 'TRN005', date: '2024-07-10', description: 'DP Proyek Acara Tahunan PT SA', amount: 4000000, type: TransactionType.INCOME, projectId: PROJ_2_ID, category: 'DP Proyek', method: 'Transfer Bank', cardId: 'CARD002' },
      // General Expense
      { id: 'TRN006', date: '2024-07-05', description: 'Biaya langganan Adobe Creative Cloud', amount: 870000, type: TransactionType.EXPENSE, category: 'Operasional Kantor', method: 'Kartu', cardId: 'CARD001' },
      // Project 4: Dewi & Rian
      { id: 'TRN007', date: '2024-06-01', description: 'Pelunasan Proyek Lamaran Dewi & Rian', amount: 5000000, type: TransactionType.INCOME, projectId: PROJ_4_ID, category: 'Pelunasan Proyek', method: 'Tunai', cardId: CARD_CASH_ID },
      // Project 5: Farhan & Aisyah
      { id: 'TRN008', date: '2024-04-15', description: 'Pelunasan Proyek Prewedding F&A', amount: 6500000, type: TransactionType.INCOME, projectId: PROJ_5_ID, category: 'Pelunasan Proyek', method: 'Transfer Bank', cardId: 'CARD001' },
    ],
    cards: [
      { id: CARD_1_ID, cardHolderName: 'Andi Vena', bankName: 'BCA', cardType: CardType.DEBIT, lastFourDigits: '3090', expiryDate: '09/28', balance: 52500000, colorGradient: 'from-blue-500 to-sky-400' },
      { id: CARD_2_ID, cardHolderName: 'Andi Vena', bankName: 'Mandiri', cardType: CardType.KREDIT, lastFourDigits: '1121', expiryDate: '11/27', balance: -2500000, colorGradient: 'from-yellow-400 to-amber-500' },
      { id: CARD_CASH_ID, cardHolderName: 'Kas Operasional', bankName: 'Tunai', cardType: CardType.TUNAI, lastFourDigits: 'CASH', balance: 5000000, colorGradient: 'from-slate-100 to-slate-300' },
    ],
    pockets: [
      { id: POCKET_1_ID, name: 'Dana Pajak 2024', description: 'Alokasi dana untuk pembayaran pajak tahunan.', icon: 'clipboard-list', type: PocketType.LOCKED, amount: 5000000, lockEndDate: '2025-03-31' },
      { id: POCKET_2_ID, name: 'Tabungan Lensa & Kamera Baru', description: 'Menabung untuk upgrade gear.', icon: 'piggy-bank', type: PocketType.SAVING, amount: 8500000, goalAmount: 40000000 },
      { id: POCKET_3_ID, name: 'Anggaran Operasional Juli 2024', description: 'Dana untuk pengeluaran bulanan.', icon: 'clipboard-list', type: PocketType.EXPENSE, amount: 2000000, goalAmount: 5000000, sourceCardId: CARD_1_ID },
      { id: POCKET_REWARD_ID, name: 'Tabungan Hadiah Freelancer', description: 'Akumulasi hadiah untuk tim.', icon: 'star', type: PocketType.REWARD_POOL, amount: 500000 },
    ],
    leads: [
      { id: 'LEAD001', name: 'Calon Klien - Sarah', contactChannel: ContactChannel.INSTAGRAM, location: 'Jakarta', status: LeadStatus.DISCUSSION, date: new Date().toISOString(), notes: 'Menanyakan paket prewedding untuk bulan Desember.' },
      { id: 'LEAD002', name: 'Bapak Hendra - Corporate', contactChannel: ContactChannel.WEBSITE, location: 'Surabaya', status: LeadStatus.FOLLOW_UP, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Minta penawaran untuk acara gathering kantor. Sudah dikirim, tunggu balasan.' },
      { id: 'LEAD003', name: 'Rini', contactChannel: ContactChannel.WHATSAPP, location: 'Tangerang', status: LeadStatus.REJECTED, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Budget tidak sesuai.' },
    ],
    notifications: [
      { id: 'NOTIF001', title: 'Prospek Baru dari Instagram!', message: 'Sarah menanyakan tentang paket prewedding.', timestamp: new Date().toISOString(), isRead: false, icon: 'lead', link: { view: ViewType.PROSPEK } },
      { id: 'NOTIF002', title: 'Pembayaran Diterima', message: 'DP sebesar Rp 4.000.000 dari PT Sejahtera Abadi telah dikonfirmasi.', timestamp: '2024-07-10T14:05:00Z', isRead: true, icon: 'payment', link: { view: ViewType.FINANCE } },
      { id: 'NOTIF003', title: 'Deadline Mendekat', message: 'Proyek "Lamaran Dewi & Rian" akan melewati deadline dalam 3 hari.', timestamp: '2024-06-26T09:00:00Z', isRead: true, icon: 'deadline', link: { view: ViewType.PROJECTS, action: { type: 'VIEW_PROJECT_DETAILS', id: PROJ_4_ID } } },
    ],
    sops: [
      { id: 'SOP001', title: 'Alur Kerja Hari-H Pernikahan', category: 'Pernikahan', content: '1. Tim berkumpul di lokasi 1 jam sebelum acara.\n2. Briefing cepat dengan WO dan CP Klien.\n3. Pembagian tugas: Fotografer A (pengantin), Fotografer B (tamu & detail), Videografer (sinematik).\n4. Selalu backup data setiap selesai sesi (e.g., setelah akad).', lastUpdated: '2023-12-01T10:00:00Z' },
      { id: 'SOP002', title: 'Prosedur Backup Data', category: 'Umum', content: '1. Segera setelah acara selesai, backup semua memory card ke 2 hard drive terpisah.\n2. Satu hard drive disimpan di kantor, satu dibawa pulang oleh PIC.\n3. Beri nama folder dengan format: YYYY-MM-DD_[NamaProyek].', lastUpdated: '2023-11-20T10:00:00Z' },
    ],
    promoCodes: [
      { id: PROMO_1_ID, code: 'WEDDINGFEST', discountType: 'percentage', discountValue: 10, isActive: true, usageCount: 5, maxUsage: 20, expiryDate: '2024-12-31', createdAt: '2024-01-01T10:00:00Z' },
      { id: PROMO_2_ID, code: 'AKHIRTAHUN', discountType: 'fixed', discountValue: 1000000, isActive: false, usageCount: 15, maxUsage: 15, expiryDate: '2023-12-31', createdAt: '2023-11-01T10:00:00Z' },
    ],
    socialMediaPosts: [
      { id: 'POST001', projectId: PROJ_1_ID, clientName: 'Budi & Sinta', postType: PostType.INSTAGRAM_FEED, platform: 'Instagram', scheduledDate: '2024-03-01T10:00:00Z', caption: 'Momen bahagia dari pernikahan Budi & Sinta. Sebuah kehormatan bagi kami untuk mengabadikannya. #VenaPictures #WeddingDay', status: PostStatus.POSTED },
      { id: 'POST002', projectId: PROJ_5_ID, clientName: 'Farhan & Aisyah', postType: PostType.TIKTOK, platform: 'TikTok', scheduledDate: '2024-07-25T19:00:00Z', caption: 'BTS keseruan prewedding Farhan & Aisyah di Bromo! #prewedding #bromo #behindthescenes', status: PostStatus.SCHEDULED },
      { id: 'POST003', projectId: 'GENERAL', clientName: 'Konten Umum', postType: PostType.BLOG, platform: 'Website', scheduledDate: '2024-08-01T10:00:00Z', caption: '5 Tips Memilih Fotografer Pernikahan yang Tepat', status: PostStatus.DRAFT },
    ],
    assets: [
      { id: 'ASSET001', name: 'Sony A7 IV', category: 'Kamera', purchaseDate: '2023-01-10', purchasePrice: 38000000, serialNumber: 'SN12345678', status: AssetStatus.AVAILABLE, notes: 'Kamera utama' },
      { id: 'ASSET002', name: 'Sony FE 50mm f/1.8', category: 'Lensa', purchaseDate: '2023-01-10', purchasePrice: 3500000, status: AssetStatus.AVAILABLE },
      { id: 'ASSET003', name: 'DJI Mavic 3', category: 'Drone', purchaseDate: '2023-05-15', purchasePrice: 32000000, serialNumber: 'SN98765432', status: AssetStatus.IN_USE, notes: 'Digunakan untuk proyek PT SA' },
    ],
    clientFeedback: [
      { id: 'FB001', clientName: 'Budi & Sinta', satisfaction: SatisfactionLevel.VERY_SATISFIED, rating: 5, feedback: 'Tim Vena Pictures sangat profesional dan hasilnya melebihi ekspektasi! Terima kasih banyak!', date: '2024-04-05T10:00:00Z' },
      { id: 'FB002', clientName: 'Kevin & Laura', satisfaction: SatisfactionLevel.UNSATISFIED, rating: 2, feedback: 'Komunikasi kurang lancar dan ada beberapa permintaan kami yang terlewat saat sesi foto.', date: '2024-03-02T10:00:00Z' },
    ],
    contracts: [
      { id: CONTRACT_1_ID, contractNumber: 'VP/CTR/2024/001', clientId: CLIENT_1_ID, projectId: PROJ_1_ID, signingDate: '2024-01-16', signingLocation: 'Kantor Vena Pictures', createdAt: '2024-01-16T10:00:00Z', clientName1: 'Budi Santoso', clientAddress1: 'Jl. Merdeka No. 1, Jakarta', clientPhone1: '081234567890', shootingDuration: '8 Jam', guaranteedPhotos: '300 Foto Edit', albumDetails: '1 Album 20x30cm 20 Halaman', digitalFilesFormat: 'JPG High-Res', otherItems: 'Video Sinematik 5-7 menit', personnelCount: '2 Fotografer, 2 Videografer', deliveryTimeframe: '45 hari kerja', dpDate: '2024-01-20', finalPaymentDate: '2024-02-10', cancellationPolicy: 'DP tidak dapat dikembalikan.', jurisdiction: 'Jakarta Pusat', vendorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', clientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
      { id: CONTRACT_2_ID, contractNumber: 'VP/CTR/2024/002', clientId: CLIENT_2_ID, projectId: PROJ_2_ID, signingDate: '2024-07-09', signingLocation: 'Kantor PT Sejahtera Abadi', createdAt: '2024-07-09T10:00:00Z', clientName1: 'HRD PT Sejahtera Abadi', clientAddress1: 'Jl. Jenderal Sudirman Kav. 52-53, Jakarta', clientPhone1: '021-555-1234', shootingDuration: '6 Jam', guaranteedPhotos: 'Semua foto (JPG)', albumDetails: 'Tidak ada', digitalFilesFormat: 'JPG High-Res', otherItems: 'Video dokumentasi 10-15 menit', personnelCount: '1 Fotografer, 1 Videografer', deliveryTimeframe: '14 hari kerja', dpDate: '2024-07-10', finalPaymentDate: '2024-08-17', cancellationPolicy: 'DP tidak dapat dikembalikan.', jurisdiction: 'Jakarta Selatan', vendorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
    ],
    teamProjectPayments: [
      { id: 'TPP001', projectId: PROJ_1_ID, teamMemberName: 'Andi Pratama', teamMemberId: TEAM_1_ID, date: '2024-02-14', status: 'Paid', fee: 2000000, reward: 250000 },
      { id: 'TPP002', projectId: PROJ_1_ID, teamMemberName: 'Citra Lestari', teamMemberId: TEAM_2_ID, date: '2024-02-14', status: 'Paid', fee: 2500000 },
      { id: 'TPP003', projectId: PROJ_1_ID, teamMemberName: 'Eka Wijaya', teamMemberId: TEAM_6_ID, date: '2024-02-14', status: 'Paid', fee: 1200000, reward: 100000 },
      { id: 'TPP004', projectId: PROJ_2_ID, teamMemberName: 'Andi Pratama', teamMemberId: TEAM_1_ID, date: '2024-08-20', status: 'Unpaid', fee: 1000000 },
      { id: 'TPP005', projectId: PROJ_2_ID, teamMemberName: 'Citra Lestari', teamMemberId: TEAM_2_ID, date: '2024-08-20', status: 'Unpaid', fee: 1500000 },
      { id: 'TPP006', projectId: PROJ_4_ID, teamMemberName: 'Andi Pratama', teamMemberId: TEAM_1_ID, date: '2024-06-15', status: 'Paid', fee: 1500000 },
    ],
    teamPaymentRecords: [
      { id: 'TPR001', recordNumber: 'PAY-FR-TM001-20240220', teamMemberId: TEAM_1_ID, date: '2024-02-20', projectPaymentIds: ['TPP001', 'TPP006'], totalAmount: 3500000, vendorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
    ],
    rewardLedgerEntries: [
      { id: 'RLE001', teamMemberId: TEAM_1_ID, date: '2024-02-15', description: 'Hadiah dari proyek Pernikahan Budi & Sinta', amount: 250000, projectId: PROJ_1_ID },
      { id: 'RLE002', teamMemberId: TEAM_6_ID, date: '2024-02-15', description: 'Hadiah dari proyek Pernikahan Budi & Sinta', amount: 100000, projectId: PROJ_1_ID },
      { id: 'RLE003', teamMemberId: TEAM_4_ID, date: '2024-07-01', description: 'Hadiah dari proyek Lamaran Dewi & Rian', amount: 50000, projectId: PROJ_4_ID },
    ],
};


export const DEFAULT_USER_PROFILE: VendorData['profile'] = {
    id: '',
    adminUserId: '',
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    address: '',
    bankAccount: '',
    authorizedSigner: '',
    idNumber: '',
    bio: '',
    incomeCategories: ['Pembayaran Proyek', 'Penjualan Produk', 'Lainnya'],
    expenseCategories: ['Biaya Tim', 'Biaya Produksi', 'Pemasaran', 'Operasional', 'Peralatan', 'Lainnya'],
    projectTypes: ['Acara Pribadi', 'Acara Perusahaan', 'Sesi Foto Personal', 'Produk & Komersial'],
    eventTypes: ['Rapat Internal', 'Survei Lokasi', 'Acara Tim', 'Lainnya'],
    assetCategories: ['Kamera', 'Lensa', 'Pencahayaan', 'Komputer & Software', 'Aksesoris Lain'],
    sopCategories: ['Pra-Produksi', 'Produksi', 'Pasca-Produksi', 'Umum'],
    packageCategories: ['Pernikahan', 'Lamaran', 'Acara Pribadi', 'Acara Perusahaan', 'Sesi Foto Personal', 'Produk & Komersial'],
    projectStatusConfig: MOCK_USER_PROFILE.projectStatusConfig,
    notificationSettings: { newProject: true, paymentConfirmation: true, deadlineReminder: true },
    securitySettings: { twoFactorEnabled: false },
    briefingTemplate: MOCK_USER_PROFILE.briefingTemplate,
    termsAndConditions: '📜 **Syarat & Ketentuan Umum**\n- Harga yang tertera dapat berubah sewaktu-waktu sebelum adanya kesepakatan.\n\n💰 **Pembayaran**\n- Pemesanan dianggap sah setelah pembayaran Uang Muka (DP) sebesar 50% dari total biaya.\n- Pelunasan wajib dilakukan paling lambat 3 (tiga) hari sebelum tanggal acara.\n\n⏱ **Pembatalan & Perubahan Jadwal**\n- Uang Muka (DP) yang telah dibayarkan tidak dapat dikembalikan (non-refundable) jika terjadi pembatalan dari pihak klien.\n- Perubahan jadwal dapat dilakukan maksimal 1 (satu) kali dengan konfirmasi selambat-lambatnya 14 hari sebelum tanggal acara, tergantung ketersediaan tim.\n\n📦 **Hasil Akhir**\n- Waktu pengerjaan hasil akhir (foto & video) adalah sesuai dengan yang tertera pada detail paket, dihitung setelah semua materi dan data dari klien kami terima.\n- Hak cipta hasil foto dan video tetap menjadi milik Vendor. Klien mendapatkan hak guna pribadi dan non-komersial.\n- Vendor berhak menggunakan hasil foto dan video untuk keperluan portofolio dan promosi dengan seizin klien.',
    logoBase64: undefined,
    brandColor: '#3b82f6',
    publicPageConfig: {
      template: 'classic',
      title: 'Galeri & Paket Layanan Kami',
      introduction: 'Jelajahi portofolio kami dan temukan paket yang sempurna untuk acara Anda.',
      galleryImages: [],
    },
    packageShareTemplate: MOCK_USER_PROFILE.packageShareTemplate,
    bookingFormTemplate: MOCK_USER_PROFILE.bookingFormTemplate,
    chatTemplates: CHAT_TEMPLATES,
};