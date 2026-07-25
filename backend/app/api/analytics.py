from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.db.session import get_db
from app.models.user import User
from app.models.chat import Chat
from app.models.message import Message
from app.models.lead import Lead
from app.models.order import Order
from app.models.customer import Customer
from app.schemas.analytics import (
    ChatAnalytics,
    LeadAnalytics,
    OrderAnalytics,
    CustomerAnalytics,
    DashboardAnalytics,
    TrendAnalytics,
    TimeSeriesData
)
from app.api.deps import get_current_active_user

router = APIRouter()


def get_date_range(period: str) -> tuple:
    """Get start and end dates based on period."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if period == "daily":
        start = now - timedelta(days=1)
    elif period == "weekly":
        start = now - timedelta(weeks=1)
    elif period == "monthly":
        start = now - timedelta(days=30)
    else:
        start = now - timedelta(days=7)  # Default to weekly
    
    return start, now


@router.get("/dashboard", response_model=DashboardAnalytics)
async def get_dashboard_analytics(
    business_id: int,
    period: str = "weekly",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard analytics for a business."""
    start_date, end_date = get_date_range(period)
    
    # Chat Analytics
    total_chats = db.query(Chat).filter(
        and_(
            Chat.business_id == business_id,
            Chat.created_at >= start_date,
            Chat.created_at <= end_date
        )
    ).count()
    
    total_messages = db.query(Message).join(Chat).filter(
        and_(
            Chat.business_id == business_id,
            Message.created_at >= start_date,
            Message.created_at <= end_date
        )
    ).count()
    
    active_chats = db.query(Chat).filter(
        and_(
            Chat.business_id == business_id,
            Chat.status == "active",
            Chat.created_at >= start_date,
            Chat.created_at <= end_date
        )
    ).count()
    
    resolved_chats = db.query(Chat).filter(
        and_(
            Chat.business_id == business_id,
            Chat.status == "closed",
            Chat.created_at >= start_date,
            Chat.created_at <= end_date
        )
    ).count()
    
    # Calculate average response time (simplified)
    avg_response_time = 45.0  # Default placeholder
    
    chat_analytics = ChatAnalytics(
        total_chats=total_chats,
        total_messages=total_messages,
        avg_response_time=avg_response_time,
        active_chats=active_chats,
        resolved_chats=resolved_chats,
        date_range=period
    )
    
    # Lead Analytics
    total_leads = db.query(Lead).filter(
        and_(
            Lead.business_id == business_id,
            Lead.created_at >= start_date,
            Lead.created_at <= end_date
        )
    ).count()
    
    new_leads = db.query(Lead).filter(
        and_(
            Lead.business_id == business_id,
            Lead.status == "new",
            Lead.created_at >= start_date,
            Lead.created_at <= end_date
        )
    ).count()
    
    qualified_leads = db.query(Lead).filter(
        and_(
            Lead.business_id == business_id,
            Lead.status == "qualified",
            Lead.created_at >= start_date,
            Lead.created_at <= end_date
        )
    ).count()
    
    converted_leads = db.query(Lead).filter(
        and_(
            Lead.business_id == business_id,
            Lead.status == "converted",
            Lead.created_at >= start_date,
            Lead.created_at <= end_date
        )
    ).count()
    
    conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0.0
    
    # Leads by source
    leads_by_source = {}
    for source in ["whatsapp", "website", "referral", "other"]:
        count = db.query(Lead).filter(
            and_(
                Lead.business_id == business_id,
                Lead.source == source,
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).count()
        leads_by_source[source] = count
    
    # Average lead score
    avg_score_result = db.query(func.avg(Lead.score)).filter(
        and_(
            Lead.business_id == business_id,
            Lead.created_at >= start_date,
            Lead.created_at <= end_date
        )
    ).scalar()
    avg_lead_score = float(avg_score_result) if avg_score_result else 0.0
    
    lead_analytics = LeadAnalytics(
        total_leads=total_leads,
        new_leads=new_leads,
        qualified_leads=qualified_leads,
        converted_leads=converted_leads,
        conversion_rate=conversion_rate,
        leads_by_source=leads_by_source,
        avg_lead_score=avg_lead_score,
        date_range=period
    )
    
    # Order Analytics
    total_orders = db.query(Order).filter(
        and_(
            Order.business_id == business_id,
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
    ).count()
    
    total_revenue_result = db.query(func.sum(Order.total)).filter(
        and_(
            Order.business_id == business_id,
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
    ).scalar()
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0
    
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0.0
    
    # Orders by status
    orders_by_status = {}
    for status in ["pending", "processing", "shipped", "delivered", "cancelled"]:
        count = db.query(Order).filter(
            and_(
                Order.business_id == business_id,
                Order.status == status,
                Order.created_at >= start_date,
                Order.created_at <= end_date
            )
        ).count()
        orders_by_status[status] = count
    
    order_analytics = OrderAnalytics(
        total_orders=total_orders,
        total_revenue=total_revenue,
        avg_order_value=avg_order_value,
        orders_by_status=orders_by_status,
        date_range=period
    )
    
    # Customer Analytics
    total_customers = db.query(Customer).filter(
        Customer.business_id == business_id
    ).count()
    
    new_customers = db.query(Customer).filter(
        and_(
            Customer.business_id == business_id,
            Customer.created_at >= start_date,
            Customer.created_at <= end_date
        )
    ).count()
    
    active_customers = db.query(Customer).join(Chat).filter(
        and_(
            Customer.business_id == business_id,
            Chat.updated_at >= start_date,
            Chat.updated_at <= end_date
        )
    ).distinct().count()
    
    customer_analytics = CustomerAnalytics(
        total_customers=total_customers,
        active_customers=active_customers,
        new_customers=new_customers,
        avg_engagement_score=75.0,  # Placeholder
        date_range=period
    )
    
    return DashboardAnalytics(
        chat_analytics=chat_analytics,
        lead_analytics=lead_analytics,
        order_analytics=order_analytics,
        customer_analytics=customer_analytics,
        period=period
    )


@router.get("/trends/{metric}")
async def get_trend_analytics(
    business_id: int,
    metric: str,
    period: str = "weekly",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get trend data for a specific metric over time."""
    start_date, end_date = get_date_range(period)
    
    data = []
    
    if metric == "leads":
        # Get daily lead counts
        for i in range(7 if period == "weekly" else 30):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            count = db.query(Lead).filter(
                and_(
                    Lead.business_id == business_id,
                    Lead.created_at >= day_start,
                    Lead.created_at < day_end
                )
            ).count()
            
            data.append(TimeSeriesData(
                date=day_start.strftime("%Y-%m-%d"),
                value=float(count),
                label=f"{count} leads"
            ))
    
    elif metric == "orders":
        # Get daily order counts
        for i in range(7 if period == "weekly" else 30):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            count = db.query(Order).filter(
                and_(
                    Order.business_id == business_id,
                    Order.created_at >= day_start,
                    Order.created_at < day_end
                )
            ).count()
            
            data.append(TimeSeriesData(
                date=day_start.strftime("%Y-%m-%d"),
                value=float(count),
                label=f"{count} orders"
            ))
    
    elif metric == "revenue":
        # Get daily revenue
        for i in range(7 if period == "weekly" else 30):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            revenue = db.query(func.sum(Order.total)).filter(
                and_(
                    Order.business_id == business_id,
                    Order.created_at >= day_start,
                    Order.created_at < day_end
                )
            ).scalar()
            
            data.append(TimeSeriesData(
                date=day_start.strftime("%Y-%m-%d"),
                value=float(revenue) if revenue else 0.0,
                label=f"${revenue or 0:.2f}"
            ))
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown metric: {metric}")
    
    return TrendAnalytics(
        metric=metric,
        data=data,
        period=period
    )
