import { User } from '@/interface/user';
import { Startup } from '@/interface/startup';

export type ValidationError = {
  field: string;
  message: string;
};

// --- Profile Validation ---

export const validateProfile = (user: Partial<User>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!user.displayName || user.displayName.length < 2 || user.displayName.length > 80) {
    errors.push({
      field: 'displayName',
      message: 'Display name must be between 2 and 80 characters.',
    });
  }

  if (!user.jobTitle || user.jobTitle.length < 2 || user.jobTitle.length > 80) {
    errors.push({
      field: 'jobTitle',
      message: 'Job title must be between 2 and 80 characters.',
    });
  }

  // Basic URL/handle validation for social
  if (user.twitterHandle && user.twitterHandle.length > 0) {
    // Simple check, can be expanded
    if (user.twitterHandle.includes(' ')) {
      errors.push({
        field: 'twitterHandle',
        message: 'Twitter handle cannot contain spaces.',
      });
    }
  }

  if (user.telegramHandle && user.telegramHandle.length > 0) {
    if (user.telegramHandle.includes(' ')) {
      errors.push({
        field: 'telegramHandle',
        message: 'Telegram handle cannot contain spaces.',
      });
    }
  }

  return errors;
};

export const isProfileMinimumComplete = (user: User): boolean => {
  return (
    user.displayName.length >= 2 &&
    user.displayName.length <= 80 &&
    user.jobTitle.length >= 2 &&
    user.jobTitle.length <= 80
  );
};

export const isProfileRecommendedComplete = (user: User): boolean => {
  return (
    isProfileMinimumComplete(user) &&
    !!user.bio &&
    !!user.avatar &&
    (!!user.twitterHandle || !!user.telegramHandle)
  );
};

// --- Startup Validation ---

export const validateStartup = (startup: Partial<Startup>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!startup.name || startup.name.length < 2 || startup.name.length > 80) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 80 characters.' });
  }

  if (!startup.oneLiner || startup.oneLiner.length > 160) {
    errors.push({
      field: 'oneLiner',
      message: 'One-liner is required and must be max 160 characters.',
    });
  }

  // Description is only strictly required for verification, but we can check it here too
  if (startup.description && (startup.description.length < 200 || startup.description.length > 2000)) {
    errors.push({
      field: 'description',
      message: 'Description must be between 200 and 2000 characters for verification.',
    });
  }

  if (startup.website) {
    try {
      new URL(startup.website);
    } catch {
      errors.push({ field: 'website', message: 'Must be a valid URL.' });
    }
  }

  if (startup.twitter) {
    // Simple validation for X URL or handle
    if (!startup.twitter.includes('x.com') && !startup.twitter.includes('twitter.com') && startup.twitter.startsWith('http')) {
        errors.push({ field: 'twitter', message: 'Must be a valid X/Twitter URL.' });
    }
  }

  if (startup.mrr !== undefined && startup.mrr < 0) {
    errors.push({ field: 'mrr', message: 'MRR cannot be negative.' });
  }

  if (startup.teamSize !== undefined && startup.teamSize < 1) {
    errors.push({ field: 'teamSize', message: 'Team size must be at least 1.' });
  }

  if (startup.category && (startup.category.length < 1 || startup.category.length > 5)) {
    errors.push({ field: 'category', message: 'Select between 1 and 5 categories.' });
  }

  if (startup.techStack && (startup.techStack.length < 1 || startup.techStack.length > 10)) {
    errors.push({ field: 'techStack', message: 'Select between 1 and 10 technologies.' });
  }

  return errors;
};

export const canSaveStartupDraft = (startup: Partial<Startup>): boolean => {
  return !!startup.name && !!startup.oneLiner && !!startup.stage;
};

export const canRequestVerification = (startup: Startup, owner: User): boolean => {
  if (!isProfileMinimumComplete(owner)) return false;

  const errors = validateStartup(startup);
  if (errors.length > 0) return false;

  // Additional verification requirements
  return (
    !!startup.description &&
    startup.description.length >= 200 &&
    !!startup.website &&
    !!startup.twitter &&
    !!startup.category &&
    startup.category.length >= 1 &&
    !!startup.techStack &&
    startup.techStack.length >= 1 &&
    !!startup.teamSize &&
    startup.teamSize >= 1
  );
};

export const canPublishStartup = (startup: Startup): boolean => {
  return startup.verificationStatus === 'verified' && !!startup.name && !!startup.oneLiner;
};

export const shouldResetVerification = (previous: Startup, next: Partial<Startup>): boolean => {
    if (previous.verificationStatus !== 'verified') return false;
    
    // Changing website or twitter resets verification
    if (next.website && next.website !== previous.website) return true;
    if (next.twitter && next.twitter !== previous.twitter) return true;
    
    return false;
};
