-- Local development and QA content only. This file is not applied to production.
insert into public.profiles (
  id, wallet_address, display_name, job_title, twitter_handle,
  telegram_handle, avatar, bio, joined_at
) values
  ('10000000-0000-4000-8000-000000000001', '11111111111111111111111111111111', 'Marco Vulcan', 'Founder & CEO', 'marcovulcan', 'mvulcan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco', 'Serial entrepreneur in the Solana ecosystem.', '2023-11-05T09:15:00Z'),
  ('10000000-0000-4000-8000-000000000002', 'Vote111111111111111111111111111111111111111', 'Alex Rivera', 'Fullstack Engineer', 'arivera_sol', 'arivera', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'Building the future of DeFi on Solana.', '2024-01-15T10:00:00Z'),
  ('10000000-0000-4000-8000-000000000003', 'Stake11111111111111111111111111111111111111', 'Sofia Chen', 'Product Designer', 'sofia_design', null, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', 'Obsessed with clean UI and Web3 UX.', '2024-02-20T14:30:00Z'),
  ('10000000-0000-4000-8000-000000000004', 'Config1111111111111111111111111111111111111', 'Elena Sol', 'Growth Lead', 'elenasol', null, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', 'Marketing and growth for Web3 startups.', '2024-03-01T12:00:00Z'),
  ('10000000-0000-4000-8000-000000000005', 'SysvarRent111111111111111111111111111111111', 'Dave Builder', 'Core Dev', null, null, null, 'I just build things. No socials.', '2024-04-10T08:00:00Z');

insert into public.startups (
  id, owner_profile_id, name, logo, one_liner, description, website, twitter,
  stage, is_raising, acquisition_status, mrr, show_mrr, team_size, tech_stack,
  category, team, verification_status, listing_status,
  domain_verification_status, x_verification_status, created_at, updated_at
) values
  (
    '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
    'Solana Pay Pro', 'https://api.dicebear.com/7.x/shapes/svg?seed=paypro',
    'The ultimate payment gateway for Solana merchants.',
    'Solana Pay Pro provides a seamless checkout experience for e-commerce stores, supporting SPL tokens and real-time transaction tracking.',
    'https://solpaypro.io', 'https://x.com/solpaypro', 'Scaling', true, 'not_open', 12500, true, 8,
    array['Rust', 'Anchor', 'Next.js', 'TypeScript'], array['Payments', 'DeFi'],
    '[{"walletAddress":"11111111111111111111111111111111","role":"CEO"},{"walletAddress":"Vote111111111111111111111111111111111111111","role":"Lead Dev"}]',
    'verified', 'published', 'verified', 'verified', '2023-12-01T08:00:00Z', '2024-05-15T10:00:00Z'
  ),
  (
    '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002',
    'Neon Garden', 'https://api.dicebear.com/7.x/shapes/svg?seed=neongarden',
    'Generative art marketplace with zero fees.',
    'A community-driven marketplace for digital artists on Solana, focusing on sustainability and low entry barriers.',
    'https://neongarden.art', 'https://x.com/neongarden', 'Early-stage', false, 'open_to_discuss', 500, false, 3,
    array['React', 'TypeScript', 'IPFS'], array['NFT', 'Consumer'],
    '[{"walletAddress":"Vote111111111111111111111111111111111111111","role":"Founder"},{"walletAddress":"Stake11111111111111111111111111111111111111","role":"Designer"}]',
    'verified', 'published', 'verified', 'verified', '2024-03-10T11:20:00Z', '2024-05-20T14:30:00Z'
  ),
  (
    '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001',
    'Cyber Shield', 'https://api.dicebear.com/7.x/shapes/svg?seed=cybershield',
    'On-chain security and fraud prevention.',
    'Protecting users and protocols from malicious actors with real-time threat intelligence and automated blocking.',
    'https://cybershield.io', 'https://x.com/cybershield', 'MVP', true, 'not_open', null, false, 5,
    array['Rust', 'Python', 'TypeScript'], array['Security', 'Infra'],
    '[{"walletAddress":"11111111111111111111111111111111","role":"Founder"}]',
    'pending', 'draft', 'pending', 'pending', '2024-04-05T09:00:00Z', '2024-04-05T09:00:00Z'
  ),
  (
    '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001',
    'Old Idea', '', 'A project that never quite took off.',
    'Longer description of why it failed or why we are moving on.',
    'https://oldidea.com', 'https://x.com/oldidea', 'Idea', false, 'not_open', null, false, 1,
    array['Next.js'], array['Consumer'],
    '[{"walletAddress":"11111111111111111111111111111111","role":"Solo Founder"}]',
    'draft', 'archived', 'not_started', 'not_started', '2023-01-15T10:00:00Z', '2023-12-15T10:00:00Z'
  ),
  (
    '20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000003',
    'Pixel Quest', 'https://api.dicebear.com/7.x/shapes/svg?seed=pixelquest',
    'Retro RPG with on-chain assets.',
    'Explore a vast pixelated world, battle monsters, and collect rare items that you truly own.',
    'https://pixelquest.game', 'https://x.com/pixelquest', 'Early-stage', true, 'open_to_discuss', 2500, true, 6,
    array['TypeScript', 'Solana Pay', 'Metaplex'], array['Gaming', 'NFT'],
    '[{"walletAddress":"Stake11111111111111111111111111111111111111","role":"Game Designer"}]',
    'verified', 'published', 'verified', 'verified', '2024-02-10T08:00:00Z', '2024-05-25T11:00:00Z'
  ),
  (
    '20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000004',
    'DeFi Lens', 'https://api.dicebear.com/7.x/shapes/svg?seed=defilens',
    'Real-time analytics for Solana DeFi.',
    'Deep insights into liquidity pools, trading volume, and protocol health across the entire ecosystem.',
    'https://defilens.com', 'https://x.com/defilens', 'Scaling', false, 'not_open', 45000, true, 12,
    array['TypeScript', 'Pyth', 'Helius'], array['Analytics', 'DeFi'],
    '[{"walletAddress":"Config1111111111111111111111111111111111111","role":"CEO"}]',
    'verified', 'published', 'verified', 'verified', '2023-09-01T10:00:00Z', '2024-06-01T15:00:00Z'
  ),
  (
    '20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000005',
    'Quiet Build', '', 'Stealth mode infra project.',
    'Building something big under the radar. Come back later.',
    'https://quietbuild.io', 'https://x.com/quietbuild', 'MVP', false, 'not_open', null, false, 2,
    array['Rust'], array['Infra'],
    '[{"walletAddress":"SysvarRent111111111111111111111111111111111","role":"Founder"}]',
    'rejected', 'draft', 'failed', 'verified', '2024-05-01T10:00:00Z', '2024-06-05T12:00:00Z'
  ),
  (
    '20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001',
    'New Idea Draft', '', 'Freshly started idea.',
    'Just getting started with this one. Minimal details.',
    'https://newdraft.io', 'https://x.com/newdraft', 'Idea', false, 'not_open', null, false, 1,
    array['Next.js'], array['AI'],
    '[{"walletAddress":"11111111111111111111111111111111","role":"Founder"}]',
    'draft', 'draft', 'not_started', 'not_started', '2026-06-01T10:00:00Z', '2026-06-01T10:00:00Z'
  );
