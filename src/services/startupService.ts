import { Startup, StartupStage, AcquisitionStatus } from '@/interface/startup';
import startupsMock from '@/data/mock/startups.json';
import { validateStartup, shouldResetVerification } from '@/utils/validation';

const startups: Startup[] = startupsMock as Startup[];

export type StartupFilters = {
  search?: string;
  category?: string[];
  stage?: StartupStage[];
  techStack?: string[];
  isRaising?: boolean;
  acquisitionStatus?: AcquisitionStatus;
};

const isPublicStartup = (startup: Startup) =>
  startup.verificationStatus === 'verified' && startup.listingStatus === 'published';

const canViewStartup = (startup: Startup, viewerWallet?: string): boolean =>
  isPublicStartup(startup) || Boolean(viewerWallet && startup.ownerWallet === viewerWallet);

export const startupService = {
  listPublishedStartups: async (filters: StartupFilters): Promise<Startup[]> => {
    return startups.filter((s) => {
      if (!isPublicStartup(s)) {
        return false;
      }

      if (
        filters.search &&
        !s.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !s.oneLiner.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.category && filters.category.length > 0 && !filters.category.some((c) => s.category.includes(c))) {
        return false;
      }

      if (filters.stage && filters.stage.length > 0 && !filters.stage.includes(s.stage)) {
        return false;
      }

      if (
        filters.techStack &&
        filters.techStack.length > 0 &&
        !filters.techStack.some((t) => s.techStack.includes(t))
      ) {
        return false;
      }

      if (filters.isRaising !== undefined && s.isRaising !== filters.isRaising) {
        return false;
      }

      if (filters.acquisitionStatus && s.acquisitionStatus !== filters.acquisitionStatus) {
        return false;
      }

      return true;
    });
  },

  getStartupById: async (id: string): Promise<Startup | null> => {
    return startups.find((s) => s.id === id) || null;
  },

  getAccessibleStartupById: async (id: string, viewerWallet?: string): Promise<Startup | null> => {
    const startup = startups.find((s) => s.id === id) || null;
    if (!startup || !canViewStartup(startup, viewerWallet)) {
      return null;
    }

    return startup;
  },

  listStartupsByOwner: async (walletAddress: string): Promise<Startup[]> => {
    return startups.filter((s) => s.ownerWallet === walletAddress);
  },

  createStartup: async (ownerWallet: string, input: Partial<Startup>): Promise<Startup> => {
    const errors = validateStartup(input);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const newStartup: Startup = {
      id: Math.random().toString(36).substring(2, 9),
      ownerWallet,
      name: input.name || '',
      logo: input.logo || '',
      oneLiner: input.oneLiner || '',
      description: input.description || '',
      website: input.website || '',
      twitter: input.twitter || '',
      discord: input.discord,
      github: input.github,
      stage: input.stage || 'Idea',
      isRaising: input.isRaising || false,
      acquisitionStatus: input.acquisitionStatus || 'not_open',
      mrr: input.mrr,
      showMrr: input.showMrr || false,
      teamSize: input.teamSize || 1,
      techStack: input.techStack || [],
      category: input.category || [],
      team: input.team || [{ walletAddress: ownerWallet, role: 'Founder' }],
      verificationStatus: 'draft',
      listingStatus: 'draft',
      domainVerificationStatus: 'not_started',
      xVerificationStatus: 'not_started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    startups.push(newStartup);
    return newStartup;
  },

  updateStartup: async (id: string, ownerWallet: string, input: Partial<Startup>): Promise<Startup> => {
    const index = startups.findIndex((s) => s.id === id && s.ownerWallet === ownerWallet);
    if (index === -1) {
      throw new Error('Startup not found or unauthorized');
    }

    const errors = validateStartup(input);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const previous = startups[index];
    let verificationStatus = previous.verificationStatus;
    let domainVerificationStatus = previous.domainVerificationStatus;
    let xVerificationStatus = previous.xVerificationStatus;

    if (shouldResetVerification(previous, input)) {
      verificationStatus = 'pending';
      domainVerificationStatus = 'pending';
      xVerificationStatus = 'pending';
    }

    startups[index] = {
      ...previous,
      ...input,
      verificationStatus,
      domainVerificationStatus,
      xVerificationStatus,
      updatedAt: new Date().toISOString(),
    };

    return startups[index];
  },

  archiveStartup: async (id: string, ownerWallet: string): Promise<Startup> => {
    const index = startups.findIndex((s) => s.id === id && s.ownerWallet === ownerWallet);
    if (index === -1) {
      throw new Error('Startup not found or unauthorized');
    }

    startups[index].listingStatus = 'archived';
    startups[index].updatedAt = new Date().toISOString();
    return startups[index];
  },

  publishStartup: async (id: string, ownerWallet: string): Promise<Startup> => {
    const index = startups.findIndex((s) => s.id === id && s.ownerWallet === ownerWallet);
    if (index === -1) {
      throw new Error('Startup not found or unauthorized');
    }

    if (startups[index].verificationStatus !== 'verified') {
      throw new Error('Only verified startups can be published');
    }

    startups[index].listingStatus = 'published';
    startups[index].updatedAt = new Date().toISOString();
    return startups[index];
  },
};
