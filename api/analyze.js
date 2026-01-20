const Anthropic = require("@anthropic-ai/sdk").default;

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const config = {
  maxDuration: 60, // Vercel Pro allows 60 seconds
};

export default async function handler(req, res) {
  // CORS headers
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

    // Determine funding type characteristics
    const fundingLower = (fundingType || '').toLowerCase();
    const isFullyInsured = fundingLower.includes('fully');
    const isSelfFunded = fundingLower.includes('self') || fundingLower.includes('aso');
    const isLevelFunded = fundingLower.includes('level');

    const analysisPrompt = `You are Canon Echo, an elite workforce health intelligence system. Your reports are used to advise C-suite executives and must demonstrate exceptional analytical depth, compelling language, and actionable precision.

CRITICAL CONTEXT:
- Company Name: ${companyName || "Client Company"}
- Reported Employee Count: ${employeeCount || "Determine from data"}
- Funding Type: ${fundingType || "Unknown"}
- Industry: ${industry || "General"}

FUNDING TYPE RULES (CRITICAL - DO NOT VIOLATE):
${isFullyInsured ? `
- This is a FULLY INSURED group
- They have LIMITED flexibility - carrier controls plan design
- NO Innovation Fund (this is only for self-funded groups)
- NO Wells Fund Surplus (this is only for self-funded groups)  
- They CAN still have Wellness Fund dollars (typically carrier-provided wellness credits)
- Focus recommendations on: carrier wellness programs, voluntary benefits, engagement strategies
- Do NOT suggest custom vendor carve-outs or plan design changes` : ''}
${isSelfFunded ? `
- This is a SELF-FUNDED (ASO) group
- They have MAXIMUM flexibility - employer controls plan design
- They CAN have Innovation Fund for pilot programs
- They CAN have Wells Fund Surplus from favorable claims
- They CAN do direct vendor contracts, carve-outs, custom programs
- Emphasize their flexibility as a strategic advantage` : ''}
${isLevelFunded ? `
- This is a LEVEL-FUNDED group
- They have MODERATE flexibility - hybrid model
- Some ability to customize but within carrier guardrails
- May have access to claims data for insights
- Focus on: strategic use of available flexibility, preparing for potential move to self-funded` : ''}

CENSUS DATA TO ANALYZE:
${censusData}

YOUR TASK:
Perform a comprehensive workforce health intelligence analysis. Calculate REAL numbers from the census data provided. Apply CDC/NHANES population health statistics. Generate insights that would make a CEO stop and pay attention.

RETURN YOUR ANALYSIS AS JSON WITH THIS EXACT STRUCTURE:

{
  "executive_summary": "Write 2-3 powerful sentences that would make a CEO stop reading emails and pay attention. Lead with the most striking finding. Use specific numbers from your analysis. Create urgency without being alarmist. This is your headline - make it count.",

  "census_profile": {
    "total_employees": "<exact count from census data>",
    "total_dependents": "<calculated: employees × 1.4 average>",
    "total_covered_lives": "<employees + dependents>",
    "average_age": "<calculated from birthdates/ages in data>",
    "median_age": "<calculated>",
    "age_range": "<youngest> - <oldest>",
    "gender_split": {
      "male_count": "<from data>",
      "male_pct": "<calculated>",
      "female_count": "<from data>",
      "female_pct": "<calculated>"
    },
    "key_insight": "Write one powerful sentence about what this specific demographic profile means for health risk and cost. Be specific to THEIR data, not generic."
  },

  "generational_breakdown": {
    "gen_z": {
      "count": "<employees born 1997-2012>",
      "percentage": "<of total workforce>",
      "age_range": "18-27",
      "gender_split": "<X% M / Y% F>",
      "health_stats": [
        {
          "stat": "42%",
          "insight": "Report anxiety or depression—but here's what matters: they're 3× more likely to seek help IF they know where to go. Your EAP is invisible to them."
        },
        {
          "stat": "67%",
          "insight": "Have no established primary care physician. They aged off parents' insurance and never established adult care. Every health issue becomes an ER visit."
        }
      ],
      "engagement_insight": "Digital-first generation. They won't call an 800-number. They need app-based solutions, text therapy, and peer stories—not brochures."
    },
    "millennials": {
      "count": "<employees born 1981-1996>",
      "percentage": "<of total workforce>",
      "age_range": "28-43",
      "gender_split": "<X% M / Y% F>",
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
      "count": "<employees born 1965-1980>",
      "percentage": "<of total workforce>",
      "age_range": "44-59",
      "gender_split": "<X% M / Y% F>",
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
      "count": "<employees born 1946-1964>",
      "percentage": "<of total workforce>",
      "age_range": "60-78",
      "gender_split": "<X% M / Y% F>",
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
    "overall_score": "<1-100, where higher = higher risk. Calculate based on age distribution, chronic disease likelihood, screening gaps>",
    "category": "<Low (1-30) | Moderate (31-50) | Elevated (51-70) | High (71-85) | Critical (86-100)>",
    "trend_indicator": "<Improving | Stable | Concerning | Deteriorating>",
    "score_rationale": "Explain in one sentence what's driving this specific score for THIS population.",
    "top_risks": [
      {
        "risk": "<Specific risk name>",
        "severity": "<Critical | High | Medium>",
        "affected_population": "<Who specifically and estimated count>",
        "financial_impact": "<Estimated annual cost impact>",
        "why_it_matters": "One sentence connecting this to real human impact—remember, these are people, not just data points."
      },
      {
        "risk": "<Second major risk>",
        "severity": "<level>",
        "affected_population": "<who>",
        "financial_impact": "<cost>",
        "why_it_matters": "<human impact>"
      },
      {
        "risk": "<Third major risk>",
        "severity": "<level>",
        "affected_population": "<who>",
        "financial_impact": "<cost>",
        "why_it_matters": "<human impact>"
      }
    ],
    "protective_factors": ["List 2-3 positive factors in this population that reduce risk"]
  },

  "cancer_screening": {
    "headline": "Early Detection Changes Everything",
    "urgency_statement": "Write one sentence about why screening matters for THIS specific population.",
    "total_screening_opportunities": "<sum of all eligible screenings>",
    "screenings": [
      {
        "type": "Colorectal Cancer",
        "eligible_count": "<employees aged 45-75>",
        "eligible_criteria": "All adults 45-75 (USPSTF Grade A)",
        "early_detection_survival": "91%",
        "late_detection_survival": "14%",
        "screening_gap_estimate": "~35% of eligible employees are not current",
        "human_impact": "At your company size, statistically 1-2 employees have undetected colorectal cancer right now. Screening finds it when it's treatable."
      },
      {
        "type": "Breast Cancer",
        "eligible_count": "<women aged 40-74>",
        "eligible_criteria": "Women 40-74 (biennial mammography)",
        "early_detection_survival": "99%",
        "late_detection_survival": "29%",
        "screening_gap_estimate": "~25% of eligible women are overdue",
        "human_impact": "For your female employees in this age range, mammography is the difference between a lumpectomy and chemotherapy."
      },
      {
        "type": "Cervical Cancer",
        "eligible_count": "<women aged 21-65>",
        "eligible_criteria": "Women 21-65 (Pap + HPV co-testing)",
        "early_detection_survival": "92%",
        "late_detection_survival": "17%",
        "screening_gap_estimate": "~30% overdue for screening",
        "human_impact": "Cervical cancer is almost entirely preventable with screening. Every case found late is a systemic failure."
      },
      {
        "type": "Lung Cancer",
        "eligible_count": "<estimated employees with 20+ pack-year history, ages 50-80>",
        "eligible_criteria": "20+ pack-year smoking history, ages 50-80",
        "early_detection_survival": "60%",
        "late_detection_survival": "6%",
        "screening_gap_estimate": "Most eligible individuals don't know they qualify",
        "human_impact": "Lung cancer is the #1 cancer killer. Low-dose CT screening reduces mortality by 20%—but only if people know they're eligible."
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
      "icon": "✅"
    },
    {
      "metric": "Generational distribution",
      "value": "<percentages>",
      "confidence": "ACTUAL",
      "source": "Calculated from birthdates in census",
      "icon": "✅"
    },
    {
      "metric": "Cancer screening eligibility",
      "value": "<counts by type>",
      "confidence": "ACTUAL",
      "source": "Age/gender applied to USPSTF guidelines",
      "icon": "✅"
    },
    {
      "metric": "Chronic disease prevalence",
      "value": "<estimated range>",
      "confidence": "MODELED",
      "source": "CDC NHANES 2022 data applied to your demographics",
      "icon": "⚠️"
    },
    {
      "metric": "Mental health prevalence",
      "value": "<estimated range>",
      "confidence": "MODELED",
      "source": "NIMH 2022 data adjusted for age distribution",
      "icon": "⚠️"
    },
    {
      "metric": "Individual health status",
      "value": "Unknown without claims",
      "confidence": "REQUIRES_CLAIMS",
      "source": "Need claims or biometric data to identify specific individuals",
      "icon": "❓"
    }
  ],

  "industry_intelligence": [
    {
      "category": "Rx Pricing",
      "date": "2025",
      "headline": "Medicare Drug Negotiation: Commercial Ripple Effects Coming",
      "insight": "CMS finalized negotiated prices for first 10 drugs with reductions of 38-79%. While this directly affects Medicare, commercial markets will feel pressure within 2-3 years as these become reference prices.",
      "canon_position": "Proactively discuss with your PBM how Medicare reference pricing will affect your commercial contract renewals. This is leverage—use it.",
      "relevance_to_client": "${isSelfFunded ? 'As a self-funded plan, you have direct negotiating power here.' : 'Work with your carrier to understand how this affects your renewal.'}"
    },
    {
      "category": "Cost Trends",
      "date": "2025",
      "headline": "GLP-1s Are Driving 9-11% Pharmacy Trend",
      "insight": "Medical trend is running 7-8%, but pharmacy trend is 9-11%—driven almost entirely by GLP-1 utilization for obesity and diabetes (Ozempic, Wegovy, Mounjaro). This is the biggest cost driver in a decade.",
      "canon_position": "GLP-1s need clinically appropriate coverage WITH guardrails. Blanket exclusion is shortsighted; unmanaged access is unsustainable. The answer is coverage tied to clinical outcomes and lifestyle program participation.",
      "relevance_to_client": "${isSelfFunded ? 'You have flexibility to design a smart GLP-1 policy. Let us help.' : 'Ask your carrier about their GLP-1 management strategy.'}"
    },
    {
      "category": "PBM Reform",
      "date": "2025",
      "headline": "FTC Report Finds PBM Practices Raise Costs",
      "insight": "The FTC interim report found that the top 3 PBMs engage in practices that inflate drug costs and squeeze independent pharmacies. Multiple states are advancing PBM reform legislation.",
      "canon_position": "${isSelfFunded ? 'As a self-funded group, you can renegotiate PBM terms or switch vendors. Request full rebate transparency and consider pass-through pricing models.' : 'Monitor these developments. When your contract renews, the landscape may offer more options.'}",
      "relevance_to_client": "This affects every employer, but those with flexibility can act now."
    },
    {
      "category": "Compliance",
      "date": "2025",
      "headline": "Mental Health Parity Enforcement Is Tightening",
      "insight": "DOL finalized MHPAEA regulations requiring detailed comparative analysis of mental health vs. medical/surgical benefits. Enforcement actions are increasing, and the litigation risk is real.",
      "canon_position": "Request MHPAEA compliance documentation from your TPA or carrier before mid-2025. If they can't produce it, that's a red flag. This is not optional—it's federal law.",
      "relevance_to_client": "Every employer is exposed here. Compliance documentation should be in your files NOW."
    }
  ],

  "funding_analysis": {
    "type": "${fundingType || 'Unknown'}",
    "flexibility_level": "${isFullyInsured ? 'Limited' : isSelfFunded ? 'Maximum' : isLevelFunded ? 'Moderate' : 'Unknown'}",
    "funds_available": {
      ${isFullyInsured ? `
      "wellness_credits": {
        "amount": "<estimated: employees × $50-100 from carrier>",
        "source": "Carrier-provided wellness incentives",
        "usage": "Typically limited to carrier-approved wellness programs"
      },
      "note": "As a fully insured group, you work within carrier programs. Focus on maximizing engagement with available resources rather than custom vendor solutions."
      ` : `
      "wellness_fund": {
        "amount": "<calculated: employees × $150>",
        "source": "Dedicated wellness budget",
        "usage": "Screenings, challenges, education, incentives"
      },
      "innovation_fund": {
        "amount": "<calculated: employees × $75>",
        "source": "Pilot program budget",
        "usage": "New vendors, technology pilots, emerging solutions"
      },
      "potential_savings": {
        "amount": "<calculated: employees × $225>",
        "source": "Projected ROI from interventions",
        "usage": "Reinvestment in population health"
      },
      "total_available": "<sum of above>"
      `}
    },
    "optimization_insight": "${isFullyInsured ? 'Your path to impact is through engagement optimization—getting more people to use the programs your carrier already provides. We can help identify the gaps.' : 'Your self-funded structure means every dollar you invest in prevention comes back as reduced claims. The ROI math works in your favor.'}"
  },

  "action_plan": [
    {
      "action_number": 1,
      "title": "Cancer Screening Activation Campaign",
      "why_now": "You have <X> employees eligible for screenings that catch cancer when it's 90%+ survivable. Every month of delay is risk.",
      "funding_source": "${isFullyInsured ? 'Carrier Wellness Credits' : 'Wellness Fund'}",
      "total_investment": "<calculated based on tactics>",
      "expected_roi": "Each cancer caught early saves $200-500K in treatment costs—plus a life.",
      "tactics": [
        {
          "letter": "A",
          "name": "At-Home Colorectal Screening Kits",
          "description": "Mail FIT/Cologuard kits directly to all employees aged 45-75. No appointment needed, completed at home in 5 minutes, mailed back in prepaid envelope.",
          "eligible_count": "<employees 45-75>",
          "estimated_cost": "$35-50 per kit",
          "expected_completion": "40-60% (vs. 10-15% for colonoscopy referrals)",
          "vendor_recommendations": [
            {"vendor": "Cologuard (Exact Sciences)", "why": "FDA-approved, highest brand recognition, integrated results reporting", "cost": "$35-50/kit"},
            {"vendor": "LetsGetChecked", "why": "Broader test menu, good UX, employer dashboard", "cost": "$40-60/kit"},
            {"vendor": "Everlywell", "why": "Consumer-friendly, fast results, lower cost", "cost": "$30-45/kit"}
          ],
          "implementation": "Partner with vendor for direct mail campaign. Include personalized letter from CEO emphasizing 'we care about catching this early.'"
        },
        {
          "letter": "B",
          "name": "Mobile Mammography Event",
          "description": "Bring a mammography van on-site. 15-minute appointments during work hours. No travel, no time off, no scheduling hassle.",
          "eligible_count": "<women 40-74>",
          "estimated_cost": "$100-150 per screening or $4,500 minimum event fee",
          "expected_completion": "60-80% of eligible women when on-site (vs. 30% referral completion)",
          "vendor_recommendations": [
            {"vendor": "Alliance Mobile Health", "why": "National coverage, excellent patient experience", "cost": "$4,500 minimum"},
            {"vendor": "Mammography Consultants", "why": "Regional expertise, flexible scheduling", "cost": "$100/screening"},
            {"vendor": "Local hospital partnership", "why": "May offer community benefit pricing, relationship building", "cost": "Negotiable"}
          ],
          "implementation": "Schedule 2 days to accommodate shift workers. Offer paid time for appointment. Send calendar holds 3 weeks in advance."
        },
        {
          "letter": "C",
          "name": "Birthday Month Screening Reminders",
          "description": "Personalized outreach to each employee during their birthday month with age/gender-specific screenings due. Concierge scheduling support included.",
          "eligible_count": "<all employees>",
          "estimated_cost": "$15-25 per employee annually",
          "expected_completion": "25-35% increase in preventive care completion",
          "vendor_recommendations": [
            {"vendor": "Accolade", "why": "High-touch navigation + personalized outreach", "cost": "$8-15 PEPM"},
            {"vendor": "Quantum Health", "why": "Strong preventive care focus, good ROI data", "cost": "$6-12 PEPM"},
            {"vendor": "Internal HR Campaign", "why": "Lower cost if resources available", "cost": "$5-10/employee"}
          ],
          "implementation": "Integrate with HRIS for birthday triggers. Include 'gift' framing—'Your birthday gift from us is peace of mind.'"
        }
      ]
    },
    {
      "action_number": 2,
      "title": "Metabolic Health & Diabetes Prevention",
      "why_now": "With <X>% of your workforce in prediabetic age/risk ranges, you're looking at a wave of diabetes diagnoses in 3-5 years. Each one costs $16,000+ annually. Prevention is 10× cheaper than treatment.",
      "funding_source": "${isFullyInsured ? 'Carrier Programs' : 'Innovation Fund'}",
      "total_investment": "<calculated>",
      "expected_roi": "CDC DPP shows 58% reduction in diabetes progression. At $16K/year per diabetic, the math is overwhelming.",
      "tactics": [
        {
          "letter": "A",
          "name": "CDC-Recognized Diabetes Prevention Program",
          "description": "16-week lifestyle change program with group coaching. The gold standard—proven in randomized controlled trials to reduce diabetes risk by 58%.",
          "eligible_count": "<estimated prediabetic employees: 30-38% of workforce over 35>",
          "estimated_cost": "$500 per participant (often covered by health plan)",
          "expected_completion": "60-70% complete the full program",
          "vendor_recommendations": [
            {"vendor": "Omada Health", "why": "Original digital DPP, strongest outcomes data, great UX", "cost": "$500/participant"},
            {"vendor": "Vida Health", "why": "Broader chronic condition support, good for multi-morbidity", "cost": "$80-150 PEPM"},
            {"vendor": "Lark Health", "why": "Fully automated AI coaching, lowest cost, good scale", "cost": "$200-300/participant"}
          ],
          "implementation": "Identify eligible participants through health assessment or claims. Frame as 'exclusive invitation' not 'you're at risk.'"
        },
        {
          "letter": "B",
          "name": "Metabolic Health Challenge",
          "description": "4-week company-wide nutrition challenge. Team competition format, subsidized healthy meal delivery partnership, weekly prizes, leadership participation.",
          "eligible_count": "<all employees>",
          "estimated_cost": "$40-60 per participant",
          "expected_completion": "50-60% participation with good promotion",
          "vendor_recommendations": [
            {"vendor": "Virgin Pulse", "why": "Comprehensive platform, good challenge mechanics", "cost": "$3-6 PEPM"},
            {"vendor": "Wellable", "why": "Flexible, lower cost, easy setup", "cost": "$2-4 PEPM"},
            {"vendor": "IncentFit", "why": "Challenge-focused, strong team features", "cost": "$3-5 PEPM"}
          ],
          "implementation": "Launch in January or September. Get CEO to participate publicly. Tie to team-based rewards, not just individual."
        },
        {
          "letter": "C",
          "name": "Continuous Glucose Monitor (CGM) Pilot",
          "description": "Provide CGMs to highest-risk prediabetics for 3 months. Real-time feedback on how food choices affect blood sugar creates powerful behavior change.",
          "eligible_count": "<15-25 highest risk individuals>",
          "estimated_cost": "$300-400 per person for 3-month pilot",
          "expected_completion": "Strong adherence due to immediate feedback loop",
          "vendor_recommendations": [
            {"vendor": "Levels", "why": "Best consumer UX, metabolic health focused", "cost": "$199/month"},
            {"vendor": "Nutrisense", "why": "Includes dietitian support, more clinical", "cost": "$225/month"},
            {"vendor": "Signos", "why": "Weight loss focused, AI-driven insights", "cost": "$199/month"}
          ],
          "implementation": "Select participants who are engaged but struggling. Position as 'beta program'—exclusive, innovative. Measure A1c before/after."
        }
      ]
    },
    {
      "action_number": 3,
      "title": "Mental Health Access & Activation",
      "why_now": "42% of your Gen Z employees report anxiety/depression. Your EAP utilization is probably 3-5%. The gap between need and access is where people suffer—and where your STD/LTD costs come from.",
      "funding_source": "${isFullyInsured ? 'Carrier EAP Enhancement' : 'Wellness Fund'}",
      "total_investment": "<calculated>",
      "expected_roi": "Each mental health-related disability claim costs $10-30K. Prevention and early intervention cost $500-1,000.",
      "tactics": [
        {
          "letter": "A",
          "name": "Leadership 'It's OK to Not Be OK' Campaign",
          "description": "Senior leader (ideally CEO or C-suite) shares personal mental health story via video or town hall. This single action does more to destigmatize than any program.",
          "eligible_count": "<all employees>",
          "estimated_cost": "$1,500-3,000 (video production)",
          "expected_completion": "2× increase in EAP utilization within 60 days",
          "vendor_recommendations": [
            {"vendor": "One Mind at Work", "why": "Free resources, leadership toolkit, campaign templates", "cost": "Free"},
            {"vendor": "Made of Millions", "why": "Storytelling expertise, authentic content", "cost": "$2-5K"},
            {"vendor": "Internal comms team", "why": "Authentic, immediate, no vendor needed", "cost": "Time only"}
          ],
          "implementation": "Leader must be genuine—scripted feels fake. Follow with one-click EAP access link. Repeat quarterly with different leaders."
        },
        {
          "letter": "B",
          "name": "Digital Mental Health Platform (Text-Based Therapy)",
          "description": "Deploy a digital mental health platform that leads with text-based therapy. This matches how Gen Z actually communicates and removes the 'call a stranger' barrier.",
          "eligible_count": "<all employees, but targets Gen Z and Millennials>",
          "estimated_cost": "$4-12 PEPM depending on vendor",
          "expected_completion": "3-5× higher engagement than traditional EAP among under-35s",
          "vendor_recommendations": [
            {"vendor": "Lyra Health", "why": "Highest clinical quality, evidence-based matching, fast access", "cost": "$7-12 PEPM"},
            {"vendor": "Spring Health", "why": "Precision matching, strong ROI data, good employer dashboard", "cost": "$6-10 PEPM"},
            {"vendor": "Talkspace", "why": "Text-first, strong brand recognition, lower cost", "cost": "$4-8 PEPM"},
            {"vendor": "Headspace (Ginger)", "why": "Prevention + treatment, meditation + coaching + therapy", "cost": "$3-6 PEPM"}
          ],
          "implementation": "Don't replace EAP—layer this on top. Promote through digital channels, not posters. Measure utilization by age band."
        },
        {
          "letter": "C",
          "name": "Manager Mental Health First Aid Training",
          "description": "2-hour workshop for all people managers on recognizing signs, having supportive conversations, and connecting employees to resources. Includes specific module on caregiver burnout for Gen X.",
          "eligible_count": "<all managers/supervisors>",
          "estimated_cost": "$5,000-10,000 for company-wide training",
          "expected_completion": "100% manager completion if mandated",
          "vendor_recommendations": [
            {"vendor": "Mental Health First Aid (MHFA)", "why": "Gold standard, certified curriculum, scalable", "cost": "$150-200/person"},
            {"vendor": "meQuilibrium", "why": "Digital + live options, resilience focus", "cost": "$8-12 PEPM"},
            {"vendor": "SonderMind", "why": "Training + therapy access combo", "cost": "$6-10 PEPM"}
          ],
          "implementation": "Make it mandatory for anyone who supervises others. Include in manager onboarding. Refresh annually."
        }
      ]
    }
  ],

  "executive_concierge": {
    "headline": "Your Personalized Vendor Activation Plan",
    "intro": "Based on your specific workforce demographics, funding structure, and identified priorities, here are the vendors and partners best positioned to help you act on these insights:",
    "priority_recommendations": [
      {
        "category": "Care Navigation & Advocacy",
        "why_you_need_it": "With <X> covered lives and multi-generational complexity, employees need help finding the right care at the right time. Navigation reduces waste and improves outcomes.",
        "top_picks": [
          {
            "vendor": "Accolade",
            "positioning": "Premium",
            "why_them": "Highest-touch model. Best for complex populations who need hand-holding. Excellent for employers who want 'white glove' perception.",
            "cost_range": "$8-15 PEPM",
            "best_for": "Companies who value employee experience and have budget"
          },
          {
            "vendor": "Quantum Health",
            "positioning": "Value Leader",
            "why_them": "Strong claims impact focus. They coordinate care AND measure results. Good for CFOs who want to see ROI.",
            "cost_range": "$6-12 PEPM",
            "best_for": "Self-funded employers focused on cost reduction"
          },
          {
            "vendor": "Rightway",
            "positioning": "Modern/Tech-Forward",
            "why_them": "App-first experience. Strong PBM navigation + care guidance. Appeals to younger workforces.",
            "cost_range": "$5-10 PEPM",
            "best_for": "Tech-savvy workforces, employers wanting digital-first"
          }
        ]
      },
      {
        "category": "Mental Health",
        "why_you_need_it": "Your Gen Z population (${gen.gen_z?.percentage || 'X'}%) has 42% reporting anxiety/depression. Your EAP isn't reaching them. Modern solutions meet them where they are.",
        "top_picks": [
          {
            "vendor": "Lyra Health",
            "positioning": "Clinical Excellence",
            "why_them": "Highest clinical quality, evidence-based therapist matching, fast access (<1 week to appointment). Premium but worth it.",
            "cost_range": "$7-12 PEPM",
            "best_for": "Employers who want best-in-class clinical outcomes"
          },
          {
            "vendor": "Spring Health",
            "positioning": "ROI Focused",
            "why_them": "Precision mental health—AI matching to right level of care. Strong employer dashboard and ROI reporting.",
            "cost_range": "$6-10 PEPM",
            "best_for": "Data-driven employers who want to measure impact"
          },
          {
            "vendor": "Headspace",
            "positioning": "Prevention + Treatment",
            "why_them": "Meditation + coaching + therapy in one platform. Good for building mental health culture, not just treating illness.",
            "cost_range": "$3-6 PEPM",
            "best_for": "Employers wanting broad engagement, not just clinical"
          }
        ]
      },
      {
        "category": "Diabetes Prevention & Metabolic Health",
        "why_you_need_it": "An estimated 30-40% of your workforce over 35 is prediabetic. Each conversion to Type 2 costs $16K+/year forever. Prevention programs cost $500 once.",
        "top_picks": [
          {
            "vendor": "Omada Health",
            "positioning": "The Original",
            "why_them": "First digital DPP, most outcomes data, proven at scale. Strong employer brand recognition.",
            "cost_range": "$500/participant",
            "best_for": "Employers wanting proven, branded solution"
          },
          {
            "vendor": "Vida Health",
            "positioning": "Multi-Condition",
            "why_them": "Goes beyond diabetes to cover hypertension, weight, anxiety. Good for populations with multiple chronic conditions.",
            "cost_range": "$80-150 PEPM",
            "best_for": "Employers with complex, multi-morbid populations"
          },
          {
            "vendor": "Virta Health",
            "positioning": "Diabetes Reversal",
            "why_them": "For people who already HAVE Type 2 diabetes. Ketogenic approach with strong reversal data. Not prevention—treatment.",
            "cost_range": "$400/month",
            "best_for": "Employers with high diabetes prevalence wanting reversal"
          }
        ]
      },
      {
        "category": "Cancer Screening & Early Detection",
        "why_you_need_it": "You have ~<X> cancer screening opportunities across your workforce. Every screening covered at 100%. Closing the gap saves lives and money.",
        "top_picks": [
          {
            "vendor": "Color Health",
            "positioning": "Comprehensive Platform",
            "why_them": "Screening + genetic testing + care navigation in one. Strong data integration. Good for employers wanting a full solution.",
            "cost_range": "$5-10 PEPM",
            "best_for": "Employers wanting comprehensive screening program"
          },
          {
            "vendor": "Grail (Galleri Test)",
            "positioning": "Cutting Edge",
            "why_them": "Multi-cancer early detection from single blood draw. Detects 50+ cancers, many with no other screening. Revolutionary but expensive.",
            "cost_range": "$949/test",
            "best_for": "Innovative employers, high-risk populations, executive physicals"
          },
          {
            "vendor": "Cologuard/Exact Sciences",
            "positioning": "At-Home Leader",
            "why_them": "Highest completion rates for colorectal screening. Mail-based, no prep, highly effective.",
            "cost_range": "$35-50/kit",
            "best_for": "Any employer wanting to increase colorectal screening"
          }
        ]
      }
    ],
    "next_steps": [
      "Schedule 30-minute vendor discovery calls for your top 2-3 priorities this week",
      "Request case studies from vendors specific to your industry and employee count",
      "Ask vendors for 'proof of concept' or pilot pricing—most will offer reduced rates to prove value",
      "Establish your baseline metrics NOW so you can measure impact (screening rates, EAP utilization, A1c levels if available)",
      "Plan for Q1 implementation on at least one initiative—momentum matters"
    ],
    "canon_offer": "Canon Echo can facilitate vendor introductions, RFP development, and implementation support. We have relationships with all vendors listed and can accelerate your timeline."
  },

  "closing": {
    "headline": "The Patterns Are Clear. The Path Is Ready.",
    "message": "Your census data has revealed specific, actionable opportunities to improve the health of your workforce and reduce your cost trajectory. The question is not whether to act—it's which actions to prioritize first.",
    "urgency": "Every month of delay is another month where preventable conditions go undetected, manageable risks become expensive diagnoses, and your people don't get the care they need.",
    "human_reminder": "Behind every data point in this report is a person—someone's parent, someone's partner, someone's child. The patterns we've identified aren't abstract. They represent real opportunities to help real people, before it's too late.",
    "tagline": "Putting the Human back in Human Capital.",
    "cta_primary": "Let's Build Your Action Plan",
    "cta_secondary": "Request Claims Data Analysis (For Deeper Precision)"
  }
}

CRITICAL INSTRUCTIONS:
1. Calculate ACTUAL numbers from the census data—do not make up employee counts
2. Apply the funding type rules strictly—fully insured groups have different options
3. Write with authority, urgency, and human connection
4. Every insight should pass the "would a CEO stop to read this?" test
5. Vendor recommendations should be specific and actionable
6. Return ONLY the JSON object—no markdown, no explanation, no preamble`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: analysisPrompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    
    let findings;
    try {
      let cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      findings = JSON.parse(cleaned);
    } catch (e) {
      // Try to extract JSON from response
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
      is_self_funded: isSelfFunded
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
