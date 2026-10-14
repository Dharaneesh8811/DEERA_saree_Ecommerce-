import io
import unittest
from unittest.mock import MagicMock, patch

from botocore.exceptions import ClientError
from fastapi import HTTPException
from starlette.datastructures import Headers, UploadFile

from app.services.hero_images import upload_hero_image


class HeroImageUploadTests(unittest.IsolatedAsyncioTestCase):
    async def test_storage_error_returns_safe_message_and_logs_upstream_code(self):
        storage_client = MagicMock()
        storage_client.upload_fileobj.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InvalidAccessKeyId",
                    "Message": "The configured key is not recognized.",
                }
            },
            "PutObject",
        )
        image = UploadFile(
            filename="banner.png",
            file=io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 16),
            headers=Headers({"content-type": "image/png"}),
        )

        with patch(
            "app.services.hero_images.get_storage_client",
            return_value=(
                storage_client,
                "test-bucket",
                "https://images.example.test",
            ),
        ):
            with self.assertLogs(
                "app.services.hero_images",
                level="ERROR",
            ) as captured_logs:
                with self.assertRaises(HTTPException) as raised:
                    await upload_hero_image(image)

        self.assertEqual(raised.exception.status_code, 502)
        self.assertEqual(
            raised.exception.detail,
            "Image storage could not save the hero image. "
            "Please check storage configuration or contact support.",
        )
        self.assertIn("InvalidAccessKeyId", "\n".join(captured_logs.output))
        await image.close()
