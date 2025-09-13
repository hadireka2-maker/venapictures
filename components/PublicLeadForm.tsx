import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, ContactChannel, Profile, PublicLeadFormProps, ViewType } from '../types';
import { cleanPhoneNumber } from '../constants';
import { WhatsappIcon, CheckCircleIcon } from '../constants';

const PublicLeadForm: React.FC<PublicLeadFormProps> = ({ setLeads, userProfile, showNotification, addNotification }) => {
    const [formState, setFormState] = useState({
        name: '',
        whatsapp: '',
        eventType: userProfile.projectTypes[0] || '',
        eventDate: '',
        eventLocation: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const template = userProfile.publicPageConfig.template || 'classic';

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const notes = `Jenis Acara: ${formState.eventType}\nTanggal Acara: ${new Date(formState.eventDate).toLocaleDateString('id-ID')}\nLokasi Acara: ${formState.eventLocation}`;

        const newLead: Lead = {
            id: crypto.randomUUID(),
            name: formState.name,
            whatsapp: formState.whatsapp,
            contactChannel: ContactChannel.WEBSITE,
            location: formState.eventLocation,
            status: LeadStatus.DISCUSSION,
            date: new Date().toISOString(),
            notes: notes
        };

        // Simulate API call
        setTimeout(() => {
            setLeads(prev => [newLead, ...prev]);
            addNotification({
                title: 'Prospek Baru Diterima!',
                message: `Prospek baru dari ${newLead.name} telah masuk melalui formulir web.`,
                icon: 'lead',
                link: { view: ViewType.PROSPEK }
            });
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1000);
    };

    const whatsappUrl = useMemo(() => {
        if (isSubmitted) {
             const message = `Halo ${userProfile.companyName}, saya ${formState.name}, baru saja mengisi formulir prospek untuk acara ${formState.eventType} pada tanggal ${new Date(formState.eventDate).toLocaleDateString('id-ID')}.`;
             return `https://wa.me/${cleanPhoneNumber(userProfile.phone)}?text=${encodeURIComponent(message)}`;
        }
        const genericMessage = `Halo ${userProfile.companyName}, saya tertarik dengan layanan Anda dan ingin bertanya lebih lanjut.`;
        return `https://wa.me/${cleanPhoneNumber(userProfile.phone)}?text=${encodeURIComponent(genericMessage)}`;

    }, [isSubmitted, formState, userProfile]);

    if (isSubmitted) {
        return (
            <div className={`template-wrapper template-${template} flex items-center justify-center min-h-screen p-4`}>
                 <div className="w-full max-w-lg p-8 text-center bg-public-surface rounded-2xl shadow-xl border border-public-border animate-fade-in">
                    <CheckCircleIcon className="w-16 h-16 text-brand-success mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gradient">Terima Kasih, {formState.name.split(' ')[0]}!</h1>
                    <p className="mt-4 text-public-text-primary">
                        Formulir Anda telah berhasil kami terima. Tim kami akan segera menghubungi Anda melalui WhatsApp untuk diskusi lebih lanjut.
                    </p>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 button-primary inline-flex items-center gap-2"
                    >
                        <WhatsappIcon className="w-5 h-5"/>
                        Konfirmasi & Lanjutkan via WhatsApp
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`template-wrapper template-${template} flex items-center justify-center min-h-screen p-4`}>
             <style>{`
                .template-wrapper { background-color: var(--public-bg); color: var(--public-text-primary); }
                .template-classic .form-container { max-width: 48rem; width: 100%; margin: auto; }
                .template-modern .form-container { max-width: 56rem; width: 100%; margin: auto; display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; align-items: center; }
                .template-gallery .form-container { max-width: 36rem; width: 100%; margin: auto; font-family: serif; }
                @media (max-width: 768px) { .template-modern .form-container { grid-template-columns: 1fr; } }
            `}</style>
            <div className="form-container">
                <div className="bg-public-surface p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-public-border animate-fade-in">
                    <div className="text-center mb-8">
                        {userProfile.logoBase64 ? (
                            <img src={userProfile.logoBase64} alt="Company Logo" className="h-16 mx-auto mb-4 object-contain" />
                        ) : (
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gradient">{userProfile.companyName}</h1>
                        )}
                        <p className="text-md text-public-text-secondary mt-4 max-w-md mx-auto">
                            Terima kasih atas ketertarikan Anda. Mohon isi detail di bawah ini agar kami dapat segera memberikan informasi ketersediaan dan pricelist.
                        </p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                         <div>
                            <h2 className="text-lg font-semibold text-public-text-primary border-b border-public-border pb-3 mb-6">1. Informasi Kontak Anda</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="input-group">
                                    <input type="text" id="name" name="name" value={formState.name} onChange={handleFormChange} className="input-field" placeholder=" " required />
                                    <label htmlFor="name" className="input-label">Nama Lengkap</label>
                                </div>
                                <div className="input-group">
                                    <input type="tel" id="whatsapp" name="whatsapp" value={formState.whatsapp} onChange={handleFormChange} className="input-field" placeholder=" " required />
                                    <label htmlFor="whatsapp" className="input-label">Nomor WhatsApp</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-public-text-primary border-b border-public-border pb-3 mb-6">2. Detail Acara Anda</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="input-group">
                                    <select id="eventType" name="eventType" value={formState.eventType} onChange={handleFormChange} className="input-field" required>
                                        {userProfile.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                    </select>
                                    <label htmlFor="eventType" className="input-label">Jenis Acara</label>
                                </div>
                                <div className="input-group">
                                    <input type="date" id="eventDate" name="eventDate" value={formState.eventDate} onChange={handleFormChange} className="input-field" placeholder=" " required />
                                    <label htmlFor="eventDate" className="input-label">Tanggal Acara</label>
                                </div>
                                 <div className="input-group">
                                    <input type="text" id="eventLocation" name="eventLocation" value={formState.eventLocation} onChange={handleFormChange} className="input-field" placeholder=" " required />
                                    <label htmlFor="eventLocation" className="input-label">Lokasi (Kota)</label>
                                </div>
                            </div>
                        </div>


                        <div className="pt-4 border-t border-public-border">
                            <div className="flex flex-col sm:flex-row-reverse gap-4">
                                <button type="submit" disabled={isSubmitting} className="button-primary w-full text-lg py-4">
                                    {isSubmitting ? 'Mengirim...' : 'Kirim'}
                                </button>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="button-secondary w-full text-lg py-4 inline-flex items-center justify-center gap-3"
                                >
                                    <WhatsappIcon className="w-6 h-6"/>
                                    Hubungi Langsung
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PublicLeadForm;
