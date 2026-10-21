/**
 * Cited figures for "Why this exists". Every number comes from
 * docs/BUSINESS-PLAN.md section 1 / docs/research/02-pakistan-landscape.md
 * with its original source. Do not add a figure without a source.
 */
export interface CitedStat {
  value: string;
  label: string;
  /** Caveat shown under the label, in plain words. */
  note?: string;
  source: { name: string; title: string; url: string };
}

export const stats: CitedStat[] = [
  {
    value: "~9 million",
    label: "Pakistanis live abroad, nearly 4 million of them in the Middle East.",
    source: {
      name: "Express Tribune",
      title: "Overbearing overseas Pakistanis",
      url: "https://tribune.com.pk/story/2330465/overbearing-overseas-pakistanis",
    },
  },
  {
    value: "$41.6bn",
    label: "sent home in remittances in FY2026, a record. Families abroad hold real assets in Pakistan.",
    source: {
      name: "Gulf News",
      title: "Saudi Arabia, UAE drive Pakistan remittances to record $41.6bn",
      url: "https://gulfnews.com/world/asia/pakistan/saudi-arabia-uae-drive-pakistan-remittances-to-record-416bn-1.500602356",
    },
  },
  {
    value: "~35,000",
    label: "complaints received by Punjab's Overseas Pakistanis Commission.",
    note: "A government-reported figure, not an audited count.",
    source: {
      name: "Business Recorder",
      title: "Overseas Pakistanis Commission complaints",
      url: "https://www.brecorder.com/news/amp/40395647",
    },
  },
  {
    value: "6,803",
    label: "land grabbing complaints from overseas Pakistanis on the Citizen's Portal in 2021-22, the largest category.",
    source: {
      name: "ProPakistani",
      title: "Citizen Portal land-related complaints of overseas Pakistanis",
      url: "https://propakistani.pk/2022/02/28/citizen-portal-resolved-85-of-land-related-complaints-of-overseas-pakistanis-in-2021/",
    },
  },
];
