import { NextResponse } from "next/server";
import { getPublicFaqs } from "@/lib/faqs-db";

export async function GET() {
  try {
    const faqs = await getPublicFaqs();
    
    return NextResponse.json({
      success: true,
      faqs,
    });
  } catch (error) {
    console.error("Error fetching public FAQs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch FAQs",
      },
      { status: 500 }
    );
  }
}
