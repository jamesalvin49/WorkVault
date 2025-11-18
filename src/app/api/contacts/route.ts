import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const q = searchParams.get("q"); // Unified query parameter
    const sortBy = searchParams.get("sortBy") || "fullName";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build base where clause for filters
    const baseWhere: any = {};

    if (department) {
      baseWhere.department = { contains: department };
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch contacts with base filters
    const allContacts = await db.contact.findMany({
      where: baseWhere,
      orderBy,
    });

    console.log(
      "Contacts API: Fetched contacts with base filters:",
      allContacts.length
    );

    // Apply unified search if query exists
    let filteredContacts = allContacts;

    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      console.log("Contacts API: Applying unified search for query:", query);

      filteredContacts = allContacts.filter((contact) => {
        try {
          // Parse tags
          const tags = contact.tags ? JSON.parse(contact.tags) : [];

          // Search in ALL fields with OR logic
          const matchesName = contact.fullName.toLowerCase().includes(query);
          const matchesEmail =
            contact.email?.toLowerCase().includes(query) || false;
          const matchesMobile = contact.mobileNumber?.includes(query) || false;
          const matchesExtension =
            contact.officeExtension?.includes(query) || false;
          const matchesDepartment =
            contact.department?.toLowerCase().includes(query) || false;
          const matchesNotes =
            contact.notes?.toLowerCase().includes(query) || false;
          const matchesTag =
            Array.isArray(tags) &&
            tags.some((tag) => tag.toLowerCase().includes(query));

          return (
            matchesName ||
            matchesEmail ||
            matchesMobile ||
            matchesExtension ||
            matchesDepartment ||
            matchesNotes ||
            matchesTag
          );
        } catch (e) {
          console.error("Error filtering contact:", contact.id, e);
          return false;
        }
      });

      console.log(
        "Contacts API: Filtered by search query:",
        filteredContacts.length
      );
    }

    // Parse tags from JSON string to array
    const parsedContacts = filteredContacts.map((contact) => ({
      ...contact,
      tags: contact.tags ? JSON.parse(contact.tags) : [],
    }));

    // Apply pagination
    const paginatedContacts = parsedContacts.slice(offset, offset + limit);

    return NextResponse.json({
      contacts: paginatedContacts,
      total: parsedContacts.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      tags,
    } = body;

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    const contact = await db.contact.create({
      data: {
        fullName,
        mobileNumber,
        officeExtension,
        email,
        department,
        notes,
        profilePicture,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    // Return with parsed tags
    return NextResponse.json(
      {
        ...contact,
        tags: contact.tags ? JSON.parse(contact.tags) : [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
