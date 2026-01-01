import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET single milestone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        todos: {
          where: { parentId: null },
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Failed to fetch milestone:', error);
    return NextResponse.json({ error: 'Failed to fetch milestone' }, { status: 500 });
  }
}

// PUT update milestone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, date, eventType, color } = body;

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(eventType && { eventType }),
        ...(color && { color }),
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Failed to update milestone:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}

// DELETE milestone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.milestone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete milestone:', error);
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 });
  }
}
