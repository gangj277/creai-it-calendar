import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET all milestones
export async function GET() {
  try {
    const milestones = await prisma.milestone.findMany({
      include: {
        todos: {
          where: { parentId: null }, // Only root-level todos
          include: {
            children: {
              include: {
                children: true, // Support 2 levels of nesting
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Failed to fetch milestones:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

// POST create milestone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, eventType, color } = body;

    if (!title || !date || !eventType) {
      return NextResponse.json(
        { error: 'Title, date, and eventType are required' },
        { status: 400 }
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        date: new Date(date),
        eventType,
        color: color || '#14b8a6',
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Failed to create milestone:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}
