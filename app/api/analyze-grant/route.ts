export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (file.type !== 'application/pdf') {
      return new Response(JSON.stringify({ error: 'Only PDF files are supported' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ✅ Skipping actual PDF parsing — using mock text instead
    const mockText = `Project Title: Advancing Renewable Energy Solutions

The purpose of this project is to research and develop scalable renewable energy solutions for rural communities. The project will focus on solar microgrids, battery storage, and local economic empowerment through training programs. 

Funding Requested: $250,000

Timeline: January 2025 – December 2026

Key Objectives:
1. Install five solar microgrids in underserved rural areas.
2. Train 100 local residents in system maintenance and energy entrepreneurship.
3. Monitor and report performance over a 24-month period.

Expected Outcomes:
- Increase energy reliability by 70%
- Reduce community energy costs by 40%
- Empower residents with technical and business skills`;

    // ✅ Mock summary result based on hardcoded text
    const mockSummary = {
      eligibilityRequirements:
        'Applicants must serve rural communities and be able to implement solar energy solutions. Priority given to local nonprofits or energy cooperatives.',
      fundingDetails:
        '$250,000 available as a one-time grant. Expected to fund 1–3 projects over a 2-year period (Jan 2025 – Dec 2026).',
      deadlinesAndKeyDates:
        'Project start: January 2025. End: December 2026. Application deadline and notification dates not provided in the document.',
      requiredApplicationComponents:
        'Applicants must provide a project narrative, budget breakdown, training plan, and performance monitoring strategy. No specific templates were referenced.',
      evaluationCriteria:
        'Reviewers will likely assess project impact, feasibility, community involvement, and sustainability of outcomes.',
      complianceAndReporting:
        'Awardees must track energy reliability, cost savings, and resident training outcomes. Reporting required throughout the 24-month period.',
      contactAndSupport:
        'No specific contact info or support resources were mentioned in the document.',
      plainLanguageSummary: `
- You can apply if you serve rural areas and work on solar energy.
- There’s a one-time grant of $250K for 1–3 projects.
- The project runs from Jan 2025 to Dec 2026.
- Be ready to submit a budget, training plan, and performance strategy.
- Track and report outcomes like energy savings and resident training.
      `,
    };

    return new Response(JSON.stringify(mockSummary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in mock grant analysis:', error);
    return new Response(
      JSON.stringify({ error: 'Mock grant analysis failed', details: error }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
