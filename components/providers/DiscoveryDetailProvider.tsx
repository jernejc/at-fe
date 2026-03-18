'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  getCompany,
  getCompanyExplainability,
  getCompanyJobs,
  getCompanyEmployees,
  getProducts,
  getCompanyPlaybooks,
} from '@/lib/api';
import type {
  CompanyDetailResponse,
  CompanyExplainabilityResponse,
  JobPostingSummary,
  EmployeeSummary,
  ProductSummary,
  PlaybookSummary,
} from '@/lib/schemas';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface DiscoveryDetailContextValue {
  /** Company domain used as the route slug. */
  domain: string;

  // --- Eager: company data ---
  /** Full company detail response, or null while loading. */
  data: CompanyDetailResponse | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch company data. */
  refetch: () => void;

  // --- Lazy: explainability (shared by events, interests, products tabs) ---
  explainability: CompanyExplainabilityResponse | null;
  explainabilityLoading: boolean;
  explainabilityError: string | null;
  /** Fetch explainability data if not already loaded. No-ops on subsequent calls. */
  ensureExplainability: () => void;

  // --- Lazy: jobs ---
  jobs: JobPostingSummary[];
  jobsTotal: number;
  jobsLoading: boolean;
  jobsError: string | null;
  /** Fetch first page of jobs if not already loaded. */
  ensureJobs: () => void;
  /** Load next page of jobs, appending to existing items. */
  loadMoreJobs: () => Promise<void>;
  jobsLoadingMore: boolean;

  // --- Lazy: people ---
  keyContacts: EmployeeSummary[];
  team: EmployeeSummary[];
  teamTotal: number;
  peopleLoading: boolean;
  peopleError: string | null;
  /** Fetch decision makers + first page of team if not already loaded. */
  ensurePeople: () => void;
  /** Load next page of team members, appending to existing items. */
  loadMoreTeam: () => Promise<void>;
  teamLoadingMore: boolean;

  // --- Lazy: playbooks initial data ---
  playbookProducts: ProductSummary[];
  playbookSummaries: PlaybookSummary[];
  playbooksLoading: boolean;
  playbooksError: string | null;
  /** Fetch products list + playbook summaries if not already loaded. */
  ensurePlaybooks: () => void;
  /** Update cached summaries (e.g. after generation completes). */
  setPlaybookSummaries: (summaries: PlaybookSummary[]) => void;
}

const DiscoveryDetailContext = createContext<DiscoveryDetailContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface DiscoveryDetailProviderProps {
  domain: string;
  children: ReactNode;
}

/** Caches company data eagerly and tab-specific data lazily across tab switches. */
export function DiscoveryDetailProvider({ domain, children }: DiscoveryDetailProviderProps) {
  // --- Eager: company ---
  const [data, setData] = useState<CompanyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCompany(domain);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company');
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Lazy: explainability ---
  const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);
  const [explainabilityLoading, setExplainabilityLoading] = useState(false);
  const [explainabilityError, setExplainabilityError] = useState<string | null>(null);
  const explainabilityFetched = useRef(false);

  const ensureExplainability = useCallback(() => {
    if (explainabilityFetched.current) return;
    explainabilityFetched.current = true;

    async function fetch() {
      setExplainabilityLoading(true);
      setExplainabilityError(null);
      try {
        const res = await getCompanyExplainability(domain);
        setExplainability(res);
      } catch (err) {
        setExplainabilityError(err instanceof Error ? err.message : 'Failed to load data');
        explainabilityFetched.current = false;
      } finally {
        setExplainabilityLoading(false);
      }
    }
    fetch();
  }, [domain]);

  // --- Lazy: jobs ---
  const [jobs, setJobs] = useState<JobPostingSummary[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsLoadingMore, setJobsLoadingMore] = useState(false);
  const jobsFetched = useRef(false);

  const ensureJobs = useCallback(() => {
    if (jobsFetched.current) return;
    jobsFetched.current = true;

    async function fetch() {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const res = await getCompanyJobs(domain, 1);
        setJobs(res.items);
        setJobsTotal(res.total);
        setJobsPage(1);
      } catch (err) {
        setJobsError(err instanceof Error ? err.message : 'Failed to load jobs');
        jobsFetched.current = false;
      } finally {
        setJobsLoading(false);
      }
    }
    fetch();
  }, [domain]);

  const loadMoreJobs = useCallback(async () => {
    if (jobsLoadingMore) return;
    setJobsLoadingMore(true);
    try {
      const nextPage = jobsPage + 1;
      const res = await getCompanyJobs(domain, nextPage);
      setJobs((prev) => [...prev, ...res.items]);
      setJobsPage(nextPage);
    } catch {
      // Silently fail — user can retry
    } finally {
      setJobsLoadingMore(false);
    }
  }, [domain, jobsPage, jobsLoadingMore]);

  // --- Lazy: people ---
  const [keyContacts, setKeyContacts] = useState<EmployeeSummary[]>([]);
  const [team, setTeam] = useState<EmployeeSummary[]>([]);
  const [teamTotal, setTeamTotal] = useState(0);
  const [teamPage, setTeamPage] = useState(1);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [teamLoadingMore, setTeamLoadingMore] = useState(false);
  const peopleFetched = useRef(false);

  const ensurePeople = useCallback(() => {
    if (peopleFetched.current) return;
    peopleFetched.current = true;

    async function fetch() {
      setPeopleLoading(true);
      setPeopleError(null);
      try {
        const [dmRes, teamRes] = await Promise.all([
          getCompanyEmployees(domain, 1, 100, { is_decision_maker: true }),
          getCompanyEmployees(domain, 1, 20, { is_decision_maker: false }),
        ]);
        setKeyContacts(dmRes.items);
        setTeam(teamRes.items);
        setTeamTotal(teamRes.total);
        setTeamPage(1);
      } catch (err) {
        setPeopleError(err instanceof Error ? err.message : 'Failed to load people');
        peopleFetched.current = false;
      } finally {
        setPeopleLoading(false);
      }
    }
    fetch();
  }, [domain]);

  const loadMoreTeam = useCallback(async () => {
    if (teamLoadingMore) return;
    setTeamLoadingMore(true);
    try {
      const nextPage = teamPage + 1;
      const res = await getCompanyEmployees(domain, nextPage, 20, { is_decision_maker: false });
      setTeam((prev) => [...prev, ...res.items]);
      setTeamPage(nextPage);
    } catch {
      // Silently fail — user can retry
    } finally {
      setTeamLoadingMore(false);
    }
  }, [domain, teamPage, teamLoadingMore]);

  // --- Lazy: playbooks initial data ---
  const [playbookProducts, setPlaybookProducts] = useState<ProductSummary[]>([]);
  const [playbookSummaries, setPlaybookSummaries] = useState<PlaybookSummary[]>([]);
  const [playbooksLoading, setPlaybooksLoading] = useState(false);
  const [playbooksError, setPlaybooksError] = useState<string | null>(null);
  const playbooksFetched = useRef(false);

  const ensurePlaybooks = useCallback(() => {
    if (playbooksFetched.current) return;
    playbooksFetched.current = true;

    async function fetch() {
      setPlaybooksLoading(true);
      setPlaybooksError(null);
      try {
        const [productsRes, playbooksRes] = await Promise.all([
          getProducts(1, 100),
          getCompanyPlaybooks(domain),
        ]);
        setPlaybookProducts(productsRes.items);
        setPlaybookSummaries(playbooksRes.playbooks);
      } catch (err) {
        setPlaybooksError(err instanceof Error ? err.message : 'Failed to load playbook data');
        playbooksFetched.current = false;
      } finally {
        setPlaybooksLoading(false);
      }
    }
    fetch();
  }, [domain]);

  return (
    <DiscoveryDetailContext.Provider
      value={{
        domain,
        data,
        loading,
        error,
        refetch: fetchData,
        explainability,
        explainabilityLoading,
        explainabilityError,
        ensureExplainability,
        jobs,
        jobsTotal,
        jobsLoading,
        jobsError,
        ensureJobs,
        loadMoreJobs,
        jobsLoadingMore,
        keyContacts,
        team,
        teamTotal,
        peopleLoading,
        peopleError,
        ensurePeople,
        loadMoreTeam,
        teamLoadingMore,
        playbookProducts,
        playbookSummaries,
        playbooksLoading,
        playbooksError,
        ensurePlaybooks,
        setPlaybookSummaries,
      }}
    >
      {children}
    </DiscoveryDetailContext.Provider>
  );
}

/** Access company detail data from the nearest DiscoveryDetailProvider. */
export function useDiscoveryDetail() {
  const context = useContext(DiscoveryDetailContext);
  if (!context) {
    throw new Error('useDiscoveryDetail must be used within a DiscoveryDetailProvider');
  }
  return context;
}
