from enum import Enum


class OrderStatus(str, Enum):
    PLACED = "placed"
    UNDER_REVIEW = "under_review"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"


class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class ReviewStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ReturnStatus(str, Enum):
    REQUESTED = "requested"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class ReturnRequestType(str, Enum):
    RETURN = "return"
    EXCHANGE = "exchange"