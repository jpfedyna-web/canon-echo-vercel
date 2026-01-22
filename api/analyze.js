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

    // Detect if claims/utilization data is present
    const hasClaimsData = censusData.toLowerCase().includes('claim') || 
                          censusData.toLowerCase().includes('diagnosis') ||
                          censusData.toLowerCase().includes('icd') ||
                          censusData.toLowerCase().includes('cpt');
    const hasRxData = censusData.toLowerCase().includes('prescription') || 
                      censusData.toLowerCase().includes('ndc') ||
                      censusData.toLowerCase().includes('pharmacy') ||
                      censusData.toLowerCase().includes('drug');
    const hasUtilizationData = censusData.toLowerCase().includes('utilization') || 
                               censusData.toLowerCase().includes('visit') ||
                               censusData.toLowerCase().includes('admission');

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
- Do NOT suggest custom vendor carve-outs or self-funded strategies` : ''}
${isSelfFunded ? `
This is a SELF-FUNDED (ASO) group:
- MAXIMUM flexibility—employer controls plan design
- CAN have Innovation Fund for pilots
- CAN have Claims Surplus from favorable experience
- CAN do direct vendor contracts and custom programs
- CAN implement reference-based pricing, direct contracting, PBM carve-outs
- Emphasize flexibility as strategic advantage` : ''}
${isLevelFunded ? `
This is a LEVEL-FUNDED group:
- MODERATE flexibility—hybrid model
- Some customization within carrier guardrails
- May have claims data access
- Focus on: strategic use of flexibility, potential path to self-funded` : ''}

ENHANCED DATA DETECTION:
${hasClaimsData ? '⚠️ CLAIMS DATA DETECTED - Provide enhanced analysis with actual diagnosis patterns, high-cost claimants, and specific intervention targets.' : 'No claims data detected - Use demographic modeling.'}
${hasRxData ? '⚠️ PHARMACY DATA DETECTED - Analyze prescription patterns, GLP-1 utilization, specialty drug costs, and therapeutic opportunities.' : 'No pharmacy data detected - Use population prevalence.'}
${hasUtilizationData ? '⚠️ UTILIZATION DATA DETECTED - Analyze ER usage patterns, PCP engagement, specialist referrals, and care navigation opportunities.' : 'No utilization data detected - Use benchmark utilization rates.'}

INDUSTRY MULTIPLIERS:
${industry?.toLowerCase().includes('manufactur') ? 'Manufacturing: Apply 1.2x to Clinical Risk (safety/workers comp exposure), 1.1x to Shift Work impact' : ''}
${industry?.toLowerCase().includes('health') ? 'Healthcare: Apply 1.1x to Clinical, 1.2x to Turnover (burnout, exposure), 1.3x to Mental Health' : ''}
${industry?.toLowerCase().includes('tech') || industry?.toLowerCase().includes('professional') ? 'Professional Services/Tech: Apply 1.2x to Productivity, 1.5x to Turnover (knowledge loss), 1.2x to Mental Health' : ''}
${industry?.toLowerCase().includes('construct') ? 'Construction: Apply 1.3x to Clinical Risk (physical safety), 1.2x to Shift Work' : ''}
${industry?.toLowerCase().includes('retail') || industry?.toLowerCase().includes('hospitality') ? 'Retail/Hospitality: Apply 1.3x to Turnover, 1.2x to Mental Health, high part-time population' : ''}
${industry?.toLowerCase().includes('education') ? 'Education: Apply 1.1x to Mental Health, strong preventive care culture, union considerations' : ''}

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

| Condition | Target Population | Prevalence | Efficiency Drop | Event Cost | Event Risk | Quit Risk |
|-----------|-------------------|------------|-----------------|------------|------------|-----------|
| Sleep Apnea | Men 30-70 | 24% x 80% undiagnosed | 15% | $32,000 CV | 5%/year | — |
| Perimenopause | Women 40-55 | 75% symptomatic | 11% | — | — | 25% |
| Menopause | Women 50-60 | 100% | 8% | — | — | 15% |
| Fertility Challenges | Women 28-42 | 12.5% | 8% | — | — | 30% |
| Pregnancy/Maternity | Pregnant employees | ~5% annually | 5% | $15,000 complications | 3% | 25% |
| Postpartum Depression | New mothers | 15% of births | 12% | $12,000 disability | 5% | 20% |
| Shift Work Disorder | Shift workers | 100% | 12% | $18,000 diabetes | 8%/year | — |
| Prediabetes | Adults 35+ | 38% | 8% | $16,000 diabetes | 10%/year | — |
| Gen Z Mental Health | Ages 18-27 | 42% anxiety/depression | 10% | $12,000 disability | 3%/year | 20% |
| Vaping (Gen Z) | Ages 18-27 | 23% | 5% | Unknown long-term | Unknown | — |
| Musculoskeletal | All employees | 25% | 10% | $25,000 surgery | 5%/year | — |
| Caregiver Burnout | Sandwich generation 45-60 | 20% | 12% | — | — | 18% |

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
    "headline": "You're leaking $[X,XXX] every single day. That's $[XX,XXX] per week—the cost of [vivid comparison like 'a new hire's salary' or 'a marketing campaign'] gone every [X] days.",
    "broker_comparison": "This is what your current broker isn't showing you."
  },

  "enhanced_data_insights": {
    "claims_data_available": ${hasClaimsData},
    "pharmacy_data_available": ${hasRxData},
    "utilization_data_available": ${hasUtilizationData},
    "top_5_data_driven_insights": [
      {
        "insight_number": 1,
        "category": "<e.g., High-Cost Claimants | Rx Patterns | Utilization Gaps>",
        "finding": "<Specific insight from the enhanced data>",
        "demographic_connection": "<How this connects to census demographics>",
        "action": "<Specific intervention recommended>",
        "estimated_impact": "<$XXX,XXX potential savings>"
      }
    ],
    "note": "${hasClaimsData || hasRxData || hasUtilizationData ? 'Enhanced analysis based on actual claims/utilization data provided.' : 'Analysis based on demographic modeling. Provide claims, pharmacy, or utilization data for deeper precision.'}"
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
      "women_21_45": "<count for pregnancy support>",
      "gen_z_18_27": "<count>",
      "shift_workers": "<count or estimate>",
      "sandwich_generation_45_60": "<count for caregiver support>"
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

      "sources": ["<List key sources: AASM 2022, CDC 2023, Milliman 2024, etc.>"],

      "timeline": {
        "implement_by": "<e.g., Q2 biometrics>",
        "expect_impact_by": "<e.g., Year 2>"
      }
    }
  ],

  "womens_health": {
    "headline": "Women's Health: The Full Lifecycle",
    "why_it_matters": "Women make 80% of healthcare decisions for their families and represent a significant portion of your workforce. Supporting women's health across all life stages—from fertility through menopause—is both a retention strategy and a cost-containment strategy.",
    "total_women_employees": "<count>",
    "lifecycle_findings": [
      {
        "stage": "Fertility & Family Planning",
        "target_population": "Women 28-42",
        "employee_count": "<count>",
        "prevalence": "12.5% experiencing fertility challenges",
        "quit_risk": "30% if no fertility benefit",
        "annual_exposure": "<calculated>",
        "daily_burn": "<calculated>",
        "key_insight": "Fertility benefits have become a top-5 factor in job selection for this demographic. Companies without coverage lose talent to those that offer it.",
        "recommended_vendors": [
          {"vendor": "Progyny", "positioning": "Premium - outcomes-based model, highest success rates", "cost": "$3-5 PEPM"},
          {"vendor": "Carrot", "positioning": "Comprehensive - fertility + adoption + surrogacy", "cost": "$3-4 PEPM"},
          {"vendor": "Maven", "positioning": "Full lifecycle - fertility through pediatrics", "cost": "$4-8 PEPM"}
        ]
      },
      {
        "stage": "Pregnancy & Maternity",
        "target_population": "Women 21-45 (childbearing age)",
        "employee_count": "<count>",
        "prevalence": "~5% pregnant annually",
        "quit_risk": "25% within first year postpartum",
        "complication_risk": "15% of pregnancies have complications ($15,000+ avg cost)",
        "annual_exposure": "<calculated>",
        "daily_burn": "<calculated>",
        "key_insight": "Maternity complications are preventable with proper support. Virtual maternity programs reduce preterm births by 20% and NICU admissions by 25%.",
        "recommended_vendors": [
          {"vendor": "Maven", "positioning": "Most comprehensive maternity support", "cost": "$4-8 PEPM"},
          {"vendor": "Ovia Health", "positioning": "Strong engagement, app-based", "cost": "$2-4 PEPM"},
          {"vendor": "Mahmee", "positioning": "High-risk pregnancy focus", "cost": "$3-5 PEPM"}
        ]
      },
      {
        "stage": "Postpartum & Return to Work",
        "target_population": "New mothers (first year)",
        "employee_count": "<estimated from pregnancy rate>",
        "prevalence": "15% experience postpartum depression",
        "quit_risk": "20% with untreated PPD",
        "disability_risk": "5% require extended leave",
        "annual_exposure": "<calculated>",
        "daily_burn": "<calculated>",
        "key_insight": "The transition back to work is where companies lose new mothers. Lactation support and flexible return-to-work programs are retention multipliers.",
        "recommended_vendors": [
          {"vendor": "Milk Stork", "positioning": "Breast milk shipping for traveling mothers", "cost": "$50-100/shipment"},
          {"vendor": "Maven", "positioning": "Postpartum mental health + lactation", "cost": "$4-8 PEPM"},
          {"vendor": "Lyra Health", "positioning": "Postpartum depression specialty", "cost": "$7-12 PEPM"}
        ]
      },
      {
        "stage": "Perimenopause",
        "target_population": "Women 40-55",
        "employee_count": "<count>",
        "prevalence": "75% symptomatic",
        "quit_risk": "25% consider leaving workforce",
        "productivity_loss": "11% efficiency drop",
        "annual_exposure": "<calculated>",
        "daily_burn": "<calculated>",
        "key_insight": "Perimenopause is the most under-addressed condition in employee health. 75% of women experience symptoms, but most suffer in silence because they don't recognize them or know help exists.",
        "recommended_vendors": [
          {"vendor": "Midi Health", "positioning": "Menopause specialty telehealth, HRT expertise", "cost": "$4-6 PEPM"},
          {"vendor": "Gennev", "positioning": "Menopause health platform + coaching", "cost": "$3-5 PEPM"},
          {"vendor": "Evernow", "positioning": "HRT delivery + virtual care", "cost": "$4-6 PEPM"}
        ]
      },
      {
        "stage": "Menopause",
        "target_population": "Women 50-60",
        "employee_count": "<count>",
        "prevalence": "100% will experience",
        "quit_risk": "15% leave workforce early",
        "productivity_loss": "8% efficiency drop",
        "annual_exposure": "<calculated>",
        "daily_burn": "<calculated>",
        "key_insight": "Menopause costs employers an estimated $1.8 billion annually in lost productivity. Yet it's rarely discussed in benefits strategy. This is your opportunity to differentiate.",
        "recommended_vendors": [
          {"vendor": "Midi Health", "positioning": "Clinical menopause care", "cost": "$4-6 PEPM"},
          {"vendor": "Gennev", "positioning": "Education + support + care", "cost": "$3-5 PEPM"}
        ]
      }
    ],
    "total_womens_health_exposure": {
      "annual": "<sum of all stages>",
      "daily": "<annual / 260>",
      "addressable": "<total x 6.25%>"
    },
    "strategic_recommendation": "Implement a comprehensive women's health strategy that covers the full lifecycle. This positions you as an employer of choice for women and addresses hidden costs that most competitors ignore."
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
        },
        {
          "stat": "23%",
          "insight": "Currently vape. Long-term health implications unknown but respiratory and cardiovascular risks are emerging."
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
        },
        {
          "stat": "20%",
          "insight": "Are caregivers for aging parents while also supporting children. The 'sandwich generation' is exhausted and invisible."
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
      },
      {
        "type": "Prostate Cancer",
        "eligible_count": "<men aged 50-70, or 40+ if Black or family history>",
        "eligible_criteria": "Men 50-70, earlier if high risk",
        "early_detection_survival": "98%",
        "late_detection_survival": "31%",
        "screening_gap_estimate": "~40% of eligible men are not current",
        "human_impact": "Prostate cancer is highly treatable when caught early. Late detection means aggressive treatment and significant quality of life impact.",
        "recommended_action": "Include PSA discussion in annual wellness visits, normalize the conversation"
      }
    ],
    "call_to_action": "Every one of these screenings is covered at 100% with zero cost-sharing under ACA preventive care rules. The only barriers are awareness and access. We can solve both."
  },

  "wellness_fund_deployment": {
    "headline": "Your Wellness Fund: Strategic Deployment Plan",
    "key_message": "This doesn't cost you anything new. This is money you're already budgeting—we're deploying it strategically with targets, goals, and outcomes instead of letting it sit unused or go to generic programs.",
    "total_wellness_budget": {
      "amount": "${isSelfFunded ? '<employees x $150 wellness + $75 innovation = $225 total>' : '<carrier wellness credits, typically $50-100 per employee>'}",
      "source": "${isSelfFunded ? 'Self-funded wellness allocation + innovation fund' : 'Carrier-provided wellness credits'}",
      "current_utilization": "Industry average: 15-25% of wellness funds are actually used effectively",
      "opportunity": "Redeploy 100% of available funds toward targeted, measurable interventions"
    },
    "deployment_plan": [
      {
        "allocation_name": "Sleep Apnea Detection & Treatment",
        "finding_addressed": "Finding #1: Undiagnosed Sleep Apnea",
        "budget_allocation": "<$XX,XXX>",
        "percentage_of_fund": "<X%>",
        "specific_use": "At-home sleep studies + CPAP program subsidies",
        "employees_reached": "<count>",
        "expected_outcome": "Identify and treat XX employees, prevent XX cardiovascular events",
        "roi_projection": "<X:1 return within 18 months>",
        "culture_impact": "Demonstrates commitment to employee health beyond basic benefits"
      },
      {
        "allocation_name": "Women's Health Lifecycle Support",
        "finding_addressed": "Women's Health Finding",
        "budget_allocation": "<$XX,XXX>",
        "percentage_of_fund": "<X%>",
        "specific_use": "Fertility benefit enhancement + menopause support program",
        "employees_reached": "<count women employees>",
        "expected_outcome": "Reduce turnover among women 28-55 by XX%, improve engagement scores",
        "roi_projection": "<X:1 return through retention>",
        "culture_impact": "Positions company as employer of choice for women"
      },
      {
        "allocation_name": "Cancer Screening Activation",
        "finding_addressed": "Cancer Screening Gaps",
        "budget_allocation": "<$XX,XXX>",
        "percentage_of_fund": "<X%>",
        "specific_use": "At-home colorectal kits + mobile mammography event",
        "employees_reached": "<count eligible>",
        "expected_outcome": "Increase screening completion from ~35% to ~60%, detect cancers early",
        "roi_projection": "Each early detection saves $200-500K vs late-stage treatment",
        "culture_impact": "Saves lives—the ultimate demonstration of 'we care about our people'"
      },
      {
        "allocation_name": "Mental Health Access Modernization",
        "finding_addressed": "Gen Z Mental Health Gap",
        "budget_allocation": "<$XX,XXX>",
        "percentage_of_fund": "<X%>",
        "specific_use": "Digital mental health platform (text-based therapy access)",
        "employees_reached": "<all employees, targeting Gen Z/Millennials>",
        "expected_outcome": "Increase mental health engagement from 3-5% EAP to 15-20%",
        "roi_projection": "<X:1 through reduced disability claims>",
        "culture_impact": "Signals psychological safety and modern approach to wellbeing"
      },
      {
        "allocation_name": "Metabolic Health Prevention",
        "finding_addressed": "Prediabetes Risk",
        "budget_allocation": "<$XX,XXX>",
        "percentage_of_fund": "<X%>",
        "specific_use": "CDC Diabetes Prevention Program enrollment",
        "employees_reached": "<estimated prediabetic employees>",
        "expected_outcome": "Prevent XX diabetes conversions, each saving $16K/year ongoing",
        "roi_projection": "58% reduction in diabetes progression (CDC data)",
        "culture_impact": "Proactive health management vs reactive sick care"
      }
    ],
    "total_deployed": "<sum of allocations>",
    "net_new_cost": "$0 — This is strategic redeployment of existing wellness budget",
    "governance": {
      "tracking_cadence": "Quarterly outcomes review",
      "success_metrics": "Participation rates, screening completion, claims impact (Year 2+)",
      "playbook_integration": "All programs documented in Canon Echo Playbook with goals and accountability"
    },
    "executive_talking_point": "We're not asking for new budget. We're showing you how to deploy the budget you already have toward interventions that will actually move the needle on cost and culture."
  },

  "cost_mitigation_strategies": {
    "headline": "Strategic Cost Containment: Beyond the Basics",
    "intro": "These strategies can drive significant savings while maintaining benefit quality. Applicability depends on your funding structure and employee population.",
    "strategies": [
      {
        "strategy_name": "Tobacco Surcharge",
        "category": "Premium Contribution",
        "description": "Charge tobacco users up to 50% more in premiums. ACA-compliant when paired with cessation program.",
        "typical_savings": "$4,000/year per tobacco user + behavior change incentive",
        "implementation_complexity": "LOW",
        "employee_impact": "Moderate - requires cessation program as 'reasonable alternative'",
        "compliance_notes": "Banned in CA, MA, NJ, NY, RI, VT, DC. Must offer cessation program. Self-attestation typical.",
        "applicable_to_client": "${isFullyInsured ? 'Yes - work with carrier on implementation' : 'Yes - full flexibility to implement'}",
        "canon_recommendation": "Implement with robust cessation support. Position as health investment, not punishment."
      },
      {
        "strategy_name": "Spousal Surcharge",
        "category": "Premium Contribution",
        "description": "Charge $50-150/month extra if spouse has coverage available through their own employer but enrolls on your plan.",
        "typical_savings": "15-30% reduction in spousal enrollment, 2% of total health costs",
        "implementation_complexity": "MEDIUM",
        "employee_impact": "Moderate - some employees dislike, but framed as fairness",
        "compliance_notes": "Legal under ERISA/ACA. Cannot apply to Medicare/TRICARE spouses. Requires attestation process.",
        "applicable_to_client": "${isFullyInsured ? 'Check with carrier - may be available' : 'Yes - full flexibility to implement'}",
        "canon_recommendation": "Frame as equity measure—employees without working spouses shouldn't subsidize those who do."
      },
      {
        "strategy_name": "Working Spouse Carve-Out",
        "category": "Premium Contribution",
        "description": "Exclude spouses from eligibility entirely if they have coverage through their own employer.",
        "typical_savings": "Can save 2-5% of total health costs",
        "implementation_complexity": "MEDIUM",
        "employee_impact": "High - more aggressive, can affect morale",
        "compliance_notes": "Legal federally but some states have marital discrimination laws. Fully insured plans subject to state law.",
        "applicable_to_client": "${isFullyInsured ? 'Check state law - may have restrictions' : 'Yes for self-funded - ERISA preempts state law'}",
        "canon_recommendation": "Use only if cost pressure is severe. Surcharge is usually better first step."
      },
      {
        "strategy_name": "The Difference Card (MERP/HRA)",
        "category": "Plan Design",
        "description": "Medical Expense Reimbursement Plan that caps claims exposure while providing employee cost-sharing relief. Works alongside carrier plan.",
        "typical_savings": "Average 18% savings on health insurance costs",
        "implementation_complexity": "MEDIUM",
        "employee_impact": "Positive - reduces employee out-of-pocket costs",
        "compliance_notes": "Section 105 plan. Must integrate with underlying health plan.",
        "applicable_to_client": "${isFullyInsured ? 'Yes - can layer on top of fully insured plan' : 'Yes - common with self-funded plans'}",
        "canon_recommendation": "Strong option for employers wanting guaranteed savings with capped risk exposure."
      },
      {
        "strategy_name": "Reference-Based Pricing",
        "category": "Plan Design",
        "description": "Pay providers a percentage of Medicare rates (typically 150-200%) instead of carrier-negotiated rates.",
        "typical_savings": "Can save $4-6M annually for large employers (500+ employees)",
        "implementation_complexity": "HIGH",
        "employee_impact": "Requires education and patient advocacy support for balance billing",
        "compliance_notes": "Need strong TPA partner and balance billing protection strategy.",
        "applicable_to_client": "${isFullyInsured ? 'No - requires self-funded structure' : 'Yes - major opportunity for self-funded plans'}",
        "canon_recommendation": "Best for sophisticated self-funded employers ready for change management."
      },
      {
        "strategy_name": "Direct Provider Contracting",
        "category": "Plan Design",
        "description": "Negotiate directly with health systems for bundled rates on high-cost procedures (joints, spine, cardiac, bariatric).",
        "typical_savings": "30-50% per episode vs network rates. 50% more likely to have below-average costs.",
        "implementation_complexity": "HIGH",
        "employee_impact": "May require travel to centers of excellence",
        "compliance_notes": "Need sufficient volume to negotiate. Works best for elective procedures.",
        "applicable_to_client": "${isFullyInsured ? 'Limited - carrier controls network' : 'Yes - significant opportunity'}",
        "canon_recommendation": "Start with joint replacements and spine surgery—highest volume, clearest quality differentiation."
      },
      {
        "strategy_name": "PBM Carve-Out / Transparent PBM",
        "category": "Pharmacy",
        "description": "Separate pharmacy benefits from medical carrier. Contract directly with PBM requiring pass-through pricing and full rebate disclosure.",
        "typical_savings": "10-15% on pharmacy spend through transparency and competitive bidding",
        "implementation_complexity": "MEDIUM",
        "employee_impact": "Minimal if done well—may improve Rx access",
        "compliance_notes": "73% of employers moving this direction per WTW. FTC supporting transparency.",
        "applicable_to_client": "${isFullyInsured ? 'Limited - pharmacy usually bundled' : 'Yes - highly recommended for self-funded'}",
        "canon_recommendation": "Require full rebate pass-through, acquisition cost transparency, and no spread pricing."
      },
      {
        "strategy_name": "GLP-1 Management Program",
        "category": "Pharmacy",
        "description": "Cover GLP-1 drugs (Ozempic, Wegovy, Mounjaro) with clinical criteria and lifestyle program participation requirements.",
        "typical_savings": "Control 10.5% of claims that are now GLP-1 related",
        "implementation_complexity": "MEDIUM",
        "employee_impact": "Access preserved but with accountability",
        "compliance_notes": "Must have reasonable clinical criteria. Cannot blanket exclude without alternative.",
        "applicable_to_client": "${isFullyInsured ? 'Work with carrier on formulary management' : 'Yes - design custom GLP-1 policy'}",
        "canon_recommendation": "Cover with guardrails: BMI criteria + metabolic coaching + 6-month outcomes review."
      },
      {
        "strategy_name": "Telehealth Expansion",
        "category": "Utilization Management",
        "description": "Promote virtual-first care for appropriate conditions. Reduce ER visits and unnecessary specialist referrals.",
        "typical_savings": "$15.65 PMPM through ER reduction (Quantum Health data)",
        "implementation_complexity": "LOW",
        "employee_impact": "Positive - convenience and lower costs",
        "compliance_notes": "Ensure mental health parity compliance in telehealth offerings.",
        "applicable_to_client": "Yes - all funding types",
        "canon_recommendation": "Make telehealth the first option, not the alternative. $0 copay for virtual visits."
      },
      {
        "strategy_name": "Care Navigation / Advocacy",
        "category": "Utilization Management",
        "description": "Deploy care navigation service to guide employees to right care at right cost. Reduces waste and improves outcomes.",
        "typical_savings": "5-15% total cost reduction through steerage and waste elimination",
        "implementation_complexity": "MEDIUM",
        "employee_impact": "Positive - high-touch support",
        "compliance_notes": "Ensure vendor is carrier-agnostic if fully insured.",
        "applicable_to_client": "Yes - all funding types",
        "canon_recommendation": "Essential for populations with low health literacy or complex conditions. Accolade, Quantum Health, Rightway."
      },
      {
        "strategy_name": "Dependent Audit",
        "category": "Eligibility Management",
        "description": "Verify that all covered dependents are actually eligible (legal spouse, children under age limit, etc.).",
        "typical_savings": "Typically removes 3-8% of dependents, saving $3,000-7,000 per ineligible dependent",
        "implementation_complexity": "LOW",
        "employee_impact": "Minimal if communicated well—removes people who shouldn't be on plan",
        "compliance_notes": "Must provide cure period for documentation. Cannot be punitive.",
        "applicable_to_client": "Yes - all funding types",
        "canon_recommendation": "Do this every 2-3 years. Frame as compliance and fairness, not cost-cutting."
      },
      {
        "strategy_name": "Tiered / High-Performance Networks",
        "category": "Network Design",
        "description": "Create provider tiers based on cost and quality. Lower copays for high-value providers.",
        "typical_savings": "10-20% cost reduction through steerage to efficient providers",
        "implementation_complexity": "HIGH",
        "employee_impact": "Requires employee education and behavior change",
        "compliance_notes": "Must ensure adequate access in all tiers.",
        "applicable_to_client": "${isFullyInsured ? 'Work with carrier on network options' : 'Yes - can design custom network strategy'}",
        "canon_recommendation": "Combine with navigation service to guide employees to high-value tier."
      }
    ],
    "funding_specific_recommendations": "${isFullyInsured ? 'As a fully insured group, focus on: tobacco surcharge, spousal surcharge, telehealth expansion, care navigation, and dependent audit. Work with your carrier on any plan design changes.' : isSelfFunded ? 'As a self-funded group, you have maximum flexibility. Consider: reference-based pricing, direct contracting, PBM carve-out, and custom plan designs in addition to standard strategies.' : 'As a level-funded group, you have moderate flexibility. Focus on strategies that work within your carrier relationship while building toward potential self-funded transition.'}",
    "implementation_priority": [
      {
        "priority": 1,
        "strategy": "Dependent Audit",
        "why": "Low effort, immediate savings, no employee pushback"
      },
      {
        "priority": 2,
        "strategy": "Telehealth Expansion",
        "why": "Employee-friendly, reduces costs, easy to implement"
      },
      {
        "priority": 3,
        "strategy": "Tobacco Surcharge",
        "why": "Drives behavior change, funds cessation support"
      },
      {
        "priority": 4,
        "strategy": "Spousal Surcharge",
        "why": "Significant savings, fairness argument strong"
      },
      {
        "priority": 5,
        "strategy": "${isSelfFunded ? 'PBM Carve-Out / Transparency' : 'Care Navigation'}",
        "why": "${isSelfFunded ? 'Major Rx savings opportunity with transparency' : 'Reduces waste and improves employee experience'}"
      }
    ]
  },

  "industry_intelligence": {
    "headline": "Market Intelligence: What's Moving in Benefits",
    "last_updated": "January 2025",
    "note": "Industry news and trends affecting your benefits strategy. Updated periodically.",
    "healthcare_trends": [
      {
        "category": "Cost Trends",
        "headline": "2025 Healthcare Costs Rising 7-9%",
        "summary": "Employer healthcare costs projected to rise 7.7% in 2025 (WTW), with some estimates as high as 9% (Aon). Primary drivers: GLP-1 drugs, specialty pharmacy, and catastrophic claims.",
        "canon_position": "Cost increases are not inevitable. Employers using direct contracting, transparent PBMs, and care navigation are 50% more likely to have below-average costs.",
        "source": "WTW 2024 Best Practices Survey, Aon Health Survey"
      },
      {
        "category": "GLP-1 Drugs",
        "headline": "GLP-1s Now 10.5% of Total Claims",
        "summary": "Ozempic, Wegovy, and Mounjaro are driving pharmacy trend to 9-11%. 77% of employers say managing GLP-1 cost is a top priority. Coverage with guardrails emerging as best practice.",
        "canon_position": "Blanket exclusion is shortsighted. Cover GLP-1s with clinical criteria (BMI, comorbidities) plus required participation in metabolic health program.",
        "source": "Business Group on Health 2024, Mercer Survey"
      },
      {
        "category": "PBM Reform",
        "headline": "FTC Report Accelerates PBM Transparency Push",
        "summary": "FTC interim report found top 3 PBMs engage in practices that inflate costs. 73% of employers plan to carve out pharmacy or renegotiate PBM contracts.",
        "canon_position": "If you haven't audited your PBM contract in 2+ years, you're leaving money on the table. Require pass-through pricing, full rebate disclosure, and no spread pricing.",
        "source": "FTC Interim Report 2024, WTW Survey"
      },
      {
        "category": "Mental Health Parity",
        "headline": "DOL Finalizes Stricter MHPAEA Enforcement",
        "summary": "New regulations require detailed comparative analysis of mental health vs medical/surgical benefits. Enforcement actions increasing. Compliance documentation now required.",
        "canon_position": "Request MHPAEA compliance documentation from your TPA or carrier NOW. If they can't produce it, that's a red flag.",
        "source": "DOL Final Rule 2024"
      },
      {
        "category": "Women's Health",
        "headline": "Menopause Benefits Growing 14% Year-Over-Year",
        "summary": "Employers rapidly adding menopause support to benefits. Mental health support for women up 44% current coverage, 40% considering. Fertility benefits now table stakes for talent.",
        "canon_position": "Women's health across the lifecycle is a competitive advantage. Companies without fertility, maternity, and menopause support are losing talent.",
        "source": "National Alliance Survey 2024"
      }
    ],
    "carrier_updates": [
      {
        "carrier": "UnitedHealthcare",
        "recent_news": "Facing DOJ antitrust scrutiny following Change Healthcare acquisition. Implementing new prior authorization transparency requirements.",
        "strategic_implication": "Monitor for service disruptions. Consider backup network access."
      },
      {
        "carrier": "Cigna / Evernorth",
        "recent_news": "Expanding value-based care arrangements. Express Scripts under pressure for PBM transparency.",
        "strategic_implication": "Negotiate PBM terms aggressively. Ask about rebate pass-through."
      },
      {
        "carrier": "Aetna / CVS Health",
        "recent_news": "Integrating MinuteClinic and HealthHUB into benefits strategies. Pushing retail health model.",
        "strategic_implication": "Evaluate CVS Health Hub access for your population."
      },
      {
        "carrier": "Anthem / Elevance Health",
        "recent_news": "Rebranded to Elevance Health. Expanding Carelon behavioral health services.",
        "strategic_implication": "Review integrated behavioral health offerings."
      }
    ],
    "vendor_spotlight": [
      {
        "vendor": "Progyny",
        "category": "Fertility",
        "recent_news": "Reported 40% enrollment increases. Outcomes-based model gaining traction. Now covers 5.7 million lives.",
        "canon_take": "Gold standard in fertility benefits. If you're going to add fertility, do it right."
      },
      {
        "vendor": "Rightway",
        "category": "Care Navigation",
        "recent_news": "Expanding PBM navigation capabilities. Strong employer dashboard for cost visibility.",
        "canon_take": "Good option for tech-savvy workforces wanting app-first navigation."
      },
      {
        "vendor": "Centivo",
        "category": "Health Plan Alternative",
        "recent_news": "Primary care-centered model gaining traction with mid-market employers. Claims 15-20% savings vs traditional plans.",
        "canon_take": "Worth evaluating for employers ready to try alternative plan design."
      },
      {
        "vendor": "Hinge Health",
        "category": "MSK",
        "recent_news": "Expanded surgical decision support. Strong ROI data on avoided surgeries.",
        "canon_take": "If MSK is a top claims driver, Hinge should be on your shortlist."
      },
      {
        "vendor": "Lyra Health",
        "category": "Mental Health",
        "recent_news": "Expanded to 17 million covered lives. Maintaining <1 week time to appointment.",
        "canon_take": "Premium mental health option. Worth the cost if your population is struggling."
      }
    ]
  },

  "executive_defense": {
    "objection_responses": [
      {
        "objection": "Is this data accurate?",
        "shield": "We use peer-reviewed actuarial modeling applied to your specific census data. Every assumption is documented and conservative. We show you what's OBSERVED vs INFERRED vs ASSUMED.",
        "counter_punch": "If your current broker isn't using demographic modeling, they're guessing with your EBITDA. We don't guess."
      },
      {
        "objection": "HR is too busy for this.",
        "shield": "Zero-Tax Execution. Implementation takes less than 5 hours of internal labor total. We handle vendor coordination, communication materials, and enrollment.",
        "counter_punch": "What's more work: 5 hours of setup, or replacing a VP who has a preventable heart attack? Or processing turnover from women who leave because you don't have fertility benefits?"
      },
      {
        "objection": "Can we wait until renewal?",
        "shield": "Your daily burn is $<daily_burn>/day. Every day you wait, that money leaks.",
        "counter_punch": "Waiting until renewal is a decision to set $<X> on fire. Why give that money away for free?"
      },
      {
        "objection": "Our broker already does this.",
        "shield": "Great. What's your daily revenue leak? What's your confidence score on each finding? What's your Priority x Confidence matrix? What's your data transparency breakdown?",
        "counter_punch": "If your broker had shown you this data, we wouldn't be having this conversation. They're looking at claims. We're looking at what CAUSES claims—and what you can do about it BEFORE the claim happens."
      },
      {
        "objection": "We don't have budget for new programs.",
        "shield": "You already have the budget—it's your wellness fund that's sitting underutilized. We're not asking for new money. We're showing you how to deploy what you already have toward interventions that actually work.",
        "counter_punch": "The cost of inaction exceeds the cost of action. This is about ROI, not expense."
      },
      {
        "objection": "Our employees won't engage with these programs.",
        "shield": "Engagement is a design problem, not an employee problem. We recommend vendors with proven engagement rates and implementation strategies that meet employees where they are.",
        "counter_punch": "If your current programs have 3% engagement, that's not your employees failing—that's the program failing. We fix that."
      },
      {
        "objection": "How do we know this will work?",
        "shield": "Every recommendation includes a confidence score based on evidence strength, client specificity, and execution control. We tell you what we're confident about and what's directional.",
        "counter_punch": "We don't promise miracles. We promise transparent, data-backed recommendations with clear accountability metrics. That's more than most brokers offer."
      }
    ]
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
      "source": "CDC NHANES 2023 data applied to demographics",
      "icon": "warning"
    },
    {
      "metric": "Mental health prevalence",
      "value": "<estimated range>",
      "confidence": "MODELED",
      "source": "NIMH 2023 data adjusted for age distribution",
      "icon": "warning"
    },
    {
      "metric": "Women's health lifecycle needs",
      "value": "<counts by stage>",
      "confidence": "MODELED",
      "source": "ACOG guidelines + demographic prevalence",
      "icon": "warning"
    },
    {
      "metric": "Individual health status",
      "value": "${hasClaimsData ? 'Available from claims data' : 'Unknown without claims'}",
      "confidence": "${hasClaimsData ? 'ACTUAL' : 'REQUIRES_CLAIMS'}",
      "source": "${hasClaimsData ? 'Claims data provided' : 'Need claims or biometric data'}",
      "icon": "${hasClaimsData ? 'checkmark' : 'question'}"
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
      "why_now": "<One sentence on urgency>",
      "wellness_fund_allocation": "<$X,XXX from wellness budget>"
    },
    {
      "rank": 2,
      "action": "<specific action>",
      "finding_addressed": "<Finding name>",
      "daily_burn_stopped": "<$XXX/day>",
      "execution_load": "<LOW | MEDIUM | HIGH>",
      "decision": "<DO NOW | DO SOON>",
      "why_now": "<One sentence on urgency>",
      "wellness_fund_allocation": "<$X,XXX from wellness budget>"
    },
    {
      "rank": 3,
      "action": "<specific action>",
      "finding_addressed": "<Finding name>",
      "daily_burn_stopped": "<$XXX/day>",
      "execution_load": "<LOW | MEDIUM | HIGH>",
      "decision": "<CONSIDER>",
      "why_now": "<One sentence on urgency>",
      "wellness_fund_allocation": "<$X,XXX from wellness budget>"
    }
  ],

  "funding_analysis": {
    "type": "${fundingType || 'Unknown'}",
    "flexibility_level": "${isFullyInsured ? 'Limited' : isSelfFunded ? 'Maximum' : isLevelFunded ? 'Moderate' : 'Unknown'}",
    "strategic_insight": "${isFullyInsured ? 'Your path to impact is engagement optimization—getting more people to use carrier programs that already exist—plus smart surcharge strategies and voluntary benefit enhancements.' : isSelfFunded ? 'Your self-funded structure means maximum flexibility. Every prevention dollar comes back as reduced claims. Consider reference-based pricing, direct contracting, and PBM carve-outs in addition to wellness strategies.' : 'Your level-funded structure gives you data visibility with some flexibility. Use it strategically while building toward potential self-funded transition.'}",
    "funds_available": ${isSelfFunded ? `{
      "wellness_fund": "<employees x $150>",
      "innovation_fund": "<employees x $75>",
      "total": "<sum>",
      "note": "Deploy strategically per Wellness Fund Deployment Plan"
    }` : `{
      "carrier_wellness_credits": "<estimated from carrier, typically $50-100/employee>",
      "note": "Work within carrier programs to maximize engagement. Supplement with voluntary benefits and surcharge strategies."
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

  "closing": {
    "headline": "The Patterns Are Clear. The Path Is Ready.",
    "daily_leak_reminder": "Every day you wait, $<total_daily> leaks from your P&L.",
    "human_reminder": "Behind every data point is a person—someone's parent, partner, child. The patterns we've identified represent real opportunities to help real people, before it's too late.",
    "investment_truth": "The wellness fund deployment we've outlined costs you nothing new. It's strategic redeployment of money you're already spending—with targets, goals, and accountability instead of hope.",
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
7. APPLY FUNDING TYPE RULES strictly—fully insured cannot have innovation funds or self-funded strategies
8. INCLUDE WOMEN'S HEALTH LIFECYCLE—fertility, pregnancy, postpartum, perimenopause, menopause
9. INCLUDE WELLNESS FUND DEPLOYMENT showing $0 net new cost
10. INCLUDE COST MITIGATION STRATEGIES appropriate to their funding type
11. IF ENHANCED DATA DETECTED—provide top 5 specific insights from claims/Rx/utilization
12. USE THE EXACT FIELD NAMES specified—the front-end depends on them
13. WRITE WITH AUTHORITY AND URGENCY—every insight should make a CEO stop
14. RETURN ONLY THE JSON OBJECT—no markdown, no preamble, no explanation`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
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
      has_claims_data: hasClaimsData,
      has_rx_data: hasRxData,
      has_utilization_data: hasUtilizationData,
      canon_echo_version: "4.1"
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
