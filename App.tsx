

import React, { useState, useEffect } from 'react';
import { ViewType, Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry, User, Card, Asset, ClientFeedback, Contract, RevisionStatus, NavigationAction, Notification, SocialMediaPost, PromoCode, SOP, CardType, PocketType, VendorData } from './types';
import { MOCK_USERS, DEFAULT_USER_PROFILE, MOCK_DATA, HomeIcon, FolderKanbanIcon, UsersIcon, DollarSignIcon, PlusIcon, lightenColor, darkenColor, hexToHsl } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { Leads } from './components/Leads';
import Booking from './components/Booking';
import Clients from './components/Clients';
import { Projects } from './components/Projects';
import { Freelancers } from './components/Freelancers';
import Finance from './components/Finance';
import Packages from './components/Packages';
import { Assets } from './components/Assets';
import Settings from './components/Settings';
import { CalendarView } from './components/CalendarView';
import Login from './components/Login';
import PublicBookingForm from './components/PublicBookingForm';
import PublicPackages from './components/PublicPackages';
import PublicFeedbackForm from './components/PublicFeedbackForm';
import PublicRevisionForm from './components/PublicRevisionForm';
import PublicLeadForm from './components/PublicLeadForm';
import Header from './components/Header';
import SuggestionForm from './components/SuggestionForm';
import ClientReports from './components/ClientKPI';
import GlobalSearch from './components/GlobalSearch';
import Contracts from './components/Contracts';
import ClientPortal from './components/ClientPortal';
import FreelancerPortal from './components/FreelancerPortal';
import { SocialPlanner } from './components/SocialPlanner';
import PromoCodes from './components/PromoCodes';
import SOPManagement from './components/SOP';
import Homepage from './components/Homepage';

// Supabase integration
import { createSyncedArraySetter, createSyncedObjectSetter, initializeAndLoadAll } from './lib/supabaseSync';
import { supabase } from './lib/supabaseClient';

// Robust persistent state hook that falls back to sessionStorage and an in-memory store
const __inMemoryStore: Record<string, string> = {};

const safeGet = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    // localStorage may be unavailable or full
  }

  try {
    return window.sessionStorage.getItem(key);
  } catch (e) {
    // sessionStorage may be unavailable
  }

  return Object.prototype.hasOwnProperty.call(__inMemoryStore, key) ? __inMemoryStore[key] : null;
};

const safeSet = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
    return;
  } catch (e) {
    // try sessionStorage as a smaller-scope fallback
  }

  try {
    window.sessionStorage.setItem(key, value);
    console.warn(`Fell back to sessionStorage for key "${key}". This will not persist across browser sessions.`);
    return;
  } catch (e) {
    // final fallback: in-memory (lost on reload)
  }

  try {
    __inMemoryStore[key] = value;
    console.warn(`Using in-memory fallback for key "${key}". Data will be lost on reload.`);
  } catch (e) {
    console.warn(`Unable to persist key "${key}" in any storage:`, e);
  }
};

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {

  // initial synchronous state: prefer local/session storage or default
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = safeGet(key);
      if (storedValue) {
        return JSON.parse(storedValue) as T;
      }
      // attempt to persist default (best-effort)
      try {
        safeSet(key, JSON.stringify(defaultValue));
      } catch (e) {
        // ignore
      }
      return defaultValue;
    } catch (error) {
      console.warn(`Error reading persistent key "${key}":`, error);
      return defaultValue;
    }
  });

  // --- IndexedDB lightweight helper ---
  const idbOpen = (dbName = 'vena-db', storeName = 'kv') => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      try {
        const req = window.indexedDB.open(dbName, 1);
        req.onupgradeneeded = (ev) => {
          const db = (ev.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  };

  const idbGet = async (keyName: string) => {
    try {
      const db = await idbOpen();
      return new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction('kv', 'readonly');
        const store = tx.objectStore('kv');
        const req = store.get(keyName);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return null;
    }
  };

  const idbSet = async (keyName: string, value: string) => {
    try {
      const db = await idbOpen();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('kv', 'readwrite');
        const store = tx.objectStore('kv');
        const req = store.put(value, keyName);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      // ignore
    }
  };

  // Sync write: try local/sessionStorage first; then try async idb write as a durable fallback
  useEffect(() => {
    let serialized: string;
    try {
      serialized = JSON.stringify(state);
    } catch (e) {
      console.warn(`Unable to serialize state for key "${key}":`, e);
      return;
    }

    // First attempt synchronous storages
    try {
      safeSet(key, serialized);
    } catch (e) {
      console.warn(`Synchronous persistence failed for key "${key}":`, e);
    }

    // Also attempt an async write to IndexedDB so we have a durable fallback when localStorage is full
    idbSet(key, serialized).catch(() => {
      // ignore idb failures silently
    });
  }, [key, state]);

  // On mount, try to hydrate from IndexedDB if we only had an in-memory value
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const idbVal = await idbGet(key);
        if (!mounted) return;
        if (idbVal) {
          try {
            const parsed = JSON.parse(idbVal) as T;
            // only update if current state matches the default or in-memory placeholder
            setState(prev => {
              // simple equality check: if prev is same as defaultValue or a shallow compare could be used
              // we avoid overwriting deliberate changes
              if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
              return parsed;
            });
          } catch (e) {
            // ignore malformed idb value
          }
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  return [state, setState];
};

const AccessDenied: React.FC<{onBackToDashboard: () => void}> = ({ onBackToDashboard }) => (
    <div className="
        flex flex-col items-center justify-center 
        h-full 
        text-center 
        p-4 sm:p-6 md:p-8
        animate-fade-in
    ">
        <div className="
            w-16 h-16 sm:w-20 sm:h-20
            rounded-full 
            bg-red-100 dark:bg-red-900/20
            flex items-center justify-center
            mb-4 sm:mb-6
        ">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        </div>
        <h2 className="
            text-xl sm:text-2xl 
            font-bold 
            text-red-600 dark:text-red-400 
            mb-2 sm:mb-3
        ">
            Akses Ditolak
        </h2>
        <p className="
            text-brand-text-secondary 
            mb-6 sm:mb-8 
            max-w-md
            leading-relaxed
        ">
            Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <button 
            onClick={onBackToDashboard} 
            className="button-primary"
        >
            Kembali ke Dasbor
        </button>
    </div>
);

const BottomNavBar: React.FC<{ activeView: ViewType; handleNavigation: (view: ViewType) => void }> = ({ activeView, handleNavigation }) => {
    const navItems = [
        { view: ViewType.DASHBOARD, label: 'Beranda', icon: HomeIcon },
        { view: ViewType.PROJECTS, label: 'Proyek', icon: FolderKanbanIcon },
        { view: ViewType.CLIENTS, label: 'Klien', icon: UsersIcon },
        { view: ViewType.FINANCE, label: 'Keuangan', icon: DollarSignIcon },
    ];

    return (
        <nav className="
            bottom-nav 
            xl:hidden
            bg-brand-surface/95 
            backdrop-blur-xl
            border-t border-brand-border/50
        ">
            <div className="
                flex justify-around items-center 
                h-16
                px-2
            " 
            style={{
                paddingBottom: 'var(--safe-area-inset-bottom, 0px)'
            }}>
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => handleNavigation(item.view)}
                        className={`
                            flex flex-col items-center justify-center 
                            w-full h-full
                            px-2 py-2
                            rounded-xl
                            transition-all duration-200 
                            min-w-[64px] min-h-[48px]
                            relative
                            group
                            ${activeView === item.view 
                                ? 'text-brand-accent bg-brand-accent/10' 
                                : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-input/50 active:bg-brand-input'
                            }
                        `}
                        aria-label={item.label}
                    >
                        {/* Enhanced Icon */}
                        <div className="
                            relative
                            mb-1
                        ">
                            <item.icon className={`
                                w-5 h-5 sm:w-6 sm:h-6
                                transition-all duration-200
                                ${activeView === item.view ? 'transform scale-110' : 'group-active:scale-95'}
                            `} />
                            
                            {/* Active indicator dot */}
                            {activeView === item.view && (
                                <div className="
                                    absolute -top-1 -right-1
                                    w-2 h-2
                                    bg-brand-accent
                                    animate-pulse-soft
                                " />
                            )}
                        </div>
                        
                        {/* Enhanced Label */}
                        <span className={`
                            text-xs font-semibold
                            leading-tight
                            transition-all duration-200
                            ${activeView === item.view ? 'font-bold' : ''}
                        `}>
                            {item.label}
                        </span>
                        
                        {/* Background highlight */}
                        <div className={`
                            absolute inset-0
                            rounded-xl
                            transition-all duration-300
                            ${activeView === item.view 
                                ? 'bg-gradient-to-t from-brand-accent/10 to-transparent' 
                                : 'bg-transparent group-hover:bg-brand-input/30'
                            }
                        `} />
                    </button>
                ))}
            </div>
        </nav>
    );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = usePersistentState<boolean>('vena-isAuthenticated', false);
  const [currentUser, setCurrentUser] = usePersistentState<User | null>('vena-currentUser', null);
  const [activeView, setActiveView] = useState<ViewType>(ViewType.HOMEPAGE);
  const [notification, setNotification] = useState<string>('');
  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- State Initialization with Persistence ---
  const [users, setUsers] = usePersistentState<User[]>('vena-users', JSON.parse(JSON.stringify(MOCK_USERS)));
  
  const [clients, setClients] = usePersistentState<Client[]>('vena-clients', JSON.parse(JSON.stringify(MOCK_DATA.clients)));
  const [projects, setProjects] = usePersistentState<Project[]>('vena-projects', JSON.parse(JSON.stringify(MOCK_DATA.projects)));
  const [teamMembers, setTeamMembers] = usePersistentState<TeamMember[]>('vena-teamMembers', JSON.parse(JSON.stringify(MOCK_DATA.teamMembers)));
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('vena-transactions', JSON.parse(JSON.stringify(MOCK_DATA.transactions)));
  const [teamProjectPayments, setTeamProjectPayments] = usePersistentState<TeamProjectPayment[]>('vena-teamProjectPayments', JSON.parse(JSON.stringify(MOCK_DATA.teamProjectPayments)));
  const [teamPaymentRecords, setTeamPaymentRecords] = usePersistentState<TeamPaymentRecord[]>('vena-teamPaymentRecords', JSON.parse(JSON.stringify(MOCK_DATA.teamPaymentRecords)));
  const [pockets, setPockets] = usePersistentState<FinancialPocket[]>('vena-pockets', JSON.parse(JSON.stringify(MOCK_DATA.pockets)));
  const [profile, setProfile] = usePersistentState<Profile>('vena-profile', JSON.parse(JSON.stringify(MOCK_DATA.profile)));
  const [leads, setLeads] = usePersistentState<Lead[]>('vena-leads', JSON.parse(JSON.stringify(MOCK_DATA.leads)));
  const [rewardLedgerEntries, setRewardLedgerEntries] = usePersistentState<RewardLedgerEntry[]>('vena-rewardLedgerEntries', JSON.parse(JSON.stringify(MOCK_DATA.rewardLedgerEntries)));
  const [cards, setCards] = usePersistentState<Card[]>('vena-cards', JSON.parse(JSON.stringify(MOCK_DATA.cards)));
  const [assets, setAssets] = usePersistentState<Asset[]>('vena-assets', JSON.parse(JSON.stringify(MOCK_DATA.assets)));
  const [contracts, setContracts] = usePersistentState<Contract[]>('vena-contracts', JSON.parse(JSON.stringify(MOCK_DATA.contracts)));
  const [clientFeedback, setClientFeedback] = usePersistentState<ClientFeedback[]>('vena-clientFeedback', JSON.parse(JSON.stringify(MOCK_DATA.clientFeedback)));
  const [notifications, setNotifications] = usePersistentState<Notification[]>('vena-notifications', JSON.parse(JSON.stringify(MOCK_DATA.notifications)));
  const [socialMediaPosts, setSocialMediaPosts] = usePersistentState<SocialMediaPost[]>('vena-socialMediaPosts', JSON.parse(JSON.stringify(MOCK_DATA.socialMediaPosts)));
  const [promoCodes, setPromoCodes] = usePersistentState<PromoCode[]>('vena-promoCodes', JSON.parse(JSON.stringify(MOCK_DATA.promoCodes)));
  const [sops, setSops] = usePersistentState<SOP[]>('vena-sops', JSON.parse(JSON.stringify(MOCK_DATA.sops)));
  const [packages, setPackages] = usePersistentState<Package[]>('vena-packages', JSON.parse(JSON.stringify(MOCK_DATA.packages)));
  const [addOns, setAddOns] = usePersistentState<AddOn[]>('vena-addOns', JSON.parse(JSON.stringify(MOCK_DATA.addOns)));

  // Supabase: create synced wrappers for CRUD
  const setUsersSynced = createSyncedArraySetter<User>('users', setUsers)
  const setClientsSynced = createSyncedArraySetter<Client>('clients', setClients)
  const setProjectsSynced = createSyncedArraySetter<Project>('projects', setProjects)
  const setTeamMembersSynced = createSyncedArraySetter<TeamMember>('team_members', setTeamMembers)
  const setTransactionsSynced = createSyncedArraySetter<Transaction>('transactions', setTransactions)
  const setTeamProjectPaymentsSynced = createSyncedArraySetter<TeamProjectPayment>('team_project_payments', setTeamProjectPayments)
  const setTeamPaymentRecordsSynced = createSyncedArraySetter<TeamPaymentRecord>('team_payment_records', setTeamPaymentRecords)
  const setPocketsSynced = createSyncedArraySetter<FinancialPocket>('financial_pockets', setPockets)
  const setProfileSynced = createSyncedObjectSetter<Profile>('profiles', setProfile)
  const setLeadsSynced = createSyncedArraySetter<Lead>('leads', setLeads)
  const setRewardLedgerEntriesSynced = createSyncedArraySetter<RewardLedgerEntry>('reward_ledger_entries', setRewardLedgerEntries)
  const setCardsSynced = createSyncedArraySetter<Card>('cards', setCards)
  const setAssetsSynced = createSyncedArraySetter<Asset>('assets', setAssets)
  const setContractsSynced = createSyncedArraySetter<Contract>('contracts', setContracts)
  const setClientFeedbackSynced = createSyncedArraySetter<ClientFeedback>('client_feedback', setClientFeedback)
  const setNotificationsSynced = createSyncedArraySetter<Notification>('notifications', setNotifications)
  const setSocialMediaPostsSynced = createSyncedArraySetter<SocialMediaPost>('social_media_posts', setSocialMediaPosts)
  const setPromoCodesSynced = createSyncedArraySetter<PromoCode>('promo_codes', setPromoCodes)
  const setSopsSynced = createSyncedArraySetter<SOP>('sops', setSops)
  const setPackagesSynced = createSyncedArraySetter<Package>('packages', setPackages)
  const setAddOnsSynced = createSyncedArraySetter<AddOn>('add_ons', setAddOns)


    // --- [NEW] MOCK EMAIL SERVICE ---
    const sendEmailNotification = (recipientEmail: string, notification: Notification) => {
        console.log(`
        ========================================
        [SIMULASI EMAIL] Mengirim notifikasi ke: ${recipientEmail}
        ----------------------------------------
        Judul: ${notification.title}
        Pesan: ${notification.message}
        Waktu: ${new Date(notification.timestamp).toLocaleString('id-ID')}
        ========================================
        `);
    };

    // --- [NEW] CENTRALIZED NOTIFICATION HANDLER ---
    const addNotification = (newNotificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            isRead: false,
            ...newNotificationData
        };

        setNotifications(prev => [newNotification, ...prev]);

        if (profile.email) {
            sendEmailNotification(profile.email, newNotification);
        } else {
            console.warn('[SIMULASI EMAIL] Gagal: Alamat email vendor tidak diatur di Pengaturan Profil.');
        }
    };

  useEffect(() => {
    const handleHashChange = () => {
        const newRoute = window.location.hash || '#/home';
        setRoute(newRoute);
        if (!isAuthenticated) {
            const isPublicRoute = newRoute.startsWith('#/public') || newRoute.startsWith('#/feedback') || newRoute.startsWith('#/suggestion-form') || newRoute.startsWith('#/revision-form') || newRoute.startsWith('#/portal') || newRoute.startsWith('#/freelancer-portal') || newRoute.startsWith('#/login') || newRoute === '#/home' || newRoute === '#';
            if (!isPublicRoute) {
                window.location.hash = '#/home';
            }
        } else {
            const isAuthLandingPage = newRoute.startsWith('#/login') || newRoute === '#/home' || newRoute === '#';
            if (isAuthLandingPage) {
                window.location.hash = '#/dashboard';
            }
        }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  useEffect(() => {
      const path = (route.split('?')[0].split('/')[1] || 'home').toLowerCase();
      const newView = Object.values(ViewType).find(v => 
          v.toLowerCase().replace(/ /g, '-') === path
      );
      if (newView) {
          setActiveView(newView);
      } else if (path === 'team') { // Handle 'Freelancer' mapping to 'team' route
          setActiveView(ViewType.TEAM);
      }
  }, [route]);

  // Initialize from Supabase (seed if empty), then load into state
  useEffect(() => {
      (async () => {
          try {
              const loaded = await initializeAndLoadAll()
              setUsers(loaded.users as any)
              setProfile(loaded.profile as any)
              setClients(loaded.clients as any)
              setProjects(loaded.projects as any)
              setTeamMembers(loaded.teamMembers as any)
              setTransactions(loaded.transactions as any)
              setTeamProjectPayments(loaded.teamProjectPayments as any)
              setTeamPaymentRecords(loaded.teamPaymentRecords as any)
              setPockets(loaded.pockets as any)
              setLeads(loaded.leads as any)
              setRewardLedgerEntries(loaded.rewardLedgerEntries as any)
              setCards(loaded.cards as any)
              setAssets(loaded.assets as any)
              setContracts(loaded.contracts as any)
              setClientFeedback(loaded.clientFeedback as any)
              setNotifications(loaded.notifications as any)
              setSocialMediaPosts(loaded.socialMediaPosts as any)
              setPromoCodes(loaded.promoCodes as any)
              setSops(loaded.sops as any)
              setPackages(loaded.packages as any)
              setAddOns(loaded.addOns as any)
          } catch (e) {
              console.warn('[Supabase] initialization failed:', e)
          }
      })()
  // We intentionally run this only once on first mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Supabase Auth: sinkronkan session -> state user
  useEffect(() => {
    const deriveDefaultUserForEmail = (email: string | null | undefined, id: string): User => {
      const lower = (email || '').toLowerCase();
      if (lower === 'admin@vena.pictures') {
        return { id, email: lower, password: '', fullName: 'Andi Vena', role: 'Admin', isApproved: true } as User;
      }
      if (lower === 'member@vena.pictures') {
        return { id, email: lower, password: '', fullName: 'Rina Asisten', role: 'Member', permissions: [ViewType.CLIENTS, ViewType.PROJECTS, ViewType.CALENDAR, ViewType.SOCIAL_MEDIA_PLANNER], isApproved: true } as User;
      }
      // Default member minimal
      return { id, email: lower, password: '', fullName: lower, role: 'Member', permissions: [], isApproved: true } as User;
    };

    const ensureUserMetadata = async (authUser: { id: string, email?: string | null }): Promise<User> => {
      const { data, error } = await supabase.from('users').select('id, data').eq('id', authUser.id);
      if (!error && data && data.length > 0) {
        const u = (data[0] as any).data as User;
        // Normalize mandatory fields
        return { ...u, id: authUser.id, email: authUser.email || u.email, password: u.password || '' } as User;
      }
      const newMeta = deriveDefaultUserForEmail(authUser.email, authUser.id);
      await supabase.from('users').upsert({ id: authUser.id, data: newMeta } as any, { onConflict: 'id' });
      // Tambahkan ke state list users
      setUsersSynced(prev => {
        const exists = prev.some(p => p.id === newMeta.id);
        return exists ? prev.map(p => p.id === newMeta.id ? newMeta : p) : [newMeta, ...prev];
      });
      return newMeta;
    };

    const sync = async () => {
      const { data: sessionRes } = await supabase.auth.getSession();
      const s = sessionRes?.session;
      if (s?.user) {
        try {
          const domainUser = await ensureUserMetadata({ id: s.user.id, email: s.user.email });
          setCurrentUser(domainUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.warn('[Supabase Auth] ensure metadata error:', e);
          setIsAuthenticated(true); // tetap login meski metadata gagal, fallback minimal
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };

    // Inisialisasi + subscribe perubahan auth
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      sync();
    });
    return () => { sub.subscription.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  useEffect(() => {
        const styleElement = document.getElementById('public-theme-style');
        const isPublicRoute = route.startsWith('#/public') || route.startsWith('#/portal') || route.startsWith('#/freelancer-portal');
        
        document.body.classList.toggle('app-theme', !isPublicRoute);
        document.body.classList.toggle('public-page-body', isPublicRoute);

        if (isPublicRoute) {
            const brandColor = profile.brandColor || '#3b82f6';
            
            if (styleElement) {
                const hoverColor = darkenColor(brandColor, 10);
                const brandHsl = hexToHsl(brandColor);
                styleElement.innerHTML = `
                    :root {
                        --public-accent: ${brandColor};
                        --public-accent-hover: ${hoverColor};
                        --public-accent-hsl: ${brandHsl};
                    }
                `;
            }
        } else if (styleElement) {
            styleElement.innerHTML = '';
        }

    }, [route, profile.brandColor]);

  const showNotification = (message: string, duration: number = 3000) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, duration);
  };

  const handleSetProfile = (value: React.SetStateAction<Profile>) => {
    setProfile(value);
  };

  const handleLoginSuccess = (user: User) => {
    // Setelah sign-in Supabase, listener auth akan mengisi state user
    window.location.hash = '#/dashboard';
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[Supabase Auth] signOut error:', e);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.hash = '#/home';
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNavigation = (view: ViewType, action?: NavigationAction, notificationId?: string) => {
        const pathMap: { [key in ViewType]: string } = {
            [ViewType.HOMEPAGE]: 'home',
            [ViewType.DASHBOARD]: 'dashboard',
            [ViewType.PROSPEK]: 'prospek',
            [ViewType.BOOKING]: 'booking',
            [ViewType.CLIENTS]: 'clients',
            [ViewType.PROJECTS]: 'projects',
            [ViewType.TEAM]: 'team',
            [ViewType.FINANCE]: 'finance',
            [ViewType.CALENDAR]: 'calendar',
            [ViewType.SOCIAL_MEDIA_PLANNER]: 'social-media-planner',
            [ViewType.PACKAGES]: 'packages',
            [ViewType.ASSETS]: 'assets',
            [ViewType.CONTRACTS]: 'contracts',
            [ViewType.PROMO_CODES]: 'promo-codes',
            [ViewType.SOP]: 'sop',
            [ViewType.CLIENT_REPORTS]: 'client-reports',
            [ViewType.SETTINGS]: 'settings',
        };

    const newRoute = `#/${pathMap[view] || view.toLowerCase().replace(/ /g, '-')}`;

    window.location.hash = newRoute;

    setActiveView(view);
    setInitialAction(action || null);
    setIsSidebarOpen(false); // Close sidebar on navigation
    setIsSearchOpen(false); // Close search on navigation
    if (notificationId) {
        handleMarkAsRead(notificationId);
    }
  };

  const hasPermission = (view: ViewType) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    // For Member, access is now purely permission-based
    return currentUser.permissions?.includes(view) || false;
  };
  
  const handleUpdateRevision = (projectId: string, revisionId: string, updatedData: { freelancerNotes: string; driveLink: string; status: RevisionStatus; }) => {
    setProjects(prevProjects => {
        const project = prevProjects.find(p => p.id === projectId);
        if (!project) return prevProjects;

        const revision = project.revisions?.find(r => r.id === revisionId);
        if (!revision) return prevProjects;

        if (updatedData.status === RevisionStatus.COMPLETED && revision.status !== RevisionStatus.COMPLETED) {
            const freelancer = teamMembers.find(tm => tm.id === revision.freelancerId);
            addNotification({
                title: 'Revisi Telah Diselesaikan',
                message: `${freelancer?.name || 'Seorang freelancer'} telah menyelesaikan tugas revisi untuk proyek "${project.projectName}".`,
                icon: 'revision',
                link: { view: ViewType.PROJECTS, action: { type: 'VIEW_PROJECT_DETAILS', id: projectId } }
            });
        }
        
        return prevProjects.map(p => 
            p.id === projectId 
                ? { ...p, revisions: p.revisions?.map(r => r.id === revisionId ? { ...r, ...updatedData, completedDate: new Date().toISOString() } : r) } 
                : p
        );
    });
  };

  const renderView = () => {
    if (!hasPermission(activeView)) {
        return <AccessDenied onBackToDashboard={() => handleNavigation(ViewType.DASHBOARD)} />;
    }
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <Dashboard 
          projects={projects} 
          clients={clients} 
          transactions={transactions} 
          teamMembers={teamMembers}
          cards={cards}
          pockets={pockets}
          handleNavigation={handleNavigation}
          leads={leads}
          teamProjectPayments={teamProjectPayments}
          packages={packages}
          assets={assets}
          clientFeedback={clientFeedback}
          contracts={contracts}
          currentUser={currentUser}
          projectStatusConfig={profile.projectStatusConfig}
        />;
      case ViewType.PROSPEK:
        return <Leads
            leads={leads} setLeads={setLeadsSynced}
            clients={clients} setClients={setClientsSynced}
            projects={projects} setProjects={setProjectsSynced}
            packages={packages} addOns={addOns}
            transactions={transactions} setTransactions={setTransactionsSynced}
            userProfile={profile} setProfile={setProfileSynced} showNotification={showNotification}
            cards={cards} setCards={setCardsSynced}
            pockets={pockets} setPockets={setPocketsSynced}
            promoCodes={promoCodes} setPromoCodes={setPromoCodesSynced}
        />;
      case ViewType.BOOKING:
        return <Booking
            leads={leads}
            clients={clients}
            projects={projects}
            setProjects={setProjectsSynced}
            packages={packages}
            userProfile={profile}
            setProfile={setProfileSynced}
            handleNavigation={handleNavigation}
            showNotification={showNotification}
        />;
      case ViewType.CLIENTS:
        return <Clients
          clients={clients} setClients={setClientsSynced}
          projects={projects} setProjects={setProjectsSynced}
          packages={packages} addOns={addOns}
          transactions={transactions} setTransactions={setTransactionsSynced}
          userProfile={profile}
          showNotification={showNotification}
          initialAction={initialAction} setInitialAction={setInitialAction}
          cards={cards} setCards={setCardsSynced}
          pockets={pockets} setPockets={setPocketsSynced}
          contracts={contracts}
          handleNavigation={handleNavigation}
          clientFeedback={clientFeedback}
          promoCodes={promoCodes} setPromoCodes={setPromoCodesSynced}
          onSignInvoice={(pId, sig) => setProjectsSynced(prev => prev.map(p => p.id === pId ? { ...p, invoiceSignature: sig } : p))}
          onSignTransaction={(tId, sig) => setTransactionsSynced(prev => prev.map(t => t.id === tId ? { ...t, vendorSignature: sig } : t))}
          addNotification={addNotification}
        />;
      case ViewType.PROJECTS:
        return <Projects 
          projects={projects} setProjects={setProjectsSynced}
          clients={clients}
          packages={packages}
          teamMembers={teamMembers}
          teamProjectPayments={teamProjectPayments} setTeamProjectPayments={setTeamProjectPaymentsSynced}
          transactions={transactions} setTransactions={setTransactionsSynced}
          initialAction={initialAction} setInitialAction={setInitialAction}
          profile={profile}
          showNotification={showNotification}
          cards={cards}
          setCards={setCardsSynced}
          handleNavigation={handleNavigation}
        />;
      case ViewType.TEAM:
        return (
          <Freelancers
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembersSynced}
            teamProjectPayments={teamProjectPayments}
            setTeamProjectPayments={setTeamProjectPaymentsSynced}
            teamPaymentRecords={teamPaymentRecords}
            setTeamPaymentRecords={setTeamPaymentRecordsSynced}
            transactions={transactions}
            setTransactions={setTransactionsSynced}
            userProfile={profile}
            showNotification={showNotification}
            initialAction={initialAction}
            setInitialAction={setInitialAction}
            projects={projects}
            setProjects={setProjectsSynced}
            rewardLedgerEntries={rewardLedgerEntries}
            setRewardLedgerEntries={setRewardLedgerEntriesSynced}
            pockets={pockets}
            setPockets={setPocketsSynced}
            cards={cards}
            setCards={setCardsSynced}
            onSignPaymentRecord={(rId, sig) => setTeamPaymentRecordsSynced(prev => prev.map(r => r.id === rId ? { ...r, vendorSignature: sig } : r))}
          />
        );
      case ViewType.FINANCE:
        return <Finance 
          transactions={transactions} setTransactions={setTransactionsSynced}
          pockets={pockets} setPockets={setPocketsSynced}
          projects={projects}
          profile={profile}
          cards={cards} setCards={setCardsSynced}
          teamMembers={teamMembers}
          rewardLedgerEntries={rewardLedgerEntries}
        />;
      case ViewType.PACKAGES:
        return <Packages packages={packages} setPackages={setPackagesSynced} addOns={addOns} setAddOns={setAddOnsSynced} projects={projects} profile={profile} />;
      case ViewType.ASSETS:
        return <Assets assets={assets} setAssets={setAssetsSynced} profile={profile} showNotification={showNotification} />;
      case ViewType.CONTRACTS:
        return <Contracts 
            contracts={contracts} setContracts={setContractsSynced}
            clients={clients} projects={projects} profile={profile}
            showNotification={showNotification}
            initialAction={initialAction} setInitialAction={setInitialAction}
            packages={packages}
            onSignContract={(cId, sig, signer) => setContractsSynced(prev => prev.map(c => c.id === cId ? { ...c, [signer === 'vendor' ? 'vendorSignature' : 'clientSignature']: sig } : c))}
        />;
      case ViewType.SOP:
        return <SOPManagement sops={sops} setSops={setSopsSynced} profile={profile} showNotification={showNotification} />;
      case ViewType.SETTINGS:
        return <Settings 
          profile={profile} setProfile={setProfileSynced} 
          transactions={transactions} setTransactions={setTransactionsSynced}
          projects={projects} setProjects={setProjectsSynced}
          packages={packages} setPackages={setPackagesSynced}
          sops={sops} setSops={setSopsSynced}
          users={users}
          setUsers={setUsersSynced}
          currentUser={currentUser}
          showNotification={showNotification}
        />;
      case ViewType.CALENDAR:
        return <CalendarView projects={projects} setProjects={setProjects} teamMembers={teamMembers} profile={profile} />;
      case ViewType.CLIENT_REPORTS:
        return <ClientReports 
            clients={clients}
            leads={leads}
            projects={projects}
            feedback={clientFeedback}
            setFeedback={setClientFeedbackSynced}
            showNotification={showNotification}
        />;
      case ViewType.SOCIAL_MEDIA_PLANNER:
        return <SocialPlanner posts={socialMediaPosts} setPosts={setSocialMediaPostsSynced} projects={projects} showNotification={showNotification} />;
      case ViewType.PROMO_CODES:
        return <PromoCodes promoCodes={promoCodes} setPromoCodes={setPromoCodesSynced} projects={projects} showNotification={showNotification} />;
      default:
        return <div />;
    }
  };
  
  // --- ROUTING LOGIC ---
  if (route.startsWith('#/home') || route === '#/') return <Homepage />;
  if (route.startsWith('#/login')) return <Login onLoginSuccess={handleLoginSuccess} users={users} />;
  
  if (route.startsWith('#/public-packages')) {
    return <PublicPackages
        packages={packages}
        addOns={addOns}
        userProfile={profile}
        showNotification={showNotification}
        setClients={setClientsSynced}
        setProjects={setProjectsSynced}
        setTransactions={setTransactionsSynced}
        setCards={setCardsSynced}
        setLeads={setLeadsSynced}
        addNotification={addNotification}
        cards={cards}
        promoCodes={promoCodes}
        setPromoCodes={setPromoCodesSynced}
    />;
  }
  if (route.startsWith('#/public-booking')) {
    const allDataForForm = { clients, projects, teamMembers, transactions, teamProjectPayments, teamPaymentRecords, pockets, profile, leads, rewardLedgerEntries, cards, assets, contracts, clientFeedback, notifications, socialMediaPosts, promoCodes, sops, packages, addOns };
    return <PublicBookingForm {...allDataForForm} userProfile={profile} showNotification={showNotification} setClients={setClientsSynced} setProjects={setProjectsSynced} setTransactions={setTransactionsSynced} setCards={setCardsSynced} setPockets={setPocketsSynced} setPromoCodes={setPromoCodesSynced} setLeads={setLeadsSynced} addNotification={addNotification} />;
  }
  if (route.startsWith('#/public-lead-form')) {
    return <PublicLeadForm setLeads={setLeadsSynced} userProfile={profile} showNotification={showNotification} addNotification={addNotification} />;
  }
  
  if (route.startsWith('#/feedback')) return <PublicFeedbackForm setClientFeedback={setClientFeedback} />;
  if (route.startsWith('#/suggestion-form')) return <SuggestionForm setLeads={setLeads} addNotification={addNotification} />;
  if (route.startsWith('#/revision-form')) return <PublicRevisionForm projects={projects} teamMembers={teamMembers} onUpdateRevision={handleUpdateRevision} />;
  if (route.startsWith('#/portal/')) {
    const accessId = route.split('/portal/')[1];
    return <ClientPortal accessId={accessId} clients={clients} projects={projects} setClientFeedback={setClientFeedbackSynced} showNotification={showNotification} contracts={contracts} transactions={transactions} userProfile={profile} packages={packages} onClientConfirmation={(pId, stage) => setProjectsSynced(prev => prev.map(p => p.id === pId ? {...p, [`is${stage.charAt(0).toUpperCase() + stage.slice(1)}ConfirmedByClient`]: true} : p))} onClientSubStatusConfirmation={(pId, sub, note) => setProjectsSynced(prev => prev.map(p => p.id === pId ? {...p, confirmedSubStatuses: [...(p.confirmedSubStatuses || []), sub], clientSubStatusNotes: {...(p.clientSubStatusNotes || {}), [sub]: note}} : p))} onSignContract={(cId, sig, signer) => setContractsSynced(prev => prev.map(c => c.id === cId ? {...c, [signer === 'vendor' ? 'vendorSignature' : 'clientSignature']: sig } : c))} />;
  }
  if (route.startsWith('#/freelancer-portal/')) {
     const accessId = route.split('/freelancer-portal/')[1];
     return <FreelancerPortal accessId={accessId} teamMembers={teamMembers} projects={projects} teamProjectPayments={teamProjectPayments} teamPaymentRecords={teamPaymentRecords} rewardLedgerEntries={rewardLedgerEntries} showNotification={showNotification} onUpdateRevision={handleUpdateRevision} sops={sops} userProfile={profile} addNotification={addNotification} />;
  }

  if (!isAuthenticated) return <Login onLoginSuccess={handleLoginSuccess} users={users} />;

  return (
    <div className="
        flex h-screen 
        bg-brand-bg 
        text-brand-text-primary
        overflow-hidden
    ">
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => handleNavigation(view)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        currentUser={currentUser}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
            pageTitle={activeView} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            setIsSearchOpen={setIsSearchOpen}
            notifications={notifications}
            handleNavigation={handleNavigation}
            handleMarkAllAsRead={handleMarkAllAsRead}
            currentUser={currentUser}
            profile={profile}
            handleLogout={handleLogout}
        />
        
        <main className="
            flex-1 
            overflow-x-hidden 
            overflow-y-auto 
            p-3 sm:p-4 md:p-6 lg:p-8 
            pb-20 xl:pb-8
            overscroll-contain
        " 
        style={{ 
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'calc(5rem + var(--safe-area-inset-bottom, 0px))'
        }}>
            <div className="animate-fade-in">
                {renderView()}
            </div>
        </main>
      </div>
      
      {/* Enhanced Notification Toast */}
      {notification && (
        <div className="
            fixed top-4 right-4 
            sm:top-6 sm:right-6
            bg-brand-accent 
            text-white 
            py-3 px-4 sm:py-4 sm:px-6
            rounded-xl 
            shadow-2xl 
            z-50 
            animate-fade-in-out
            backdrop-blur-sm
            border border-brand-accent-hover/20
            max-w-sm
            break-words
        "
        style={{
            top: 'calc(1rem + var(--safe-area-inset-top, 0px))',
            right: 'calc(1rem + var(--safe-area-inset-right, 0px))'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse-soft" />
            <span className="font-medium text-sm sm:text-base">{notification}</span>
          </div>
        </div>
      )}
      
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        handleNavigation={handleNavigation}
      />
      
      <BottomNavBar activeView={activeView} handleNavigation={handleNavigation} />
    </div>
  );
};

export default App;