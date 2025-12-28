# Ticket: Subprocess Environment Variable Propagation Bug

## Problem
When running scraper scripts via subprocesses in `scrape_all.py`, environment variables loaded from `.env` (such as database credentials) were not available to the child processes. This caused authentication failures (e.g., `fe_sendauth: no password supplied`) even though direct script execution worked fine.

## Details
- Parent process loaded `.env` but did not pass the environment to subprocesses.
- Subprocesses could not access `DATABASE_URL` and other secrets, leading to connection errors.
- Fix: Explicitly load `.env` in the parent and pass `env=os.environ.copy()` to all subprocesses.

## Status
- Fixed by updating `scrape_all.py` to load `.env` and pass the environment to subprocesses.
- All scripts now have access to required credentials and secrets.
