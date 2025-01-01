export interface DateRange {
    startDate: string | Date;
    endDate: string | Date;
}

export interface MarketingMetrics {
    date: string;
    outbound_messages: number;
    positive_responses: number;
    response_rate: number;
    posts_created: number;
    leads_generated: number;
    leads_per_post: number;
    marketing_xp: number;
} 