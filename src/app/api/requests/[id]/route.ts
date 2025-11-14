import { NextResponse } from 'next/server';

type RequestPayload = {
  id: string;
  title: string;
  requester: string;
  city: string;
  status: 'new' | 'on progress' | 'done' | 'on hold';
  date: string;
  deadline: string;
  description: string;
};

const demoRequests: Record<string, RequestPayload> = {
  '1': {
    id: '1',
    title: 'New Marketing Campaign',
    requester: 'Alice Johnson',
    city: 'New York, NY',
    status: 'done',
    date: '2024-10-28',
    deadline: '2024-11-15',
    description:
      'Launch a new marketing campaign for the Q4 product release. Includes social, email, and influencer outreach. Budget review pending approval.',
  },
  '2': {
    id: '2',
    title: 'Seasonal Menu Expansion',
    requester: 'Marco Lee',
    city: 'Austin, TX',
    status: 'on progress',
    date: '2024-11-04',
    deadline: '2024-12-01',
    description:
      'Coordinate with culinary partners to introduce four limited-time menu items for the winter season. Requires sourcing confirmation.',
  },
  '3': {
    id: '3',
    title: 'Pop-up Event Logistics',
    requester: 'Priya Desai',
    city: 'San Francisco, CA',
    status: 'new',
    date: '2024-11-10',
    deadline: '2024-12-05',
    description:
      'Plan venue, staffing, and vendor logistics for the December tasting pop-up, targeting VIP members and press.',
  },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = context.params;
  const record = demoRequests[id];

  if (!record) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  await sleep(600);

  return NextResponse.json(record);
}
