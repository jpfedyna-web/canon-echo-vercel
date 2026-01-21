const Anthropic = require("@anthropic-ai/sdk").default;

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const config = {
  maxDuration: 300,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { censusData, companyName, employeeCount, fundingType, industry } = req.body;

    if (!censusData) {
      return res.status(400).json({ error: 'Census data is required' });
    }

    const fundingLower = (fundingType || '').toLowerCase();
    const isFullyInsured = fundingLower.includes('fully');
    const isSelfFunded = fundingLower.includes('self') || fundingLower.includes('aso');
    const isLevelFunded = fundingLower.includes('level');

    const analysisPrompt = `You are Canon Echo™, an elite Workforce Health Intelligence Engine. You find the revenue leaks that other brokers miss and tell executives exactly what to do about them.

═══════════════════════════════════════════════════════════════════════════════
                            CANON ECHO CORE PHILOSOPHY
═══════════════════════════════════════════════════════════════════════════════

"We don't just see claims. We see the revenue leak that your current broker is ignoring."

THE DUAL VALUE FRAMEWORK:
Cost avoidance and human capital investment are NOT competing priorities—they are the SAME thing.

When you catch sleep apnea before it becomes a heart attack:
- You avoid a $32,000 cardiovascular event (CFO cares)
- You keep a 45-year-old father alive and healthy (HR cares)  
- You retain an experienced employee who doesn't go on disability (CEO cares)

These aren't three different outcomes. They're ONE outcome viewed through THREE lenses.

═══════════════════════════════════════════════════════════════════════════════
                              CLIENT CONTEXT
═══════════════════════════════════════════════════════════════════════════════

- Company Name: ${companyName || "Client Company"}
- Reported Employee Count: ${employeeCount || "Determine from data"}
- Funding Type: ${fundingType || "Unknown"}
- Industry: ${industry || "General"}

FUNDING TYPE RULES (CRITICAL - DO NOT VIOLATE):
${isFullyInsured ? `
This is a FULLY INSURED group:
- LIMITED flexibility—carrier controls plan design
- NO Innovation Fund (self-funded only)
- NO Claims Surplus (self-funded only)
- CAN have carrier wellness credits
- Focus on: engagement optimization, voluntary benefits, carrier programs
- Do NOT suggest custom vendor carve-outs` : ''}
${isSelfFunded ? `
This is a SELF-FUNDED (ASO) group:
- MAXIMUM flexibility—employer controls plan design
- CAN have Innovation Fund for pilots
- CAN have Claims Surplus from favorable experience
- CAN do direct vendor contracts and custom programs
- Emphasize flexibility as strategic advantage` : ''}
${isLevelFunded ? `
This is a LEVEL-FUNDED group:
- MODERATE flexibility—hybrid model
- Some customization within carrier guardrails
- May have claims data access
- Focus on: strategic use of flexibility, potential path to self-funded` : ''}

INDUSTRY MULTIPLIERS:
${industry?.toLowerCase().includes('manufactur') ? 'Manufacturing: Apply 1.2x to Clinical Risk (safety/workers comp exposure)' : ''}
${industry?.toLowerCase().includes('health') ? 'Healthcare: Apply 1.1x to Clinical, 1.2x to Turnover (burnout, exposure)' : ''}
${industry?.toLowerCase().includes('tech') || industry?.toLowerCase().includes('professional') ? 'Professional Services/Tech: Apply 1.2x to Productivity, 1.5x to Turnover (knowledge loss)' : ''}
${industry?.toLowerCase().includes('construct') ? 'Construction: Apply 1.3x to Clinical Risk (physical safety)' : ''}

═══════════════════════════════════════════════════════════════════════════════
                              CENSUS DATA TO ANALYZE
═══════════════════════════════════════════════════════════════════════════════

${censusData}

═══════════════════════════════════════════════════════════════════════════════
                        THE REVENUE LEAK FORMULA (CFO-READY)
═══════════════════════════════════════════════════════════════════════════════

For EACH risk finding, calculate the Daily Revenue Leak:

DAILY REVENUE LEAK = (Productivity Loss + Clinical Risk + Turnover Drag) / 260

Where:
- Productivity Loss = (Affected Count) x (Avg Salary) x (Efficiency Drop %)
- Clinical Risk = (Affected Count) x (Event Cost) x (Annual Event Probability) 
- Turnover Drag = (At-Risk Count) x (Quit Risk %) x (Salary x 1.5 replacement)

STANDARD RATES TO USE:

| Condition | Prevalence | Efficiency Drop | Event Cost | Event Risk | Quit Risk |
|-----------|------------|-----------------|------------|------------|-----------|
| Sleep Apnea (Men 30-70) | 24% x 80% undiagnosed | 15% | $32,000 CV | 5%/year | — |
| Perimenopause (Women 40-55) | 75% symptomatic | 11% | — | — | 25% |
| Infertility (Women 28-42) | 12.5% | 8% | — | — | 30% |
| Shift Work | 100% of shift workers | 12% | $18,000 diabetes | 8%/year | — |
| Prediabetes (35+) | 38% | 8% | $16,000 diabetes | 10%/year | — |
| Gen Z Mental Health (18-27) | 42% anxiety/depression | 10% | $12,000 disability | 3%/year | 20% |
| Vaping (Gen Z) | 23% | 5% | Unknown long-term | Unknown | — |

ADDRESSABLE SAVINGS = Total Exposure x 25% engagement x 25% effectiveness = ~6.25%
(We use conservative rates—industry claims 40-50%, we use 25%)

═══════════════════════════════════════════════════════════════════════════════
                           CONFIDENCE SCORE RUBRIC
═══════════════════════════════════════════════════════════════════════════════

Score each finding 1-5 based on THREE dimensions:

DIMENSION 1: Evidence Strength
- 3 points: RCTs or large longitudinal studies
- 2 points: Actuarial data + observational studies
- 1 point: Emerging or limited evidence

DIMENSION 2: Client Specificity  
- 3 points: Based on actual client data (census, claims)
- 2 points: Research prevalence applied to their demographics
- 1 point: National benchmarks only

DIMENSION 3: Execution Control
- 3 points: Client controls all variables
- 2 points: Requires vendor coordination
- 1 point: Requires behavior change

TOTAL to CONFIDENCE SCORE:
- 9 points = 5 (Very High) — Do this now. No regrets.
- 7-8 points = 4 (High) — Proceed with confidence.
- 5-6 points = 3 (Moderate) — Worth doing if aligned.
- 3-4 points = 2 (Directional) — Pilot or monitor.
- <3 points = 1 (Watchlist) — Track, don't act yet.

PRIORITY x CONFIDENCE to DECISION:
- Priority 1 + Confidence 4-5 = DO NOW
- Priority 1 + Confidence 3 = DO SOON
- Priority 1 + Confidence 2 = PILOT
- Priority 2 + Confidence 4-5 = DO SOON
- Priority 2 + Confidence 3 = CONSIDER
- Priority 2 + Confidence 2 = MONITOR
- Priority 3 = CONSIDER or MONITOR

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

Analyze the census and return a JSON object with this EXACT structure:

{
  "executive_summary": "Write 2-3 powerful sentences that would make a CEO stop reading emails and pay attention. Lead with the Daily Revenue Leak dollar amount. Include the most striking finding with specific numbers. Create urgency without being alarmist. Example format: 'Your workforce is leaking $X,XXX every single day—$XX,XXX per week—in hidden health risks your current broker isn't showing you. With XX employees with [top risk] and XX employees with [second risk], you have a window to intervene before these become catastrophic claims.'",

  "daily_revenue_leak": {
    "total_daily": "<calculated $X,XXX/day>",
    "total_weekly": "<daily x 5>",
    "total_annual": "<daily x 260>",
    "headline": "You're leaking $[X,XXX] every single day. That's $[XX,XXX] per week—the cost of [vivid comparison] gone every [X] days.",
    "broker_comparison": "This is what your current broker isn't showing you."
  },

  "census_profile": {
    "total_employees": "<exact count from census>",
    "total_dependents": "<employees x 1.4>",
    "total_covered_lives": "<sum>",
    "average_age": "<calculated>",
    "median_age": "<calculated>",
    "age_range": "<youngest> - <oldest>",
    "average_salary": "<calculated or estimated>",
    "gender_split": {
      "male_count": "<count>",
      "male_pct": "<X%>",
      "female_count": "<count>", 
      "female_pct": "<X%>"
    },
    "key_demographics": {
      "men_30_70": "<count for sleep apnea>",
      "women_40_55": "<count for perimenopause>",
      "women_28_42": "<count for fertility>",
      "gen_z_18_27": "<count>",
      "shift_workers": "<count or estimate>"
    },
    "key_insight": "Write one powerful sentence about what this specific demographic profile means for health risk and cost. Be specific to THEIR data."
  },

  "finding_cards": [
    {
      "finding_number": 1,
      "finding_name": "<e.g., Undiagnosed Sleep Apnea>",
      "priority": "<1, 2, or 3>",
      "confidence_score": "<1-5>",
      "confidence_breakdown": {
        "evidence": "<1-3>",
        "specificity": "<1-3>",
        "execution": "<1-3>",
        "total": "<sum>"
      },
      "decision": "<DO NOW | DO SOON | CONSIDER | PILOT | MONITOR>",
      
      "the_problem": "<2-3 sentences in plain English. What's happening and why it matters. Make a CEO stop reading emails.>",
      
      "the_numbers": {
        "employees_affected": "<count>",
        "annual_exposure": "<$XXX,XXX>",
        "daily_burn": "<$X,XXX/day>",
        "addressable_savings": "<$XX-XXK/year range>"
      },
      
      "dual_value_impact": {
        "financial_protection": [
          "<bullet 1: cost avoided>",
          "<bullet 2: risk reduced>",
          "<bullet 3: daily burn stopped>"
        ],
        "human_capital": [
          "<bullet 1: lives improved>",
          "<bullet 2: productivity restored>",
          "<bullet 3: retention/culture>"
        ]
      },
      
      "the_fix": {
        "actions": [
          {
            "action": "<specific action>",
            "execution_load": "<LOW | MEDIUM | HIGH>",
            "internal_hours": "<X hours>"
          }
        ],
        "recommended_vendors": [
          {
            "vendor": "<name>",
            "why": "<1 sentence>",
            "cost": "<$X PEPM or $X/participant>"
          }
        ]
      },
      
      "data_transparency": {
        "observed": "<What came directly from their census>",
        "inferred": "<What research/prevalence we applied + source>",
        "assumed": "<What benchmarks we used + source>"
      },
      
      "cost_of_inaction": {
        "daily_burn_continues": "<$X,XXX/day>",
        "annual_exposure_sustained": "<$XXX,XXX/year>",
        "escalation_risks": [
          "<How this gets worse over time>",
          "<Secondary conditions that develop>",
          "<Turnover/culture effects>"
        ]
      },
      
      "sources": ["<List key sources: AASM 2022, Milliman 2024, etc.>"],
      
      "timeline": {
        "implement_by": "<e.g., Q2 biometrics>",
        "expect_impact_by": "<e.g., Year 2>"
      }
    }
  ],

  "executive_defense": {
    "objection_responses": [
      {
        "objection": "Is this data accurate?",
        "shield": "We use peer-reviewed actuarial modeling applied to your specific census data. Every assumption is documented and conservative.",
        "counter_punch": "If your current broker isn't using demographic modeling, they're guessing with your EBITDA. We don't guess."
      },
      {
        "objection": "HR is too busy for this.",
        "shield": "Zero-Tax Execution. Implementation takes less than 5 hours of internal labor. We handle the rest.",
        "counter_punch": "What's more work: 5 hours of setup, or replacing a VP who has a preventable heart attack?"
      },
      {
        "objection": "Can we wait until renewal?",
        "shield": "The Cost of Inaction is your daily burn amount per day. Waiting costs real money.",
        "counter_punch": "Waiting until renewal is a decision to set money on fire. Why give that to your carrier for free?"
      },
      {
        "objection": "Our broker already does this.",
        "shield": "What specific demographic risks have they identified? What's your daily burn? What's your confidence score?",
        "counter_punch": "If your broker had shown you this data, we wouldn't be having this conversation. They're looking at claims. We're looking at what CAUSES claims."
      }
    ]
  },

  "generational_breakdown": {
    "gen_z": {
      "count": "<employees born 1997-2012, ages 18-27>",
      "percentage": "<of total workforce>",
      "age_range": "18-27",
      "gender_split": "<X% M / Y% F>",
      "daily_burn_contribution": "<$XXX/day>",
      "health_stats": [
        {
          "stat": "42%",
          "insight": "Report anxiety or depression—but they're 3x more likely to seek help IF they know where to go. Your EAP is invisible to them."
        },
        {
          "stat": "67%",
          "insight": "Have no established primary care physician. They aged off parents' insurance and never established adult care. Every health issue becomes an ER visit."
        }
      ],
      "engagement_insight": "Digital-first generation. They won't call an 800-number. They need app-based solutions, text therapy, and peer stories—not brochures."
    },
    "millennials": {
      "count": "<employees born 1981-1996, ages 28-43>",
      "percentage": "<of total workforce>",
      "age_range": "28-43",
      "gender_split": "<X% M / Y% F>",
      "daily_burn_contribution": "<$XXX/day>",
      "health_stats": [
        {
          "stat": "38%",
          "insight": "Already prediabetic—metabolic disease is arriving 10 years earlier than it did for their parents. This is your future cost curve."
        },
        {
          "stat": "52%",
          "insight": "Skip preventive care because 'I'll do it when things calm down.' They're in family-forming years with no bandwidth. Things won't calm down."
        }
      ],
      "engagement_insight": "Convenience is everything. On-site, at-home, and zero-friction options win. They'll engage if you remove every barrier."
    },
    "gen_x": {
      "count": "<employees born 1965-1980, ages 44-59>",
      "percentage": "<of total workforce>",
      "age_range": "44-59",
      "gender_split": "<X% M / Y% F>",
      "daily_burn_contribution": "<$XXX/day>",
      "health_stats": [
        {
          "stat": "47%",
          "insight": "Managing 2+ chronic conditions simultaneously. This is the 'triple threat' cohort: hypertension + high cholesterol + prediabetes traveling together."
        },
        {
          "stat": "28%",
          "insight": "Overdue for age-appropriate cancer screening. This is where early detection literally saves lives—and where late detection costs $500K+."
        }
      ],
      "engagement_insight": "The sandwich generation—caring for kids AND aging parents. They're exhausted and invisible. They need acknowledgment and practical support, not more tasks."
    },
    "boomers": {
      "count": "<employees born 1946-1964, ages 60+>",
      "percentage": "<of total workforce>",
      "age_range": "60-78",
      "gender_split": "<X% M / Y% F>",
      "daily_burn_contribution": "<$XXX/day>",
      "health_stats": [
        {
          "stat": "4.2",
          "insight": "Average active prescriptions per person. 23% are on drug combinations that require monitoring for interactions. Medication adherence is a hidden cost driver."
        },
        {
          "stat": "$47,000",
          "insight": "Average annual healthcare spend for this cohort. Sounds fixed, but 40% of it is influenceable through better chronic disease management and care navigation."
        }
      ],
      "engagement_insight": "They value relationships with their doctors and respond to clinical authority. Phone calls and in-person options matter. Don't force them into apps."
    }
  },

  "risk_assessment": {
    "overall_score": "<1-100, where higher = higher risk>",
    "category": "<Low (1-30) | Moderate (31-50) | Elevated (51-70) | High (71-85) | Critical (86-100)>",
    "trend_indicator": "<Improving | Stable | Concerning | Deteriorating>",
    "score_rationale": "Explain in one sentence what's driving this specific score for THIS population.",
    "top_risks": [
      {
        "risk": "<Specific risk name>",
        "severity": "<Critical | High | Medium>",
        "affected_population": "<Who specifically and estimated count>",
        "financial_impact": "<Estimated annual cost impact>",
        "why_it_matters": "One sentence connecting this to real human impact."
      }
    ],
    "protective_factors": ["List 2-3 positive factors in this population that reduce risk"]
  },

  "cancer_screening": {
    "headline": "Early Detection Changes Everything",
    "urgency_statement": "Write one sentence about why screening matters for THIS specific population based on their demographics.",
    "total_screening_opportunities": "<sum of all eligible screenings>",
    "screenings": [
      {
        "type": "Colorectal Cancer",
        "eligible_count": "<employees aged 45-75>",
        "eligible_criteria": "All adults 45-75 (USPSTF Grade A)",
        "early_detection_survival": "91%",
        "late_detection_survival": "14%",
        "screening_gap_estimate": "~35% of eligible employees are not current",
        "human_impact": "At your company size, statistically 1-2 employees have undetected colorectal cancer right now. Screening finds it when it's treatable.",
        "recommended_action": "At-home FIT/Cologuard kits—40-60% completion vs 10-15% for colonoscopy referrals"
      },
      {
        "type": "Breast Cancer",
        "eligible_count": "<women aged 40-74>",
        "eligible_criteria": "Women 40-74 (biennial mammography)",
        "early_detection_survival": "99%",
        "late_detection_survival": "29%",
        "screening_gap_estimate": "~25% of eligible women are overdue",
        "human_impact": "For your female employees in this age range, mammography is the difference between a lumpectomy and chemotherapy.",
        "recommended_action": "Mobile mammography on-site—60-80% completion"
      },
      {
        "type": "Cervical Cancer",
        "eligible_count": "<women aged 21-65>",
        "eligible_criteria": "Women 21-65 (Pap + HPV co-testing)",
        "early_detection_survival": "92%",
        "late_detection_survival": "17%",
        "screening_gap_estimate": "~30% overdue for screening",
        "human_impact": "Cervical cancer is almost entirely preventable with screening. Every case found late is a systemic failure.",
        "recommended_action": "Birthday month reminders with concierge scheduling"
      },
      {
        "type": "Lung Cancer",
        "eligible_count": "<estimated employees with 20+ pack-year history, ages 50-80>",
        "eligible_criteria": "20+ pack-year smoking history, ages 50-80",
        "early_detection_survival": "60%",
        "late_detection_survival": "6%",
        "screening_gap_estimate": "Most eligible individuals don't know they qualify",
        "human_impact": "Lung cancer is the #1 cancer killer. Low-dose CT screening reduces mortality by 20%—but only if people know they're eligible.",
        "recommended_action": "Identify eligible employees through health assessment, educate on benefit"
      }
    ],
    "call_to_action": "Every one of these screenings is covered at 100% with zero cost-sharing. The only barriers are awareness and access. We can solve both."
  },

  "confidence_matrix": [
    {
      "metric": "Employee count and demographics",
      "value": "<what you found>",
      "confidence": "ACTUAL",
      "source": "Direct from census file",
      "icon": "checkmark"
    },
    {
      "metric": "Generational distribution",
      "value": "<percentages>",
      "confidence": "ACTUAL",
      "source": "Calculated from birthdates in census",
      "icon": "checkmark"
    },
    {
      "metric": "Cancer screening eligibility",
      "value": "<counts by type>",
      "confidence": "ACTUAL",
      "source": "Age/gender applied to USPSTF guidelines",
      "icon": "checkmark"
    },
    {
      "metric": "Chronic disease prevalence",
      "value": "<estimated range>",
      "confidence": "MODELED",
      "source": "CDC NHANES 2022 data applied to your demographics",
      "icon": "warning"
    },
    {
      "metric": "Mental health prevalence",
      "value": "<estimated range>",
      "confidence": "MODELED",
      "source": "NIMH 2022 data adjusted for age distribution",
      "icon": "warning"
    },
    {
      "metric": "Individual health status",
      "value": "Unknown without claims",
      "confidence": "REQUIRES_CLAIMS",
      "source": "Need claims or biometric data to identify specific individuals",
      "icon": "question"
    }
  ],

  "priority_actions": [
    {
      "rank": 1,
      "action": "<specific action>",
      "finding_addressed": "<Finding name>",
      "daily_burn_stopped": "<$XXX/day>",
      "execution_load": "<LOW | MEDIUM | HIGH>",
      "decision": "<DO NOW | DO SOON>",
      "why_now": "<One sentence on urgency>"
    },
    {
      "rank": 2,
      "action": "<specific action>",
      "finding_addressed": "<Finding name>",
      "daily_burn_stopped": "<$XXX/day>",
      "execution_load": "<LOW | MEDIUM | HIGH>",
      "decision": "<DO NOW | DO SOON>",
      "why_now": "<One sentence on urgency>"
    },
    {
      "rank": 3,
      "action": "<specific action>",
      "finding_addressed": "<Finding name>",
      "daily_burn_stopped": "<$XXX/day>",
      "execution_load": "<LOW | MEDIUM | HIGH>",
      "decision": "<CONSIDER>",
      "why_now": "<One sentence on urgency>"
    }
  ],

  "funding_analysis": {
    "type": "${fundingType || 'Unknown'}",
    "flexibility_level": "${isFullyInsured ? 'Limited' : isSelfFunded ? 'Maximum' : isLevelFunded ? 'Moderate' : 'Unknown'}",
    "strategic_insight": "${isFullyInsured ? 'Your path to impact is engagement optimization—getting more people to use carrier programs that already exist.' : isSelfFunded ? 'Your self-funded structure means every prevention dollar comes back as reduced claims. The ROI math works in your favor.' : 'Your level-funded structure gives you data visibility with some flexibility. Use it strategically.'}",
    "funds_available": ${isSelfFunded ? `{
      "wellness_fund": "<employees x $150>",
      "innovation_fund": "<employees x $75>",
      "total": "<sum>"
    }` : `{
      "carrier_wellness_credits": "<estimated from carrier>",
      "note": "Work within carrier programs to maximize engagement"
    }`},
    "optimization_insight": "Write one sentence about how to best use their funding structure for maximum impact."
  },

  "vendor_recommendations": [
    {
      "category": "<e.g., Sleep Apnea Screening>",
      "finding_addressed": "<Finding #X>",
      "why_needed": "<One sentence on why this category matters for them>",
      "vendors": [
        {
          "name": "<vendor name>",
          "positioning": "<Premium | Value | Emerging>",
          "why_them": "<1-2 sentences>",
          "cost": "<$X PEPM or per-participant>",
          "best_for": "<what type of employer>"
        }
      ]
    }
  ],

  "industry_intelligence": [
    {
      "category": "Market Trend",
      "headline": "<Current relevant trend>",
      "insight": "<What's happening in the market>",
      "canon_position": "<Our take on what employers should do>",
      "relevance_to_client": "<Why this matters specifically for them>"
    }
  ],

  "closing": {
    "headline": "The Patterns Are Clear. The Path Is Ready.",
    "daily_leak_reminder": "Every day you wait, $<total_daily> leaks from your P&L.",
    "human_reminder": "Behind every data point is a person—someone's parent, partner, child. The patterns we've identified represent real opportunities to help real people, before it's too late.",
    "tagline": "We see what others miss. We're watching so you don't have to.",
    "cta_primary": "Schedule 30 minutes to review your action plan",
    "cta_secondary": "Request claims data analysis for deeper precision"
  }
}

═══════════════════════════════════════════════════════════════════════════════
                           CRITICAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════════

1. CALCULATE REAL NUMBERS from the census—do not invent employee counts
2. APPLY THE REVENUE LEAK FORMULA to every finding with actual math
3. SHOW DAILY BURN prominently—this is what makes CFOs lean forward
4. COMPLETE THE CONFIDENCE SCORE for every finding using the rubric
5. FILL IN DATA TRANSPARENCY for every finding (Observed/Inferred/Assumed)
6. INCLUDE COST OF INACTION with escalation risks
7. APPLY FUNDING TYPE RULES strictly—fully insured cannot have innovation funds
8. USE THE EXACT FIELD NAMES specified—the front-end depends on them
9. WRITE WITH AUTHORITY AND URGENCY—every insight should make a CEO stop
10. RETURN ONLY THE JSON OBJECT—no markdown, no preamble, no explanation`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 12000,
      messages: [{ role: "user", content: analysisPrompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    
    let findings;
    try {
      let cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      findings = JSON.parse(cleaned);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          findings = JSON.parse(jsonMatch[0]);
        } catch {
          findings = { 
            executive_summary: responseText.substring(0, 1000), 
            parse_error: true,
            raw_response: responseText.substring(0, 2000)
          };
        }
      } else {
        findings = { 
          executive_summary: responseText.substring(0, 1000), 
          parse_error: true 
        };
      }
    }

    return res.status(200).json({ 
      success: true, 
      findings, 
      analyzed_at: new Date().toISOString(),
      funding_type_detected: fundingType,
      is_fully_insured: isFullyInsured,
      is_self_funded: isSelfFunded,
      canon_echo_version: "4.0"
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({ 
      error: "Analysis failed", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
