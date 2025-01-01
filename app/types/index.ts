export interface DateRange {
    startDate: string | Date;
    endDate: string | Date;
}

export interface MarketingMetrics {
    // Raw data fields (from API)
    posts_created?: number;
    leads_generated?: number;
    outbound_messages?: number;
    positive_responses?: number;
    marketing_xp?: number;

    // Calculated totals (used in UI)
    totalOutboundMessages: number;
    totalPositiveResponses: number;
    totalPostsCreated: number;
    totalLeadsGenerated: number;
    totalRevenue: number;
    marketingXP: number;
    responseRate: number;
    leadsPerPost: number;
    revenuePerClose: number;
} 