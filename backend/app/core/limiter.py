from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared rate limiter instance. key_func extracts the client IP,
# respecting X-Forwarded-For set by Railway/Vercel proxies.
limiter = Limiter(key_func=get_remote_address)
