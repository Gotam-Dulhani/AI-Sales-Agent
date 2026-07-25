from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ChatAnalytics(BaseModel):
    total_chats: int
    total_messages: int
    avg_response_time: float  # in seconds
    active_chats: int
    resolved_chats: int
    date_range: str


class LeadAnalytics(BaseModel):
    total_leads: int
    new_leads: int
    qualified_leads: int
    converted_leads: int
    conversion_rate: float
    leads_by_source: Dict[str, int]
    avg_lead_score: float
    date_range: str


class OrderAnalytics(BaseModel):
    total_orders: int
    total_revenue: float
    avg_order_value: float
    orders_by_status: Dict[str, int]
    date_range: str


class CustomerAnalytics(BaseModel):
    total_customers: int
    active_customers: int
    new_customers: int
    avg_engagement_score: float
    date_range: str


class DashboardAnalytics(BaseModel):
    chat_analytics: ChatAnalytics
    lead_analytics: LeadAnalytics
    order_analytics: OrderAnalytics
    customer_analytics: CustomerAnalytics
    period: str  # "daily", "weekly", "monthly"


class TimeSeriesData(BaseModel):
    date: str
    value: float
    label: str


class TrendAnalytics(BaseModel):
    metric: str
    data: List[TimeSeriesData]
    period: str
