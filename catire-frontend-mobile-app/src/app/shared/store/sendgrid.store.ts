import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipients: string[];
  scheduled_at?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
  created_at: Date;
}

export interface EmailContact {
  id: string;
  email: string;
  name: string;
  tags: string[];
  subscribed: boolean;
  created_at: Date;
}

type SendgridState = {
  campaigns: EmailCampaign[];
  contacts: EmailContact[];
  createCampaign: (campaign: Omit<EmailCampaign, 'id' | 'stats' | 'created_at'>) => string;
  updateCampaign: (campaignId: string, updates: Partial<EmailCampaign>) => void;
  deleteCampaign: (campaignId: string) => void;
  sendCampaign: (campaignId: string) => Promise<void>;
  addContact: (contact: Omit<EmailContact, 'id' | 'created_at'>) => void;
  removeContact: (contactId: string) => void;
  getContactsByTag: (tag: string) => EmailContact[];
  getCampaignStats: (campaignId: string) => EmailCampaign['stats'] | undefined;
  getOverallStats: () => {
    total_contacts: number;
    subscribed: number;
    total_campaigns: number;
    total_sent: number;
  };
};

export const useSendgridStore = create<SendgridState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      contacts: [],

      createCampaign: (campaign) => {
        const id = Date.now().toString();
        const newCampaign: EmailCampaign = {
          ...campaign,
          id,
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
          },
          created_at: new Date(),
        };
        set((state) => ({
          campaigns: [newCampaign, ...state.campaigns],
        }));
        return id;
      },

      updateCampaign: (campaignId, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map(c =>
            c.id === campaignId ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCampaign: (campaignId) => {
        set((state) => ({
          campaigns: state.campaigns.filter(c => c.id !== campaignId),
        }));
      },

      sendCampaign: async (campaignId) => {
        const campaign = get().campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 2000));

        set((state) => ({
          campaigns: state.campaigns.map(c =>
            c.id === campaignId ? {
              ...c,
              status: 'sent',
              stats: {
                sent: c.recipients.length,
                delivered: Math.floor(c.recipients.length * 0.95),
                opened: Math.floor(c.recipients.length * 0.3),
                clicked: Math.floor(c.recipients.length * 0.1),
                bounced: Math.floor(c.recipients.length * 0.05),
              },
            } : c
          ),
        }));
      },

      addContact: (contact) => {
        const newContact: EmailContact = {
          ...contact,
          id: Date.now().toString(),
          created_at: new Date(),
        };
        set((state) => ({
          contacts: [...state.contacts, newContact],
        }));
      },

      removeContact: (contactId) => {
        set((state) => ({
          contacts: state.contacts.filter(c => c.id !== contactId),
        }));
      },

      getContactsByTag: (tag) => {
        return get().contacts.filter(c => c.tags.includes(tag));
      },

      getCampaignStats: (campaignId) => {
        return get().campaigns.find(c => c.id === campaignId)?.stats;
      },

      getOverallStats: () => {
        const { contacts, campaigns } = get();
        const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0);
        
        return {
          total_contacts: contacts.length,
          subscribed: contacts.filter(c => c.subscribed).length,
          total_campaigns: campaigns.length,
          total_sent: totalSent,
        };
      },
    }),
    {
      name: 'sendgrid-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

