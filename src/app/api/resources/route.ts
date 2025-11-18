import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const isFavorite = searchParams.get("isFavorite");
    const q = searchParams.get("q"); // Unified query parameter
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    console.log("=== SEARCH DEBUG START ===");
    console.log("Query parameter (q):", q);
    console.log("Type:", type);
    console.log("Category:", categoryId);
    console.log("Favorite:", isFavorite);

    // Build base where clause for filters
    const baseWhere: any = {};

    if (type) {
      baseWhere.type = type;
    }

    if (categoryId) {
      baseWhere.categoryId = categoryId;
    }

    if (isFavorite === "true") {
      baseWhere.isFavorite = true;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch resources with base filters
    const allResources = await db.resource.findMany({
      where: baseWhere,
      orderBy,
      include: {
        category: true,
      },
    });

    console.log("Total resources fetched:", allResources.length);

    // Apply unified search if query exists
    let filteredResources = allResources;

    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      console.log("Applying search filter for:", query);

      let matchCount = 0;
      filteredResources = allResources.filter((resource) => {
        try {
          // Parse tags safely
          let tags: string[] = [];
          try {
            tags = resource.tags ? JSON.parse(resource.tags) : [];
          } catch (tagError) {
            console.error(
              "Error parsing tags for resource:",
              resource.id,
              resource.tags
            );
            tags = [];
          }

          // Search in ALL fields with OR logic
          const matchesName = resource.name.toLowerCase().includes(query);
          const matchesDescription =
            resource.description?.toLowerCase().includes(query) || false;
          const matchesUrl = resource.url.toLowerCase().includes(query);
          const matchesTag =
            Array.isArray(tags) &&
            tags.some((tag) => tag.toLowerCase().includes(query));
          const matchesCategory =
            resource.category?.name.toLowerCase().includes(query) || false;

          const matched =
            matchesName ||
            matchesDescription ||
            matchesUrl ||
            matchesTag ||
            matchesCategory;

          // Log EVERY match with details
          if (matched) {
            matchCount++;
            console.log(`Match #${matchCount}:`, {
              id: resource.id,
              name: resource.name,
              url: resource.url.substring(0, 50) + "...",
              tags: tags,
              category: resource.category?.name,
              matchedIn: {
                name: matchesName,
                description: matchesDescription,
                url: matchesUrl,
                tag: matchesTag,
                category: matchesCategory,
              },
            });
          }

          return matched;
        } catch (e) {
          console.error("Error filtering resource:", resource.id, e);
          return false;
        }
      });

      console.log("Resources after filter:", filteredResources.length);
    } else {
      console.log("No search query - returning all resources");
    }

    // Parse tags from JSON strings to arrays
    const parsedResources = filteredResources.map((resource) => ({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
    }));

    // Apply pagination
    const paginatedResources = parsedResources.slice(offset, offset + limit);

    console.log("Final resources to return:", paginatedResources.length);
    console.log("=== SEARCH DEBUG END ===\n");

    return NextResponse.json({
      resources: paginatedResources,
      total: parsedResources.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, type, description, icon, tags, categoryId, isFavorite } =
      body;

    if (!name || !url || !type) {
      return NextResponse.json(
        { error: "Name, URL, and type are required" },
        { status: 400 }
      );
    }

    const resource = await db.resource.create({
      data: {
        name,
        url,
        type,
        description,
        icon,
        tags: tags ? JSON.stringify(tags) : null,
        categoryId,
        isFavorite: isFavorite || false,
      },
      include: {
        category: true,
      },
    });

    // Return with parsed tags
    return NextResponse.json(
      {
        ...resource,
        tags: resource.tags ? JSON.parse(resource.tags) : [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
