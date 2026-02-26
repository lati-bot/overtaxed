export interface MetroConfig {
  slug: string;
  name: string;
  state: string;
  counties: string[];
  jurisdictions: string[];
  propertyCount: string;
  propertiesRaw: string;
  avgSavings: string;
  deadline: string;
  protestType: string;
  portalInfo: { county: string; url: string; name: string }[];
  placeholder: string;
  trustLine: string;
  faqs: { question: string; answer: string }[];
}

export const METROS: Record<string, MetroConfig> = {
  houston: {
    slug: "houston",
    name: "Houston",
    state: "Texas",
    counties: ["Harris County", "Fort Bend County"],
    jurisdictions: ["harris_county_tx", "fortbend_county_tx"],
    propertyCount: "1,003,000+",
    propertiesRaw: "1003000",
    avgSavings: "1,200",
    deadline: "May 15, 2026",
    protestType: "Uniform & Equal",
    portalInfo: [
      { county: "Harris County", url: "https://www.hcad.org", name: "HCAD" },
      { county: "Fort Bend County", url: "https://www.fbcad.org", name: "FBCAD" },
    ],
    placeholder: "Try any address in The Heights, Houston",
    trustLine: "Used by homeowners in Harris County and Fort Bend County",
    faqs: [
      {
        question: "How do I protest my Harris County property taxes?",
        answer: "File a protest with HCAD by May 15, 2026. You can file online at hcad.org or submit a written notice. Overtaxed gives you a $49 evidence packet with comparable properties and a cover letter to strengthen your case.",
      },
      {
        question: "What is the deadline to file a property tax protest in Houston?",
        answer: "The deadline to file a property tax protest in Harris County and Fort Bend County is May 15, 2026 (or 30 days after your notice of appraised value, whichever is later).",
      },
      {
        question: "Can I protest my Houston property taxes online?",
        answer: "Yes. Harris County (HCAD) and Fort Bend County (FBCAD) both allow online protest filing through their appraisal district websites.",
      },
      {
        question: "How much can I save by protesting property taxes in Houston?",
        answer: "Houston-area homeowners who protest save an average of $1,200 per year. Your actual savings depend on how much your property is over-assessed compared to similar homes.",
      },
    ],
  },
  dallas: {
    slug: "dallas",
    name: "Dallas–Fort Worth",
    state: "Texas",
    counties: ["Dallas County", "Collin County", "Tarrant County", "Denton County", "Rockwall County"],
    jurisdictions: ["dallas_county_tx", "collin_county_tx", "tarrant_county_tx", "denton_county_tx", "rockwall_county_tx"],
    propertyCount: "1,903,000+",
    propertiesRaw: "1903000",
    avgSavings: "1,400",
    deadline: "May 15, 2026",
    protestType: "Uniform & Equal",
    portalInfo: [
      { county: "Dallas County", url: "https://www.dallascad.org", name: "DCAD" },
      { county: "Collin County", url: "https://www.collincad.org", name: "Collin CAD" },
      { county: "Tarrant County", url: "https://www.tad.org", name: "TAD" },
      { county: "Denton County", url: "https://www.dentoncad.com", name: "Denton CAD" },
      { county: "Rockwall County", url: "https://www.rockwallcad.com", name: "Rockwall CAD" },
    ],
    placeholder: "Try any address in Oak Lawn, Dallas",
    trustLine: "Used by homeowners in Dallas, Collin, Tarrant, Denton, and Rockwall counties",
    faqs: [
      {
        question: "How do I protest my Dallas County property taxes?",
        answer: "File a protest with DCAD by May 15, 2026. You can file online at dallascad.org. Overtaxed provides a $49 evidence packet with comparable properties and a cover letter.",
      },
      {
        question: "What is the deadline to file a property tax protest in DFW?",
        answer: "The deadline is May 15, 2026 (or 30 days after your notice of appraised value, whichever is later) for all DFW-area counties.",
      },
      {
        question: "Can I protest my property taxes online in Dallas–Fort Worth?",
        answer: "Yes. All major DFW appraisal districts — DCAD, Collin CAD, TAD, Denton CAD, and Rockwall CAD — accept online protest filings.",
      },
      {
        question: "How much can I save by protesting property taxes in DFW?",
        answer: "DFW homeowners who protest save an average of $1,400 per year. Savings depend on your property's over-assessment relative to comparable homes.",
      },
    ],
  },
  austin: {
    slug: "austin",
    name: "Austin",
    state: "Texas",
    counties: ["Travis County", "Williamson County"],
    jurisdictions: ["travis_county_tx", "williamson_county_tx"],
    propertyCount: "613,000+",
    propertiesRaw: "613000",
    avgSavings: "1,100",
    deadline: "May 15, 2026",
    protestType: "Uniform & Equal",
    portalInfo: [
      { county: "Travis County", url: "https://www.traviscad.org", name: "TCAD" },
      { county: "Williamson County", url: "https://www.wcad.org", name: "WCAD" },
    ],
    placeholder: "Try any address in Hyde Park, Austin",
    trustLine: "Used by homeowners in Travis County and Williamson County",
    faqs: [
      {
        question: "How do I protest my Travis County property taxes?",
        answer: "File a protest with TCAD by May 15, 2026. You can file online at traviscad.org. Overtaxed gives you a $49 evidence packet with comps and a cover letter.",
      },
      {
        question: "What is the deadline to file a property tax protest in Austin?",
        answer: "The deadline is May 15, 2026 (or 30 days after your notice of appraised value, whichever is later) for Travis and Williamson counties.",
      },
      {
        question: "Can I protest my Austin property taxes online?",
        answer: "Yes. Both Travis County (TCAD) and Williamson County (WCAD) allow online protest filing.",
      },
      {
        question: "How much can I save by protesting property taxes in Austin?",
        answer: "Austin-area homeowners who protest save an average of $1,100 per year. Your savings depend on how over-assessed your property is compared to similar homes.",
      },
    ],
  },
  "san-antonio": {
    slug: "san-antonio",
    name: "San Antonio",
    state: "Texas",
    counties: ["Bexar County"],
    jurisdictions: ["bexar_county_tx"],
    propertyCount: "607,000+",
    propertiesRaw: "607000",
    avgSavings: "900",
    deadline: "May 15, 2026",
    protestType: "Uniform & Equal",
    portalInfo: [
      { county: "Bexar County", url: "https://www.bcad.org", name: "BCAD" },
    ],
    placeholder: "Try any address in Alamo Heights, San Antonio",
    trustLine: "Used by homeowners in Bexar County",
    faqs: [
      {
        question: "How do I protest my Bexar County property taxes?",
        answer: "File a protest with BCAD by May 15, 2026. You can file online at bcad.org. Overtaxed provides a $49 evidence packet with comparable properties and a cover letter.",
      },
      {
        question: "What is the deadline to file a property tax protest in San Antonio?",
        answer: "The deadline is May 15, 2026 (or 30 days after your notice of appraised value, whichever is later).",
      },
      {
        question: "Can I protest my San Antonio property taxes online?",
        answer: "Yes. Bexar County Appraisal District (BCAD) accepts online protest filings through their website.",
      },
      {
        question: "How much can I save by protesting property taxes in San Antonio?",
        answer: "San Antonio homeowners who protest save an average of $900 per year. Your savings depend on your property's over-assessment.",
      },
    ],
  },
  chicago: {
    slug: "chicago",
    name: "Chicago",
    state: "Illinois",
    counties: ["Cook County"],
    jurisdictions: ["cook_county_il"],
    propertyCount: "971,000+",
    propertiesRaw: "971000",
    avgSavings: "1,500",
    deadline: "August–November 2026 (varies by township)",
    protestType: "Market Value",
    portalInfo: [
      { county: "Cook County", url: "https://www.cookcountyassessor.com", name: "Cook County Assessor" },
    ],
    placeholder: "Try any address in Lincoln Park, Chicago",
    trustLine: "Used by homeowners in Cook County",
    faqs: [
      {
        question: "How do I protest my Cook County property taxes?",
        answer: "File an appeal with the Cook County Assessor's Office during your township's open appeal period (typically August–November). Overtaxed gives you a $49 evidence packet with comps and a cover letter.",
      },
      {
        question: "What is the deadline to file a property tax appeal in Chicago?",
        answer: "Cook County appeals are filed by township, with windows opening between August and November 2026. Check cookcountyassessor.com for your township's specific dates.",
      },
      {
        question: "Can I protest my Chicago property taxes online?",
        answer: "Yes. Cook County allows online appeal filing through the Assessor's website at cookcountyassessor.com.",
      },
      {
        question: "How much can I save by appealing property taxes in Chicago?",
        answer: "Chicago homeowners who appeal save an average of $1,500 per year. Savings depend on how your assessed value compares to similar properties.",
      },
    ],
  },
};

export const METRO_SLUGS = Object.keys(METROS);
