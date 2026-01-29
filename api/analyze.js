export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { census_data, claims_data, pharmacy_data, large_claimants, utilization_data, benefits_data, contributions_data, client_info } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `You are a benefits consulting AI analyst. Analyze this employee benefits data and provide a comprehensive risk assessment.

CLIENT INFO:
${JSON.stringify(client_info, null, 2)}

CENSUS DATA (${census_data?.length || 0} employees):
${JSON.stringify(census_data?.slice(0, 50), null, 2)}

CLAIMS DATA:
${JSON.stringify(claims_data?.slice(0, 20), null, 2)}

PHARMACY DATA:
${JSON.stringify(pharmacy_data?.slice(0, 20), null, 2)}

LARGE CLAIMANTS:
${JSON.stringify(large_claimants?.slice(0, 10), null, 2)}

UTILIZATION METRICS:
${JSON.stringify(utilization_data?.slice(0, 15), null, 2)}

Respond with a JSON object containing:
{
  "executive_summary": "2-3 sentence overview",
  "risk_assessment": {
    "overall_score": 0-100,
    "risk_category": "Low/Moderate/High/Critical",
    "key_risks": ["risk1", "risk2", "risk3"]
  },
  "census_profile": {
    "total_lives": number,
    "average_age": number,
    "age_distribution": {"under_30": n, "30_to_50": n, "over_50": n},
    "gender_split": {"male": "X%", "female": "Y%"}
  },
  "cost_drivers": ["driver1", "driver2", "driver3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}

Return ONLY valid JSON, no markdown or explanation.`
        }]
      })
    });

    const data = await response.json();
    
    let analysis;
    try {
      const content = data.content[0].text;
      analysis = JSON.parse(content);
    } catch {
      analysis = {
        executive_summary: data.content[0].text.substring(0, 500),
        risk_assessment: { overall_score: 65, risk_category: 'Moderate', key_risks: ['Analysis parsing error'] },
        recommendations: ['Review raw analysis output']
      };
    }

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: error.message });
  }
}
