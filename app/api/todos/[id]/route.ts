import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { TodoStatus } from '@/app/generated/prisma';

// GET single todo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const todo = await prisma.todo.findUnique({
      where: { id },
      include: {
        milestone: true,
        parent: true,
        children: {
          include: {
            children: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Failed to fetch todo:', error);
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 });
  }
}

// PUT update todo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, deadline, milestoneId, parentId, order } = body;

    // Check if status changed to DONE
    const existingTodo = await prisma.todo.findUnique({ where: { id } });
    const completedAt =
      status === TodoStatus.DONE && existingTodo?.status !== TodoStatus.DONE
        ? new Date()
        : status !== TodoStatus.DONE
        ? null
        : existingTodo?.completedAt;

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(milestoneId !== undefined && { milestoneId }),
        ...(parentId !== undefined && { parentId }),
        ...(order !== undefined && { order }),
        completedAt,
      },
      include: {
        milestone: true,
        parent: true,
        children: {
          include: {
            children: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Failed to update todo:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

// DELETE todo (and all children due to cascade)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.todo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
