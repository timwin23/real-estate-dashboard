export interface DateRange {
    startDate: string | Date;
    endDate: string | Date;
}

export interface MarketingMetrics {
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