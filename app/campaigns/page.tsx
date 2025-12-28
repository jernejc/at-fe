'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to homepage - campaigns are shown there
export default function CampaignsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return null;
}
