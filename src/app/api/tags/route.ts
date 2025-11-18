import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "frequency"; // 'frequency' or 'alphabetical'
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get all resources and contacts to extract tags
    const [resources, contacts] = await Promise.all([
      db.resource.findMany({
        select: {
          tags: true,
        },
      }),
      db.contact.findMany({
        select: {
          tags: true,
        },
      }),
    ]);

    // Extract and parse tags with frequency counting
    const tagFrequency = new Map<string, number>();

    // Process resource tags
    resources.forEach((resource) => {
      if (resource.tags) {
        try {
          const tags = JSON.parse(resource.tags);
          if (Array.isArray(tags)) {
            tags.forEach((tag) => {
              const normalizedTag = tag.trim();
              if (normalizedTag) {
                tagFrequency.set(
                  normalizedTag,
                  (tagFrequency.get(normalizedTag) || 0) + 1
                );
              }
            });
          }
        } catch (error) {
          console.log("Error parsing resource tags:", error);
        }
      }
    });

    // Process contact tags
    contacts.forEach((contact) => {
      if (contact.tags) {
        try {
          const tags = JSON.parse(contact.tags);
          if (Array.isArray(tags)) {
            tags.forEach((tag) => {
              const normalizedTag = tag.trim();
              if (normalizedTag) {
                tagFrequency.set(
                  normalizedTag,
                  (tagFrequency.get(normalizedTag) || 0) + 1
                );
              }
            });
          }
        } catch (error) {
          console.log("Error parsing contact tags:", error);
        }
      }
    });

    // Convert to array with frequency data
    const tagsWithFrequency = Array.from(tagFrequency.entries()).map(
      ([tag, frequency]) => ({
        tag,
        frequency,
      })
    );

    // Sort based on preference
    let sortedTags;
    if (sortBy === "alphabetical") {
      sortedTags = tagsWithFrequency.sort((a, b) => a.tag.localeCompare(b.tag));
    } else {
      // Sort by frequency (most used first), then alphabetically
      sortedTags = tagsWithFrequency.sort((a, b) => {
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return a.tag.localeCompare(b.tag);
      });
    }

    // Apply limit
    const limitedTags = sortedTags.slice(0, limit);

    // Return just the tag names for simplicity (but include frequency data for debugging)
    const tagArray = limitedTags.map((t) => t.tag);

    console.log("Tags API: Total unique tags found:", tagFrequency.size);
    console.log("Tags API: Top 5 tags:", limitedTags.slice(0, 5));

    return NextResponse.json({
      tags: tagArray,
      tagsWithFrequency: limitedTags, // Include detailed data
      total: tagFrequency.size,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
