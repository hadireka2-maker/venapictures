

import React, { useMemo, useState } from 'react';
import { Project, Client, Transaction, TransactionType, ViewType, TeamMember, Card, FinancialPocket, PocketType, Lead, LeadStatus, TeamProjectPayment, Package, Asset, AssetStatus, ClientFeedback, Contract, ClientStatus, NavigationAction, User, ProjectStatusConfig } from '../types';
import StatCard from './StatCard';
import Modal from './Modal';
import { NAV_ITEMS, DollarSignIcon, FolderKanbanIcon, UsersIcon, BriefcaseIcon, ChevronRightIcon, CreditCardIcon, CalendarIcon, ClipboardListIcon, LightbulbIcon, TargetIcon, StarIcon, CameraIcon, FileTextIcon, SparkleIcon, PlusIcon } from '../constants';
import { GoogleGenAI } from "@google/genai";


// Helper Functions
const formatCurrency = (amount: number, minimumFractionDigits = 0) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits }).format(amount);
};

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};


// --- Sub-components for Dashboard ---

const DashboardHeader: React.FC<{ currentUser: User | null }> = ({ currentUser }) => (
    <div className="col-span-1 xl:col-span-12 mb-2">
        <h2 className="text-3xl font-bold text-brand-text-light">Selamat Datang Kembali, {currentUser?.fullName.split(' ')[0]}!</h2>
        <p className="text-brand-text-secondary mt-1">Berikut adalah ringkasan bisnis Anda hari ini.</p>
    </div>
);

const ActionHubWidget: React.FC<{ 
    handleNavigation: (view: ViewType, action?: NavigationAction) => void;
    unpaidTeamPayments: TeamProjectPayment[];
    contractsAwaitingSignature: Contract[];
    newLeads: Lead[];
}> = ({ handleNavigation, unpaidTeamPayments, contractsAwaitingSignature, newLeads }) => {
    
    const actionItems = [
        {
            count: unpaidTeamPayments.length,
            label: "Pembayaran tim belum lunas",
            icon: <BriefcaseIcon className="w-5 h-5 text-red-400"/>,
            action: () => handleNavigation(ViewType.TEAM)
        },
        {
            count: contractsAwaitingSignature.length,
            label: "Kontrak menunggu TTD Anda",
            icon: <FileTextIcon className="w-5 h-5 text-yellow-400"/>,
            action: () => handleNavigation(ViewType.CONTRACTS)
        },
        {
            count: newLeads.length,
            label: "Prospek baru minggu ini",
            icon: <TargetIcon className="w-5 h-5 text-blue-400"/>,
            action: () => handleNavigation(ViewType.PROSPEK)
        }
    ].filter(item => item.count > 0);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg text-gradient mb-4">Pusat Aksi & Tugas</h3>
                {actionItems.length > 0 ? (
                     <div className="space-y-3">
                        {actionItems.map(item => (
                            <button key={item.label} onClick={item.action} className="w-full flex items-center justify-between p-3 bg-brand-bg rounded-lg hover:bg-brand-input transition-colors">
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span className="font-semibold text-sm text-brand-text-light">{item.label}</span>
                                </div>
                                <span className="font-bold text-sm text-brand-text-light bg-brand-surface px-2.5 py-1 rounded-full">{item.count}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-brand-text-secondary text-center py-8">Tidak ada tugas mendesak. Kerja bagus!</p>
                )}
            </div>
            <div className="flex gap-3 mt-6 pt-6 border-t border-brand-border">
                <button onClick={() => handleNavigation(ViewType.PROJECTS)} className="button-secondary text-sm w-full">Tambah Proyek</button>
                <button onClick={() => handleNavigation(ViewType.FINANCE)} className="button-secondary text-sm w-full">Tambah Transaksi</button>
            </div>
        </div>
    );
};

const SmartInsightWidget: React.FC<{ 
    summary: any;
    unpaidTeamPayments: TeamProjectPayment[];
    projects: Project[];
    packages: Package[];
 }> = ({ summary, unpaidTeamPayments, projects, packages }) => {
    const [insight, setInsight] = useState('Klik tombol untuk mendapatkan insight bisnis dari data Anda.');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateInsight = async () => {
        setIsGenerating(true);
        setInsight('Menganalisis data Anda...');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const topPackageName = (() => {
                const counts = projects.reduce((acc, p) => { acc[p.packageName] = (acc[p.packageName] || 0) + 1; return acc; }, {} as Record<string, number>);
                return Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0] || 'N/A';
            })();

            const prompt = `
            Anda adalah seorang analis bisnis ahli untuk vendor fotografi. Berdasarkan ringkasan data berikut, berikan satu insight atau saran bisnis yang singkat (maksimal 2 kalimat), tajam, dan dapat ditindaklanjuti dalam bahasa Indonesia. Fokus pada area yang paling butuh perhatian atau peluang terbesar.

            Ringkasan Data:
            - Total Saldo Saat Ini: ${formatCurrency(summary.totalBalance)}
            - Proyek Aktif: ${summary.activeProjects}
            - Klien Aktif: ${summary.activeClients}
            - Pemasukan Bulan Ini: ${formatCurrency(summary.totalIncomeThisMonth)}
            - Pengeluaran Bulan Ini: ${formatCurrency(summary.totalExpenseThisMonth)}
            - Pembayaran Tim Belum Lunas: ${unpaidTeamPayments.length} pembayaran dengan total ${formatCurrency(unpaidTeamPayments.reduce((s,p)=>s+p.fee, 0))}
            - Paket Terpopuler: ${topPackageName}

            Contoh output yang diinginkan: "Pemasukan bulan ini bagus, tapi ada ${unpaidTeamPayments.length} pembayaran tim yang tertunda. Prioritaskan pelunasan ini untuk menjaga semangat tim."

            Berikan hanya teks saran Anda, tanpa pengantar atau penutup.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setInsight(response.text);

        } catch (error) {
            console.error("Error generating insight:", error);
            setInsight("Gagal mendapatkan insight. Coba beberapa saat lagi.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-2xl shadow-lg h-full flex flex-col text-white">
            <div className="flex items-center gap-3 mb-4">
                <SparkleIcon className="w-6 h-6"/>
                <h3 className="font-bold text-lg">Insight Cerdas</h3>
            </div>
            <p className="text-base font-medium flex-grow">{insight}</p>
            <button 
                onClick={generateInsight} 
                disabled={isGenerating} 
                className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
                {isGenerating ? 'Menganalisis...' : 'Dapatkan Insight Baru'}
            </button>
        </div>
    );
};

const IncomeChartWidget: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const [chartView, setChartView] = useState<'monthly' | 'yearly'>('monthly');

    const chartData = useMemo(() => {
        if (chartView === 'yearly') {
            const incomeByYear: { [year: string]: number } = {};
            transactions.forEach(t => {
                if (t.type === TransactionType.INCOME) {
                    const year = new Date(t.date).getFullYear().toString();
                    if (!incomeByYear[year]) {
                        incomeByYear[year] = 0;
                    }
                    incomeByYear[year] += t.amount;
                }
            });
            return Object.entries(incomeByYear)
                .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
                .map(([year, income]) => ({ name: year, value: income }));
        } else { // monthly
            const currentYear = new Date().getFullYear();
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const data = months.map(month => ({ name: month, value: 0 }));

            transactions.forEach(t => {
                const transactionDate = new Date(t.date);
                if (t.type === TransactionType.INCOME && transactionDate.getFullYear() === currentYear) {
                    const monthIndex = transactionDate.getMonth();
                    data[monthIndex].value += t.amount;
                }
            });
            return data;
        }
    }, [transactions, chartView]);

    const maxIncome = Math.max(...chartData.map(d => d.value), 1);
    const currentLabel = chartView === 'monthly' 
        ? new Date().toLocaleString('default', { month: 'short' })
        : new Date().getFullYear().toString();

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg h-full border border-brand-border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gradient">Grafik Pemasukan</h3>
                <div className="p-1 bg-brand-bg rounded-lg flex items-center h-fit">
                    <button 
                        onClick={() => setChartView('monthly')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${chartView === 'monthly' ? 'bg-brand-surface shadow-sm text-brand-text-light' : 'text-brand-text-secondary'}`}
                    >
                        Bulanan
                    </button>
                    <button 
                        onClick={() => setChartView('yearly')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${chartView === 'yearly' ? 'bg-brand-surface shadow-sm text-brand-text-light' : 'text-brand-text-secondary'}`}
                    >
                        Tahunan
                    </button>
                </div>
            </div>
            <div className="h-48 flex justify-between items-end gap-2">
                {chartData.length > 0 && chartData.some(d => d.value > 0) ? chartData.map(item => {
                    const height = Math.max((item.value / maxIncome) * 100, 2);
                    const isCurrent = item.name === currentLabel;
                    return (
                        <div key={item.name} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                             <div className="absolute -top-8 text-xs bg-brand-accent text-white font-bold py-1 px-2 rounded-md mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{formatCurrency(item.value, 0)}</div>
                            <div
                                className={`${isCurrent ? 'bg-brand-accent' : 'bg-brand-text-primary/20'} w-full rounded-md transition-colors hover:bg-brand-accent/80`}
                                style={{ height: `${height}%` }}
                            ></div>
                            <span className="text-xs text-brand-text-secondary mt-2">{item.name}</span>
                        </div>
                    );
                }) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-brand-text-secondary">Tidak ada data pemasukan untuk periode ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const RecentTransactionsWidget: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gradient">Transaksi Terbaru</h3>
            <button className="text-brand-text-secondary hover:text-brand-text-light"><ChevronRightIcon className="w-6 h-6" /></button>
        </div>
        <div className="space-y-4">
            {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-bg flex-shrink-0 flex items-center justify-center">
                      <DollarSignIcon className={`w-5 h-5 ${t.type === TransactionType.INCOME ? 'text-brand-success' : 'text-brand-danger'}`} />
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <p className="font-medium text-brand-text-light truncate text-sm">{t.description}</p>
                        <p className="text-xs text-brand-text-secondary">{new Date(t.date).toLocaleDateString('en-US', {day: 'numeric', month: 'long'})}</p>
                    </div>
                    <div className={`font-semibold text-sm ${t.type === TransactionType.INCOME ? 'text-brand-success' : 'text-brand-text-light'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount, 0)}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const CardWidget: React.FC<{ card: Card }> = ({ card }) => {
    const isLight = card.colorGradient.includes('slate-100');
    const textColor = isLight ? 'text-slate-800' : 'text-white';
    
    return (
        <div className={`p-4 rounded-xl ${textColor} shadow-md flex flex-col justify-between h-40 w-64 flex-shrink-0 bg-gradient-to-br ${card.colorGradient} transform transition-transform hover:scale-105 hover:-translate-y-1`}>
             <div>
                <div className="flex justify-between items-center">
                    <p className="font-bold text-sm">{card.bankName}</p>
                    <p className="text-xs">{card.cardType}</p>
                </div>
            </div>
            <div>
                <p className="text-xl font-mono tracking-wider">**** {card.lastFourDigits}</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(card.balance)}</p>
            </div>
        </div>
    );
};

const MyCardsWidget: React.FC<{ cards: Card[], handleNavigation: (view: ViewType) => void }> = ({ cards, handleNavigation }) => (
    <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gradient flex items-center gap-2"><CreditCardIcon className="w-5 h-5"/> Kartu Saya</h3>
            <button onClick={() => handleNavigation(ViewType.FINANCE)} className="text-sm font-semibold text-brand-accent hover:underline">Kelola Kartu &rarr;</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -m-2 p-2">
            {cards.map(card => <CardWidget key={card.id} card={card} />)}
            {cards.length === 0 && <p className="text-sm text-center w-full py-12 text-brand-text-secondary">Belum ada kartu. Tambahkan di halaman Keuangan.</p>}
        </div>
    </div>
);

const UpcomingCalendarWidget: React.FC<{ projects: Project[], handleNavigation: (view: ViewType, action?: NavigationAction) => void }> = ({ projects, handleNavigation }) => {
    const upcoming = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

        return projects
            .filter(p => new Date(p.date) >= today)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    }, [projects]);
    
    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gradient flex items-center gap-2"><CalendarIcon className="w-5 h-5"/>Kalender Mendatang</h3>
                <button onClick={() => handleNavigation(ViewType.CALENDAR)} className="text-sm font-semibold text-brand-accent hover:underline">Lihat Semua &rarr;</button>
            </div>
            <div className="space-y-3">
                 {upcoming.map(p => (
                     <div key={p.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-brand-bg cursor-pointer" onClick={() => handleNavigation(ViewType.PROJECTS, { type: 'VIEW_PROJECT_DETAILS', id: p.id })}>
                        <div className="w-11 h-11 rounded-lg bg-brand-bg flex-shrink-0 flex flex-col items-center justify-center">
                            <p className="text-xs font-bold text-brand-text-secondary -mb-1">{new Date(p.date).toLocaleString('default', { month: 'short' })}</p>
                            <p className="text-xl font-extrabold text-brand-text-light">{new Date(p.date).getDate()}</p>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-medium text-brand-text-light truncate text-sm">{p.projectName}</p>
                            <p className="text-xs text-brand-text-secondary">{p.projectType}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                             <p className="text-xs text-brand-text-secondary">{p.location}</p>
                             <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 mt-1 inline-block">{p.status}</span>
                        </div>
                    </div>
                ))}
                {upcoming.length === 0 && <p className="text-center text-sm text-brand-text-secondary py-8">Tidak ada acara mendatang.</p>}
            </div>
        </div>
    )
}

const ProjectStatusWidget: React.FC<{ projects: Project[], projectStatusConfig: ProjectStatusConfig[], handleNavigation: (view: ViewType) => void }> = ({ projects, projectStatusConfig, handleNavigation }) => {
    const statusOrder = projectStatusConfig.map(s => s.name).filter(name => name !== 'Selesai' && name !== 'Dibatalkan');

    const statusCounts = useMemo(() => {
        return statusOrder.map(statusName => {
            const count = projects.filter(p => p.status === statusName).length;
            const config = projectStatusConfig.find(s => s.name === statusName);
            return {
                name: statusName,
                count: count,
                color: config ? config.color : '#64748b'
            };
        });
    }, [projects, statusOrder, projectStatusConfig]);
    
    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col">
            <h3 className="font-bold text-lg text-gradient mb-4">Status Proyek Aktif</h3>
            <div className="flex-grow flex flex-col justify-center">
                {total > 0 ? (
                    <>
                        <div className="w-full flex rounded-full h-4 overflow-hidden mb-4 bg-brand-bg">
                            {statusCounts.filter(s => s.count > 0).map(status => (
                                <div key={status.name} className="h-full" style={{ width: `${(status.count / total) * 100}%`, backgroundColor: status.color }} title={`${status.name}: ${status.count}`}></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            {statusCounts.map(status => (
                                <div key={status.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }}></div><span className="text-brand-text-secondary">{status.name}</span></div>
                                    <span className="font-semibold text-brand-text-light">{status.count}</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-center text-sm text-brand-text-secondary py-8">Tidak ada proyek aktif.</p>
                )}
            </div>
            <button onClick={() => handleNavigation(ViewType.PROJECTS)} className="mt-4 text-sm font-semibold text-brand-accent hover:underline self-start">Kelola Proyek &rarr;</button>
        </div>
    );
};

const LeadsSummaryWidget: React.FC<{ leads: Lead[]; handleNavigation: (view: ViewType) => void }> = ({ leads, handleNavigation }) => {
    const newLeadsThisMonth = leads.filter(l => new Date(l.date).getMonth() === new Date().getMonth() && new Date(l.date).getFullYear() === new Date().getFullYear()).length;
    const convertedLeads = leads.filter(l => l.status === LeadStatus.CONVERTED).length;
    const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;
    
    const SmallStat: React.FC<{icon: React.ReactNode; title: string; value: string;}> = ({icon, title, value}) => (
        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-accent">{icon}</div><div><p className="text-sm text-brand-text-secondary">{title}</p><p className="font-bold text-lg text-brand-text-light">{value}</p></div></div>
    );

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col justify-between">
            <h3 className="font-bold text-lg text-gradient mb-4">Ringkasan Prospek</h3>
            <div className="space-y-4 flex-grow">
                <SmallStat icon={<LightbulbIcon className="w-5 h-5"/>} title="Prospek Baru Bulan Ini" value={newLeadsThisMonth.toString()} />
                <SmallStat icon={<TargetIcon className="w-5 h-5"/>} title="Tingkat Konversi" value={`${conversionRate.toFixed(1)}%`} />
            </div>
            <button onClick={() => handleNavigation(ViewType.PROSPEK)} className="mt-4 text-sm font-semibold text-brand-accent hover:underline self-start">Kelola Prospek &rarr;</button>
        </div>
    );
};


// --- Main Dashboard Component ---

interface DashboardProps {
  projects: Project[];
  clients: Client[];
  transactions: Transaction[];
  teamMembers: TeamMember[];
  cards: Card[];
  pockets: FinancialPocket[];
  handleNavigation: (view: ViewType, action?: NavigationAction) => void;
  leads: Lead[];
  teamProjectPayments: TeamProjectPayment[];
  packages: Package[];
  assets: Asset[];
  clientFeedback: ClientFeedback[];
  contracts: Contract[];
  currentUser: User | null;
  projectStatusConfig: ProjectStatusConfig[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects, clients, transactions, teamMembers, cards, pockets, handleNavigation, leads, teamProjectPayments, packages, assets, clientFeedback, contracts, currentUser, projectStatusConfig }) => {
  const [activeModal, setActiveModal] = useState<'balance' | 'projects' | 'clients' | 'freelancers' | 'payments' | 'contracts' | null>(null);
  
  const getSubStatusDisplay = (project: Project) => {
    if (project.activeSubStatuses?.length) {
        return `${project.status}: ${project.activeSubStatuses.join(', ')}`;
    }
    if (project.status === 'Dikirim' && project.shippingDetails) {
        return `Dikirim: ${project.shippingDetails}`;
    }
    return project.status;
  };

  const summary = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);

    return {
      totalBalance: cards.reduce((sum, c) => sum + c.balance, 0),
      activeProjects: projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').length,
      activeClients: clients.filter(c => c.status === ClientStatus.ACTIVE).length,
      totalFreelancers: teamMembers.length,
      totalIncomeThisMonth: thisMonthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0),
      totalExpenseThisMonth: thisMonthTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0),
    };
  }, [cards, projects, clients, teamMembers, transactions]);
  
  const unpaidTeamPayments = useMemo(() => teamProjectPayments.filter(p => p.status === 'Unpaid'), [teamProjectPayments]);
  const contractsAwaitingSignature = useMemo(() => contracts.filter(c => !c.vendorSignature), [contracts]);
  const newLeads = useMemo(() => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return leads.filter(l => new Date(l.date) >= oneWeekAgo);
  }, [leads]);
  
  const modalTitles: { [key: string]: string } = {
    balance: 'Rincian Saldo',
    projects: 'Daftar Proyek Aktif',
    clients: 'Daftar Klien Aktif',
    freelancers: 'Daftar Semua Freelancer',
    payments: 'Rincian Sisa Pembayaran Tim',
    contracts: 'Daftar Semua Kontrak'
  };
  
  return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <DashboardHeader currentUser={currentUser} />
        
        <div className="col-span-1 xl:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '100ms' }} onClick={() => setActiveModal('balance')}><StatCard icon={<DollarSignIcon className="w-6 h-6" />} iconBgColor="bg-blue-500/20" iconColor="text-blue-400" title="Total Saldo" value={formatCurrency(summary.totalBalance)} /></div>
            <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '200ms' }} onClick={() => setActiveModal('projects')}><StatCard icon={<FolderKanbanIcon className="w-6 h-6" />} iconBgColor="bg-indigo-500/20" iconColor="text-indigo-400" title="Proyek Aktif" value={summary.activeProjects.toString()} /></div>
            <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '300ms' }} onClick={() => setActiveModal('clients')}><StatCard icon={<UsersIcon className="w-6 h-6" />} iconBgColor="bg-brand-success/20" iconColor="text-brand-success" title="Klien Aktif" value={summary.activeClients.toString()} /></div>
            <div className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '400ms' }} onClick={() => setActiveModal('freelancers')}><StatCard icon={<BriefcaseIcon className="w-6 h-6" />} iconBgColor="bg-orange-500/20" iconColor="text-orange-400" title="Total Freelancer" value={summary.totalFreelancers.toString()} /></div>
        </div>
        
        <div className="col-span-1 xl:col-span-7 widget-animate" style={{ animationDelay: '500ms' }}>
            <ActionHubWidget handleNavigation={handleNavigation} unpaidTeamPayments={unpaidTeamPayments} contractsAwaitingSignature={contractsAwaitingSignature} newLeads={newLeads} />
        </div>
        <div className="col-span-1 xl:col-span-5 widget-animate" style={{ animationDelay: '600ms' }}>
            <SmartInsightWidget summary={summary} unpaidTeamPayments={unpaidTeamPayments} projects={projects} packages={packages}/>
        </div>

        <div className="col-span-1 xl:col-span-8 widget-animate" style={{ animationDelay: '700ms' }}><IncomeChartWidget transactions={transactions} /></div>
        <div className="col-span-1 xl:col-span-4 widget-animate" style={{ animationDelay: '800ms' }}><UpcomingCalendarWidget projects={projects} handleNavigation={handleNavigation} /></div>

        <div className="col-span-1 xl:col-span-4 widget-animate" style={{ animationDelay: '900ms' }}><ProjectStatusWidget projects={projects} projectStatusConfig={projectStatusConfig} handleNavigation={handleNavigation} /></div>
        <div className="col-span-1 xl:col-span-4 widget-animate" style={{ animationDelay: '1000ms' }}><RecentTransactionsWidget transactions={transactions} /></div>
        <div className="col-span-1 xl:col-span-4 widget-animate" style={{ animationDelay: '1100ms' }}><LeadsSummaryWidget leads={leads} handleNavigation={handleNavigation}/></div>
        
        <div className="col-span-1 xl:col-span-12 widget-animate" style={{ animationDelay: '1200ms' }}><MyCardsWidget cards={cards} handleNavigation={handleNavigation} /></div>
        
         <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={activeModal ? modalTitles[activeModal] : ''} size="2xl">
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {activeModal === 'balance' && (
                         <div className="space-y-4">
                            <h4 className="font-semibold text-gradient border-b border-brand-border pb-2">Kartu & Tunai</h4>
                            <div className="space-y-3">
                                {cards.map(card => (
                                    <div key={card.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                        <p className="font-semibold text-brand-text-light">{card.bankName} {card.id.startsWith('CARD_CASH') ? '(Tunai)' : `**** ${card.lastFourDigits}`}</p>
                                        <p className="font-semibold text-brand-text-light">{formatCurrency(card.balance)}</p>
                                    </div>
                                ))}
                            </div>
                            <h4 className="font-semibold text-gradient border-b border-brand-border pb-2 mt-6">Kantong</h4>
                             <div className="space-y-3">
                                {pockets.map(pocket => (
                                    <div key={pocket.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                        <p className="font-semibold text-brand-text-light">{pocket.name}</p>
                                        <p className="font-semibold text-brand-text-light">{pocket.type === PocketType.REWARD_POOL ? formatCurrency(teamMembers.reduce((s, m) => s + m.rewardBalance, 0)) : formatCurrency(pocket.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeModal === 'projects' && (
                        <div className="space-y-3">
                            {projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').length > 0 ? projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').map(project => (
                                <div key={project.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-text-light">{project.projectName}</p>
                                        <p className="text-sm text-brand-text-secondary">{project.clientName}</p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{backgroundColor: `${projectStatusConfig.find(c => c.name === project.status)?.color || '#64748b'}33`, color: projectStatusConfig.find(c => c.name === project.status)?.color || '#64748b', }}>
                                        {getSubStatusDisplay(project)}
                                    </span>
                                </div>
                            )) : <p className="text-center text-brand-text-secondary py-8">Tidak ada proyek aktif.</p>}
                        </div>
                    )}
                    {activeModal === 'clients' && (
                        <div className="space-y-3">
                            {clients.filter(c => c.status === ClientStatus.ACTIVE).map(client => (
                                <div key={client.id} className="p-3 bg-brand-bg rounded-lg">
                                    <p className="font-semibold text-brand-text-light">{client.name}</p>
                                    <p className="text-sm text-brand-text-secondary">{client.email}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeModal === 'freelancers' && (
                         <div className="space-y-3">
                            {teamMembers.map(member => (
                                <div key={member.id} className="p-3 bg-brand-bg rounded-lg">
                                    <p className="font-semibold text-brand-text-light">{member.name}</p>
                                    <p className="text-sm text-brand-text-secondary">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeModal === 'payments' && (
                        <div className="space-y-3">
                            {unpaidTeamPayments.length > 0 ? unpaidTeamPayments.map(p => (
                                <div key={p.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-text-light">{p.teamMemberName}</p>
                                        <p className="text-sm text-brand-text-secondary">Proyek: {projects.find(proj => proj.id === p.projectId)?.projectName || 'N/A'}</p>
                                    </div>
                                    <p className="font-semibold text-brand-danger">{formatCurrency(p.fee)}</p>
                                </div>
                            )) : <p className="text-center text-brand-text-secondary py-8">Tidak ada pembayaran yang tertunda.</p>}
                        </div>
                    )}
                    {activeModal === 'contracts' && (
                        <div className="space-y-3">
                            {contracts.length > 0 ? contracts.map(c => (
                                <div key={c.id} className="p-3 bg-brand-bg rounded-lg">
                                    <p className="font-semibold text-brand-text-light">{c.contractNumber}</p>
                                    <p className="text-sm text-brand-text-secondary">Klien: {clients.find(client => client.id === c.clientId)?.name || c.clientName1}</p>
                                </div>
                            )) : <p className="text-center text-brand-text-secondary py-8">Tidak ada kontrak.</p>}
                        </div>
                    )}
                </div>
            </Modal>
    </div>
  );
};

export default Dashboard;
