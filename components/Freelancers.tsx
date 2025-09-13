import React, { useState, useMemo, useEffect } from 'react';
import { TeamMember, TeamProjectPayment, Profile, Transaction, TransactionType, TeamPaymentRecord, Project, RewardLedgerEntry, Card, FinancialPocket, PocketType, PerformanceNoteType, PerformanceNote, NavigationAction, CardType } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import FreelancerProjects from './FreelancerProjects';
import StatCard from './StatCard';
import SignaturePad from './SignaturePad';
import { PlusIcon, PencilIcon, Trash2Icon, EyeIcon, PrinterIcon, CreditCardIcon, FileTextIcon, HistoryIcon, Share2Icon, PiggyBankIcon, LightbulbIcon, StarIcon, UsersIcon, AlertCircleIcon, UserCheckIcon, MessageSquareIcon, DownloadIcon, QrCodeIcon } from '../constants';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getStatusClass = (status: 'Paid' | 'Unpaid') => {
    return status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400';
};

const emptyMember: Omit<TeamMember, 'id' | 'rewardBalance' | 'rating' | 'performanceNotes' | 'portalAccessId'> = { name: '', role: '', email: '', phone: '', standardFee: 0, noRek: '' };

const downloadCSV = (headers: string[], data: (string | number)[][], filename: string) => {
    const DELIM = ';';
    const BOM = '\uFEFF';

    const quoteField = (field: string | number) => {
        if (typeof field === 'number') return String(field);
        const str = String(field ?? '');
        if (str.includes(DELIM) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}`;
        }
        return str;
    };

    const csvRows = [
        headers.join(DELIM),
        ...data.map(row => row.map(quoteField).join(DELIM))
    ];

    const csvString = BOM + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// --- NEWLY ADDED HELPER COMPONENTS ---

const StarRating: React.FC<{ rating: number; onSetRating?: (rating: number) => void }> = ({ rating, onSetRating }) => (
    <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
            <button
                key={star}
                type="button"
                onClick={onSetRating ? () => onSetRating(star) : undefined}
                className={`p-1 ${onSetRating ? 'cursor-pointer' : ''}`}
                disabled={!onSetRating}
                aria-label={`Set rating to ${star}`}
            >
                <StarIcon className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
            </button>
        ))}
    </div>
);

const getNoteTypeClass = (type: PerformanceNoteType) => {
    switch (type) {
        case PerformanceNoteType.PRAISE: return 'bg-green-500/20 text-green-400';
        case PerformanceNoteType.CONCERN: return 'bg-yellow-500/20 text-yellow-400';
        case PerformanceNoteType.LATE_DEADLINE: return 'bg-red-500/20 text-red-400';
        case PerformanceNoteType.GENERAL:
        default: return 'bg-gray-500/20 text-gray-400';
    }
}

interface PerformanceTabProps {
    member: TeamMember;
    onSetRating: (rating: number) => void;
    newNote: string;
    setNewNote: (note: string) => void;
    newNoteType: PerformanceNoteType;
    setNewNoteType: (type: PerformanceNoteType) => void;
    onAddNote: () => void;
    onDeleteNote: (noteId: string) => void;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({
    member, onSetRating, newNote, setNewNote, newNoteType, setNewNoteType, onAddNote, onDeleteNote
}) => (
    <div>
        <div className="bg-brand-bg p-4 rounded-lg mb-6">
            <h4 className="text-base font-semibold text-brand-text-light mb-2">Peringkat Kinerja Keseluruhan</h4>
            <p className="text-sm text-brand-text-secondary mb-3">Beri peringkat pada freelancer ini berdasarkan kinerja mereka secara umum.</p>
            <div className="flex justify-center">
                <StarRating rating={member.rating} onSetRating={onSetRating} />
            </div>
        </div>

        <div className="mb-6">
            <h4 className="text-base font-semibold text-brand-text-light mb-3">Tambah Catatan Kinerja Baru</h4>
            <div className="bg-brand-bg p-4 rounded-lg space-y-4">
                 <div className="input-group">
                    <textarea 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="input-field" 
                        rows={3} 
                        placeholder=" "
                        id="newPerformanceNote"
                    />
                    <label htmlFor="newPerformanceNote" className="input-label">Tulis catatan...</label>
                </div>
                 <div className="flex justify-between items-center">
                    <div className="input-group !mb-0 flex-grow">
                        <select
                            id="newNoteType"
                            value={newNoteType}
                            onChange={(e) => setNewNoteType(e.target.value as PerformanceNoteType)}
                            className="input-field"
                        >
                            {Object.values(PerformanceNoteType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                         <label htmlFor="newNoteType" className="input-label">Jenis Catatan</label>
                    </div>
                    <button onClick={onAddNote} className="button-primary ml-4">Tambah Catatan</button>
                </div>
            </div>
        </div>
        
        <div>
            <h4 className="text-base font-semibold text-brand-text-light mb-3">Riwayat Catatan Kinerja</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {member.performanceNotes.length > 0 ? member.performanceNotes.map(note => (
                    <div key={note.id} className="bg-brand-bg p-3 rounded-lg flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getNoteTypeClass(note.type)}`}>{note.type}</span>
                                <span className="text-xs text-brand-text-secondary">{new Date(note.date).toLocaleDateString('id-ID')}</span>
                            </div>
                            <p className="text-sm text-brand-text-primary">{note.note}</p>
                        </div>
                        <button onClick={() => onDeleteNote(note.id)} className="p-1.5 text-brand-text-secondary hover:text-red-400">
                            <Trash2Icon className="w-4 h-4" />
                        </button>
                    </div>
                )) : (
                    <p className="text-center text-sm text-brand-text-secondary py-8">Belum ada catatan kinerja.</p>
                )}
            </div>
        </div>
    </div>
);


// --- Detail Modal Sub-components (Moved outside main component) ---

const RewardSavingsTab: React.FC<{
    member: TeamMember,
    suggestions: {id: string, icon: React.ReactNode, title: string, text: string}[],
    rewardLedger: RewardLedgerEntry[],
    onWithdraw: () => void
}> = ({ member, suggestions, rewardLedger, onWithdraw }) => (
    <div>
        <div className="flex flex-col items-center justify-center p-6 text-center">
             <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg w-full max-w-sm">
                <p className="text-sm uppercase tracking-wider opacity-80">Saldo Hadiah Saat Ini</p>
                <p className="text-5xl font-bold mt-2 tracking-tight">{formatCurrency(member.rewardBalance)}</p>
            </div>
            <p className="text-sm text-brand-text-secondary mt-6 max-w-md">Saldo ini terakumulasi dari hadiah yang Anda berikan pada setiap proyek yang telah lunas. Anda dapat mencairkan seluruh saldo ini untuk freelancer.</p>
            <button onClick={onWithdraw} disabled={member.rewardBalance <= 0} className="mt-6 button-primary">
                Tarik Seluruh Saldo Hadiah
            </button>
        </div>
        
        <div className="my-8 px-1">
            <h4 className="text-lg font-semibold text-gradient mb-4 text-center">Saran Strategis</h4>
            {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map(s => (
                        <div key={s.id} className="bg-brand-bg p-4 rounded-xl flex items-start gap-4 border border-brand-border">
                            <div className="flex-shrink-0 mt-1 text-blue-400">{s.icon}</div>
                            <div>
                                <p className="font-semibold text-brand-text-light">{s.title}</p>
                                <p className="text-sm text-brand-text-secondary">{s.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-center text-brand-text-secondary text-sm">Tidak ada saran khusus saat ini.</p>
            )}
        </div>

        <div className="mt-4 px-1">
            <h4 className="text-lg font-semibold text-gradient mb-4">Riwayat Saldo Hadiah</h4>
            {rewardLedger.length > 0 ? (
                <div className="border border-brand-border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-brand-bg">
                            <tr>
                                <th className="p-3 text-left font-medium text-brand-text-secondary tracking-wider">Tanggal</th>
                                <th className="p-3 text-left font-medium text-brand-text-secondary tracking-wider">Deskripsi</th>
                                <th className="p-3 text-right font-medium text-brand-text-secondary tracking-wider">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {rewardLedger.map(entry => (
                                <tr key={entry.id}>
                                    <td className="p-3 whitespace-nowrap text-brand-text-primary">{new Date(entry.date).toLocaleDateString('id-ID')}</td>
                                    <td className="p-3 text-brand-text-light">{entry.description}</td>
                                    <td className={`p-3 text-right font-semibold whitespace-nowrap ${entry.amount >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                                        {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-brand-text-secondary py-8">Belum ada riwayat hadiah untuk freelancer ini.</p>
            )}
        </div>
    </div>
);

interface CreatePaymentTabProps {
    member: TeamMember;
    paymentDetails: { projects: TeamProjectPayment[]; total: number };
    paymentAmount: number | '';
    setPaymentAmount: (amount: number | '') => void;
    onPay: () => void;
    onSetTab: (tab: 'projects') => void;
    renderPaymentDetailsContent: () => React.ReactNode;
    cards: Card[];
    monthlyBudgetPocket: FinancialPocket | undefined;
    paymentSourceId: string;
    setPaymentSourceId: (id: string) => void;
    onSign: () => void;
}

const CreatePaymentTab: React.FC<CreatePaymentTabProps> = ({ 
    member, paymentDetails, paymentAmount, setPaymentAmount, onPay, onSetTab, renderPaymentDetailsContent, cards,
    monthlyBudgetPocket, paymentSourceId, setPaymentSourceId, onSign
}) => {
    
    const handlePayClick = () => {
        onPay();
    }
    
    return (
        <div>
             {renderPaymentDetailsContent()}
             
            <div className="mt-6 pt-6 border-t border-brand-border non-printable space-y-4">
                <h5 className="font-semibold text-gradient text-base">Buat Pembayaran</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="input-group">
                        <input
                            type="number"
                            id="paymentAmount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            className="input-field"
                            placeholder=" "
                            max={paymentDetails.total}
                        />
                        <label htmlFor="paymentAmount" className="input-label">Jumlah Bayar (Total: {formatCurrency(paymentDetails.total)})</label>
                    </div>
                     <div className="input-group">
                        <select
                            id="paymentSource"
                            className="input-field"
                            value={paymentSourceId}
                            onChange={e => setPaymentSourceId(e.target.value)}
                        >
                             <option value="" disabled>Pilih Sumber Pembayaran...</option>
                            {monthlyBudgetPocket && (
                                <option value={`pocket-${monthlyBudgetPocket.id}`}>
                                    {monthlyBudgetPocket.name} (Sisa: {formatCurrency(monthlyBudgetPocket.amount)})
                                </option>
                            )}
                            {cards.map(card => (
                                <option key={card.id} value={`card-${card.id}`}>
                                    {card.bankName} {card.lastFourDigits !== 'CASH' ? `**** ${card.lastFourDigits}` : ''} (Saldo: {formatCurrency(card.balance)})
                                </option>
                            ))}
                        </select>
                         <label htmlFor="paymentSource" className="input-label">Sumber Dana</label>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-2">
                         <button type="button" onClick={onSign} className="button-secondary text-sm inline-flex items-center gap-2">
                             <PencilIcon className="w-4 h-4"/>
                             Tanda Tangani Slip
                        </button>
                        <button type="button" onClick={() => window.print()} className="button-secondary text-sm inline-flex items-center gap-2">
                             <PrinterIcon className="w-4 h-4"/> Cetak
                        </button>
                    </div>
                     <button type="button" onClick={handlePayClick} className="button-primary w-full sm:w-auto">
                        Bayar Sekarang & Buat Catatan
                    </button>
                </div>
            </div>
        </div>
    );
};

interface FreelancersProps {
    teamMembers: TeamMember[];
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    teamPaymentRecords: TeamPaymentRecord[];
    setTeamPaymentRecords: React.Dispatch<React.SetStateAction<TeamPaymentRecord[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    userProfile: Profile;
    showNotification: (message: string) => void;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    rewardLedgerEntries: RewardLedgerEntry[];
    setRewardLedgerEntries: React.Dispatch<React.SetStateAction<RewardLedgerEntry[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    onSignPaymentRecord: (recordId: string, signatureDataUrl: string) => void;
}

export const Freelancers: React.FC<FreelancersProps> = ({
    teamMembers, setTeamMembers, teamProjectPayments, setTeamProjectPayments, teamPaymentRecords, setTeamPaymentRecords,
    transactions, setTransactions, userProfile, showNotification, initialAction, setInitialAction, projects, setProjects,
    rewardLedgerEntries, setRewardLedgerEntries, pockets, setPockets, cards, setCards, onSignPaymentRecord
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState<Omit<TeamMember, 'id' | 'rewardBalance' | 'rating' | 'performanceNotes' | 'portalAccessId'>>(emptyMember);
    
    const [detailTab, setDetailTab] = useState<'projects' | 'payments' | 'performance' | 'rewards' | 'create-payment'>('projects');
    const [projectsToPay, setProjectsToPay] = useState<string[]>([]);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentSourceId, setPaymentSourceId] = useState('');
    const [activeStatModal, setActiveStatModal] = useState<'total' | 'unpaid' | 'topRated' | 'rewards' | null>(null);
    const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
    const [paymentSlipToView, setPaymentSlipToView] = useState<TeamPaymentRecord | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    
    // New states for performance management
    const [newNote, setNewNote] = useState('');
    const [newNoteType, setNewNoteType] = useState<PerformanceNoteType>(PerformanceNoteType.GENERAL);
    const [qrModalContent, setQrModalContent] = useState<{ title: string; url: string } | null>(null);

    useEffect(() => {
        if (initialAction && initialAction.type === 'VIEW_FREELANCER_DETAILS' && initialAction.id) {
            const memberToView = teamMembers.find(m => m.id === initialAction.id);
            if (memberToView) {
                handleViewDetails(memberToView);
            }
            setInitialAction(null);
        }
        if (qrModalContent) {
            const qrCodeContainer = document.getElementById('freelancer-portal-qrcode');
            if (qrCodeContainer && typeof (window as any).QRCode !== 'undefined') {
                qrCodeContainer.innerHTML = '';
                 new (window as any).QRCode(qrCodeContainer, {
                    text: qrModalContent.url,
                    width: 200,
                    height: 200,
                    colorDark: "#020617",
                    colorLight: "#ffffff",
                    correctLevel: 2 // H
                });
            }
        }
    }, [initialAction, teamMembers, setInitialAction, qrModalContent]);

    const handleOpenQrModal = (member: TeamMember) => {
        const path = window.location.pathname.replace(/index\.html$/, '');
        const url = `${window.location.origin}${path}#/freelancer-portal/${member.portalAccessId}`;
        setQrModalContent({ title: `Portal Tautan untuk ${member.name}`, url });
    };

    const teamStats = useMemo(() => {
        const totalUnpaid = teamProjectPayments.filter(p => p.status === 'Unpaid').reduce((sum, p) => sum + p.fee, 0);
        const topRated = [...teamMembers].sort((a,b) => b.rating - a.rating)[0];
        return {
            totalMembers: teamMembers.length,
            totalUnpaid: formatCurrency(totalUnpaid),
            topRatedName: topRated ? topRated.name : 'N/A',
            topRatedRating: topRated ? topRated.rating.toFixed(1) : 'N/A',
        }
    }, [teamMembers, teamProjectPayments]);

    const handleOpenForm = (mode: 'add' | 'edit', member?: TeamMember) => {
        setFormMode(mode);
        if (mode === 'edit' && member) {
            setSelectedMember(member);
            setFormData(member);
        } else {
            setSelectedMember(null);
            setFormData(emptyMember);
        }
        setIsFormOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'standardFee' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formMode === 'add') {
            const newMember: TeamMember = {
                ...formData,
                id: crypto.randomUUID(),
                rewardBalance: 0,
                rating: 0,
                performanceNotes: [],
                portalAccessId: crypto.randomUUID(),
            };
            setTeamMembers(prev => [...prev, newMember]);
            showNotification(`Freelancer ${newMember.name} berhasil ditambahkan.`);
        } else if (selectedMember) {
            const updatedMemberData = { ...selectedMember, ...formData };
            setTeamMembers(prev => prev.map(m => m.id === selectedMember.id ? updatedMemberData : m));
    
            // Cascade name change to other data structures
            if (formData.name !== selectedMember.name) {
                // Update projects
                setProjects(prevProjects => prevProjects.map(proj => ({
                    ...proj,
                    team: proj.team.map(t => 
                        t.memberId === selectedMember.id ? { ...t, name: formData.name } : t
                    )
                })));
    
                // Update team project payments
                setTeamProjectPayments(prevPayments => prevPayments.map(p => 
                    p.teamMemberId === selectedMember.id ? { ...p, teamMemberName: formData.name } : p
                ));
            }
    
            showNotification(`Data ${formData.name} berhasil diperbarui.`);
        }
        setIsFormOpen(false);
    };
    
    const handleDelete = (memberId: string) => {
        if (teamProjectPayments.some(p => p.teamMemberId === memberId && p.status === 'Unpaid')) {
            alert("Freelancer ini memiliki pembayaran yang belum lunas dan tidak dapat dihapus.");
            return;
        }
        if (window.confirm("Apakah Anda yakin ingin menghapus freelancer ini? Semua data terkait (proyek, pembayaran, riwayat hadiah) juga akan dihapus.")) {
            // Remove from projects
            setProjects(prevProjects => prevProjects.map(p => ({
                ...p,
                team: p.team.filter(t => t.memberId !== memberId)
            })));

            // Remove from payments
            setTeamProjectPayments(prevPayments => prevPayments.filter(p => p.teamMemberId !== memberId));
            
            // Remove from payment records
            setTeamPaymentRecords(prevRecords => prevRecords.filter(r => r.teamMemberId !== memberId));

            // Remove from reward ledger
            setRewardLedgerEntries(prevLedger => prevLedger.filter(l => l.teamMemberId !== memberId));

            // Finally, remove the member
            setTeamMembers(prev => prev.filter(m => m.id !== memberId));
            
            showNotification('Freelancer dan semua data terkait berhasil dihapus.');
        }
    };
    
    const handleViewDetails = (member: TeamMember) => {
        setSelectedMember(member);
        setDetailTab('projects');
        setIsDetailOpen(true);
    };

    const handleCreatePayment = () => {
        if (!selectedMember || projectsToPay.length === 0) return;
        const totalToPay = selectedMemberUnpaidProjects
            .filter(p => projectsToPay.includes(p.id))
            .reduce((sum, p) => sum + p.fee, 0);
        setPaymentAmount(totalToPay);
        
        const budgetPocket = pockets.find(p => p.type === PocketType.EXPENSE);
        if (budgetPocket && budgetPocket.amount >= totalToPay) {
            setPaymentSourceId(`pocket-${budgetPocket.id}`);
        } else {
            setPaymentSourceId('');
        }
        
        setDetailTab('create-payment');
    };

    const handlePay = () => {
        if (!selectedMember || !paymentAmount || paymentAmount <= 0 || !paymentSourceId) {
            alert('Harap isi jumlah dan pilih sumber dana.');
            return;
        }
        
        // 1. Create Transaction
        const newTransaction: Transaction = {
            id: `TRN-PAY-FR-${crypto.randomUUID()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Pembayaran Gaji Freelancer: ${selectedMember.name} (${projectsToPay.length} proyek)`,
            amount: paymentAmount,
            type: TransactionType.EXPENSE,
            category: 'Gaji Freelancer',
            method: 'Transfer Bank', // Placeholder, will be overwritten
        };
        
        // 2. Update Card/Pocket Balance
        if (paymentSourceId.startsWith('card-')) {
            const cardId = paymentSourceId.replace('card-', '');
            const card = cards.find(c => c.id === cardId);
            if (!card || card.balance < paymentAmount) {
                alert(`Saldo di kartu ${card?.bankName} tidak mencukupi.`); return;
            }
            newTransaction.cardId = cardId;
            newTransaction.method = card.cardType === CardType.TUNAI ? 'Tunai' : 'Kartu';
            setCards(prev => prev.map(c => c.id === cardId ? {...c, balance: c.balance - paymentAmount} : c));
        } else { // pocket
            const pocketId = paymentSourceId.replace('pocket-', '');
            const pocket = pockets.find(p => p.id === pocketId);
            if (!pocket || pocket.amount < paymentAmount) {
                alert(`Saldo di kantong ${pocket?.name} tidak mencukupi.`); return;
            }
            newTransaction.pocketId = pocketId;
            newTransaction.method = 'Sistem';
            setPockets(prev => prev.map(p => p.id === pocketId ? { ...p, amount: p.amount - paymentAmount } : p));
        }
        
        // 3. Create Payment Record
        const newRecord: TeamPaymentRecord = {
            id: crypto.randomUUID(),
            recordNumber: `PAY-FR-${selectedMember.id.slice(-4)}-${Date.now()}`,
            teamMemberId: selectedMember.id,
            date: new Date().toISOString().split('T')[0],
            projectPaymentIds: projectsToPay,
            totalAmount: paymentAmount
        };

        // 4. Update Project Payment Status
        setTeamProjectPayments(prev => prev.map(p => projectsToPay.includes(p.id) ? { ...p, status: 'Paid' } : p));
        
        setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setTeamPaymentRecords(prev => [...prev, newRecord]);

        showNotification(`Pembayaran untuk ${selectedMember.name} sebesar ${formatCurrency(paymentAmount)} berhasil dicatat.`);
        
        setProjectsToPay([]);
        setPaymentAmount('');
        setIsDetailOpen(false);
    };

    const handleWithdrawRewards = () => {
        if (!selectedMember || selectedMember.rewardBalance <= 0) return;

        if (window.confirm(`Anda akan menarik saldo hadiah sebesar ${formatCurrency(selectedMember.rewardBalance)} untuk ${selectedMember.name}. Lanjutkan?`)) {
            const withdrawalAmount = selectedMember.rewardBalance;
            const sourceCard = cards.find(c => c.id !== 'CARD_CASH') || cards[0];
            if (!sourceCard || sourceCard.balance < withdrawalAmount) {
                alert(`Saldo di kartu sumber (${sourceCard.bankName}) tidak mencukupi untuk penarikan hadiah.`);
                return;
            }

            // 1. Create transaction for the withdrawal
            const withdrawalTx: Transaction = {
                id: `TRN-RWD-WTH-${crypto.randomUUID()}`,
                date: new Date().toISOString().split('T')[0],
                description: `Penarikan saldo hadiah oleh ${selectedMember.name}`,
                amount: withdrawalAmount,
                type: TransactionType.EXPENSE,
                category: 'Penarikan Hadiah Freelancer',
                method: 'Transfer Bank',
                cardId: sourceCard.id,
            };

            // 2. Create a negative entry in the reward ledger
            const ledgerEntry: RewardLedgerEntry = {
                id: `RLE-${withdrawalTx.id}`,
                teamMemberId: selectedMember.id,
                date: withdrawalTx.date,
                description: withdrawalTx.description,
                amount: -withdrawalAmount,
            };

            // 3. Update states
            setTransactions(prev => [...prev, withdrawalTx].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setRewardLedgerEntries(prev => [...prev, ledgerEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setCards(prev => prev.map(c => c.id === sourceCard.id ? { ...c, balance: c.balance - withdrawalAmount } : c));
            setTeamMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, rewardBalance: 0 } : m));
            
            const rewardPocket = pockets.find(p => p.type === PocketType.REWARD_POOL);
            if (rewardPocket) {
                setPockets(prev => prev.map(p => p.id === rewardPocket.id ? { ...p, amount: p.amount - withdrawalAmount } : p));
            }

            showNotification(`Penarikan hadiah untuk ${selectedMember.name} berhasil.`);
            setIsDetailOpen(false);
        }
    };

    const selectedMemberUnpaidProjects = useMemo(() => {
        if (!selectedMember) return [];
        return teamProjectPayments.filter(p => p.teamMemberId === selectedMember.id && p.status === 'Unpaid');
    }, [teamProjectPayments, selectedMember]);
    
    // Performance Tab Handlers
    const handleSetRating = (rating: number) => {
        if (!selectedMember) return;
        setTeamMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, rating } : m));
        // Also update the selectedMember state to reflect change in the modal
        setSelectedMember(prev => prev ? { ...prev, rating } : null);
    };

    const handleAddNote = () => {
        if (!selectedMember || !newNote.trim()) return;
        const note: PerformanceNote = {
            id: `PN-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            note: newNote,
            type: newNoteType
        };
        const updatedNotes = [...selectedMember.performanceNotes, note];
        setTeamMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, performanceNotes: updatedNotes } : m));
        setSelectedMember(prev => prev ? { ...prev, performanceNotes: updatedNotes } : null);
        setNewNote('');
        setNewNoteType(PerformanceNoteType.GENERAL);
    };

    const handleDeleteNote = (noteId: string) => {
        if (!selectedMember) return;
        const updatedNotes = selectedMember.performanceNotes.filter(n => n.id !== noteId);
        setTeamMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, performanceNotes: updatedNotes } : m));
        setSelectedMember(prev => prev ? { ...prev, performanceNotes: updatedNotes } : null);
    };

    const monthlyBudgetPocket = useMemo(() => pockets.find(p => p.type === PocketType.EXPENSE), [pockets]);

    const handleSaveSignature = (signatureDataUrl: string) => {
        if (paymentSlipToView) {
            onSignPaymentRecord(paymentSlipToView.id, signatureDataUrl);
            setPaymentSlipToView(prev => prev ? { ...prev, vendorSignature: signatureDataUrl } : null);
        }
        setIsSignatureModalOpen(false);
    };
    
    const renderPaymentSlipBody = (record: TeamPaymentRecord) => {
        const freelancer = teamMembers.find(m => m.id === record.teamMemberId);
        if (!freelancer) return null;
        const projectsBeingPaid = teamProjectPayments.filter(p => record.projectPaymentIds.includes(p.id));
    
        return (
            <div id={`payment-slip-content-${record.id}`} className="printable-content bg-slate-50 font-sans text-slate-800 printable-area avoid-break">
                <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg">
                    <header className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900">{userProfile.companyName}</h1>
                            <p className="text-sm text-slate-500">{userProfile.address}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold uppercase text-slate-400 tracking-widest">Slip Pembayaran</h2>
                            <p className="text-sm text-slate-500 mt-1">No: <span className="font-semibold text-slate-700">{record.recordNumber}</span></p>
                            <p className="text-sm text-slate-500">Tanggal: <span className="font-semibold text-slate-700">{formatDate(record.date)}</span></p>
                        </div>
                    </header>
    
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 doc-header-grid">
                        <div className="bg-slate-50 p-6 rounded-xl"><h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Dibayarkan Kepada</h3><p className="font-bold text-slate-800">{freelancer.name}</p><p className="text-sm text-slate-600">{freelancer.role}</p><p className="text-sm text-slate-600">No. Rek: {freelancer.noRek}</p></div>
                        <div className="bg-slate-50 p-6 rounded-xl"><h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Dibayarkan Oleh</h3><p className="font-bold text-slate-800">{userProfile.companyName}</p><p className="text-sm text-slate-600">{userProfile.bankAccount}</p></div>
                    </section>
    
                    <section>
                        <h3 className="font-semibold text-slate-800 mb-3">Rincian Pembayaran</h3>
                        <table className="w-full text-left responsive-table">
                            <thead><tr className="border-b-2 border-slate-200"><th className="p-3 text-sm font-semibold uppercase text-slate-500">Proyek</th><th className="p-3 text-sm font-semibold uppercase text-slate-500">Peran</th><th className="p-3 text-sm font-semibold uppercase text-slate-500 text-right">Fee</th></tr></thead>
                            <tbody className="divide-y divide-slate-200">
                                {projectsBeingPaid.map(p => {
                                    const project = projects.find(proj => proj.id === p.projectId);
                                    return (
                                        <tr key={p.id}>
                                            <td data-label="Proyek" className="p-3 font-semibold text-slate-800">{project?.projectName || 'N/A'}</td>
                                            <td data-label="Peran" className="p-3 text-slate-600">{project?.team.find(t => t.memberId === freelancer.id)?.role || freelancer.role}</td>
                                            <td data-label="Fee" className="p-3 text-right text-slate-800">{formatCurrency(p.fee)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>
    
                    <section className="mt-12 avoid-break totals-section">
                        <div className="flex flex-col sm:flex-row justify-end">
                            <div className="w-full sm:w-2/5 space-y-2 text-sm">
                                <div className="flex justify-between font-bold text-xl text-slate-900 bg-slate-100 p-4 rounded-lg">
                                    <span>TOTAL DIBAYAR</span>
                                    <span>{formatCurrency(record.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <footer className="mt-12 pt-8 border-t-2 border-slate-200 avoid-break signature-section">
                        <div className="flex justify-between items-end">
                            <div></div>
                            <div className="text-center w-full sm:w-2/5">
                                <p className="text-sm text-slate-600">Diverifikasi oleh,</p>
                                <div className="h-20 mt-2 flex items-center justify-center">{record.vendorSignature ? (<img src={record.vendorSignature} alt="Tanda Tangan" className="h-20 object-contain" />) : (<div className="h-20 flex items-center justify-center text-xs text-slate-400 italic border-b border-dashed w-full">Belum Ditandatangani</div>)}</div>
                                <p className="text-sm font-semibold text-slate-800 mt-1 border-t-2 border-slate-300 pt-1">({userProfile.authorizedSigner || userProfile.companyName})</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        );
    };
    
    const handleDownloadFreelancers = () => {
        const headers = ['Nama', 'Role', 'Email', 'Telepon', 'No. Rekening', 'Fee Belum Dibayar', 'Saldo Hadiah', 'Rating'];
        const data = teamMembers.map(member => {
            const unpaidFee = teamProjectPayments
                .filter(p => p.teamMemberId === member.id && p.status === 'Unpaid')
                .reduce((sum, p) => sum + p.fee, 0);
            return [
                `"${member.name.replace(/"/g, '""')}"`,
                member.role,
                member.email,
                member.phone,
                member.noRek || '-',
                unpaidFee,
                member.rewardBalance,
                member.rating.toFixed(1)
            ];
        });
        downloadCSV(headers, data, `data-freelancer-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const modalTitles: { [key: string]: string } = {
        total: 'Daftar Semua Freelancer',
        unpaid: 'Rincian Fee Belum Dibayar',
        topRated: 'Peringkat Freelancer',
        rewards: 'Riwayat Saldo Hadiah'
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Manajemen Freelancer" subtitle="Kelola semua data freelancer, proyek, dan pembayaran.">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsInfoModalOpen(true)} className="button-secondary">Pelajari Halaman Ini</button>
                    <button onClick={handleDownloadFreelancers} className="button-secondary inline-flex items-center gap-2">
                        <DownloadIcon className="w-4 h-4"/> Unduh Data
                    </button>
                    <button onClick={() => handleOpenForm('add')} className="button-primary inline-flex items-center gap-2">
                        <PlusIcon className="w-5 h-5"/>
                        Tambah Freelancer
                    </button>
                </div>
            </PageHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div onClick={() => setActiveStatModal('total')} className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '100ms' }}>
                    <StatCard icon={<UsersIcon className="w-6 h-6"/>} title="Total Freelancer" value={teamStats.totalMembers.toString()} iconBgColor="bg-blue-500/20" iconColor="text-blue-400" />
                 </div>
                 <div onClick={() => setActiveStatModal('unpaid')} className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '200ms' }}>
                    <StatCard icon={<AlertCircleIcon className="w-6 h-6"/>} title="Total Fee Belum Dibayar" value={teamStats.totalUnpaid} iconBgColor="bg-red-500/20" iconColor="text-red-400" />
                 </div>
                 <div onClick={() => setActiveStatModal('topRated')} className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '300ms' }}>
                    <StatCard icon={<UserCheckIcon className="w-6 h-6"/>} title="Rating Tertinggi" value={teamStats.topRatedName} subtitle={`Rating: ${teamStats.topRatedRating}`} iconBgColor="bg-green-500/20" iconColor="text-green-400" />
                 </div>
                 <div onClick={() => setActiveStatModal('rewards')} className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '400ms' }}>
                    <StatCard icon={<PiggyBankIcon className="w-6 h-6"/>} title="Total Saldo Hadiah" value={formatCurrency(pockets.find(p => p.type === PocketType.REWARD_POOL)?.amount || 0)} iconBgColor="bg-yellow-500/20" iconColor="text-yellow-400" />
                 </div>
            </div>

             <div className="bg-brand-surface p-4 rounded-xl shadow-lg border border-brand-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-brand-text-secondary uppercase"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Fee Belum Dibayar</th><th className="px-4 py-3">Saldo Hadiah</th><th className="px-4 py-3 text-center">Rating</th><th className="px-4 py-3 text-center">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-brand-border">
                            {teamMembers.map(member => {
                                const unpaidFee = teamProjectPayments.filter(p => p.teamMemberId === member.id && p.status === 'Unpaid').reduce((sum, p) => sum + p.fee, 0);
                                return (
                                <tr key={member.id} className="hover:bg-brand-bg">
                                    <td className="px-4 py-3 font-semibold text-brand-text-light">{member.name}</td>
                                    <td className="px-4 py-3 text-brand-text-primary">{member.role}</td>
                                    <td className="px-4 py-3 font-semibold text-red-400">{formatCurrency(unpaidFee)}</td>
                                    <td className="px-4 py-3 font-semibold text-yellow-400">{formatCurrency(member.rewardBalance)}</td>
                                    <td className="px-4 py-3"><div className="flex justify-center items-center gap-1"><StarIcon className="w-4 h-4 text-yellow-400 fill-current"/>{member.rating.toFixed(1)}</div></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button onClick={() => handleViewDetails(member)} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full" title="Detail"><EyeIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleOpenForm('edit', member)} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full" title="Edit"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(member.id)} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full" title="Hapus"><Trash2Icon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Panduan Halaman Freelancer">
                <div className="space-y-4 text-sm text-brand-text-primary">
                    <p>Halaman ini adalah pusat untuk semua hal yang berkaitan dengan tim freelancer Anda.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Tambah & Edit:</strong> Gunakan tombol di kanan atas untuk menambahkan freelancer baru atau klik ikon pensil di tabel untuk mengedit data yang ada.</li>
                        <li><strong>Lihat Detail (<EyeIcon className="w-4 h-4 inline-block"/>):</strong> Buka panel detail untuk melihat semua proyek yang dikerjakan, riwayat pembayaran, dan catatan kinerja.</li>
                        <li><strong>Kelola Pembayaran:</strong> Di panel detail, Anda dapat memilih proyek yang belum dibayar, membuat slip pembayaran, dan mencatat transaksi pembayaran.</li>
                        <li><strong>Kinerja & Hadiah:</strong> Berikan peringkat, tambahkan catatan kinerja, dan kelola saldo hadiah untuk setiap freelancer di tab masing-masing pada panel detail.</li>
                        <li><strong>Bagikan Portal:</strong> Setiap freelancer memiliki portal pribadi. Bagikan tautan unik melalui panel detail agar mereka dapat melihat jadwal dan tugas revisi mereka.</li>
                    </ul>
                </div>
            </Modal>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={formMode === 'add' ? 'Tambah Freelancer' : 'Edit Freelancer'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="input-group"><input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} className="input-field" placeholder=" " required /><label className="input-label">Nama</label></div>
                    <div className="input-group"><input type="text" id="role" name="role" value={formData.role} onChange={handleFormChange} className="input-field" placeholder=" " required /><label className="input-label">Role (e.g., Fotografer)</label></div>
                    <div className="input-group"><input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} className="input-field" placeholder=" " required /><label className="input-label">Email</label></div>
                    <div className="input-group"><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} className="input-field" placeholder=" " required /><label className="input-label">Telepon</label></div>
                    <div className="input-group"><input type="number" id="standardFee" name="standardFee" value={formData.standardFee} onChange={handleFormChange} className="input-field" placeholder=" " required /><label className="input-label">Fee Standar (IDR)</label></div>
                    <div className="input-group"><input type="text" id="noRek" name="noRek" value={formData.noRek} onChange={handleFormChange} className="input-field" placeholder=" " /><label className="input-label">No. Rekening</label></div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border"><button type="button" onClick={() => setIsFormOpen(false)} className="button-secondary">Batal</button><button type="submit" className="button-primary">{formMode === 'add' ? 'Simpan' : 'Update'}</button></div>
                </form>
            </Modal>
            
            {selectedMember && <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Detail Freelancer: ${selectedMember.name}`} size="4xl">
                <div>
                     <div className="border-b border-brand-border"><nav className="-mb-px flex space-x-6 overflow-x-auto">
                        <button onClick={() => setDetailTab('projects')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'projects' || detailTab === 'create-payment' ?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><FileTextIcon className="w-5 h-5"/>Proyek Belum Dibayar</button>
                        <button onClick={() => setDetailTab('payments')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'payments'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><HistoryIcon className="w-5 h-5"/>Riwayat Pembayaran</button>
                        <button onClick={() => setDetailTab('performance')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'performance'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><StarIcon className="w-5 h-5"/>Kinerja</button>
                        <button onClick={() => setDetailTab('rewards')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'rewards'?'border-brand-accent text-brand-accent':'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><PiggyBankIcon className="w-5 h-5"/>Tabungan Hadiah</button>
                        <button onClick={() => handleOpenQrModal(selectedMember)} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm border-transparent text-brand-text-secondary hover:text-brand-text-light`}><Share2Icon className="w-5 h-5"/>Bagikan Portal</button>
                    </nav></div>
                    <div className="pt-5 max-h-[65vh] overflow-y-auto pr-2">
                        {detailTab === 'projects' && <FreelancerProjects unpaidProjects={selectedMemberUnpaidProjects} projectsToPay={projectsToPay} onToggleProject={(id) => setProjectsToPay(p => p.includes(id) ? p.filter(i=>i!==id) : [...p, id])} onProceedToPayment={handleCreatePayment} projects={projects} />}
                        {detailTab === 'payments' && <div>
                            <h4 className="text-base font-semibold text-brand-text-light mb-4">Riwayat Pembayaran</h4>
                            {teamPaymentRecords.filter(r => r.teamMemberId === selectedMember.id).length > 0 ? (
                                <div className="overflow-x-auto border border-brand-border rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-brand-bg text-xs text-brand-text-secondary uppercase">
                                            <tr>
                                                <th className="px-4 py-3 text-left">No. Pembayaran</th>
                                                <th className="px-4 py-3 text-left">Tanggal</th>
                                                <th className="px-4 py-3 text-right">Jumlah</th>
                                                <th className="px-4 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-border">
                                            {teamPaymentRecords.filter(r => r.teamMemberId === selectedMember.id).map(record => (
                                                <React.Fragment key={record.id}>
                                                    <tr>
                                                        <td className="px-4 py-3 font-mono text-brand-text-secondary">{record.recordNumber}</td>
                                                        <td className="px-4 py-3 text-brand-text-primary">{formatDate(record.date)}</td>
                                                        <td className="px-4 py-3 text-right font-semibold text-brand-success">{formatCurrency(record.totalAmount)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                           <div className="flex items-center justify-center gap-1">
                                                                <button onClick={() => setExpandedRecordId(expandedRecordId === record.id ? null : record.id)} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full" title={expandedRecordId === record.id ? 'Tutup Rincian' : 'Lihat Rincian'}><EyeIcon className="w-5 h-5" /></button>
                                                                <button onClick={() => setPaymentSlipToView(record)} className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full" title="Lihat Slip Pembayaran"><FileTextIcon className="w-5 h-5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedRecordId === record.id && (
                                                        <tr className="bg-brand-bg">
                                                            <td colSpan={4} className="p-4">
                                                                <p className="text-sm font-medium mb-2 text-brand-text-light">Proyek yang dibayar:</p>
                                                                <ul className="list-disc list-inside text-sm space-y-1 pl-4">
                                                                    {record.projectPaymentIds.map(paymentId => {
                                                                        const payment = teamProjectPayments.find(p => p.id === paymentId);
                                                                        const project = projects.find(p => p.id === payment?.projectId);
                                                                        return (
                                                                            <li key={paymentId} className="text-brand-text-primary">
                                                                                {project?.projectName || 'Proyek tidak ditemukan'} - <span className="font-semibold">{formatCurrency(payment?.fee || 0)}</span>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-brand-text-secondary py-8">Tidak ada riwayat pembayaran untuk freelancer ini.</p>
                            )}
                        </div>}
                        {detailTab === 'performance' && <PerformanceTab member={selectedMember} onSetRating={handleSetRating} newNote={newNote} setNewNote={setNewNote} newNoteType={newNoteType} setNewNoteType={setNewNoteType} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />}
                        {detailTab === 'rewards' && <RewardSavingsTab member={selectedMember} suggestions={[]} rewardLedger={rewardLedgerEntries.filter(rle => rle.teamMemberId === selectedMember.id)} onWithdraw={handleWithdrawRewards} />}
                        {detailTab === 'create-payment' && selectedMember && (
                            <CreatePaymentTab
                                member={selectedMember}
                                paymentDetails={{
                                    projects: selectedMemberUnpaidProjects.filter(p => projectsToPay.includes(p.id)),
                                    total: typeof paymentAmount === 'number' ? paymentAmount : 0
                                }}
                                paymentAmount={paymentAmount}
                                setPaymentAmount={setPaymentAmount}
                                onPay={handlePay}
                                onSetTab={() => setDetailTab('projects')}
                                renderPaymentDetailsContent={() => renderPaymentSlipBody({ id: `TEMP-${Date.now()}`, recordNumber: `PAY-FR-${selectedMember.id.slice(-4)}-${Date.now()}`, teamMemberId: selectedMember.id, date: new Date().toISOString(), projectPaymentIds: projectsToPay, totalAmount: typeof paymentAmount === 'number' ? paymentAmount : 0 })}
                                cards={cards}
                                monthlyBudgetPocket={monthlyBudgetPocket}
                                paymentSourceId={paymentSourceId}
                                setPaymentSourceId={setPaymentSourceId}
                                onSign={() => { setIsSignatureModalOpen(true); }}
                            />
                        )}
                    </div>
                </div>
            </Modal>}
            
            {paymentSlipToView && (
                <Modal isOpen={!!paymentSlipToView} onClose={() => setPaymentSlipToView(null)} title={`Slip Pembayaran: ${paymentSlipToView.recordNumber}`} size="3xl">
                     <div className="printable-area">
                        {renderPaymentSlipBody(paymentSlipToView)}
                    </div>
                    <div className="mt-6 text-right non-printable space-x-2">
                        <button type="button" onClick={() => setIsSignatureModalOpen(true)} className="button-secondary inline-flex items-center gap-2">
                             <PencilIcon className="w-4 h-4"/>
                             Tanda Tangani Slip
                        </button>
                        <button type="button" onClick={() => window.print()} className="button-primary inline-flex items-center gap-2">
                             <PrinterIcon className="w-4 h-4"/> Cetak
                        </button>
                    </div>
                </Modal>
            )}

            {isSignatureModalOpen && (
                <Modal isOpen={isSignatureModalOpen} onClose={() => setIsSignatureModalOpen(false)} title="Bubuhkan Tanda Tangan Anda">
                    <SignaturePad onClose={() => setIsSignatureModalOpen(false)} onSave={handleSaveSignature} />
                </Modal>
            )}

            <Modal isOpen={!!activeStatModal} onClose={() => setActiveStatModal(null)} title={activeStatModal ? modalTitles[activeStatModal] : ''} size="3xl">
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {activeStatModal === 'total' && (<div className="space-y-3">
                        {teamMembers.map(member => (<div key={member.id} className="p-3 bg-brand-bg rounded-lg"><p className="font-semibold text-brand-text-light">{member.name}</p><p className="text-sm text-brand-text-secondary">{member.role}</p></div>))}
                    </div>)}
                    {activeStatModal === 'unpaid' && (<div className="space-y-3">
                        {teamProjectPayments.filter(p => p.status === 'Unpaid').length > 0 ? teamProjectPayments.filter(p => p.status === 'Unpaid').map(payment => (
                             <div key={payment.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center"><div><p className="font-semibold text-brand-text-light">{payment.teamMemberName}</p><p className="text-sm text-brand-text-secondary">Proyek: {projects.find(proj => proj.id === payment.projectId)?.projectName || 'N/A'}</p></div><p className="font-semibold text-brand-danger">{formatCurrency(payment.fee)}</p></div>
                        )) : <p className="text-center py-8 text-brand-text-secondary">Tidak ada fee yang belum dibayar.</p>}
                    </div>)}
                     {activeStatModal === 'topRated' && (<div className="space-y-3">
                        {[...teamMembers].sort((a,b) => b.rating - a.rating).map(member => (<div key={member.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center"><div><p className="font-semibold text-brand-text-light">{member.name}</p><p className="text-sm text-brand-text-secondary">{member.role}</p></div><div className="flex items-center gap-1 font-semibold text-brand-text-light"><StarIcon className="w-4 h-4 text-yellow-400 fill-current"/>{member.rating.toFixed(1)}</div></div>))}
                    </div>)}
                     {activeStatModal === 'rewards' && (<div className="overflow-x-auto">
                        <table className="w-full text-sm"><thead className="bg-brand-input"><tr><th className="p-3 text-left">Tanggal</th><th className="p-3 text-left">Freelancer</th><th className="p-3 text-left">Deskripsi</th><th className="p-3 text-right">Jumlah</th></tr></thead><tbody className="divide-y divide-brand-border">{rewardLedgerEntries.map(entry => (<tr key={entry.id}><td className="p-3 whitespace-nowrap">{formatDate(entry.date)}</td><td className="p-3 font-semibold">{teamMembers.find(tm => tm.id === entry.teamMemberId)?.name || 'N/A'}</td><td className="p-3">{entry.description}</td><td className={`p-3 text-right font-semibold ${entry.amount >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>{entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}</td></tr>))}</tbody></table>
                    </div>)}
                </div>
            </Modal>
             {qrModalContent && (
                <Modal isOpen={!!qrModalContent} onClose={() => setQrModalContent(null)} title={qrModalContent.title} size="sm">
                    <div className="text-center p-4">
                        <div id="freelancer-portal-qrcode" className="p-4 bg-white rounded-lg inline-block mx-auto"></div>
                        <p className="text-xs text-brand-text-secondary mt-4 break-all">{qrModalContent.url}</p>
                        <div className="flex items-center gap-2 mt-6">
                            <button onClick={() => { navigator.clipboard.writeText(qrModalContent.url); showNotification('Tautan berhasil disalin!'); }} className="button-secondary w-full">Salin Tautan</button>
                            <button onClick={() => {
                                const canvas = document.querySelector('#freelancer-portal-qrcode canvas') as HTMLCanvasElement;
                                if (canvas) {
                                    const link = document.createElement('a');
                                    link.download = 'freelancer-portal-qr.png';
                                    link.href = canvas.toDataURL();
                                    link.click();
                                }
                            }} className="button-primary w-full">Unduh QR</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};