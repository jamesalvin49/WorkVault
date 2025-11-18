import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await db.resource.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Parse tags from JSON string to array
    const parsedResource = {
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : []
    };

    // Update access count and last accessed
    await db.resource.update({
      where: { id: params.id },
      data: {
        accessCount: { increment: 1 },
        lastAccessed: new Date()
      }
    });

    return NextResponse.json(parsedResource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      url,
      type,
      description,
      icon,
      tags,
      categoryId,
      isFavorite
    } = body;

    const resource = await db.resource.update({
      where: { id: params.id },
      data: {
        name,
        url,
        type,
        description,
        icon,
        tags: tags ? JSON.stringify(tags) : null,
        categoryId,
        isFavorite
      },
      include: {
        category: true
      }
    });

    // Parse tags from JSON string to array for response
    const parsedResource = {
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : []
    };

    return NextResponse.json(parsedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.resource.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}