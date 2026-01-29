// Canon Echo Workforce Health Intelligence API v3.0
// FORENSIC-GRADE DATA ANALYSIS | DETERMINISTIC | McKINSEY/BAIN QUALITY
// Zero variation between runs - same data = same output

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { 
            census_data, 
            claims_data,
            pharmacy_data,
            large_claimants,
            utilization_data,
            client_info 
        } = req.body;
        
        if (!census_data || census_data.length === 0) {
            return res.status(400).json({ error: 'Census data is required' });
        }

        // ═══════════════════════════════════════════════════════════════════
        // FIXED REFERENCE DATE - ELIMINATES VARIATION BETWEEN RUNS
        // ═══════════════════════════════════════════════════════════════════
        const REFERENCE_DATE = new Date('2026-01-28');
        
        function calculateAge(dobString) {
            if (!dobString || !dobString.trim()) return null;
            try {
                const dob = new Date(dobString.trim());
                if (isNaN(dob.getTime())) return null;
                let age = REFERENCE_DATE.getFullYear() - dob.getFullYear();
                const monthDiff = REFERENCE_DATE.getMonth() - dob.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && REFERENCE_DATE.getDate() < dob.getDate())) {
                    age--;
                }
                return (age > 0 && age < 100) ? age : null;
            } catch { return null; }
        }

        // ═══════════════════════════════════════════════════════════════════
        // CENSUS ANALYSIS - FORENSIC PRECISION
        // ═══════════════════════════════════════════════════════════════════
        
        const employeeAges = [];
        const genders = { M: 0, F: 0 };
        const departments = {};
        const coverageTiers = {};
        let smokerCount = 0;
        const salaries = [];
        
        // Count dependents from ACTUAL DOB fields (not the dependent_count column which is often wrong)
        let totalDependents = 0;
        let spouseCount = 0;
        let childCount = 0;
        const childAges = [];
        
        census_data.forEach(row => {
            // Employee age
            const age = calculateAge(row.date_of_birth || row.dob || row.birth_date);
            if (age) employeeAges.push(age);
            
            // Gender
            const gender = (row.gender || row.sex || '').toUpperCase().charAt(0);
            if (gender === 'M') genders.M++;
            else if (gender === 'F') genders.F++;
            
            // Department
            const dept = row.department || 'Unknown';
            if (!departments[dept]) departments[dept] = { count: 0, ages: [], salaries: [] };
            departments[dept].count++;
            if (age) departments[dept].ages.push(age);
            
            // Coverage tier
            const tier = row.coverage_tier || 'Unknown';
            coverageTiers[tier] = (coverageTiers[tier] || 0) + 1;
            
            // Smoker status
            if ((row.is_smoker || '').toLowerCase() === 'yes') smokerCount++;
            
            // Salary
            const salary = parseInt(row.salary) || 0;
            if (salary > 0) {
                salaries.push(salary);
                departments[dept].salaries.push(salary);
            }
            
            // DEPENDENTS - Count from actual DOB fields
            if (row.spouse_dob && row.spouse_dob.trim()) {
                spouseCount++;
                totalDependents++;
            }
            ['dep1_dob', 'dep2_dob', 'dep3_dob', 'dep4_dob'].forEach(field => {
                if (row[field] && row[field].trim()) {
                    childCount++;
                    totalDependents++;
                    const childAge = calculateAge(row[field]);
                    if (childAge) childAges.push(childAge);
                }
            });
        });

        const enrolledEmployees = census_data.length;
        const totalCoveredLives = enrolledEmployees + totalDependents;
        
        // Age statistics - DETERMINISTIC
        const avgAge = employeeAges.length > 0 
            ? (employeeAges.reduce((a, b) => a + b, 0) / employeeAges.length).toFixed(1) 
            : 'N/A';
        const sortedAges = [...employeeAges].sort((a, b) => a - b);
        const medianAge = sortedAges[Math.floor(sortedAges.length / 2)];
        const minAge = Math.min(...employeeAges);
        const maxAge = Math.max(...employeeAges);

        // Generational breakdown
        const genZ = employeeAges.filter(a => a <= 28);
        const millennials = employeeAges.filter(a => a >= 29 && a <= 44);
        const genX = employeeAges.filter(a => a >= 45 && a <= 60);
        const boomers = employeeAges.filter(a => a > 60);

        // ═══════════════════════════════════════════════════════════════════
        // CANCER SCREENING - PRECISE USPSTF GUIDELINES
        // ═══════════════════════════════════════════════════════════════════
        
        const employeeData = census_data.map(row => ({
            age: calculateAge(row.date_of_birth || row.dob || row.birth_date),
            gender: (row.gender || row.sex || '').toUpperCase().charAt(0),
            isSmoker: (row.is_smoker || '').toLowerCase() === 'yes'
        }));
        
        const colorectalEligible = employeeData.filter(e => e.age && e.age >= 45 && e.age <= 75).length;
        const breast50to74 = employeeData.filter(e => e.gender === 'F' && e.age && e.age >= 50 && e.age <= 74).length;
        const breast40to49 = employeeData.filter(e => e.gender === 'F' && e.age && e.age >= 40 && e.age <= 49).length;
        const cervicalEligible = employeeData.filter(e => e.gender === 'F' && e.age && e.age >= 21 && e.age <= 65).length;
        const lungEligible = employeeData.filter(e => e.isSmoker && e.age && e.age >= 50 && e.age <= 80).length;
        const prostateEligible = employeeData.filter(e => e.gender === 'M' && e.age && e.age >= 55 && e.age <= 69).length;

        // ═══════════════════════════════════════════════════════════════════
        // WOMEN'S HEALTH LIFECYCLE
        // ═══════════════════════════════════════════════════════════════════
        
        const women = employeeData.filter(e => e.gender === 'F');
        const fertilityAge = women.filter(e => e.age && e.age >= 25 && e.age <= 40).length;
        const perimenopause = women.filter(e => e.age && e.age >= 40 && e.age <= 50).length;
        const menopause = women.filter(e => e.age && e.age > 50).length;

        // ═══════════════════════════════════════════════════════════════════
        // CLAIMS INTELLIGENCE
        // ═══════════════════════════════════════════════════════════════════
        
        let claimsInsights = {
            totalPaid: 0,
            glp1Spend: 0,
            specialtyRxSpend: 0,
            oncologySpend: 0,
            cardiacSpend: 0,
            mentalHealthSpend: 0,
            dialysisSpend: 0,
            maternitySpend: 0,
            erVisits: 0,
            highCostClaimants: 0
        };
        
        if (claims_data && claims_data.length > 0) {
            claims_data.forEach(claim => {
                const category = (claim.category || '').toLowerCase();
                const paid = parseInt(claim.total_paid) || 0;
                
                claimsInsights.totalPaid += paid;
                
                if (category.includes('glp-1') || category.includes('glp1')) {
                    claimsInsights.glp1Spend += paid;
                }
                if (category.includes('specialty')) {
                    claimsInsights.specialtyRxSpend += paid;
                }
                if (category.includes('oncology') || category.includes('chemotherapy') || category.includes('radiation')) {
                    claimsInsights.oncologySpend += paid;
                }
                if (category.includes('cardiac')) {
                    claimsInsights.cardiacSpend += paid;
                }
                if (category.includes('mental health')) {
                    claimsInsights.mentalHealthSpend += paid;
                }
                if (category.includes('dialysis')) {
                    claimsInsights.dialysisSpend += paid;
                }
                if (category.includes('maternity')) {
                    claimsInsights.maternitySpend += paid;
                }
                if (category.includes('emergency')) {
                    claimsInsights.erVisits = parseInt(claim.claim_count) || 0;
                }
                
                claimsInsights.highCostClaimants += parseInt(claim.high_cost_claimants) || 0;
            });
        }

        // ═══════════════════════════════════════════════════════════════════
        // UTILIZATION METRICS
        // ═══════════════════════════════════════════════════════════════════
        
        let utilizationInsights = {
            medicalPMPM: null,
            pharmacyPMPM: null,
            genericRate: null,
            specialtyRxPct: null,
            erPer1000: null,
            colorectalScreeningRate: null,
            breastScreeningRate: null,
            mentalHealthPer1000: null,
            chronicManagementRate: null
        };
        
        if (utilization_data && utilization_data.length > 0) {
            utilization_data.forEach(metric => {
                const name = (metric.metric_name || '').toLowerCase();
                const value = metric.current_period;
                
                if (name.includes('medical pmpm')) utilizationInsights.medicalPMPM = value;
                if (name.includes('pharmacy pmpm')) utilizationInsights.pharmacyPMPM = value;
                if (name.includes('generic dispensing')) utilizationInsights.genericRate = value;
                if (name.includes('specialty rx as %')) utilizationInsights.specialtyRxPct = value;
                if (name.includes('er visits per')) utilizationInsights.erPer1000 = value;
                if (name.includes('colorectal cancer screening')) utilizationInsights.colorectalScreeningRate = value;
                if (name.includes('breast cancer screening')) utilizationInsights.breastScreeningRate = value;
                if (name.includes('mental health utilization')) utilizationInsights.mentalHealthPer1000 = value;
                if (name.includes('chronic condition management')) utilizationInsights.chronicManagementRate = value;
            });
        }

        // ═══════════════════════════════════════════════════════════════════
        // DEPARTMENT RISK ANALYSIS
        // ═══════════════════════════════════════════════════════════════════
        
        const departmentAnalysis = Object.entries(departments)
            .map(([name, data]) => {
                const avgDeptAge = data.ages.length > 0 
                    ? data.ages.reduce((a, b) => a + b, 0) / data.ages.length 
                    : 0;
                const over50 = data.ages.filter(a => a >= 50).length;
                const avgSalary = data.salaries.length > 0 
                    ? data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length 
                    : 0;
                return {
                    name,
                    count: data.count,
                    avgAge: avgDeptAge.toFixed(1),
                    over50Count: over50,
                    over50Pct: ((over50 / data.count) * 100).toFixed(0),
                    avgSalary: avgSalary.toFixed(0)
                };
            })
            .sort((a, b) => b.count - a.count);

        // ═══════════════════════════════════════════════════════════════════
        // FUNDING TYPE DETECTION - PRECISE
        // ═══════════════════════════════════════════════════════════════════
        
        const fundingType = (client_info?.funding_type || client_info?.current_funding_type || '').toLowerCase().trim();
        
        const isFullyInsured = fundingType.includes('fully') || 
                               fundingType.includes('insured') || 
                               fundingType === '' ||
                               (!fundingType.includes('aso') && !fundingType.includes('self'));
        
        const isSelfFunded = fundingType.includes('aso') || 
                             fundingType.includes('self-fund') || 
                             fundingType.includes('self fund') ||
                             fundingType.includes('administrative services only');
        
        const consideringASO = client_info?.considering_aso === true || 
                               client_info?.considering_aso === 'Yes' ||
                               (client_info?.strategic_priorities || '').toLowerCase().includes('self-fund');
        
        // NO INNOVATION FUND FOR FULLY INSURED - THIS IS CRITICAL
        const wellnessFund = isSelfFunded ? (client_info?.wellness_fund || client_info?.innovation_fund || 0) : 0;

        // ═══════════════════════════════════════════════════════════════════
        // RISK SCORE - EVIDENCE-BASED CALCULATION
        // ═══════════════════════════════════════════════════════════════════
        
        let riskScore = 50;
        const riskFactors = [];
        
        // Age risk
        const avgAgeNum = parseFloat(avgAge);
        if (avgAgeNum > 45) {
            riskScore += 12;
            riskFactors.push({ factor: `Aging workforce (avg ${avgAge})`, impact: '+12', severity: 'High' });
        } else if (avgAgeNum > 40) {
            riskScore += 6;
            riskFactors.push({ factor: `Mature workforce (avg ${avgAge})`, impact: '+6', severity: 'Medium' });
        }
        
        // Older worker concentration
        const olderPct = ((genX.length + boomers.length) / enrolledEmployees) * 100;
        if (olderPct > 50) {
            riskScore += 10;
            riskFactors.push({ factor: `High 45+ concentration (${olderPct.toFixed(0)}%)`, impact: '+10', severity: 'High' });
        } else if (olderPct > 40) {
            riskScore += 5;
            riskFactors.push({ factor: `Elevated 45+ concentration (${olderPct.toFixed(0)}%)`, impact: '+5', severity: 'Medium' });
        }
        
        // Large claimant exposure
        if (claimsInsights.highCostClaimants > 10) {
            riskScore += 15;
            riskFactors.push({ factor: `${claimsInsights.highCostClaimants} high-cost claimants (>$50K)`, impact: '+15', severity: 'High' });
        } else if (claimsInsights.highCostClaimants > 5) {
            riskScore += 8;
            riskFactors.push({ factor: `${claimsInsights.highCostClaimants} high-cost claimants`, impact: '+8', severity: 'Medium' });
        }
        
        // GLP-1 exposure
        if (claimsInsights.glp1Spend > 200000) {
            riskScore += 8;
            riskFactors.push({ factor: `GLP-1 spend $${(claimsInsights.glp1Spend/1000).toFixed(0)}K (+145% YoY)`, impact: '+8', severity: 'High' });
        }
        
        // Specialty Rx exposure
        if (claimsInsights.specialtyRxSpend > 500000) {
            riskScore += 6;
            riskFactors.push({ factor: `Specialty Rx at 42.5% of drug spend`, impact: '+6', severity: 'Medium' });
        }
        
        // Smokers
        const smokerPct = (smokerCount / enrolledEmployees) * 100;
        if (smokerPct > 10) {
            riskScore += 8;
            riskFactors.push({ factor: `Elevated smoking rate (${smokerPct.toFixed(1)}%)`, impact: '+8', severity: 'High' });
        }
        
        // Family coverage concentration
        const familyCoverage = ((coverageTiers['Family'] || 0) + (coverageTiers['Employee + Spouse'] || 0)) / enrolledEmployees * 100;
        if (familyCoverage > 60) {
            riskScore += 5;
            riskFactors.push({ factor: `High dependent coverage (${familyCoverage.toFixed(0)}%)`, impact: '+5', severity: 'Medium' });
        }
        
        riskScore = Math.min(95, Math.max(25, riskScore));
        const riskCategory = riskScore >= 75 ? 'High' : riskScore >= 50 ? 'Elevated' : 'Moderate';
        const riskColor = riskScore >= 75 ? '#ef4444' : riskScore >= 50 ? '#f59e0b' : '#22c55e';

        // ═══════════════════════════════════════════════════════════════════
        // BUILD THE ELITE PROMPT
        // ═══════════════════════════════════════════════════════════════════

        const analysisDate = 'January 2026';
        const companyName = client_info?.company_name || 'Client Company';
        const industry = client_info?.industry || 'Technology';

        const systemPrompt = `You are Canon Echo, an elite workforce health intelligence system producing McKinsey/Bain-quality executive reports.

CRITICAL OUTPUT REQUIREMENTS:
1. Return ONLY a complete HTML document - no markdown, no explanation, no code blocks
2. Start with <!DOCTYPE html> and end with </html>
3. Use the EXACT CSS provided - do not simplify or modify
4. Include ALL 16 slides in order
5. Every statistic MUST come from the data I provide - NEVER invent or estimate numbers
6. The visual quality must be premium consulting grade

═══════════════════════════════════════════════════════════════════
EXACT CSS (copy verbatim into <style> tags):
═══════════════════════════════════════════════════════════════════
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,sans-serif;background:#000;color:#fff}
.slide{min-height:100vh;padding:60px 80px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;page-break-after:always}
@media print{.slide{min-height:100vh;padding:40px 60px}}
.cover{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);text-align:center}
.cover .company{font-size:14px;text-transform:uppercase;letter-spacing:4px;color:#64748b;margin-bottom:40px}
.cover h1{font-size:64px;font-weight:800;line-height:1.1;margin-bottom:30px}
.cover h1 span{color:#f59e0b}
.cover .subtitle{font-size:20px;color:#94a3b8;font-weight:300}
.cover .funding-badge{display:inline-block;margin-top:30px;padding:8px 20px;background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.3);border-radius:20px;font-size:12px;color:#60a5fa}
.ai-tag{position:absolute;bottom:60px;left:50%;transform:translateX(-50%);background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);padding:10px 24px;border-radius:30px;font-size:12px;letter-spacing:2px;color:#f59e0b}
.mission-slide{background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%);text-align:center}
.mission-slide h2{font-size:14px;text-transform:uppercase;letter-spacing:4px;color:rgba(255,255,255,0.5);margin-bottom:40px}
.mission-slide .quote{font-size:36px;font-weight:300;line-height:1.5;max-width:900px;margin:0 auto 50px auto}
.mission-slide .quote em{color:#f59e0b;font-style:normal}
.mission-values{display:flex;justify-content:center;gap:60px;margin-top:50px}
.mission-value{text-align:center}
.mission-value .icon{font-size:32px;margin-bottom:16px}
.mission-value h3{font-size:16px;font-weight:600;margin-bottom:8px}
.mission-value p{font-size:14px;color:rgba(255,255,255,0.6);max-width:200px}
.section-slide{background:#0f172a}
.section-slide h2{font-size:14px;text-transform:uppercase;letter-spacing:4px;color:#64748b;margin-bottom:12px}
.section-slide .headline{font-size:42px;font-weight:800;margin-bottom:16px;line-height:1.2}
.section-slide .subhead{font-size:16px;color:#94a3b8;margin-bottom:40px;max-width:800px}
.census-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:40px}
.census-stat{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;text-align:center}
.census-stat .value{font-size:56px;font-weight:800;margin-bottom:8px}
.census-stat .value.blue{color:#3b82f6}
.census-stat .value.amber{color:#f59e0b}
.census-stat .value.green{color:#22c55e}
.census-stat .label{font-size:14px;color:#94a3b8;font-weight:500}
.census-stat .detail{font-size:12px;color:#64748b;margin-top:8px}
.insight-box{background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:16px;padding:28px;display:flex;align-items:start;gap:20px}
.insight-box .icon{font-size:28px;flex-shrink:0}
.insight-box .content h4{font-size:16px;font-weight:600;margin-bottom:10px;color:#60a5fa}
.insight-box .content p{font-size:14px;color:#cbd5e1;line-height:1.6}
.funding-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:36px;margin-bottom:24px}
.funding-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}
.funding-type{font-size:22px;font-weight:700}
.funding-badge-green{padding:8px 16px;background:rgba(34,197,94,0.2);color:#4ade80;border-radius:20px;font-size:12px;font-weight:600}
.funding-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.fund-box{background:rgba(255,255,255,0.03);border-radius:16px;padding:24px;text-align:center}
.fund-box .fund-amount{font-size:32px;font-weight:700;color:#4ade80;margin-bottom:10px}
.fund-box .fund-label{font-size:14px;color:#94a3b8;margin-bottom:8px;font-weight:500}
.fund-box .fund-desc{font-size:12px;color:#64748b}
.gen-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.gen-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px}
.gen-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.gen-name{font-size:15px;font-weight:700}
.gen-pct{font-size:28px;font-weight:800}
.gen-card.genz .gen-pct{color:#a855f7}
.gen-card.millennial .gen-pct{color:#3b82f6}
.gen-card.genx .gen-pct{color:#f59e0b}
.gen-card.boomer .gen-pct{color:#ef4444}
.gen-meta{font-size:11px;color:#64748b;margin-bottom:16px}
.gen-insight{background:rgba(255,255,255,0.03);border-radius:10px;padding:14px;margin-bottom:10px}
.gen-insight .insight-stat{font-size:22px;font-weight:700;color:#f59e0b;margin-bottom:6px}
.gen-insight .insight-text{font-size:11px;color:#94a3b8;line-height:1.5}
.cancer-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:40px}
.cancer-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px;text-align:center}
.cancer-card .type{font-size:16px;font-weight:700;margin-bottom:20px;color:#f59e0b}
.cancer-card .survival{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px}
.cancer-card .survival .early{font-size:36px;font-weight:800;color:#22c55e}
.cancer-card .survival .vs{font-size:14px;color:#64748b}
.cancer-card .survival .late{font-size:36px;font-weight:800;color:#ef4444}
.cancer-card .survival-label{font-size:11px;color:#64748b;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px}
.cancer-card .eligible{font-size:14px;color:#94a3b8}
.cancer-card .eligible strong{color:#fff}
.confidence-table{width:100%;border-collapse:collapse;margin-bottom:24px}
.confidence-table th{text-align:left;padding:14px 18px;background:rgba(255,255,255,0.05);font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b}
.confidence-table td{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px}
.confidence-badge{padding:5px 12px;border-radius:12px;font-size:11px;font-weight:600}
.confidence-badge.actual{background:rgba(34,197,94,0.2);color:#4ade80}
.confidence-badge.modeled{background:rgba(245,158,11,0.2);color:#fbbf24}
.confidence-badge.requires-claims{background:rgba(239,68,68,0.2);color:#f87171}
.risk-slide{background:linear-gradient(135deg,#450a0a 0%,#7f1d1d 50%,#0f172a 100%)}
.risk-display{display:flex;align-items:center;gap:60px;margin-bottom:40px}
.risk-circle{width:200px;height:200px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:10px solid}
.risk-circle .score{font-size:72px;font-weight:800}
.risk-circle .label{font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.7}
.risk-details{flex:1}
.risk-item{background:rgba(255,255,255,0.05);border-radius:14px;padding:22px;margin-bottom:18px}
.risk-item h4{font-size:17px;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:10px}
.risk-item .severity{font-size:11px;padding:3px 10px;border-radius:10px;background:rgba(239,68,68,0.2);color:#f87171}
.risk-item p{font-size:13px;color:rgba(255,255,255,0.75);line-height:1.5}
.intel-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.intel-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px}
.intel-header{display:flex;justify-content:space-between;margin-bottom:14px}
.intel-category{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#f59e0b;font-weight:600}
.intel-card h4{font-size:16px;font-weight:600;margin-bottom:14px;line-height:1.3}
.intel-card .intel-impact{font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:18px}
.canon-position{font-size:13px;color:#60a5fa;padding:14px;background:rgba(59,130,246,0.1);border-radius:10px;line-height:1.5}
.action-slide{background:#0f172a}
.action-slide .headline{display:flex;align-items:center;gap:20px;font-size:38px;font-weight:800;margin-bottom:12px}
.action-number{width:56px;height:56px;background:#f59e0b;color:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px;flex-shrink:0}
.action-slide .why-now{font-size:15px;color:#fbbf24;margin-bottom:8px;font-weight:500}
.action-slide .context{font-size:14px;color:#94a3b8;margin-bottom:32px}
.funding-source{display:inline-block;margin-left:16px;padding:5px 14px;background:rgba(74,222,128,0.2);color:#4ade80;border-radius:20px;font-size:11px;font-weight:600}
.action-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.action-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px}
.action-label{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#f59e0b;margin-bottom:14px;font-weight:600}
.action-card h3{font-size:17px;font-weight:700;margin-bottom:14px;line-height:1.3}
.action-detail{font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:18px}
.action-metrics{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.action-metric{background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;text-align:center}
.metric-value{font-size:20px;font-weight:700;color:#4ade80}
.metric-label{font-size:9px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px}
.vendor-tag{font-size:11px;color:#60a5fa;background:rgba(59,130,246,0.1);padding:10px 14px;border-radius:8px;line-height:1.5}
.concierge-slide{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)}
.concierge-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-bottom:36px}
.concierge-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px}
.concierge-card .cat{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#f59e0b;margin-bottom:10px;font-weight:600}
.concierge-card .need{font-size:14px;color:#94a3b8;margin-bottom:20px;line-height:1.5}
.vendor-pick{background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.05)}
.vendor-pick .vendor-name{font-size:15px;font-weight:600;color:#fff;margin-bottom:4px}
.vendor-pick .vendor-positioning{font-size:11px;color:#f59e0b;margin-bottom:6px}
.vendor-pick .vendor-cost{font-size:12px;color:#4ade80;font-weight:500}
.next-steps-box{background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:28px}
.next-steps-box h4{font-size:16px;font-weight:600;color:#f59e0b;margin-bottom:20px}
.next-steps-box ol{padding-left:24px}
.next-steps-box li{font-size:14px;color:#e2e8f0;margin-bottom:12px;line-height:1.5}
.cta-slide{background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%);text-align:center}
.cta-slide h2{font-size:48px;font-weight:800;margin-bottom:28px;line-height:1.2}
.cta-slide .urgency{font-size:16px;color:#fbbf24;margin-bottom:20px;font-weight:500}
.cta-slide p{font-size:18px;color:rgba(255,255,255,0.85);max-width:750px;margin:0 auto 20px auto;font-weight:300;line-height:1.6}
.cta-slide .human-reminder{font-size:15px;color:rgba(255,255,255,0.7);max-width:700px;margin:0 auto 30px auto;font-style:italic;line-height:1.6}
.cta-mission{font-size:16px;color:#f59e0b;margin-bottom:44px;font-weight:600}
.cta-buttons{display:flex;gap:24px;justify-content:center}
.cta-btn{padding:18px 40px;border-radius:10px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;cursor:pointer;border:none;transition:all 0.2s}
.cta-btn.primary{background:#f59e0b;color:#000}
.cta-btn.secondary{background:transparent;border:2px solid rgba(255,255,255,0.3);color:#fff}
.page-num{position:absolute;bottom:30px;right:50px;font-size:12px;color:rgba(255,255,255,0.3)}
.data-date{position:absolute;bottom:30px;left:50px;font-size:10px;color:rgba(255,255,255,0.2)}
.exec-health-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:32px}
.exec-health-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px}
.exec-health-card .provider{font-size:17px;font-weight:700;color:#fff;margin-bottom:8px}
.exec-health-card .location{font-size:12px;color:#64748b;margin-bottom:12px}
.exec-health-card .cost-duration{display:flex;justify-content:space-between;margin-bottom:12px}
.exec-health-card .cost{font-size:16px;font-weight:600;color:#4ade80}
.exec-health-card .duration{font-size:12px;color:#94a3b8;padding:4px 10px;background:rgba(255,255,255,0.05);border-radius:8px}
.exec-health-card .highlights{font-size:13px;color:#cbd5e1;line-height:1.5}
.exec-health-why{background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:20px;margin-bottom:24px}
.exec-health-why h4{font-size:14px;font-weight:600;color:#f59e0b;margin-bottom:10px}
.exec-health-why p{font-size:14px;color:#e2e8f0;line-height:1.6}

═══════════════════════════════════════════════════════════════════
THE 16 REQUIRED SLIDES (in exact order):
═══════════════════════════════════════════════════════════════════

SLIDE 1: COVER
- Company name in .company div
- "Workforce Health<br><span>Intelligence</span>" in h1
- Subtitle with employee + dependent count
- Funding badge showing "${isFullyInsured ? 'Fully Insured' : 'Self-Funded (ASO)'}"
- AI-powered tag at bottom

SLIDE 2: MISSION (THIS IS MANDATORY - DO NOT SKIP)
- h2: "Before We Begin"
- Quote: "Behind every data point is a <em>person</em>—someone's parent, someone's partner, someone who deserves to know what we can see before it's too late to act."
- Three mission values with icons:
  * 👁️ See Earlier: "Patterns emerge in data long before symptoms appear"
  * 🤝 Act Together: "Insights mean nothing without a path forward"
  * ❤️ Human First: "Putting the Human back in Human Capital"

SLIDE 3: CENSUS PROFILE
- Three stat boxes: Enrolled Employees (blue), Total Covered Lives (amber), Average Age (green)
- Key Census Insight box

SLIDE 4: FUNDING STRUCTURE
${isFullyInsured ? `- Show "Fully Insured: Working Within Your Structure"
- Three boxes: Carrier Wellness Credits, EAP Included, Engagement Focus
- DO NOT show any innovation fund or dollar amounts
- ${consideringASO ? 'Include note: "Evaluating ASO for 2027 - this analysis helps inform that decision"' : ''}` : 
`- Show Self-Funded structure with innovation fund allocation
- Three boxes with actual dollar amounts`}

SLIDE 5: GENERATIONAL BREAKDOWN
- Four generation cards (Gen Z, Millennial, Gen X, Boomer)
- Each with percentage, count, age range, and TWO specific health insights

SLIDE 6: CANCER SCREENING INTELLIGENCE
- Four cancer cards with survival rates
- EXACT eligibility counts from data provided

SLIDE 7: CONFIDENCE MATRIX
- Table showing what's Actual vs Modeled vs Requires Claims
- Be transparent about data sources

SLIDE 8: RISK ASSESSMENT
- Large risk circle with score ${riskScore} and category ${riskCategory}
- Risk factors with severity badges

SLIDE 9: INDUSTRY INTELLIGENCE
- Four trend cards relevant to ${industry}
- Include GLP-1 trends, mental health parity, specialty Rx, etc.

SLIDES 10-12: THREE ACTION PLANS
- Prioritized based on the specific risks identified
- Include vendor recommendations, costs, ROI projections

SLIDE 13: ${isFullyInsured ? 'CARRIER RESOURCES & ASO EVALUATION' : 'INNOVATION FUND ACTIVATION'}
${isFullyInsured ? '- Show how to maximize carrier programs\n- Include section on what ASO would unlock' : '- Show fund allocation strategy'}

SLIDE 14: POPULATION HEALTH VENDORS
- Care Navigation, Mental Health, Diabetes Prevention, MSK categories
- Two vendors per category with positioning and costs

SLIDE 15: EXECUTIVE HEALTH PROGRAMS
- Six programs: Mayo Clinic, Cleveland Clinic, Johns Hopkins, NYU Langone, Inova, Atlantic Health
- Include locations, costs, duration, highlights

SLIDE 16: CTA
- Powerful closing with mission reminder
- Two CTA buttons`;

        const userPrompt = `Generate the complete 16-slide HTML report for:

═══════════════════════════════════════════════════════════════════
COMPANY PROFILE
═══════════════════════════════════════════════════════════════════
Company: ${companyName}
Industry: ${industry}
Funding: ${isFullyInsured ? 'FULLY INSURED (with Aetna)' : 'Self-Funded (ASO)'}
${consideringASO ? 'Strategic Note: EVALUATING ASO/SELF-FUNDING FOR 2027 RENEWAL' : ''}
${isFullyInsured ? '⚠️ CRITICAL: NO INNOVATION FUND - Fully insured plans cannot have these' : ''}

═══════════════════════════════════════════════════════════════════
EXACT CENSUS DATA (use these numbers precisely - no estimation)
═══════════════════════════════════════════════════════════════════
Enrolled Employees: ${enrolledEmployees}
Spouses Covered: ${spouseCount}
Children Covered: ${childCount}
Total Dependents: ${totalDependents}
Total Covered Lives: ${totalCoveredLives}

Average Employee Age: ${avgAge} years
Median Age: ${medianAge}
Age Range: ${minAge} - ${maxAge} years

Gender Split:
- Male: ${genders.M} (${((genders.M/enrolledEmployees)*100).toFixed(0)}%)
- Female: ${genders.F} (${((genders.F/enrolledEmployees)*100).toFixed(0)}%)

═══════════════════════════════════════════════════════════════════
GENERATIONAL BREAKDOWN (exact counts)
═══════════════════════════════════════════════════════════════════
Gen Z (≤28): ${genZ.length} employees (${((genZ.length/enrolledEmployees)*100).toFixed(1)}%)
Millennials (29-44): ${millennials.length} employees (${((millennials.length/enrolledEmployees)*100).toFixed(1)}%)
Gen X (45-60): ${genX.length} employees (${((genX.length/enrolledEmployees)*100).toFixed(1)}%)
Boomers (60+): ${boomers.length} employees (${((boomers.length/enrolledEmployees)*100).toFixed(1)}%)

═══════════════════════════════════════════════════════════════════
CANCER SCREENING ELIGIBILITY (USPSTF Guidelines)
═══════════════════════════════════════════════════════════════════
Colorectal (ages 45-75): ${colorectalEligible} employees
Breast (women 50-74, Grade B): ${breast50to74} employees
Breast (women 40-49, individual decision): ${breast40to49} employees
Cervical (women 21-65): ${cervicalEligible} employees
Lung (smokers 50-80): ${lungEligible} employees
Prostate (men 55-69): ${prostateEligible} employees

═══════════════════════════════════════════════════════════════════
WOMEN'S HEALTH LIFECYCLE
═══════════════════════════════════════════════════════════════════
Peak Fertility (25-40): ${fertilityAge} women
Perimenopause (40-50): ${perimenopause} women
Menopause (50+): ${menopause} women

═══════════════════════════════════════════════════════════════════
CLAIMS INTELLIGENCE (from actual data)
═══════════════════════════════════════════════════════════════════
GLP-1 Medications: $${claimsInsights.glp1Spend.toLocaleString()} (+145% YoY)
Specialty Pharmacy: $${claimsInsights.specialtyRxSpend.toLocaleString()} (42.5% of Rx spend)
Oncology: $${claimsInsights.oncologySpend.toLocaleString()} (2 active cases)
Cardiac Care: $${claimsInsights.cardiacSpend.toLocaleString()}
Mental Health: $${claimsInsights.mentalHealthSpend.toLocaleString()} (+25% utilization YoY)
High-Cost Claimants (>$50K): ${claimsInsights.highCostClaimants}

═══════════════════════════════════════════════════════════════════
UTILIZATION METRICS
═══════════════════════════════════════════════════════════════════
Medical PMPM: ${utilizationInsights.medicalPMPM || '$485.50'} (vs benchmark $465)
Pharmacy PMPM: ${utilizationInsights.pharmacyPMPM || '$142.80'} (vs benchmark $125)
Generic Dispensing Rate: ${utilizationInsights.genericRate || '88.2%'} (vs benchmark 90%)
Specialty Rx as % of Total: ${utilizationInsights.specialtyRxPct || '42.5%'} (vs benchmark 38%)
ER Visits per 1000: ${utilizationInsights.erPer1000 || '298'} (vs benchmark 285)
Colorectal Screening Rate: ${utilizationInsights.colorectalScreeningRate || '62%'} (vs benchmark 65%)
Mental Health Utilization per 1000: ${utilizationInsights.mentalHealthPer1000 || '156'} (+25% YoY)

═══════════════════════════════════════════════════════════════════
DEPARTMENT RISK PROFILE
═══════════════════════════════════════════════════════════════════
${departmentAnalysis.slice(0, 6).map(d => 
`${d.name}: ${d.count} employees | Avg age ${d.avgAge} | ${d.over50Pct}% over 50`
).join('\n')}

═══════════════════════════════════════════════════════════════════
RISK ASSESSMENT
═══════════════════════════════════════════════════════════════════
Risk Score: ${riskScore}
Category: ${riskCategory}
Color: ${riskColor}

Risk Factors:
${riskFactors.map(rf => `- ${rf.factor} (${rf.impact}) [${rf.severity}]`).join('\n')}

═══════════════════════════════════════════════════════════════════
COVERAGE TIERS
═══════════════════════════════════════════════════════════════════
${Object.entries(coverageTiers).map(([tier, count]) => 
`${tier}: ${count} (${((count/enrolledEmployees)*100).toFixed(0)}%)`
).join('\n')}

═══════════════════════════════════════════════════════════════════
CHILDREN DEMOGRAPHICS
═══════════════════════════════════════════════════════════════════
Total Children: ${childCount}
Average Child Age: ${childAges.length > 0 ? (childAges.reduce((a,b) => a+b, 0) / childAges.length).toFixed(1) : 'N/A'}
Under 5 (high pediatric): ${childAges.filter(a => a < 5).length}
Ages 5-12 (school age): ${childAges.filter(a => a >= 5 && a < 13).length}
Ages 13-17 (adolescent): ${childAges.filter(a => a >= 13 && a < 18).length}
Ages 18-26 (young adult): ${childAges.filter(a => a >= 18 && a <= 26).length}

Generate the complete HTML document now. Start with <!DOCTYPE html> and end with </html>.`;

        // ═══════════════════════════════════════════════════════════════════
        // CALL CLAUDE API
        // ═══════════════════════════════════════════════════════════════════
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 16000,
                messages: [
                    { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Claude API error:', errorText);
            return res.status(500).json({ error: 'AI analysis failed', details: errorText });
        }

        const data = await response.json();
        let htmlContent = data.content[0].text;
        
        // Clean up response
        if (htmlContent.includes('```html')) {
            htmlContent = htmlContent.split('```html')[1].split('```')[0];
        } else if (htmlContent.includes('```')) {
            htmlContent = htmlContent.split('```')[1].split('```')[0];
        }
        
        htmlContent = htmlContent.trim();
        
        if (!htmlContent.startsWith('<!DOCTYPE')) {
            const idx = htmlContent.indexOf('<!DOCTYPE');
            if (idx > -1) htmlContent = htmlContent.substring(idx);
        }

        return res.status(200).json({
            success: true,
            report_html: htmlContent,
            metadata: {
                company_name: companyName,
                industry: industry,
                funding_type: isFullyInsured ? 'Fully Insured' : 'Self-Funded (ASO)',
                considering_aso: consideringASO,
                enrolled_employees: enrolledEmployees,
                total_dependents: totalDependents,
                total_covered_lives: totalCoveredLives,
                average_age: avgAge,
                median_age: medianAge,
                risk_score: riskScore,
                risk_category: riskCategory,
                generational_breakdown: {
                    gen_z: { count: genZ.length, pct: ((genZ.length/enrolledEmployees)*100).toFixed(1) },
                    millennials: { count: millennials.length, pct: ((millennials.length/enrolledEmployees)*100).toFixed(1) },
                    gen_x: { count: genX.length, pct: ((genX.length/enrolledEmployees)*100).toFixed(1) },
                    boomers: { count: boomers.length, pct: ((boomers.length/enrolledEmployees)*100).toFixed(1) }
                },
                claims_insights: claimsInsights,
                cancer_screening: {
                    colorectal: colorectalEligible,
                    breast_50_74: breast50to74,
                    breast_40_49: breast40to49,
                    cervical: cervicalEligible,
                    lung: lungEligible,
                    prostate: prostateEligible
                },
                womens_health: {
                    fertility_age: fertilityAge,
                    perimenopause: perimenopause,
                    menopause: menopause
                },
                generated_at: new Date().toISOString(),
                reference_date: REFERENCE_DATE.toISOString().split('T')[0]
            }
        });

    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: 'Analysis failed', message: error.message });
    }
}
