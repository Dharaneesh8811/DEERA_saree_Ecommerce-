from typing import Generic, TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class PageResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    status_counts: dict[str, int] | None = None
