import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { TodoStatus, TodoPriority } from '@/app/generated/prisma';

// GET all todos (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get('milestoneId');
    const status = searchParams.get('status') as TodoStatus | null;
    const parentId = searchParams.get('parentId');
    const rootOnly = searchParams.get('rootOnly') === 'true';

    const where: Record<string, unknown> = {};

    if (milestoneId) where.milestoneId = milestoneId;
    if (status) where.status = status;
    if (parentId) where.parentId = parentId;
    if (rootOnly) where.parentId = null;

    const todos = await prisma.todo.findMany({
      where,
      include: {
        milestone: true,
        parent: true,
        children: {
          include: {
            children: true, // 2 levels of nesting
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// POST create todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status, priority, deadline, milestoneId, parentId, order } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get the max order for positioning
    let newOrder = order;
    if (newOrder === undefined) {
      const maxOrderTodo = await prisma.todo.findFirst({
        where: parentId ? { parentId } : { parentId: null, milestoneId },
        orderBy: { order: 'desc' },
      });
      newOrder = (maxOrderTodo?.order ?? -1) + 1;
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        status: status || TodoStatus.TODO,
        priority: priority || TodoPriority.MEDIUM,
        deadline: deadline ? new Date(deadline) : null,
        milestoneId,
        parentId,
        order: newOrder,
      },
      include: {
        milestone: true,
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
