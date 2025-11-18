import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await db.contact.findUnique({
      where: { id: params.id }
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Parse tags from JSON string to array
    const parsedContact = {
      ...contact,
      tags: contact.tags ? JSON.parse(contact.tags) : []
    };

    return NextResponse.json(parsedContact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
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
      fullName,
      mobileNumber,
      officeExtension,
      email,
      department,
      notes,
      profilePicture,
      tags
    } = body;

    const contact = await db.contact.update({
      where: { id: params.id },
      data: {
        fullName,
        mobileNumber,
        officeExtension,
        email,
        department,
        notes,
        profilePicture,
        tags: tags ? JSON.stringify(tags) : null
      }
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.contact.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}