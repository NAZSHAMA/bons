from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create scheduler instance
scheduler = AsyncIOScheduler()

async def daily_cleanup_task():
    """
    Runs daily at midnight (00:00)
    Purpose: Clean up old data, logs, temporary files
    """
    logger.info(f"[CRON] Running daily cleanup task at {datetime.now()}")
    # Add your cleanup logic here
    # Example: Delete old completed tasks, clear temporary files, etc.
    logger.info("[CRON] Daily cleanup completed")

async def hourly_sync_task():
    """
    Runs every hour at the start of the hour
    Purpose: Synchronize data, update cache, perform maintenance
    """
    logger.info(f"[CRON] Running hourly sync task at {datetime.now()}")
    # Add your sync logic here
    # Example: Sync with external APIs, update cached data, etc.
    logger.info("[CRON] Hourly sync completed")

async def test_task():
    """
    Runs every minute for testing purposes
    Remove or comment out in production
    """
    logger.info(f"[CRON] Test task executed at {datetime.now()}")

def setup_cron_jobs():
    """
    Setup and configure all cron jobs
    """
    logger.info("Setting up cron jobs...")

    # Daily cleanup task at midnight (00:00)
    scheduler.add_job(
        daily_cleanup_task,
        CronTrigger(hour=0, minute=0),
        id="daily_cleanup",
        replace_existing=True,
        name="Daily Cleanup Task"
    )

    # Hourly sync task at the start of each hour
    scheduler.add_job(
        hourly_sync_task,
        CronTrigger(minute=0),
        id="hourly_sync",
        replace_existing=True,
        name="Hourly Sync Task"
    )

    # Test task - runs every minute (for testing)
    # Comment out in production
    scheduler.add_job(
        test_task,
        CronTrigger(minute="*"),
        id="test_task",
        replace_existing=True,
        name="Test Task (Every Minute)"
    )

    # Start the scheduler
    scheduler.start()
    logger.info("Cron jobs started successfully")

def shutdown_scheduler():
    """
    Shutdown the scheduler gracefully
    """
    logger.info("Shutting down scheduler...")
    scheduler.shutdown()
    logger.info("Scheduler shutdown complete")
