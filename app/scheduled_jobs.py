"""
app/scheduled_jobs.py
---------------------
Scheduled job configuration for analytics refresh and maintenance tasks.

Uses APScheduler for background job scheduling.
Jobs run asynchronously and log to analytics_refresh_jobs table.

Setup:
    1. Import and configure in main.py lifespan
    2. Jobs run automatically on schedule
    3. Monitor via GET /api/v1/analytics/jobs/recent

Jobs:
    - Nightly analytics refresh (2:00 AM daily)
    - Widget cache cleanup (hourly)
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta

from app.modules.analytics import service as analytics_service
from app.core.database import AsyncSessionLocal
from app.modules.analytics.models import DashboardWidgetCache
from app.utils.time_utils import utcnow_naive
from sqlalchemy import delete

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = AsyncIOScheduler()


async def run_nightly_analytics_refresh():
    """
    Run all analytics refresh functions.

    Schedule: Daily at 2:00 AM
    Duration: ~2-5 minutes (depends on data volume)
    Purpose: Update all summary tables with latest student performance data
    """
    logger.info("Starting nightly analytics refresh...")

    try:
        job_id = await analytics_service.refresh_all()
        logger.info(f"Analytics refresh completed successfully. Job ID: {job_id}")

    except Exception as e:
        logger.error(f"Analytics refresh failed: {str(e)}", exc_info=True)
        # Job status is logged to analytics_refresh_jobs table by refresh_all()


async def cleanup_expired_widgets():
    """
    Remove expired dashboard widget cache entries.

    Schedule: Hourly
    Duration: < 1 second
    Purpose: Free up database space by removing stale cache entries
    """
    logger.info("Starting widget cache cleanup...")

    try:
        async with AsyncSessionLocal() as db:
            # Delete widgets where expires_at < now
            query = delete(DashboardWidgetCache).where(
                DashboardWidgetCache.expires_at < utcnow_naive()
            )

            result = await db.execute(query)
            await db.commit()

            deleted_count = result.rowcount
            logger.info(f"Widget cache cleanup complete. Removed {deleted_count} expired entries.")

    except Exception as e:
        logger.error(f"Widget cache cleanup failed: {str(e)}", exc_info=True)


def configure_scheduler():
    """
    Configure all scheduled jobs.

    Called during application startup (main.py lifespan).
    """
    # Nightly analytics refresh at 2:00 AM
    scheduler.add_job(
        run_nightly_analytics_refresh,
        trigger=CronTrigger(hour=2, minute=0),  # 2:00 AM daily
        id='nightly_analytics_refresh',
        name='Nightly Analytics Refresh',
        replace_existing=True,
        max_instances=1,  # Prevent overlapping runs
        misfire_grace_time=3600  # Allow 1 hour grace period
    )

    # Widget cache cleanup every hour
    scheduler.add_job(
        cleanup_expired_widgets,
        trigger=CronTrigger(minute=0),  # Every hour at :00
        id='widget_cache_cleanup',
        name='Widget Cache Cleanup',
        replace_existing=True,
        max_instances=1
    )

    logger.info("Scheduled jobs configured:")
    logger.info("  - Nightly analytics refresh: 2:00 AM daily")
    logger.info("  - Widget cache cleanup: hourly")


def start_scheduler():
    """Start the scheduler. Called in main.py startup."""
    if not scheduler.running:
        configure_scheduler()
        scheduler.start()
        logger.info("Scheduler started successfully")


def shutdown_scheduler():
    """Shutdown the scheduler. Called in main.py shutdown."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler shut down successfully")


# Optional: Manual trigger functions for testing/admin use
async def trigger_analytics_refresh_now():
    """Manually trigger analytics refresh (outside schedule)."""
    logger.info("Manual analytics refresh triggered")
    await run_nightly_analytics_refresh()


async def trigger_cache_cleanup_now():
    """Manually trigger cache cleanup (outside schedule)."""
    logger.info("Manual cache cleanup triggered")
    await cleanup_expired_widgets()
