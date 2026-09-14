import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';
import { requireAuth, handleRouteError } from '@/lib/api-guard.js';
import { addBusinessInvestment, businessFundingProfile, updateBusinessInvestment } from '@/lib/business-funding.js';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, { roles: ['admin', 'cashier'], permission: 'business_funding.manage' });
    if (auth.error) return auth.error;
    const db = Database.getInstance();
    return NextResponse.json(await businessFundingProfile(db));
  } catch (error) {
    return handleRouteError(error, 'Could not load Business Funding. Run migration 057 first.');
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, { roles: ['admin', 'cashier'], permission: 'business_funding.manage' });
    if (auth.error) return auth.error;
    const data = await request.json();
    const db = Database.getInstance();
    const investment = await addBusinessInvestment(db, {
      amount: data.amount,
      date: data.date,
      note: data.note,
      createdBy: auth.user?.id || null,
    });
    return NextResponse.json({ message: 'Investment added to Business Funding.', investment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Could not add the investment.');
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAuth(request, { roles: ['admin', 'cashier'], permission: 'business_funding.manage' });
    if (auth.error) return auth.error;
    const data = await request.json();
    const db = Database.getInstance();
    const investment = await updateBusinessInvestment(db, {
      id: data.id,
      date: data.date,
      note: data.note,
    });
    return NextResponse.json({ message: 'Investment date corrected.', investment });
  } catch (error) {
    return handleRouteError(error, 'Could not correct the investment date.');
  }
}

