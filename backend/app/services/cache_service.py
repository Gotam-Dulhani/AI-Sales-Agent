import json
import redis
from typing import Optional, Any, Dict, List
from app.core.config import settings


class CacheService:
    """Service for caching data using Redis."""
    
    def __init__(self):
        self.redis_client = None
        self._connect()
    
    def _connect(self):
        """Connect to Redis."""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5
            )
            # Test connection
            self.redis_client.ping()
        except Exception as e:
            print(f"Warning: Could not connect to Redis: {e}")
            print("Caching will be disabled")
            self.redis_client = None
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.redis_client:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Error getting from cache: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL (default 1 hour)."""
        if not self.redis_client:
            return False
        
        try:
            serialized = json.dumps(value)
            return self.redis_client.setex(key, ttl, serialized)
        except Exception as e:
            print(f"Error setting cache: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self.redis_client:
            return False
        
        try:
            return self.redis_client.delete(key) > 0
        except Exception as e:
            print(f"Error deleting from cache: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern."""
        if not self.redis_client:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            print(f"Error deleting pattern from cache: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        if not self.redis_client:
            return False
        
        try:
            return self.redis_client.exists(key) > 0
        except Exception as e:
            print(f"Error checking cache existence: {e}")
            return False
    
    def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple values from cache."""
        if not self.redis_client:
            return {}
        
        try:
            values = self.redis_client.mget(keys)
            result = {}
            for key, value in zip(keys, values):
                if value:
                    result[key] = json.loads(value)
            return result
        except Exception as e:
            print(f"Error getting multiple from cache: {e}")
            return {}
    
    def set_many(self, mapping: Dict[str, Any], ttl: int = 3600) -> bool:
        """Set multiple values in cache."""
        if not self.redis_client:
            return False
        
        try:
            pipe = self.redis_client.pipeline()
            for key, value in mapping.items():
                serialized = json.dumps(value)
                pipe.setex(key, ttl, serialized)
            pipe.execute()
            return True
        except Exception as e:
            print(f"Error setting multiple in cache: {e}")
            return False
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment a counter in cache."""
        if not self.redis_client:
            return None
        
        try:
            return self.redis_client.incrby(key, amount)
        except Exception as e:
            print(f"Error incrementing cache: {e}")
            return None
    
    def expire(self, key: str, ttl: int) -> bool:
        """Set TTL for existing key."""
        if not self.redis_client:
            return False
        
        try:
            return self.redis_client.expire(key, ttl)
        except Exception as e:
            print(f"Error setting cache TTL: {e}")
            return False
    
    # Specific cache methods for the application
    
    def cache_customer_memory(self, customer_id: int, business_id: int, memory: Dict[str, Any], ttl: int = 86400) -> bool:
        """Cache customer memory for 24 hours."""
        key = f"customer_memory:{business_id}:{customer_id}"
        return self.set(key, memory, ttl)
    
    def get_customer_memory(self, customer_id: int, business_id: int) -> Optional[Dict[str, Any]]:
        """Get cached customer memory."""
        key = f"customer_memory:{business_id}:{customer_id}"
        return self.get(key)
    
    def cache_rag_results(self, business_id: int, query: str, results: List[Dict], ttl: int = 3600) -> bool:
        """Cache RAG search results for 1 hour."""
        import hashlib
        query_hash = hashlib.md5(query.encode()).hexdigest()
        key = f"rag_results:{business_id}:{query_hash}"
        return self.set(key, results, ttl)
    
    def get_rag_results(self, business_id: int, query: str) -> Optional[List[Dict]]:
        """Get cached RAG results."""
        import hashlib
        query_hash = hashlib.md5(query.encode()).hexdigest()
        key = f"rag_results:{business_id}:{query_hash}"
        return self.get(key)
    
    def cache_session(self, session_id: str, session_data: Dict[str, Any], ttl: int = 7200) -> bool:
        """Cache session data for 2 hours."""
        key = f"session:{session_id}"
        return self.set(key, session_data, ttl)
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get cached session data."""
        key = f"session:{session_id}"
        return self.get(key)
    
    def invalidate_business_cache(self, business_id: int) -> int:
        """Invalidate all cache entries for a business."""
        patterns = [
            f"customer_memory:{business_id}:*",
            f"rag_results:{business_id}:*",
            f"business_data:{business_id}:*"
        ]
        total_deleted = 0
        for pattern in patterns:
            total_deleted += self.delete_pattern(pattern)
        return total_deleted


cache_service = CacheService()
